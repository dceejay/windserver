# windserver

Simple service to expose [GRIB2](http://en.wikipedia.org/wiki/GRIB) wind forecast data
from the [Canadian Centre for Climate Services](https://weather.gc.ca/)
(25km 12 hourly model from [here](https://dd.weather.gc.ca/model_gem_global/25km/grib2/lat_lon/)) as
JSON. The Canadian model is produced 2 times a day and provide a prediction for every 3 hours - we
then grab the last most recent (so it should update every 3 hours or so).

Can be consumed by Dan Wild's [leaflet-velocity layer](https://github.com/danwild/leaflet-velocity).
Contains a pre-packaged copy of [grib2json](https://github.com/cambecc/grib2json) for conversion which requires Java8 to be available and `JAVA_HOME` to be set.

Based loosely on Dan's excellent wind-js-server - but changed to point to Canada instead of NOAA as the data seems much more reliable.

Note that this is intended as a crude demonstration, not intended for production use.
To get to production; you should improve upon this or build your own.

### Install & Run

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

Note: you may need to update the url reference in the http reques node to point the server and port where the container is running.

### License
MIT License (MIT)
