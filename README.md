# ol-couchdb-source

OpenLayers source for fetching and displaying GeoJSON documents from a CouchDB server.

## Prerequisites

- [OpenLayers](http://openlayers.org) Library for creating interactive maps on the web.
- [CouchDB](https://couchdb.apache.org) (or compatible) database server.

## Installation

`npm install notnotse/ol-couchdb-source`

## Minimal example

Complete example can be found in the `examples` folder.

```javascript
import ol from "openlayers"
import { CouchDBVectorSource } from "ol-couchdb-sourc"

const map = new ol.Map({
  layers: [
    new ol.layer.Vector({
      source: CouchDBVectorSource("https://server/database")
    })
  ],
  target: "map",
  view: new ol.View()
})
```

## API

### CouchDBVectorSource

`CouchDBVectorSource(databaseUrl, opt_options)`

Options

| Name           | Type                           | Default                | Description                                                                                            |
| -------------- | ------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------ |
| dataProjection | <code>ol.ProjectionLike</code> | <code>undefined</code> | Projection of the data we are reading. A projection as `ol.proj.Projection` or a SRS identifier string |

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

## Development

- `npm start` - Spins up webpack server on `http://localhost:8080` and a PouchDB (CouchDB compatible) in memory server at `http://localhost:3000/_utils`.
- `npm run deploy`- Compiles your application to the lib folder.
