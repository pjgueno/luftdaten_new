var hexagonheatmap;
var hmhexaPM_aktuell;
var hmhexaPM_24Stunden;
var hmhexatemp;
var hmhexahumi;
var hmhexadruck;

var map;
var tiles;
var hash;

var selector1 = "P1";

var P1orP2 = "";

//var cooCenter = [50.495171, 9.730827];
//var zoomLevel = 6;
var cooCenter = [0, 0];
var zoomLevel = 2;


//	P10

var options1 = {
			valueDomain: [20, 40, 60, 100, 500],
			colorRange: ['#00796B', '#F9A825', '#E65100', '#DD2C00', '#960084']	
			};

//	PM2.5

var options2 = {
			valueDomain: [10, 20, 40, 60, 100],
			colorRange: ['#00796B', '#F9A825', '#E65100', '#DD2C00', '#960084']	
			};


//	AQI US

//	change in order to make gradient

//	var options3 = {
//			valueDomain: [0,50,51,100,101,150,151,200,201,300,301,500],
//			colorRange: ['#00E400','#00E400','#FFFF00','#FFFF00','#FF7E00', '#FF7E00','#FF0000', '#FF0000','rgb(143, 63, 151)', 'rgb(143, 63, 151)','#7E0023','#7E0023']	
//			};

var options3 = {
			valueDomain: [0,50,100,150,200,300],
			colorRange: ['#00E400','#FFFF00','#FF7E00','#FF0000','rgb(143, 63, 151)','#7E0023']	
			};

var options4 = {
			valueDomain: [-20, 0, 50],
			colorRange: ['#0022FE', '#FFFFFF', '#FF0000']
			};

var options5 = {
			valueDomain: [0,100],
			colorRange: ['#FFFFFF', '#0000FF']
			};

var options6 = {
			valueDomain: [926, 1013, 1100],
			colorRange: ['#FF0000', '#FE9E01', '#00796B']
			};

var div = d3.select("body").append("div")
			.attr("id", "tooltip")
			.style("display", "none");

var div = d3.select("#sidebar").append("div")
			.attr("id", "table")
			.style("display", "none");

var tooltipDiv = document.getElementsByClassName('tooltip-div');

window.onmousemove = function (e) {
	var x = e.clientX,
	y = e.clientY;

	for (var i = 0; i < tooltipDiv.length; i++) {
		tooltipDiv.item(i).style.top = (y + 1 )+ 'px';
		tooltipDiv.item(i).style.left = (x + 20) + 'px';
	};
};

//window.onpopstate = function(event) {
//	if ((typeof location.search !== 'undefined') && (typeof location.hash !== 'undefined') && (location.hash !== '')) {
//		if (typeof location.pathname !== 'undefined') {
//			var path = location.pathname;
//			path = path.substring(0, path.lastIndexOf('/') + 1);
//		} else {
//			var path = "/";
//		}
//
//		var new_location = location.protocol+'//'+location.host+path;
//		if (typeof location.hash !== 'undefined') {
//			new_location += location.hash;
//		}
//		console.log("New location: "+new_location);
////		location.replace(new_location);
//		history.pushState('remove_query', null, new_location);
//	} 
//};
//
//
//

if (location.hash) {
	var hash_params = location.hash.split("/");
	var cooCenter = [hash_params[1],hash_params[2]];
	var zoomLevel = hash_params[0].substring(1);
//} else if (location.hostname.split(".").length == 4){

} else {
	var hostname = location.hostname;
	var hostname_parts = hostname.split(".");
	if (hostname_parts.length = 4) {
		var place = hostname_parts[0].toLowerCase();
		console.log(place);

		if (typeof places[place] !== 'undefined' && places[place] !== null) {
			var cooCenter = places[place];
			var zoomLevel = 11;
		}
		if (typeof zooms[place] !== 'undefined' && zooms[place] !== null) {
			var zoomLevel = zooms[place];
		}
		console.log("Center: "+cooCenter);
		console.log("Zoom: "+zoomLevel)
	}
};

