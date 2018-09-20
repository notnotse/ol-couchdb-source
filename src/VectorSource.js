import PouchDB from "pouchdb"
import ol from "openlayers"

const VectorSource = (databaseUrl, opt) => {
  const sourceOptions = Object.assign(
    {
      fetch: undefined,
      replication: undefined
    },
    opt,
    {
      featureProjection: undefined
    }
  )

  const state = {
    featureProjection: null,
    changes: null,
    updateSeq: "now",
    source: null
  }

  const db = new PouchDB(databaseUrl, {
    fetch: (url, dbOptions) => {
      const fetchOptions = opt ? opt.fetch : undefined
      return PouchDB.fetch(url, Object.assign({}, dbOptions, fetchOptions))
    }
  })

  const geoJSONFormat = new ol.format.GeoJSON()

  const isString = str => typeof str === "string" || str instanceof String

  const removeDesignDocs = result =>
    Object.assign({}, result, {
      rows: result.rows.filter(row => row.id.indexOf("_design") < 0)
    })

  const getAllDocs = () =>
    db.allDocs({ include_docs: true, update_seq: true }).then(removeDesignDocs)

  const appendUrlToAttachments = dbUrl => doc =>
    Object.keys(doc._attachments || {}).map(key => ({
      [key]: `${dbUrl}/${doc._id}/${key}`
    }))

  const parseAttachments = appendUrlToAttachments(databaseUrl)

  const rowToGeoJSON = row => ({
    type: "Feature",
    id: row.doc._id,
    properties: Object.assign(
      {},
      ...parseAttachments(row.doc),
      row.doc.properties,
      {
        _id: row.doc._id,
        _rev: row.doc._rev
      }
    ),
    geometry: row.doc.geometry
  })

  const resultToGeoJSON = result => ({
    type: "FeatureCollection",
    features: result.rows.map(rowToGeoJSON)
  })

  const geoJSONToFeatures = featureProjection => geoJSON =>
    geoJSONFormat.readFeatures(geoJSON, {
      featureProjection: featureProjection,
      dataProjection: sourceOptions.dataProjection
    })

  const addFeatures = features => {
    state.source.addFeatures(features)
  }

  const setDbUpdateSeq = updateSeq => {
    state.updateSeq = updateSeq
  }

  const setDbUpdateSeqFromResult = result => {
    setDbUpdateSeq(result.update_seq)
    return result
  }

  const sourceLoader = (extent, resolution, featureProjection) => {
    state.featureProjection = featureProjection
    return getAllDocs()
      .then(setDbUpdateSeqFromResult)
      .then(result => {
        if (sourceOptions.replication) {
          startReplication()
        }
        return result
      })
      .then(resultToGeoJSON)
      .then(geoJSONToFeatures(featureProjection))
      .then(addFeatures)
  }

  const deleteFeature = id => {
    const feature = state.source.getFeatureById(id)
    if (feature) {
      state.source.removeFeature(feature)
    }
  }

  const handleDbChange = source => row => {
    const doc = row.doc
    deleteFeature(doc._id)
    if (!doc._deleted) {
      source.addFeature(
        geoJSONFormat.readFeature(rowToGeoJSON(row), {
          featureProjection: state.featureProjection,
          dataProjection: state.dataProjection
        })
      )
    }
  }

  const startReplication = since => {
    if (since) {
      setDbUpdateSeq(since)
    }
    stopReplication()

    state.changes = db
      .changes({
        since: state.updateSeq,
        retry: true,
        live: true,
        include_docs: true
      })
      .on("change", handleDbChange(state.source))
      .on("error", console.error)
  }

  const stopReplication = () => {
    if (state.changes) {
      state.changes.cancel()
      state.changes = null
    }
  }

  const createSource = () => {
    const source = new ol.source.Vector(
      Object.assign({}, sourceOptions, {
        strategy: ol.loadingstrategy.all,
        loader: sourceLoader
      })
    )

    source.update = () => {
      source.clear() // Will trigger a new call to souceLoader by OpenLayers
    }

    source.replication = {
      start: startReplication,
      stop: stopReplication
    }

    return source
  }

  state.source = createSource()

  return state.source
}

export default VectorSource
