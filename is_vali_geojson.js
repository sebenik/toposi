var fs = require('fs');
var GJV = require("geojson-validation");

var obj = JSON.parse(fs.readFileSync('obcine.geojson', 'utf8'));

if(GJV.valid(obj)) {
      console.log("this is valid GeoJSON!");
}