window.onload=function(){

//	if (!navigator.geolocation){
//		console.log("Geolocation is not supported by your browser");
//	};
//
//	navigator.geolocation.getCurrentPosition(success, error);

//	map.setView([50.495171, 9.730827], 6);

	map.setView(cooCenter, zoomLevel);

	hexagonheatmap = L.hexbinLayer(options1).addTo(map);

//	REVOIR ORDRE DANS FONCTION READY

	d3.queue()
		.defer(d3.json, "https://maps.luftdaten.info/data/v2/data.dust.min.json")
		.defer(d3.json, "https://maps.luftdaten.info/data/v2/data.24h.json")
		.defer(d3.json, "https://maps.luftdaten.info/data/v2/data.temp.min.json")

		.awaitAll(ready); 

	d3.interval(function(){

		d3.selectAll('path.hexbin-hexagon').remove();

		d3.queue()
			.defer(d3.json, "https://maps.luftdaten.info/data/v2/data.dust.min.json")
			.defer(d3.json, "https://maps.luftdaten.info/data/v2/data.24h.json")
			.defer(d3.json, "https://maps.luftdaten.info/data/v2/data.temp.min.json")

			.awaitAll(ready); 

		console.log('reload')

	}, 300000);

	map.on('moveend', function() { 

		hexagonheatmap._zoomChange();

	});

//	REVOIR LES idselec!

	map.on('move', function() { 
//		div.style("display", "none");
		idselec1=0;
		idselec0=0;
	});

//	map.on('dblclick', function() { 
//		div.style("display", "none");
//		idselec1=0;
//		idselec0=0;
//	});
//
//	map.on('click', function() { 
//		div.style("display", "none");
//		idselec1=0;
//		idselec0=0;
//	});

//	REVOIR LE DOUBLECLIQUE

	map.on('click', function(e) {
		map.setView([e.latlng.lat, e.latlng.lng], map.getZoom()); 
		idselec1=0;
		idselec0=0;
	});

};

map = L.map('map',{ zoomControl:true,minZoom:1,doubleClickZoom:false});

hash = new L.Hash(map);

tiles = L.tileLayer('https://{s}.tiles.madavi.de/{z}/{x}/{y}.png',{
		attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
		maxZoom: 18}).addTo(map);


