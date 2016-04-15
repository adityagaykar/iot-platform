var express = require('express');
var sha1 = require('sha1');
var router = express.Router();
var mongoose = require('mongoose');
var Dataset = mongoose.model("dataset");
var Application = mongoose.model("applications");
var ApplicationUsers = mongoose.model("ApplicationUsers");
var hat = require('hat');
//GET datasets
router.get("/home/:id",function(req, res, next){
	Application.find(function(err, data){
		var _id = req.params.id;
		res.render("application/app_home",{user : req.session.user, id : _id});
	});
});

//View Application users

router.get("/:id/users",function(req,res,next){
	var app_id = req.params.id;
	console.log(" App_id : "+ app_id);
	ApplicationUsers.find({app_id : app_id}, function(err, apps){
		console.log(JSON.stringify(apps));
		res.render("application/view", {apps : apps})
	});
});

//Add view
router.get("/add",function(req,res,next){
	res.render("application/add");
});

//POST Dataset
router.post("/", function(req, res, next){
	var name = req.body.name;
	var owner = req.session.user._id;

	Application.create({
		name : name,
		owner : owner,
		registration_key: hat(),
		users : []
	}, function(err, dataset){
		if( err)
			res.send(err);
		res.redirect("/home");
	})
});


//DELETE Dataset

router.get("/delete/:id",function(req, res, next){
	var id = req.params.id;
	console.log(id);
	Application.remove({_id: id}).exec();	
	res.redirect("/applications");
});

module.exports = router;