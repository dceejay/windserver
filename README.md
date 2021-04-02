# wind-server [![NPM version][npm-image]][npm-url] [![NPM Downloads][npm-downloads-image]][npm-url]

Simple service to expose [GRIB2](http://en.wikipedia.org/wiki/GRIB) wind forecast data
from the [Canadian Centre for Climate Services](https://weather.gc.ca/)
(25km 12 hourly from [here](https://dd.weather.gc.ca/model_gem_global/25km/grib2/lat_lon/)) as JSON. <br/>

Consumed in [leaflet-velocity](https://github.com/danwild/leaflet-velocity).
Contains a pre-packaged copy of [grib2json](https://github.com/cambecc/grib2json) for conversion which requires Java8 to be available and `JAVA_HOME` to be set.

Based 90% on Dan Wild's excellent wind-js-server - but changed to point to Canada instead of NOAA as the data seems much more reliable.

Note that this is intended as a crude demonstration, not intended for production use.
To get to production; you should improve upon this or build your own.

### Install, run:

#### Docker

```
docker run -d -p 7000:7000 --name windserver theceejay/windserver:latest
```

#### Node.js

reqires both node.js and java8 to be installed locally

```
# from project root:
npm install
npm start
```

### Endpoints
- **/latest** returns the most up to date JSON data available.
- **/last** returns the YYYYMMDD:HHH of the data.
- **/example** returns a Node-RED example json flow file that you can import and deploy.
- **/alive** health check url, returns simple message.

### License
MIT License (MIT)
