window.preco = {}

preco.initMap = function(){
	 preco.map = new google.maps.Map(document.getElementById('map'), {
		center: { lat: 36.0907578, lng: -119.5948303 },
		zoom: 5
	})
			
	preco.refreshMap = function(events){
		var newCenter = new google.maps.LatLng(events[0].startingLatitude, events[0].startingLongitude);
    preco.map.setOptions({
        center: newCenter,
        zoom: 5
    });

		events.forEach(function(e){
			console.log("Event: ", e)
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(e.startingLatitude, e.startingLongitude),
				map: preco.map,
				title: e.startDate + "-" + e.startTime,
				animation: google.maps.Animation.DROP
			})
		})
	}
}

$(document).ready(function() {
	
	var mdl = model()
	
	function initUI(){
		fileSelect()
		map()
		mdl.getFileList()
	}

	function fileSelect(){
		mdl.topics.fileListRetrieved.add(refresh)
		
		$('#file-select').change(function(e){
			mdl.getEvents(e.target.value)
		})

		function refresh(fileList){
			$('#file-select')
				.empty()
				.append('<option>Choose a file</option>')

			fileList.forEach(function(f){
				$('#file-select').append('<option>' + f.replace('.json', '') + '</option>')
			})
		}
	}

	function map() {
		mdl.topics.eventsRetrieved.add(preco.refreshMap)
	}

	initUI()
})

function model(){
	var theModel = {}
	
	theModel.topics = {
		fileListRetrieved: $.Callbacks(),
		eventsRetrieved: $.Callbacks()
	}

	theModel.getFileList = function(){
		$.getJSON('/preco/files', function(data){
			theModel.topics.fileListRetrieved.fire(data)
		})
	}

	theModel.getEvents = function(fileId){
		$.getJSON('/preco/files/' + fileId + '/events', function(data){
			theModel.topics.eventsRetrieved.fire(data)
		})
	}

	return theModel
}

