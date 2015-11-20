'use strict';

var covertMap = covertMap || {};

covertMap.embedAPI = 'AIzaSyCExq39ql2QOxjS90djLcDdUaOCFFA56Ns';

covertMap.functions = function() {

  var geocoder;

  function pageLoaded() {
    $('.location-search').submit(enterSearch);
    $('#draw-map').click(drawView);
    $('#elevation-map').click(elevationView);
    $('#find-SAM').click(SAMView);
    $('.left-menu').hide();
    $('#pick-location').addClass('active');
    $('#pick-location').click(function() {
      location.reload();
    });
  }

  var enterSearch = function (evt) {
    evt.preventDefault();
    var searchTerm = evt.currentTarget[0].value;
    findLocation(searchTerm);
  };

  var initMap = function() {
    covertMap.map = new google.maps.Map(document.getElementById('map-view'), {
      center: {lat: 0, lng: 0},
      zoom: 2,
      mapTypeId: 'hybrid'
    });
  };

  function findLocation(search) {
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': search}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          covertMap.map.setCenter(results[0].geometry.location);
          covertMap.map.setZoom(10);
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }

  function clearState() {
    google.maps.event.clearListeners(covertMap.map);
    covertMap.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
    $('.left-menu').hide();
    $('#pick-location').removeClass('active');
    $('#draw-map').removeClass('active');
    $('#elevation-map').removeClass('active');
    // Lock map.
  }


  function drawView() {
    clearState();
    $('#draw-map').addClass('active');
    var drawingManager = new google.maps.drawing.DrawingManager();
    
    covertMap.map.addListener('click', function(e) {
      alert(e.getPosition());
    });

    $('.left-menu').show();

    $('.left-menu-item').click(function() {
      var index = $( ".left-menu-item" ).index( this );
      
      // Menu item classes
      var draw = $('.left-menu-item:eq(0)');
      var select = $('.left-menu-item:eq(1)');

      // If draw was selected
      if (index === 0) {
        draw.toggleClass('menu-item-selected');
        select.toggleClass('menu-item-selected', false);

        // Add draw control to map
        drawingManager.setMap(covertMap.map);
      } else {
        select.toggleClass('menu-item-selected');
        draw.toggleClass('menu-item-selected', false);

        // Remove draw control from map
        drawingManager.setMap(null);
      }

      if (!draw.hasClass('menu-item-selected')) {
        drawingManager.setMap(null);
      }

    });
  }

  function elevationView() {
    clearState();
    $('#elevation-map').addClass('active');
    var elevator = new google.maps.ElevationService();
    var infowindow = new google.maps.InfoWindow({map: covertMap.map});
    covertMap.map.setMapTypeId(google.maps.MapTypeId.TERRAIN);

    var updateInfo = function (event) {
      displayLocationElevation(event.latLng, elevator, infowindow);
    }

    covertMap.map.addListener('click', updateInfo);

    function displayLocationElevation(location, elevator, infowindow) {
      // Initiate the location request
      elevator.getElevationForLocations({
        'locations': [location]
      }, function(results, status) {
        infowindow.setPosition(location);
        if (status === google.maps.ElevationStatus.OK) {
          // Retrieve the first result
          if (results[0]) {
            // Open the infowindow indicating the elevation at the clicked position.
            infowindow.setContent('The elevation at this point <br>is ' +
                results[0].elevation + ' meters.');
          } else {
            infowindow.setContent('No results found');
          }
        } else {
          infowindow.setContent('Elevation service failed due to: ' + status);
        }
      });
    }
  }

  function SAMView(evt) {
    clearState();
    $('#find-SAM').addClass('active');
    evt.preventDefault();
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
      pageLoaded: pageLoaded,
      initMap: initMap,
      drawView: drawView
  };

}();

window.addEventListener('load', covertMap.functions.pageLoaded);