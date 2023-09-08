const { parseIsolatedEntityName } = require("typescript");

initMap().catch((err) => {
  console.error(err);
});

let apiKey = "AIzaSyAmjehq5Rf1kK-E4bU7D-VaHbtvb_5FSC0";
let map;

let Markers = [];

async function initMap() {
  //Starting point of the map latlang
  const myLatLng = { lat: 6.93, lng: 79.84 };

  //Importing the map library
  const { Map } = await google.maps.importLibrary("maps");

  //Importing the map to the div with id "map"
  map = new Map(document.getElementById("map"), {
    center: myLatLng,
    zoom: 14,
    clickableIcons: false,
  });

  //Drawing the route
  routePath = new google.maps.Polyline({
    strokeColor: "#393",
    strokeOpacity: 1.0,
    strokeWeight: 3,
  });
  routePath.setMap(map);

  //Adding a listener to the map
  map.addListener("click", addLatLan);
}

//Array to store the route coordinates
const routeCoord = [];

/**
 *
 * @param {*} event [Event object]
 *
 */
function addLatLan(event) {
  //Getting the path of the route
  let path = routePath.getPath();

  //Adding to the array
  routeCoord.push(event.latLng.toJSON());

  path.push(event.latLng);
  Markers = new google.maps.Marker({
    position: event.latLng,
    title: "#" + path.getLength(),
    map: map,
    visible: true,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 4,
      strokeColor: "#393",
    },
  });
}

const clearButton = document.getElementById("clear-button");
clearButton.addEventListener("click", clearMap);

const submitButton = document.getElementById("submit-button");
submitButton.addEventListener("click", submitRoute);

function clearMap() {
  routeCoord.length = 0;
  routePath.getPath().clear();

  //clear markers
  //Write code on clearing markers from the map
}

function submitRoute() {
  console.log(routeCoord);
  routePath.getPath().clear();
  snapToRoad(routeCoord);
}

//snap a user center to the nearest road
//ref: https://developers.google.com/maps/documentation/roads/snap

function snapToRoad(path) {
  let url = changeUrl(path);
  console.log(url);
  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      processSnapToRoadResponse(data);
    })
    .catch(function (error) {
      alert(error);
    });
}
var placeIdArray = [];
var polylines = [];
var snappedCoordinates = [];

function processSnapToRoadResponse(data) {
  snappedCoordinates = [];
  placeIdArray = [];
  for (var i = 0; i < data.snappedPoints.length; i++) {
    var latlng = new google.maps.LatLng(
      data.snappedPoints[i].location.latitude,
      data.snappedPoints[i].location.longitude
    );
    snappedCoordinates.push(latlng);
    placeIdArray.push(data.snappedPoints[i].placeId);
  }
}

function changeUrl(path) {
  let url = "https://roads.googleapis.com/v1/snapToRoads?path=";

  for (let i = 0; i < path.length; i++) {
    url += path[i].lat + "," + path[i].lng + "|";
  }
  url = url.slice(0, -1);
  url += "&interpolate=true&key=" + apiKey;
  return url;
}
