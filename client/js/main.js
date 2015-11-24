'use strict';

var covertMap = covertMap || {};

covertMap.functions = function() {

  var geocoder;

  function pageLoaded() {
    $('.location-search').submit(enterSearch);
    $('#draw-map').click(drawView);
    $('#elevation-map').click(elevationView);
    $('#find-SAM').click(calcSAMSite);
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
    var searchTerm = evt.currentTarget[0].value;
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
      //console.log(covertMap.map.getZoom());
      var minZoomLevel = 13;
     if (covertMap.map.getZoom() < minZoomLevel) covertMap.map.setZoom(minZoomLevel);
   });

  };



  var searchCenter;
  function findLocation(search) {
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': search}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          covertMap.map.setCenter(results[0].geometry.location);
          covertMap.map.setZoom(10);
          searchCenter = results[0].geometry.location;
          drawCircle();
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }

  var circle;
  function drawCircle() { 

      circle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        map: covertMap.map,
        center: searchCenter,
        radius: 1000
      }); 

      // Place default radius in input box (1000m)
      document.getElementById('searchRadius').value = 1000;

      // Limit Zooming

  }

  function clearState() {
    google.maps.event.clearListeners(covertMap.map);
    covertMap.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
    $('.left-menu').hide();
    $('#pick-location').removeClass('active');
    $('#draw-map').removeClass('active');
    $('#elevation-map').removeClass('active');
  }

  function updateChosenRadius() {
    $('.searchRadiusBtn').html($(this).text() + ' <span class="caret"></span>');

    // Set radius of circle
    setRadius();
  }

  function setRadius() {
    var unit = $('.searchRadiusBtn').text();
    var value = document.getElementById('searchRadius').value;
    

    if (value != null && circle != null) {
      // Update current circle
      circle.setMap(null);
      var radius = parseInt(getRadius(value, unit));
      circle.radius = radius;
      circle.setMap(covertMap.map);
    }
  }

  function getRadius(value, unit) {
    // Standard value is in metres, so any other unit must be converted to metres
    var radius = 0;

    if (unit.trim() == 'Metres') {
      return value;
    }
    else if (unit.trim() == 'Miles') {
      return value * 1609.34;
    }

    //return null;
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

  function getAlgorithms() {
    $.get('http://localhost:8080/api/1/algorithms')
      .done((data) => {
        buildMenu(data);
      })
      .fail(() => {
        alert('API Fail');
      });
  }

  function buildMenu (algorithmData) {
    covertMap.algorithms = {};
    for (var algo in algorithmData) {
      if (algorithmData.hasOwnProperty(algo)) {
        var obj = algorithmData[algo];
        $('.algo-menu').append('<li id="' + obj.name + '"><a href="#">' + obj.description + '</a></li>');
        $.getScript(obj.file);
        $('.algo-menu').on('click', '#' + obj.name, (evt) => {
          covertMap.algorithms[evt.currentTarget.id].run();
        });
      }
    } 
  }
 
  function calcSAMSite() {
    // Will be moved to API
    
    // (a) Add current SAMs
    addCurrentSAMLocations();

    // (b) Calculate average of current sites
    var elevations = getElevation(locations);
    //var distances = getDistancesFromSea();
    elevations = collectionOfElevations;
    console.log(elevations);

    var totalElevation = 0;
    for (var i = 0;i < elevations.length;i++) {
      console.log('we in');
      totalElevation += elevations[i];
    }

    var averageElevation = totalElevation / elevations.length;

    // (c) Set SAM site elevation boundaries
    getElevationBoundaries(elevations);
    
    
  }

  var collectionOfElevations = new Array();
  function getElevation(collectionOfLocations) {
    var elevator = new google.maps.ElevationService();

    // Loop through locations
    for (var i = 0;i < collectionOfLocations.length; i++) {
      var lat = collectionOfLocations[i][1];
      var lon = collectionOfLocations[i][2];

      var latLon = { lat: lat, lng: lon };

      elevator.getElevationForLocations({ 
        'locations': [latLon]
      }, function(results, status) {
        if (status === google.maps.ElevationStatus.OK) {
          var val = results[0].elevation;
          collectionOfElevations.push(val);
        } 
      }) 
    }

    console.log('The money: ' + collectionOfElevations);
    
    return collectionOfElevations;
    
  }

  function getElevationBoundaries(elevations) {
    for (var i = 0;i < elevations.length;i++) {

    }
  }

  function getDistancesFromSea() {

  }

  var locations;  
  function addCurrentSAMLocations() {
    locations = [
    ['England',  55.0517923211, -2.55790018136 , 1],
    ['France',  47.7873344622, 6.34956062139  , 2],
    ['France',  48.6355062273, 4.90134469371 , 3],
    ['France',  47.0571024196, 2.63520947243 , 4],
    ['France',  43.5176364593, 4.92771362148  , 5],
    ['France',  43.5176364593, 4.92771362148  , 6],
    ['France',  43.9118541239, -0.499979705002 , 7],
    ['spain',  37.6078102302, -1.02401270745 , 8],
    ['germany', 48.0748293196, 10.8973230551 , 9],
    ['germany',  48.7029502418, 11.4374623747 , 10],
    ['germany',  49.4420417433, 7.69231297144 , 11],
    ['germany',  54.0812813073, 12.6751894549   , 12],
    ['netherlands',  51.5177310506, 5.87103097117  , 13],
    ['denmark',  54.7424370253, 9.03667155729   , 14],
    ['italy',  45.0105418207, 10.813257  , 15],    
    ['slovakia',  48.3378623579, 17.9212248592  , 16],
    ['albania',  41.2441446538, 19.8306914692  , 17],
    ['greece',  38.337154, 23.556117  , 18],
    ['greece',  40.6573701253, 23.0247654546  , 19],
    ['greece',  35.3339406285, 25.1778278571  , 20],
    ['greece',  38.5829656307, 26.4904326071  , 21],
    ['greece',  40.9144082648, 24.60913305077  , 22],
    ['greece',40.53705646, 23.0257893018   , 23],
    ['turkey',  36.8632597849, 28.3187663656  , 24],
    ['bulgaria',  42.2113778215, 24.886893043  , 25],
    ['bulgaria',  42.7316372891, 23.395959304 , 26],
    ['romania',  44.1197443427, 26.068306  , 27],
    ['romania',  44.4003135137, 25.628965  , 28],
    ['romania',  45.8556750156, 25.6632601352  , 29],
    ['romania',  44.7572629962, 26.469901  , 30],
    ['ukraine',  45.1491846191, 35.7223712915 , 31],
    ['ukraine',  46.7303425219, 33.3818334529  , 32],
    ['ukraine',  46.5699370098, 30.8806277359 , 33],
    ['ukraine',  46.9848574569, 32.0962095282  , 34],
    ['ukraine',  47.6519672743, 34.546666 , 35],
    ['ukraine',  47.9708646585, 30.9054358838 , 36],
    ['ukraine',  48.3874221439, 34.893212193 , 37],
    ['ukraine',  50.2782128092, 30.8113019284  , 38],
    ['ukraine',  49.9327437316, 36.2903408807  , 39],
    ['Belarus',  53.8653508586, 27.0828145193 , 40],
    ['Belarus',  52.0410543796, 23.692221203  , 41],
    ['Belarus',  53.7290121508, 23.8661613224  , 42],
    ['russia',  55.083341496, 21.8722428987 , 43],
    ['russia',  54.8717553817, 19.9538143131 , 44],
    ['russia',  54.4808053926, 19.91432  , 45],
    ['russia',  54.7478248936, 19.9706574888  , 46]
    ];

    // Could get locations dynamically, e.g. assign values to "locations"

    var infowindow = new google.maps.InfoWindow();

    // Loop through markers, adding the to map
    for (var i = 0; i < locations.length; i++) {  
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(locations[i][1], locations[i][2]),
        map: covertMap.map,
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
      });

      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
          // Capitalise first letter of location
          infowindow.setContent(locations[i][0].charAt(0).toUpperCase() + locations[i][0].slice(1));
          infowindow.open(covertMap.map, marker);
        }
      })(marker, i));
    }
  }

  return {
      pageLoaded: pageLoaded,
      initMap: initMap,
      drawView: drawView
  };

}();

window.addEventListener('load', covertMap.functions.pageLoaded);
