import ol from "openlayers"
import PouchDB from "pouchdb"
import geojson from "./geojson.json"

import { CouchDBVectorSource } from "../src/index"

const databaseUrl = "http://localhost:3000/geodata"

const db = new PouchDB(databaseUrl)

db.bulkDocs(geojson)
  .then(res => {
    console.log("bulkDocs result", res)
    init()
  })
  .catch(console.error)

const init = () => {
  const couchSource = CouchDBVectorSource(databaseUrl)
  const map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      }),
      new ol.layer.Vector({
        source: couchSource
      })
    ],
    target: "map",
    view: new ol.View({
      center: [0, 0],
      zoom: 2
    })
  })

  setTimeout(() => {
    couchSource.update()
  }, 3000)
}
