'use strict';

var covertMap = covertMap || {};

covertMap.embedAPI = 'AIzaSyCExq39ql2QOxjS90djLcDdUaOCFFA56Ns';

covertMap.functions = function() {

  function pageLoaded() {
    $('.location-search').submit(enterSearch);
    $('#draw-map').click(drawView);
    $('#elevation-map').click(elevationView);
    $('.left-menu').hide();
  }

  var enterSearch = function (evt) {
    evt.preventDefault();
    var searchTerm = evt.currentTarget[0].value;
    $('body').append('<script async defer ' +
      'src="https://maps.googleapis.com/maps/api/js?key=' + covertMap.embedAPI + '&callback=covertMap.functions.initMap&libraries=drawing,geometry">' +
      '</script>');
  };

  var initMap = function() {
    covertMap.map = new google.maps.Map(document.getElementById('map-view'), {
      center: {lat: -34.397, lng: 150.644},
      zoom: 8,
      mapTypeId: 'hybrid'
    });
  };

  function drawView() {
      covertMap.map.addListener('click', function(e) {
        alert(e.getPosition());
      });

      var drawingManager = new google.maps.drawing.DrawingManager();

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
    var elevator = new google.maps.ElevationService();
    var infowindow = new google.maps.InfoWindow({map: covertMap.map});
    covertMap.map.setMapTypeId(google.maps.MapTypeId.TERRAIN);

    covertMap.map.addListener('click', function(event) {
      displayLocationElevation(event.latLng, elevator, infowindow);
    });

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

  return {
      pageLoaded: pageLoaded,
      initMap: initMap,
      drawView: drawView
  };

}();

window.addEventListener('load', covertMap.functions.pageLoaded);