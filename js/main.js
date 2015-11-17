'use strict';

var covertMap = covertMap || {};

covertMap.embedAPI = 'AIzaSyCExq39ql2QOxjS90djLcDdUaOCFFA56Ns';

covertMap.functions = function() {

  function pageLoaded() {
    $('.location-search').submit(enterSearch);
    $('#draw-map').click(drawView);
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
      mapTypeId: 'terrain'
    });
  };

  function drawView () {
      covertMap.map.addListener('click', function(e) {
        alert(e.computeArea());
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

  return {
      pageLoaded: pageLoaded,
      initMap: initMap,
      drawView: drawView
  };

}();

window.addEventListener('load', covertMap.functions.pageLoaded);