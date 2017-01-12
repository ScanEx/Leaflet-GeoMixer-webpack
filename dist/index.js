var map = L.map('map').setView([55.73, 37.59], 5);

var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
}).addTo(map);

//Load all the layers from GeoMixer map and add them to Leaflet map
//L.gmx.loadMap('24A629C7563742B49BBCC01D7D27B8DB', {leafletMap: map});

var myGmxTree = L.control.gmxTree({
	contextMenu: function (ev) {
		console.log('_____', ev);
		var node = ev.node,
			gmxOptions = node.gmxOptions,
			type = node.type;
		if (type === 'layer') {
			// if (dataSource) // меню вьюшки
			return [	// меню источника данных слоя 
				{text: 'Свойства', callback: function (ev) { console.log('Свойства', ev); }},
				{separator: true},
				{text: 'Копировать стиль', callback: function (ev) { console.log('Копировать стиль', ev); }},
				{text: 'Добавить объект', callback: function (ev) { console.log('Добавить объект', ev); }}
			];
		} else if (type === 'group') {
			return [	// меню группы
				{text: 'Свойства', callback: function (ev) { console.log('Свойства', ev); }},
				{text: 'Добавить группу', callback: function (ev) { console.log('Добавить группу', ev); }},
				{text: 'Удалить', callback: function (ev) { console.log('Удалить', ev); }}
			];
		}
		return null;
	},
	mapID: '24A629C7563742B49BBCC01D7D27B8DB'
});
myGmxTree
	.addTo(map)
	.on('selected', myGmxTree.nodeSelect)			// async: показать слой на карте (создать слой если еще не создан)
	.on('deselected', myGmxTree.nodeDeselect);		// скрыть слой с карты

