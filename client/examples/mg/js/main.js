'use strict';

var covertMap = covertMap || {};

covertMap.embedAPI = 'AIzaSyCExq39ql2QOxjS90djLcDdUaOCFFA56Ns';

covertMap.functions = function() {

  function pageLoaded() {
    $('.location-search').submit(enterSearch);
  }

  var enterSearch = function (evt) {
    evt.preventDefault();
    var searchTerm = evt.currentTarget[0].value;
    $('body').append('<script async defer ' +
      'src="https://maps.googleapis.com/maps/api/js?key=' + covertMap.embedAPI + '&callback=covertMap.functions.initMap">' +
      '</script>');
  };

  var initMap = function() {
    covertMap.map = new google.maps.Map(document.getElementById('map-view'), {
      center: {lat: -34.397, lng: 150.644},
      zoom: 8,
      mapTypeId: 'terrain'
    });
  };

  return {
      pageLoaded: pageLoaded,
      initMap: initMap
  };

}();

window.addEventListener('load', covertMap.functions.pageLoaded);