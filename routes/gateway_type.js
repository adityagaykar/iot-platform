var express = require('express');
var sha1 = require('sha1');
var router = express.Router();
var mongoose = require('mongoose');
var Dataset = mongoose.model("dataset");
var GatewayType = mongoose.model("gatewayType");

//Add view
router.get("/add",function(req,res,next){
	
	res.render("gatewaytype/add");
});

//POST Dataset
router.post("/", function(req, res, next){
	var name = req.body.name;
	var owner = req.session.user._id;
	var number_of_meta_fields = req.body.number_of_meta_fields;
	var number_of_static_fields = req.body.number_of_static_fields;
	var number_of_sensors = req.body.number_of_sensors;
	var metas = [], statics = [], sensors = [];
	for(var i = 1; i <= parseInt(number_of_meta_fields); i++){
		metas.push(req.body["meta"+i]);
	}
	for(var i = 1; i <= parseInt(number_of_static_fields); i++){
		statics.push(req.body["static"+i]);
	}
	for(var i = 1; i <= parseInt(number_of_sensors); i++){
		sensors.push(req.body["sensor"+i]);
	}
	GatewayType.create({
		name : name,
		owner : owner,
		meta_data : metas,
		static_data : statics,
		sensor_data : sensors
	}, function(err, dataset){
		if( err)
			res.send(err);
		else
			res.redirect("/adminhome");
	})
});


//DELETE Dataset

router.get("/delete/:id",function(req, res, next){
	var id = req.params.id;
	console.log(id);
	GatewayType.remove({_id: id}).exec();	
	res.redirect("/adminhome");
});

module.exports = router;