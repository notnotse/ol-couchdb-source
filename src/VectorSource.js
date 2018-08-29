import PouchDB from "pouchdb"
import ol from "openlayers"

const VectorSource = (databaseUrl, opt) => {
  const sourceOptions = Object.assign({}, opt, {
    featureProjection: undefined,
    fetch: undefined
  })

  const db = new PouchDB(databaseUrl, {
    fetch: (url, dbOptions) => {
      const fetchOptions = opt ? opt.fetch : undefined

      return fetch(url, Object.assign({}, dbOptions, fetchOptions))
    }
  })

  const geoJSONFormat = new ol.format.GeoJSON()

  const isString = str => typeof str === "string" || str instanceof String

  const removeDesignDocs = result =>
    result.rows.filter(row => row.id.indexOf("_design") < 0)

  const getGeoJSON = () =>
    db
      .allDocs({ include_docs: true })
      .then(removeDesignDocs)
      .then(rowsToGeoJSON)

  const appendUrlToAttachments = dbUrl => doc =>
    Object.keys(doc._attachments || {}).map(key => ({
      [key]: `${dbUrl}/${doc._id}/${key}`
    }))

  const parseAttachments = appendUrlToAttachments(databaseUrl)

  const rowsToGeoJSON = rows => ({
    type: "FeatureCollection",
    features: rows.map(row => ({
      type: "Feature",
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
    }))
  })

  const sourceLoader = function(extent, resolution, featureProjection) {
    getGeoJSON().then(geoJSON => {
      const features = geoJSONFormat.readFeatures(geoJSON, {
        featureProjection: featureProjection,
        dataProjection: sourceOptions.dataProjection
      })
      this.addFeatures(features)
    })
  }

  const source = new ol.source.Vector(
    Object.assign({}, sourceOptions, {
      strategy: ol.loadingstrategy.all,
      loader: sourceLoader
    })
  )

  source.update = () => {
    source.clear()
  }

  return source
}

export default VectorSource