function ready(error,data) {
	if (error) throw error;

	hmhexaPM_aktuell = data[0].reduce(function(filtered, item) {
		if (item.sensor.sensor_type.name == "SDS011") {
			filtered.push({"data":{"PM10": parseInt(getRightValue(item.sensordatavalues,"P1")) , "PM25":parseInt( getRightValue(item.sensordatavalues,"P2"))}, "id":item.sensor.id, "latitude":item.location.latitude,"longitude":item.location.longitude})
		}
		return filtered;
	}, []);

//	console.log(hmhexaPM_aktuell);

	hmhexaPM_24Stunden = data[1].reduce(function(filtered, item) {
		if (item.sensor.sensor_type.name == "SDS011") {
			filtered.push({"data":{"PM10": parseInt(getRightValue(item.sensordatavalues,"P1")) , "PM25":parseInt( getRightValue(item.sensordatavalues,"P2"))}, "id":item.sensor.id, "latitude":item.location.latitude,"longitude":item.location.longitude})
		}
		return filtered;
	}, []);

//	console.log(hmhexaPM_24Stunden);


//	REVOIR LES TYPES DE SENSORS

	hmhexatemp = data[2].reduce(function(filtered, item) {
		if (item.sensor.sensor_type.name == "BME280" || item.sensor.sensor_type.name == "DHT22") {
			filtered.push({"data":{"Temp":parseInt(getRightValue(item.sensordatavalues,"temperature"))}, "id":item.sensor.id, "latitude":item.location.latitude,"longitude":item.location.longitude})
		}
		return filtered;
	}, []);

	hmhexahumi = data[2].reduce(function(filtered, item) {
		if (item.sensor.sensor_type.name == "BME280" || item.sensor.sensor_type.name == "DHT22") {
			filtered.push({"data":{"Humi":parseInt(getRightValue(item.sensordatavalues,"humidity"))}, "id":item.sensor.id, "latitude":item.location.latitude,"longitude":item.location.longitude})
		}
		return filtered;
	}, []);
//	console.log(hmhexahumi);

	hmhexadruck = data[2].reduce(function(filtered, item) {
//		if (item.sensordatavalues.length == 3) {
		if (item.sensor.sensor_type.name == "BME280" || item.sensor.sensor_type.name == "BMP180" || item.sensor.sensor_type.name == "BMP280" ) {
			filtered.push({"data":{"Press":Math.round(parseInt(getRightValue(item.sensordatavalues,"pressure_at_sealevel"))/10)/10}, "id":item.sensor.id, "latitude":item.location.latitude,"longitude":item.location.longitude})
		}
		return filtered;
	}, []);
//	console.log(hmhexadruck);

	document.getElementById('update').innerHTML = "Last update: " + data[0][0].timestamp;

	if(selector1 == "P1") {makeHexagonmap(hmhexaPM_aktuell,options1);};
	if(selector1 == "P2") {makeHexagonmap(hmhexaPM_aktuell,options2);};

	if(selector1 == "officialus"){makeHexagonmap(hmhexaPM_24Stunden,options3);};
	if(selector1 == "temp"){makeHexagonmap(hmhexatemp,options4);};
	if(selector1 == "humi"){makeHexagonmap(hmhexahumi,options5);};
	if(selector1 == "druck"){makeHexagonmap(hmhexadruck,options6);};

};

function makeHexagonmap(data,option){
	hexagonheatmap.initialize(option);
	hexagonheatmap.data(data);
};

function reload(val){
	console.log(val);
//	div.style("display", "none");
	d3.selectAll('path.hexbin-hexagon').remove();
	switch(val) {
			case "P1":
				selector1 = "P1";
				break;
			case "P2":
				selector1 = "P2";
				break;
			case "officialus":
				selector1 = "officialus";
				break;
			case "temp":
				selector1 = "temp";
				break;
			case "humi":
				selector1 = "humi";
				break;
			case "druck":
				selector1 = "druck";
				break;
	};

	console.log(selector1);

	if(selector1 == "P1"){
		hexagonheatmap.initialize(options1);
		hexagonheatmap.data(hmhexaPM_aktuell); 
		document.getElementById('legendaqius').style.visibility='hidden';
		document.getElementById('legendpm').style.visibility='visible';
		document.getElementById('legendpm2').style.visibility='hidden';
		document.getElementById('legendtemp').style.visibility='hidden';
		document.getElementById('legendhumi').style.visibility='hidden';
		document.getElementById('legenddruck').style.visibility='hidden';
	};

	if(selector1 == "P2"){
		hexagonheatmap.initialize(options2);
		hexagonheatmap.data(hmhexaPM_aktuell); 
		document.getElementById('legendaqius').style.visibility='hidden';
		document.getElementById('legendpm').style.visibility='hidden';
		document.getElementById('legendpm2').style.visibility='visible';
		document.getElementById('legendtemp').style.visibility='hidden';
		document.getElementById('legendhumi').style.visibility='hidden';
		document.getElementById('legenddruck').style.visibility='hidden';
	};

	if(selector1 == "officialus"){
		hexagonheatmap.initialize(options3);
		hexagonheatmap.data(hmhexaPM_24Stunden); 
		document.getElementById('legendaqius').style.visibility='visible';
		document.getElementById('legendpm').style.visibility='hidden';
		document.getElementById('legendpm2').style.visibility='hidden';
		document.getElementById('legendtemp').style.visibility='hidden';
		document.getElementById('legendhumi').style.visibility='hidden';
		document.getElementById('legenddruck').style.visibility='hidden';
	};

	if(selector1 == "temp"){
		hexagonheatmap.initialize(options4);
		hexagonheatmap.data(hmhexatemp); 
		document.getElementById('legendaqius').style.visibility='hidden';
		document.getElementById('legendpm').style.visibility='hidden';
		document.getElementById('legendpm2').style.visibility='hidden';
		document.getElementById('legendtemp').style.visibility='visible';
		document.getElementById('legendhumi').style.visibility='hidden';
		document.getElementById('legenddruck').style.visibility='hidden';
	};

	if(selector1 == "humi"){
		hexagonheatmap.initialize(options5);
		hexagonheatmap.data(hmhexahumi); 
		document.getElementById('legendaqius').style.visibility='hidden';
		document.getElementById('legendpm').style.visibility='hidden';
		document.getElementById('legendpm2').style.visibility='hidden';
		document.getElementById('legendtemp').style.visibility='hidden';
		document.getElementById('legendhumi').style.visibility='visible';
		document.getElementById('legenddruck').style.visibility='hidden';
	};

	if(selector1 == "druck"){
		hexagonheatmap.initialize(options6);
		hexagonheatmap.data(hmhexadruck); 
		document.getElementById('legendaqius').style.visibility='hidden';
		document.getElementById('legendpm').style.visibility='hidden';
		document.getElementById('legendpm2').style.visibility='hidden';
		document.getElementById('legendtemp').style.visibility='hidden';
		document.getElementById('legendhumi').style.visibility='hidden';
		document.getElementById('legenddruck').style.visibility='visible';
	};

	if (openedGraph.length >0){
		openedGraph.forEach(function(item){
			removeSvg2(item);
			displayGraph(item);
		});
	};

};

