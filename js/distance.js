var points = [['15/1 Buccleuch Street', 'Edinburgh City', 'UK', 'EH8 9JN', 'N', 'Nicola', 'ff0000', '55.9434414', '-3.1845431'], ['5/1 C Riego Street', 'Edinburgh City', 'UK', 'EH3 9BL', 'G', 'Graham', '', '55.9449922', '-3.2034685'], ['', 'Edinburgh City', 'UK', 'EH10 5DT', 'N', 'Napier', '', '55.9333255', '-3.2138956'], ['', 'new york city', 'new york', '', '', 'New York', '', '40.7143528', '-74.0059731'], ['', '', 'Maryland', '', '', 'Maryland', '', '39.0457549', '-76.6412712']];

var FEET = {
	label: "feet",
	f: function (distance) {
		return distance * 3.2808399
	}
};
var MILES = {
	label: "miles",
	f: function (distance) {
		return distance / 1609.344
	}
};
var KMS = {
	label: "km",
	f: function (distance) {
		return distance / 1000
	}
};
var NMILES = {
	label: "nautical miles",
	f: function (distance) {
		return ((distance / 1609.344) * (1 / 1.150779))
	}
};
var METRES = {
	label: "metres",
	f: function (distance) {
		return (distance)
	}
};
var unit_handler = MILES;
var map;
var routePoints = new Array(0);
var circlePoints = new Array(0);
var polylines = new Array(0);

var pinSelected = false;
var mainPin_Title = null;
var mainPin_LatLng = null;
var subPin_Title = null;
var subPin_LatLng = null;


function initialize() {
	var myOptions = {
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);

	for (var i in points) {

		if (points[i][4] == "") {
			points[i][4] = "%E2%80%A2";
		}
		if (points[i][6] == "") {
			// Randomize color!
			points[i][6] = "7575FF";
		}

		routePoints.push(addPin(i));
	};

	// document.getElementById('map_canvas').style.width = "80%";
	// document.getElementById('map_canvas').style.height = "60%";

	var latlngbounds = new google.maps.LatLngBounds();
	if (routePoints) {
		for (i in routePoints) {
			latlngbounds.extend(routePoints[i])
		}
	}

	map.setCenter(latlngbounds.getCenter());

	if (routePoints.length == 1) {
		map.setZoom(19);
	} else {
		map.fitBounds(latlngbounds);
	}
	
}

function addPin(i) {
	var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld="+ points[i][4] +"|"+points[i][6],
			new google.maps.Size(21, 34),
			new google.maps.Point(0,0),
			new google.maps.Point(10, 34));

	var LatLng = new google.maps.LatLng(points[i][7],points[i][8]);

	var marker = new google.maps.Marker({
		position: LatLng, 
		map: map,
		icon: pinImage,
		title: points[i][5],
		content: points[i][5]
	});

	google.maps.event.addListener(marker, 'click', function (event) {
		// Add opposite order support
		if (nav == "distance") {
			if (pinSelected) {
				if (mainPin_LatLng == event.latLng) {

					if (document.getElementById("keepDistanceLines").value == "") {
						for (var i=0; i<polylines.length; i++) {
							if (polylines[i][0] == mainPin_LatLng && polylines[i][1] == subPin_LatLng) {
								polylines[i][2].setMap(null); // Delete old line
								polylines.splice(i, i+1);
							}
						}
					}
					mainPin_Title = "";
					mainPin_LatLng = null;
					subPin_Title = "";
					subPin_LatLng = null;

					this.setAnimation(null); // Stop bouncing
					pinSelected = false;
				} else {
					if (document.getElementById("keepDistanceLines").value == "") {
						for (var i=0; i<polylines.length; i++) {
							if (polylines[i][0] == mainPin_LatLng && polylines[i][1] == subPin_LatLng) {
								polylines[i][2].setMap(null); // Delete old line
								polylines.splice(i, i+1);q
							}
						}
					}

					subPin_Title = this.title;
					subPin_LatLng = event.latLng;
					var distance = getDistance(mainPin_LatLng, subPin_LatLng);
					document.getElementById("distanceInfo").innerHTML = mainPin_Title + " is " + distance + " miles away from " + subPin_Title + "\n"
																+document.getElementById("distanceInfo").innerHTML;
				}

			} else {
				mainPin_Title = this.title;
				mainPin_LatLng = event.latLng;
				pinSelected = true;
				this.setAnimation(google.maps.Animation.BOUNCE); // Start bouncing
			}
		}

		if (nav == "circle") {
			var circleRemoved = false;

			for (var i=0; i<circlePoints.length; i++) {
				if (circlePoints[i][0] == event.latLng) {
					circlePoints[i][1].setMap(null);
					circlePoints.splice(i, i+1);
					circleRemoved = true;
				}
			}
			if (!circleRemoved) {
				var radius = document.getElementById("circleRadius").value*1609.34; 
				var color = document.getElementById("colorSelector").getElementsByTagName('div')[0].style.background;
				if (radius > 0) {
					var circleOptions = {
						strokeColor: color,
						strokeOpacity: 0.8,
						strokeWeight: 2,
						fillColor: color,
						fillOpacity: 0.35,
						map: map,
						center: event.latLng,
						radius: radius
					};
					circle = new google.maps.Circle(circleOptions);

					circlePoints.push(new Array(event.latLng, circle));
				} else {
					alert("Please enter a radius");
				}
				
			}
			circleRemoved = false; // Reset!
		}
		
	});

	return LatLng;
}

