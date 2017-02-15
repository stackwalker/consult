window.preco = {}

preco.initMap = function(){

	preco.markers = []

	preco.map = new google.maps.Map(document.getElementById('map'), {
		center: { lat: 36.0907578, lng: -119.5948303 },
		zoom: 5
	})
	
	preco.infoWindow = new google.maps.InfoWindow()

	preco.refreshMap = function(events){
		removeMarkers()

		if(events.length > 0){
			var newCenter = new google.maps.LatLng(events[0].startLatitude, events[0].startLongitude);
			preco.map.setOptions({
					center: newCenter,
					zoom: 7
			});

			events.forEach(function(e,i){
					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(e.startLatitude, e.startLongitude),
						icon:{
							url: '/images/mastcrane-red.png'
						},
						map: preco.map,
						title: e.startDate + "-" + e.startTime,
						animation: google.maps.Animation.DROP,
						index: i
					})

				preco.markers.push(marker)
				google.maps.event.addListener(marker, 'click', function() {preco.model.selectEvent(preco.model.getFilteredEvents()[marker.index], marker.index)});
			})
		}
	}

	function removeMarkers(){
    for(i=0; i<preco.markers.length; i++){
			preco.markers[i].setMap(null);
    }
	}
}

$(document).ready(function() {
		
	var mdl = model()
	var allEvents

	function initUI(){
		fileSelect()
		map()
		mapNav()
		//uploader()
		filters()
		mdl.fetchFileList()
	}

	function fileSelect(){
		mdl.topics.fileListRetrieved.add(refresh)
				
		$('#file-select').change(function(e){
			mdl.fetchEvents(e.target.value)
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

		mdl.topics.eventSelected.add(function(event, index){
			preco.infoWindow.setContent('<strong>Date:</strong> ' + event.startDateTime + '<br/><strong>Start/End Zone:</strong>' + event.startZone + '/' + event.endZone + '<br/><strong>Start/End Speed:</strong>' + event.startSpeed + '/' + event.endSpeed)	
			preco.infoWindow.open(preco.map, preco.markers[index])
			var newCenter = new google.maps.LatLng(preco.markers[index].position.lat(), preco.markers[index].position.lng());
			preco.map.setOptions({
					center: newCenter,
					zoom: 12
			});
		})
	}
	
	function mapNav() {

		$('#map-nav').delegate('.event-block', 'click', function(e){
			var index = $('#map-nav .event-block').index(this)
			mdl.selectEvent(mdl.getFilteredEvents()[index], index)
		})
		
		$('#map-nav').delegate('.event-block', 'mouseenter', function(e){
			var index = $('#map-nav .event-block').index(this);
      preco.markers[index].setIcon({url: '/images/mastcrane-white.png'});
		})

		$('#map-nav').delegate('.event-block', 'mouseleave', function(e){
			var index = $('#map-nav .event-block').index(this);
      preco.markers[index].setIcon({url: '/images/mastcrane-red.png'});
		})

		mdl.topics.eventSelected.add(function(event, index){
			$('.event-block').removeClass('block-expanded')
			$($('.event-block')[index]).toggleClass('block-expanded')
		})

		mdl.topics.eventsRetrieved.add(function(events){
			$('#map-nav').empty()

			events.forEach(function(e,i){
				var startDateTime = moment(e.startDateTime, 'YYYY/MM/DD hh:mm:ss.SSS')
				var endDateTime = moment(e.endDateTime, 'YYYY/MM/DD hh:mm:ss.SSS')

				var block = $('<div class="event-block"/>')
				block.append('<div class="block-heading">' + startDateTime.format('MMMM Do YYYY, h:mm a') + '</div>')
				block.append('<div class="event-data-row"/>')
					.append('<div class="block-label">Start-End Speed</div><div class="block-value">' + e.startSpeed + 'km/h - ' + e.endSpeed + 'km/h</div></div>')
				block.append('<div class="event-data-row"/>')
					.append('<div class="block-label">Start/End Zone</div><div class="block-value">' + e.startZone + ' / ' + e.endZone + '</div></div>')
				block.append('<div class="event-data-row"/>')
					.append('<div class="block-label">Duration(secs)</div><div class="block-value">' + moment.duration(endDateTime.diff(startDateTime)).asSeconds() + '</div></div>')
				$('#map-nav').append(block)
			})
		})
	}

	function uploader(){
		$('#file-input').change(function(e){
			var file = this.files[0]
			var rdr = new FileReader()
			rdr.onload = function(event){
				var json = toJSON(event.target.result)
			}
			var csv = rdr.readAsText(file)
		})
	}
	
	function filters(){
		
		$('.ui-filter').change(function(e){
			applyFilters()
		})
		
		function applyFilters(){
			var filteredEvents = mdl.allEvents

			if($('#start-date').val()){
				var sd = moment($('#start-date').val())
				filteredEvents = filteredEvents.filter(function(e){
					return moment(e.startDateTime, 'YYYY/MM/DD hh:mm:ss.SSS').diff(sd) >= 0
				})
			}
			if($('#end-date').val()){
				var ed = moment($('#end-date').val())
				filteredEvents = filteredEvents.filter(function(e){
					return moment(e.endDateTime, 'YYYY/MM/DD hh:mm:ss.SSS').diff(ed) <= 0
				})
			}
			if(!$('#end-zone-1').prop('checked')){
				filteredEvents = filteredEvents.filter(function(e){
					return e.endZone !== 1
				})
			}
			if(!$('#end-zone-2').prop('checked')){
				filteredEvents = filteredEvents.filter(function(e){
					return e.endZone !== 2
				})
			}
			if(!$('#end-zone-3').prop('checked')){
				filteredEvents = filteredEvents.filter(function(e){
					return e.endZone !== 3
				})
			}
			if(!$('#end-zone-4').prop('checked')){
				filteredEvents = filteredEvents.filter(function(e){
					return e.endZone !== 4
				})
			}	
			if(!$('#end-zone-5').prop('checked')){
				filteredEvents = filteredEvents.filter(function(e){
					return e.endZone !== 5
				})
			}
			mdl.setFilteredEvents(filteredEvents)
		}
	}

	initUI()
})

function model(){
	var theModel = {}
	var filteredEvents = []	
	var selectedEvent = {}
	theModel.allEvents = []

	theModel.topics = {
		fileListRetrieved: $.Callbacks(),
		eventsRetrieved: $.Callbacks(),
		eventSelected: $.Callbacks()
	}

	theModel.fetchFileList = function(){
		$.getJSON('/preco/files', function(data){
			theModel.topics.fileListRetrieved.fire(data)
		})
	}

	theModel.fetchEvents = function(fileId){
		$.getJSON('/preco/files/' + fileId + '/events', function(data){
			console.log(data)
			theModel.allEvents = data
			theModel.setFilteredEvents(data)
		})
	}

	theModel.setFilteredEvents = function(filtered){
		filteredEvents = filtered
		theModel.topics.eventsRetrieved.fire(filteredEvents)		
	} 

	theModel.getFilteredEvents = function(){
		return filteredEvents
	}

	theModel.selectEvent = function(event,index){
		selectedEvent = event
		theModel.topics.eventSelected.fire(event, index)
	}

	preco.model = theModel
	return theModel
}

function toJSON(csv){
	var last = {}
	var events = []
	var event
	var fileName

	const headers = ['date', 'time', 'latitude', 'longitude', 'speed', 'id', 'type', 'zone', 'status', 'reverse', 'newDetection']
	csvToJson(csv, headers)
		.onRowConverted(function(obj){
			var pair = converter(obj.latitude, obj.longitude).toDecimal()				
			obj.latitude = pair.latitude
			obj.longitude = pair.longitude
			if(obj.zone > 0 && last.zone === 0){
				event = {entries: []}
				event.entries.push(obj)
				fileName = moment(obj.date + ' ' + obj.time, 'DD/MM/YY hh:mm:ss.SSS').format('YYYYMMDDhhmm') 
				event.startDateTime = moment(obj.date + ' ' + obj.time, 'DD/MM/YY hh:mm:ss.SSS').format('YYYYMMDDhhmm') 
				event.startLatitude = obj.latitude
				event.startLongitude = obj.longitude
				event.startDate = obj.date
				event.startTime = obj.time
			}
			if(obj.zone > 0 && last.zone > 0){
				event.entries.push(obj)
			}
			if(obj.zone === 0 && last.zone > 0){
				event.endDateTime = moment(obj.date + ' ' + obj.time, 'DD/MM/YY hh:mm:ss.SSS').format('YYYYMMDDhhmm') 
				events.push(event)
			}
			last = obj
			return event
		})
		.done(function(events){
			return events
		})
}

function csvToJson(csv, headers){
	var thingy = {}
	var convertedCallback;
	var doneCallback;

	thingy.onRowConverted = function(cb){
		convertedCallback = cb	
	} 
	thingy.done = function(cb){
		doneCallback = cb	
	}

	setTimeout(function(){
		var lines=csv.split("\n")
		var result = []

		for(var i=1;i<lines.length;i++){
			var obj = {}
			var currentline=lines[i].split(",")

			for(var j=0;j<headers.length;j++){
				obj[headers[j]] = currentline[j]
			}
			
			result.push(convertedCallback(obj))
		}

		doneCallback(JSON.stringify(result))

	}, 0)

	return thingy
}

function converter(){
	const converter = {}
	
	function getPair(){
		return { latitude: convertToDecimal(latitude), longitude: convertToDecimal(longitude) }
	}

	function convertToDecimal(coordinate){
		const hoursmins = coordinate.split(' ')
		let mins = parseFloat(hoursmins[1])
		const degrees = parseInt(hoursmins[0].match(/(\d+)/g)[0])
		const direction = hoursmins[0].match(/(\D+)/g)[0]
		mins = mins/60
		return ['n','e'].includes(direction.toLowerCase()) ?
			degrees + mins :
			(degrees * -1) - mins
	}

	converter.toDecimal = getPair
	return converter
}