function getRightValue(array,type){
	var value;
	array.forEach(function(item){
		if (item.value_type == type){value = item.value;};
	});
	return value;
};

//function success(position) {
//	var latitude  = position.coords.latitude;
//	var longitude = position.coords.longitude;
//
//	console.log("OK POSITION");
//
//	L.marker([latitude,longitude]).addTo(map);
//
//	map.setView([latitude, longitude], 10);
//
//};


//function error() {
//	console.log("Unable to retrieve your location");
//};


function color(val){
	var col= parseInt(val);

	if(val>= 0 && val < 25){ return "#00796b";};
	if(val>= 25 && val < 50){
		var couleur = interpolColor('#00796b','#f9a825',(col-25)/25);
		return couleur;
	};
	if(val>= 50 && val < 75){
		var couleur = interpolColor('#f9a825','#e65100',(col-50)/25);
		return couleur;
	};
	if(val>= 75 && val < 100){
		var couleur = interpolColor('#e65100','#dd2c00',(col-75)/25);
		return couleur;
	};
	if(val>=100 && val < 500){
		var couleur = interpolColor('#dd2c00','#8c0084',(col-100)/400);
		return couleur;
	};

	if(val>=100 && val < 500){ return "#8c0084";};
};

function interpolColor(a, b, amount) { 
	var ah = parseInt(a.replace(/#/g, ''), 16),
			ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
			bh = parseInt(b.replace(/#/g, ''), 16),
			br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
			rr = ar + amount * (br - ar),
			rg = ag + amount * (bg - ag),
			rb = ab + amount * (bb - ab);
//	console.log('#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1));
	return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
};

function drop() {
	document.getElementById("control").classList.toggle("show");
	idselec1=0;
	idselec0=0;
}

function openSideBar(value){
	var x = document.getElementById("sidebar");
	if (x.style.display === "block") {
		x.style.display = "none";
		document.getElementById('menu').innerHTML='Open';
	} else {
		x.style.display = "block";
		document.getElementById('menu').innerHTML='Close';
	};
};
