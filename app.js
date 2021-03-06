#!/usr/bin/env node
var express = require("express");
var dayjs = require("dayjs");
var utc = require('dayjs/plugin/utc');
var request = require('request');
var fs = require('fs');
var cors = require('cors');
var app = express();
var port = process.env.PORT || 7000;
var lasttime = "";
dayjs.extend(utc)
process.env.JAVA_HOME = "/usr";

var type = 'TGL';
var alt = process.env.altitude || "";
if (alt.indexOf("mb") != -1) { type = "ISBL"; }
alt = parseInt( alt || 10);
if (type == "TGL" && alt != 10 && alt != 40 && alt != 80 && alt != 120) { alt = 10; }
if (type == "ISBL" && alt%50 != 0) { alt = 300; }
console.log("💨 Using "+type+'_'+alt);

// cors config
var whitelist = [
    'http://localhost:3000',
    'http://localhost:1880'
];

var corsOptions = {
    origin: function(origin, callback) {
        var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    }
};

setTimeout(() => {
    app.listen(port, function(err) {
        console.log("🌎 Running server on port "+ port);
    });
},10000);

app.get('/', cors(corsOptions), function(req, res) {
    res.send('<h3>windserver</h3><p>Go to <b>/latest</b> for wind data</p><p>or <b>/last</b> to get datetime of latest file</p><p><b>/example</b> to get an example Node-RED flow file,</p><p>or <b>/alive</b> for a simple health check.</b></p>');
});

app.get('/alive', cors(corsOptions), function(req, res) {
    res.send('windserver is alive');
});

app.get('/latest', cors(corsOptions), function(req, res) {
    var fileName = __dirname +"/json-data/uv.json";
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(fileName, {}, function (err) {
        if (err) {
            console.log('uv.json doesnt exist yet');
        }
    });
});

app.get('/last', cors(corsOptions), function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(fs.readFileSync(__dirname +"/json-data/last"));
});

app.get('/example', cors(corsOptions), function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(fs.readFileSync(__dirname +"/nodes.json"));
});

const download = (url, path, callback) => {
    request.head(url, (err, res, body) => {
        if (err) callback(err, path);
        else {
            request(url)
                .pipe(fs.createWriteStream(path))
                .on('close', callback)
        }
    })
}

function run(t) {
    let h = ("" + (parseInt(t.hour() / 3) * 3)).padStart(3,"0");
    let d = t.format("YYYYMMDD");

    const urlu = 'https://dd.weather.gc.ca/model_gem_global/15km/grib2/lat_lon/00/' + h + '/CMC_glb_UGRD_' + type + '_' + alt + '_latlon.15x.15_' + d + '00_P' + h + '.grib2';
    const pathu = '/tmp/u.grb2'
    const urlv = 'https://dd.weather.gc.ca/model_gem_global/15km/grib2/lat_lon/00/' + h + '/CMC_glb_VGRD_' + type + '_' + alt + '_latlon.15x.15_' + d + '00_P' + h + '.grib2';
    const pathv = '/tmp/v.grb2'
    // console.log("GetU:"+urlu)
    // console.log("GetV:"+urlv)

    // only get if it's past 4am and time slot has moved on or we failed last time.
    if (h !== lasttime) {
        // As the new model isn't published until 4 am don't bother until then
        if (t.hour() < 4) {
            // d = t.subtract(1,'d').format('YYYYMMDD');
            // h = ((parseInt(h) + 24)+"").padStart(3,"0");
            // lasttime = h;
            console.log("💤 "+d+":"+h);
            return;
        }
        console.log("🕑 "+t.format('HH:mm:ss')+" - "+d+":"+h);
        download(urlu, pathu, () => {
            process.stdout.write('✅ Fetched U, ');
            download(urlv, pathv, () => {
                process.stdout.write('Fetched V, ');
                joingrib(() => {
                    convert(() => {
                        fs.writeFileSync("json-data/last", d+":"+h);
                        lasttime = h;
                    });
                });
            })
        })
    }
}

function joingrib(cb) {
    var exec = require('child_process').exec, child;
    child = exec('cat /tmp/u.grb2 /tmp/v.grb2 > /tmp/uv.grb2',
        {maxBuffer: 500 * 1024},
        function (error, stdout, stderr) {
            if (error) { console.log('❌ join error.'); }
            else { process.stdout.write("Joined U+V, "); if (cb) {cb()} }
        });
}

function convert(cb) {
    checkPath('json-data', true);
    var exec = require('child_process').exec, child;
    child = exec('converter/bin/grib2json --data --output json-data/uv.json --names --compact /tmp/uv.grb2',
        {maxBuffer: 500 * 1024},
        function (error, stdout, stderr) {
            if (error) { console.log('❌ conversion error.'); }
            else { console.log("Converted to JSON."); if (cb) {cb()} }
        });
}

function checkPath(path, mkdir) {
    try {
        fs.statSync(path);
        return true;
    }
    catch(e) {
        if (mkdir) { fs.mkdirSync(path); }
        return false;
    }
}

setInterval(function() {
    run(dayjs.utc());
}, 600000);    // Check every 10 mins

run(dayjs.utc());
