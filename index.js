"use strict"

var d3 = require("d3-browserify");
var proj4 = require("proj4");

// EPSG 3912
var from = '+proj=tmerc +lat_0=0 +lon_0=15 +k=0.9999 +x_0=500000 +y_0=-5000000 +ellps=bessel +towgs84=682,-203,480,0,0,0,0 +units=m +no_defs';
// EPSG 4326
var to = '+proj=longlat +datum=WGS84 +no_defs';


var width = 960
  , height = 800;


var svg = d3.select("body").append("svg")
.attr("width", width)
.attr("height", height);

// central meridian for EPSG:3912 = 15
var projection = d3.geo.transverseMercator().scale(1).translate([0,0]).rotate([-15,0,0]);
var path = d3.geo.path().projection(projection);

d3.json("/toposi/OB/obcine.topojson", function(error, topology) {
  if (error) throw error;

  var outerBorder = topojson.mesh(topology, topology.objects.obcine, function(a, b) { return a === b });
  var innerBorder = topojson.mesh(topology, topology.objects.obcine, function(a, b) { return a !== b });
  var obcine = topojson.feature(topology, topology.objects.obcine);

  var min = d3.min(obcine.features, function(p) {
    return p.properties.POVRSINA;
  });
  var max = d3.max(obcine.features, function(p) {
    return p.properties.POVRSINA;
  });
  var fill = d3.scale.log()
  .domain([min, max])
  .range(["brown", "steelblue"]);

  console.log(obcine);

  var b = path.bounds(outerBorder);
  var s = .98 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
  var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1]))/2];

  projection.scale(s).translate(t);
  console.log(t);

  svg.selectAll(".obcina")
  .data(obcine.features).enter()
  .append("path")
  .attr("d", path)
  .style("fill", function(d) { return fill(d.properties.POVRSINA); })
  .on("mouseover", function(d) {
    // console.log(d.properties.OB_IME + " - " + d.properties.POVRSINA + "m²");
    d3.select("#center_" + d.properties.OB_ID)
    .transition().duration(0)
    .style("opacity", "1")
    .style("display", null);
  })
  .on("mouseout", function(d) {
    d3.select("#center_" + d.properties.OB_ID)
    .transition().duration(500)
    .style("opacity", "1e-9")
    .each("end", function() { d3.select(this).style("display", "none"); });
  });
  svg.append("path")
  .datum(outerBorder)
  .attr("class", "outer-border")
  .attr("d", path);
  svg.append("path")
  .datum(innerBorder)
  .attr("class", "inner-border")
  .attr("d", path);
  var center = svg.selectAll(".center")
  .data(obcine.features).enter()
  .append("g")
  .attr("id", function(d) {return "center_" + d.properties.OB_ID})
  .attr("class", "center")
  .attr("transform", function(d) { return "translate (" + projection(proj4(from, to, [d.properties.Y_C, d.properties.X_C])) + ") rotate(0)"; })
  .style("display", "none");

  center.append("circle")
  .attr("cx", "0")
  .attr("cy", "0")
  .attr("r", 1);
  center.append("text")
  .text(function(d) {return d.properties.OB_IME});
});

console.log(proj4(from, to, [513890, 72720]));

