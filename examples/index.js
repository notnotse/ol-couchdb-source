import ol from "openlayers"
import PouchDB from "pouchdb"
import geojson from "./geojson.json"

import { CouchDBVectorSource } from "../src/index"

const databaseUrl = "http://localhost:3000/geodata"

const db = new PouchDB(databaseUrl)

db.bulkDocs(geojson)
  .then(res => {
    init()
  })
  .catch(console.error)

const init = () => {
  const couchSource = CouchDBVectorSource(databaseUrl, {
    replication: true
  })
  const layer = new ol.layer.Vector({
    source: couchSource
  })
  const map = new ol.Map({
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      }),
      layer
    ],
    target: "map",
    view: new ol.View({
      center: [0, 0],
      zoom: 2
    })
  })

  const replicationStopButton = document.getElementById("stopReplication")
  const replicationStartButton = document.getElementById("startReplication")

  replicationStopButton.addEventListener("click", e =>
    couchSource.replication.stop()
  )
  replicationStartButton.addEventListener("click", e =>
    couchSource.replication.start()
  )
}
