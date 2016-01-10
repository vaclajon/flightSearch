var map;
var markers = [];
var coor = [];
var radius = 250;

function initMap() {
  var myLatlng = {lat: 50.21, lng: 14.044};
   var numOfMarkers=0;
   
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: myLatlng
  });

  map.addListener('click', function(event) {
   numOfMarkers = numOfMarkers + 1;
   if(numOfMarkers===1){
   $("#radius").val(radius).attr("disabled", false);
   coor.push(placeMarker(event.latLng)); 
    $("#from").val(coor[0].lat+";"+coor[0].lng);    
   }
   else if(numOfMarkers===2){
       coor.push(placeMarker(event.latLng));
    
    $("#to").val(coor[1].lat+";"+coor[1].lng);   
   }
   else{
   deleteMarkers();
   $("#radius").val("").attr("disabled", true); 
   $("#from").val("");
   $("#to").val("");    
   }

  });

function placeMarker(location) {
var position;
    var marker = new google.maps.Marker({
        position: location, 
        map: map
  });
  position={
   lat:marker.getPosition().lat(),
   lng:marker.getPosition().lng()
  
  };
  markers.push(marker);

  return position;
}

function clearMarkers() {
  setMapOnAll(null);
}

 // Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}
// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
  coor = [];
  numOfMarkers =0;
}


}
    