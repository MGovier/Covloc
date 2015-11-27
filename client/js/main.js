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

  function pageLoaded() {
    $('.location-search').submit(enterSearch);
    $('#draw-map').click(drawView);
    $('#elevation-map').click(elevationView);
    $('.left-menu').hide();
    $('#pick-location').addClass('active');
    $('#pick-location').click(function() {
      location.reload();
    });
    $('.radiusDropdown > li').click(updateChosenRadius);
    $('#searchRadius').keydown( function(e) { if (e.which == 13) { setRadius(); } });
    getAlgorithms();
    $('#searchRadius').keyup(setRadius);
  }


  var enterSearch = function (evt) {
    evt.preventDefault();
    let searchTerm = evt.currentTarget[0].value;
    findLocation(searchTerm);
    covertMap.map.setZoom(13);
  };


  var initMap = function() {
    covertMap.map = new google.maps.Map(document.getElementById('map-view'), {
      center: {lat: 0, lng: 0},
      zoom: 2,
      mapTypeId: 'hybrid'
    });

    google.maps.event.addListener(covertMap.map, 'zoom_changed', function() {
      let minZoomLevel = 13;
      if (covertMap.map.getZoom() < minZoomLevel) covertMap.map.setZoom(minZoomLevel);
   });

  };


  function findLocation(search) {
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': search}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          covertMap.map.setCenter(results[0].geometry.location);
          covertMap.map.setZoom(10);
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
        radius: 1000
      }); 
      covertMap.circle.setDraggable(true);
      // Place default radius in input box (1000m)
      document.getElementById('searchRadius').value = 1000;
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


  function getAlgorithms() {
    $.get('http://localhost:8080/api/1/algorithms')
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


  return {
      pageLoaded: pageLoaded,
      initMap: initMap,
      drawView: drawView
  };
}();


window.addEventListener('load', covertMap.functions.pageLoaded);
