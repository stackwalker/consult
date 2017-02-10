const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const csv = require('csvtojson')
const fs = require('fs')
const moment = require('moment')

const upload = multer({
	dest: path.join(__dirname, '../uploads')
})

router.get('/', (req, res, next) => {
  res.render('preco')
})

router.post('/', upload.single('myFile'), (req, res, next) => {
	let last = {}
	let events = []
	let event
	let fileName

	const headers = ['date', 'time', 'latitude', 'longitude', 'speed', 'id', 'type', 'zone', 'status', 'reverse', 'newDetection']
	csv({headers: headers, noheader: false}).fromFile(req.file.path)
		.on('json', obj => {
			const pair = require('convert-coordinates')(obj.latitude, obj.longitude).toDecimal()				
			obj.latitude = pair.latitude
			obj.longitude = pair.longitude
			console.log("Decimals?: ", obj)	
			if(obj.zone > 0 && last.zone === 0){
				event = {entries: []}
				event.entries.push(obj)
				fileName = moment(obj.date + ' ' + obj.time, 'DD/MM/YY hh:mm:ss.SSS').format('YYYYMMDDhhmm') 
				event.startDateTime = moment(obj.date + ' ' + obj.time, 'DD/MM/YY hh:mm:ss.SSS').format('YYYY/MM/DD hh:mm:ss.SSS') 
				event.startLatitude = obj.latitude
				event.startLongitude = obj.longitude
				event.startDate = obj.date
				event.startTime = obj.time
				event.startSpeed = obj.speed
				event.startZone = obj.zone
			}
			if(obj.zone > 0 && last.zone > 0){
				event.entries.push(obj)
			}
			if(obj.zone === 0 && last.zone > 0){
				event.endLatitude = last.latitude
				event.endLongitude = last.longitude
				event.endDateTime = moment(last.date + ' ' + last.time, 'DD/MM/YY hh:mm:ss.SSS').format('YYYY/MM/DD hh:mm:ss.SSS')
				event.endSpeed = last.speed
				event.endZone = last.zone
				events.push(event)
			}
			last = obj
		})
		.on('done', (err, obj) => {
			fs.appendFile(req.file.destination + '/' + fileName + '.json', JSON.stringify(events), (err) => {
				if(err){
					console.log('Unable to write to file: ', err)
				}else{
					fs.unlink(req.file.path, (err) => {
						if(err){console.log('Unable to delete uploaded file')}
					})
				}
			})
			req.flash('success', { msg: 'File was uploaded successfully.' });
			res.redirect('/preco');
		})
})

router.get('/files', (req, res, next) => {
	let fileList = []
	fs.readdir('./uploads', (err, files) => {
		files.forEach(f => {
			fileList.push(f.replace('.json', ''))	
		})
		res.json(fileList)
	}) 
})

router.get('/files/:fileId/events', (req, res, next) => {
	let events = require('../uploads/' + req.params.fileId + '.json')
	res.json(events)
})

module.exports = router;
