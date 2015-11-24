'use strict';

covertMap.algorithms.HighestAltitude = function () {
  function run() {
    var bounds = covertMap.map.getBounds(),
        ne = bounds.getNorthEast(),
        sw = bounds.getSouthWest(),
        nw = new google.maps.LatLng(ne.lat(), sw.lng()),
        se = new google.maps.LatLng(sw.lat(), ne.lng()),
        coords = [];
    var hSteps = Math.abs(sw.lng() - se.lng()) / 25;
    var vSteps = Math.abs(ne.lat() - se.lat()) / 25;
    for (var i = sw.lng(); i <= se.lng(); i += hSteps) {
      for (var j = se.lat(); j <= ne.lat(); j += vSteps) {
        coords.push(new google.maps.LatLng(j, i));
      }
    }
    console.log(coords);
    var highest, elevator = new google.maps.ElevationService();
    elevator.getElevationForLocations({
      'locations': coords
    }, function(results, status) {
      if (status === google.maps.ElevationStatus.OK) {
        // Retrieve the first result
        if (results[0]) {
          for (var i = 0; i < results.length; i++) {
            if (results[i].elevation > highest.elevation) {
              highest = results[i];
            }
          }
          var marker = new google.maps.Marker({
            position: highest,
            map: covertMap.map,
            title: 'PROBABLY A SAM SITE: ' + highest.elevation
          });
        } else {
          // 'No results found'
        }
      } else {
        // 'Elevation service failed due to: ' + status)
      }
    });
  }
  return {
    run: run
  }
}();