# ol-couchdb-source

OpenLayers source for fetching and displaying GeoJSON documents from a CouchDB server.

## Prerequisites

- [OpenLayers](http://openlayers.org) Library for creating interactive maps on the web.
- [CouchDB](https://couchdb.apache.org) (or compatible) database server.

## CouchDB document format

Documents are expected to be a valid GeoJSON feature.

Example

```
{
  "_id": "b98c7d39-f556-4ead-ac3a-86133c66978a",
  "_rev": "1-e4774e4ee81042448f007d7d987b99d1",
  "type": "Feature",
  "properties": {},
  "geometry": {
    "type": "Point",
    "coordinates": [
      -27.773437499999996,
      21.94304553343818
    ]
  }
}
```

### Attachments

Attachments will generate a property in the `Feature` properties object with the filename as the key and the full path to the file as the value.

## Installation

`npm install notnotse/ol-couchdb-source`

## Minimal example

Complete example can be found in the `examples` folder.

```javascript
import Map from "ol/Map"
import VectorLayer from "ol/layer/Vector"
import View from "ol/View"
import { CouchDBVectorSource } from "ol-couchdb-source"

const map = new Map({
  layers: [
    new VectorLayer({
      source: CouchDBVectorSource("https://server/database")
    })
  ],
  target: "map",
  view: new View()
})
```

## API

### CouchDBVectorSource

`CouchDBVectorSource(databaseUrl, opt_options)`

Options

| Name           | Type                           | Default                | Description                                                                                            |
| -------------- | ------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------ |
| dataProjection | <code>ol.ProjectionLike</code> | <code>undefined</code> | Projection of the data we are reading. A projection as `ol.proj.Projection` or a SRS identifier string |
| fetch          | <code>Object</code>            | <code>undefined</code> | Optional options to add to all `fetch` requests.                                                       |
| replication    | <code>bool</code>              | <code>undefined</code> | Start live replication.                                                                                |

Example

```
CouchDBVectorSource("https://localhost:3000/geodata", {
  dataProjection: "EPSG:4326"
})
```

### .update()

Clear all geometries and fetch new data from server.

Example

```
const couchSource = CouchDBVectorSource("https://localhost:3000/geodata")
couchSource.update()
```

### .replication.start()

Start live replication

Example

```
const couchSource = CouchDBVectorSource("https://localhost:3000/geodata")
couchSource.replication.start()
```

### .replication.stop()

Stop live replication

Example

```
const couchSource = CouchDBVectorSource("https://localhost:3000/geodata")
couchSource.replication.stop()
```

## Development

- `npm start` - Spins up webpack server on `http://localhost:8080` and a PouchDB (CouchDB compatible) in memory server at `http://localhost:3000/_utils`.
- `npm run deploy`- Compiles your application to the lib folder.
