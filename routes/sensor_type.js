var express = require('express');
var sha1 = require('sha1');
var router = express.Router();
var mongoose = require('mongoose');
var Dataset = mongoose.model("dataset");
var SensorType = mongoose.model("sensorType");

//Add view
router.get("/add",function(req,res,next){
	
	res.render("sensortype/add");
});

//POST Dataset
router.post("/", function(req, res, next){
	var name = req.body.name;
	var owner = req.session.user._id;
	var number_of_output_fields = req.body.number_of_output_fields;
	var output_fields = [];
	for(var i = 1; i <= parseInt(number_of_output_fields); i++){
		output_fields.push(req.body["output_field"+i]);
	}
	SensorType.create({
		name : name,
		owner : owner,
		type_of_output_fields : output_fields,
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
	SensorType.remove({_id: id}).exec();	
	res.redirect("/adminhome");
});

module.exports = router;