function deletePolylines(){
	if (document.getElementById("keepDistanceLines").value == "") {
		for (var i=0; i<polylines.length; i++) {
			polylines[i][2].setMap(null);
		}
		polylines = new Array(0);
	}
}


function getLine(start, end) {
	var line = new google.maps.Polyline({
		path: new Array(start, end),
		strokeColor: "#0000FF",
		strokeOpacity: 1.0,
		strokeWeight: 2.0,
		geodesic: true
	});
	var flag = false;
	//if ((polylines[i][0] == mainPin_LatLng && polylines[i][1] == subPin_LatLng) || (polylines[i][1] == mainPin_LatLng && polylines[i][0] == subPin_LatLng))
	for (var i=0; i<polylines.length; i++) {
		if ((polylines[i][0] == start && polylines[i][1] == end) || (polylines[i][1] == start && polylines[i][0] == end)) {
			flag = true;
		}
	}

	if (flag == false) {
		line.setMap(map);
		polylines.push([start, end, line]);
	}
	
	return line
}


function getDistance(start, end) {
	var line = getLine(start, end);
	var total_distance_m = 1000 * line.inKm();
	var dist = unit_handler.f(total_distance_m);
	return dist.toFixed(3);
}


google.maps.LatLng.prototype.kmTo = function (a) {
	var e = Math,
		ra = e.PI / 180;
	var b = this.lat() * ra,
		c = a.lat() * ra,
		d = b - c;
	var g = this.lng() * ra - a.lng() * ra;
	var f = 2 * e.asin(e.sqrt(e.pow(e.sin(d / 2), 2) + e.cos(b) * e.cos(c) * e.pow(e.sin(g / 2), 2)));
	return f * 6378.137
};


google.maps.Polyline.prototype.inKm = function (n) {
	var a = this.getPath(n),
		len = a.getLength(),
		dist = 0;
	for (var i = 0; i < len - 1; i++) {
		dist += a.getAt(i).kmTo(a.getAt(i + 1))
	}
	return dist
};

function navDisplay(id){
	if (id == "#distanceOptions") {
		$('#distanceOptions').show(700);
		$('#circleOptions').hide(700);
		nav='distance';
	} else if (id == "#circleOptions") {
		$('#circleOptions').show(700);
		$('#distanceOptions').hide(700);
		nav='circle';
	} else {
		$('#circleOptions').hide(700);
		$('#distanceOptions').hide(700);
		nav='';
	}


}