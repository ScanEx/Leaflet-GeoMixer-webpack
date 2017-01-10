var map = L.map('map').setView([55.73, 37.59], 8);

var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
}).addTo(map);

//Load all the layers from GeoMixer map and add them to Leaflet map
L.gmx.loadMap('H2DUP', {leafletMap: map});
