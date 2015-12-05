/**
 * Client script to create map object, and pull in algorithms from API. 
 * Handles UI events and setting areas for algorithms to run.
 * Built for WebRes 2015/16 Sprint 1.
 *
 * @author T9
 */

'use strict';

// Namespace object for the map, functions, globals, algorithms.
var covertMap = covertMap || {};

covertMap.functions = function() {
  covertMap.mapMarkers = { markers: [] };
  covertMap.CURR_SAM_LAYER = "Current SAM Layer";
  covertMap.LOW_SAM_LAYER = "Low Probabilty SAM Layer";
  covertMap.MED_SAM_LAYER = "Medium Probability SAM Layer";
  covertMap.HIGH_SAM_LAYER = "High Probability SAM Layer";

  const API_URL = '/api/1/algorithms';

  function getAlgorithms() {
    $.get(API_URL)
      .done((data) => {
        buildMenu(data);
      })
      .fail((err) => {
        alert('Algorithm API failed due to: ' + err);
      });
  }


  function buildMenu (algorithmData) {
    covertMap.algorithms = {};
    for (let algo in algorithmData) {
      // Don't use prototype...
      if (algorithmData.hasOwnProperty(algo)) {
        let obj = algorithmData[algo];
        $('.algo-menu').append('<li id="' + obj.name + '"><a href="#">' + obj.description + '</a></li>');
        $.getScript(obj.file);
      }
    }
  }


  function runAlgo(evt) {
    clearState();
    $(evt.currentTarget).addClass('active');
    covertMap.algorithms[evt.currentTarget.id].run();
  }

  function pageLoaded() {
    $('.location-search').submit(enterSearch);
    $('#draw-map').click(drawView);
    $('#elevation-map').click(elevationView);
    $('.left-menu').hide();
    $('#pick-location').addClass('active');
    $('#pick-location').click(function() {
      // Simplest way to reset the map for now:
      location.reload();
    });
    $('.radiusDropdown > li').click(updateChosenRadius);
    $('#searchRadius').keydown( function(e) { if (e.which == 13) { setRadius(); } });
    getAlgorithms();
    $('#searchRadius').keyup(setRadius);
    $('.list-group li').click(toggleMarkers);
  }


  var enterSearch = function (evt) {
    evt.preventDefault();
    let searchTerm = evt.currentTarget[0].value;
    findLocation(searchTerm);
    covertMap.map.setZoom(11);
  };


  var initMap = function() {
    covertMap.map = new google.maps.Map(document.getElementById('map-view'), {
      center: {lat: 0, lng: 0},
      zoom: 2,
      mapTypeId: 'hybrid'
    });

  };


  function findLocation(search) {
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': search}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          covertMap.map.setCenter(results[0].geometry.location);
          let searchCenter = results[0].geometry.location;
          drawCircle(searchCenter);
          // Enable angorithms:
          $('.algo-menu li').on('click', runAlgo);
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }


  function drawCircle(searchCenter) { 
      covertMap.circle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        map: covertMap.map,
        center: searchCenter,
        radius: 5000,
        geodesic: true,
        draggable: true
      }); 

      // Place default radius in input box (1000m)
      document.getElementById('searchRadius').value = 5000;

      // Set map to chosen location
      covertMap.map.setCenter(searchCenter);
  }

  function clearState() {
    google.maps.event.clearListeners(covertMap.map);
    covertMap.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
    $('.left-menu').hide();
    $('.sidebar li').removeClass('active');
  }

  function updateChosenRadius() {
    $('.searchRadiusBtn').html($(this).text() + ' <span class="caret"></span>');

    // Set radius of circle
    setRadius();
  }

  function setRadius() {
    let unit = $('.searchRadiusBtn').text(),
        value = document.getElementById('searchRadius').value;
    
    if (value !== null && covertMap.circle !== null) {
      // Update current circle
      covertMap.circle.setMap(null);
      let radius = parseInt(getRadius(value, unit));
      covertMap.circle.radius = radius;
      covertMap.circle.setMap(covertMap.map);
    }
  }


  function getRadius(value, unit) {
    if (unit.trim() == 'Metres') {
      return value;
    }
    else if (unit.trim() == 'Miles') {
      return value * 1609.34;
    }
  }


  function drawView() {
    clearState();
    $('#draw-map').addClass('active');
    let drawingManager = new google.maps.drawing.DrawingManager();
    
    covertMap.map.addListener('click', function(e) {
      alert(e.getPosition());
    });

    $('.left-menu').show();

    $('.left-menu-item').click(function() {
      let index = $( '.left-menu-item' ).index( this );
      
      // Menu item classes
      let draw = $('.left-menu-item:eq(0)'),
          select = $('.left-menu-item:eq(1)');

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

  function toggleMarkers() {
    // check the index
    let index = $(this).index();
    //alert(index);
    if (index > 0) {
      if (index === 1) {
        // Toggle known SAM sites OFF
        if ( $('.toggle-button').eq( index - 1).hasClass('list-group-item-success') ) { setMarkerVisibility(covertMap.CURR_SAM_LAYER, false); } 
        // Toggle known SAM sites ON
        else { setMarkerVisibility(covertMap.CURR_SAM_LAYER, true); }

      } 
      else if (index === 2) {
        // Toggle High Probability SAM sites OFF
        if ( $('.toggle-button').eq( index - 1).hasClass('list-group-item-success') ) { setMarkerVisibility(covertMap.HIGH_SAM_LAYER, false); } 
        // Toggle High Probability SAM sites OFF
        else { setMarkerVisibility(covertMap.HIGH_SAM_LAYER, true); }
      } 
      else if (index === 3) {
        // Toggle Medium Probability SAM sites OFF
        if ( $('.toggle-button').eq( index - 1).hasClass('list-group-item-success') ) { setMarkerVisibility(covertMap.MED_SAM_LAYER, false); } 
        // Toggle Medium Probability SAM sites OFF
        else { setMarkerVisibility(covertMap.MED_SAM_LAYER, true); }
      } 
      else {
        // Toggle Low Probability SAM sites OFF
        if ( $('.toggle-button').eq( index - 1).hasClass('list-group-item-success') ) { setMarkerVisibility(covertMap.LOW_SAM_LAYER, false); } 
        // Toggle Low Probability SAM sites OFF
        else { setMarkerVisibility(covertMap.LOW_SAM_LAYER, true); }
      }

      // Toggle the class for visual aid
      $('.toggle-button').eq( index - 1 ).toggleClass('list-group-item-success');
    }
    
    
    // toggle the class
    // if on, hide markers
    // if off, show markers

  }

  function setMarkerVisibility(layerName, setVisible) {

    for (var i = 0;i < covertMap.mapMarkers.markers.length;i++) {
      var markerObj = covertMap.mapMarkers.markers[i];

      if (markerObj.layer == layerName) { 
        // Set to map or null, based on setVisible parameter
        let map = setVisible ? covertMap.map : null;
        markerObj.marker.setMap(map); 
      }
    } 
  }


  function elevationView() {
    clearState();
    $('#elevation-map').addClass('active');
    let elevator = new google.maps.ElevationService(),
        infowindow = new google.maps.InfoWindow({map: covertMap.map});

    covertMap.map.setMapTypeId(google.maps.MapTypeId.TERRAIN);

    var updateInfo = function (event) {
      displayLocationElevation(event.latLng, elevator, infowindow);
    };

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

  return {
      pageLoaded: pageLoaded,
      initMap: initMap,
      drawView: drawView
  };
}();


window.addEventListener('load', covertMap.functions.pageLoaded);
