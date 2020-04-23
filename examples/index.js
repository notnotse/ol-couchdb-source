import OSM from "ol/source/OSM"
import TileLayer from "ol/layer/Tile"
import View from "ol/View"
import Map from "ol/Map"
import VectorLayer from "ol/layer/Vector"

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
  const layer = new VectorLayer({
    source: couchSource
  })
  const map = new Map({
    layers: [
      new TileLayer({
        source: new OSM()
      }),
      layer
    ],
    target: "map",
    view: new View({
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
