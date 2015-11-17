var map;
var drawingManager;


function startgoogleapi() {
	var mapProp = {
		center:new google.maps.LatLng(51.508742, -0.120850),
		zoom: 5,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById("map"), mapProp);

	map.addListener('click', function(e) {
		alert(e.computeArea());
	});	

	// Set up Drawing Tools
	drawingManager = new google.maps.drawing.DrawingManager();
	//rawingManager.setMap(map);
}
// When the window loads
google.maps.event.addDomListener(window, 'load', startgoogleapi);


$(document).ready(function() {

	// Clicking on control
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
			drawingManager.setMap(map);
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


});





