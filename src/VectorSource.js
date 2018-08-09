import PouchDB from "pouchdb"
import ol from "openlayers"

const VectorSource = (databaseUrl, opt) => {
  const options = Object.assign({}, opt, {
    featureProjection: undefined
  })

  const db = new PouchDB(databaseUrl)

  const geoJSONFormat = new ol.format.GeoJSON()

  const isString = str => typeof str === "string" || str instanceof String

  const removeDesignDocs = result =>
    result.rows.filter(row => row.id.indexOf("_design") < 0)

  const getGeoJSON = () => {
    return db
      .allDocs({ include_docs: true })
      .then(removeDesignDocs)
      .then(rows => {
        return rows
      })
      .then(rowsToGeoJSON)
  }

  const appendUrlToAttachments = dbUrl => doc => {
    return Object.keys(doc._attachments || {}).map(key => {
      return {
        [key]: `${dbUrl}/${doc.id}/${key}`
      }
    })
  }

  const parseAttachments = appendUrlToAttachments(databaseUrl)

  const rowsToGeoJSON = rows => ({
    type: "FeatureCollection",
    features: rows.map(row => ({
      type: "Feature",
      properties: Object.assign(
        {},
        ...parseAttachments(row.doc),
        row.doc.properties
      ),
      geometry: row.doc.geometry
    }))
  })

  const sourceLoader = function(extent, resolution, featureProjection) {
    getGeoJSON().then(geoJSON => {
      const features = geoJSONFormat.readFeatures(geoJSON, {
        featureProjection: featureProjection,
        dataProjection: options.dataProjection
      })
      this.addFeatures(features)
    })
  }

  const source = new ol.source.Vector(
    Object.assign({}, options, {
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
