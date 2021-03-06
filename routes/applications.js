var express = require('express');
var sha1 = require('sha1');
var router = express.Router();
var mongoose = require('mongoose');
var Dataset = mongoose.model("dataset");
var Application = mongoose.model("applications");
var ApplicationUsers = mongoose.model("ApplicationUsers");
var hat = require('hat');
var RegisterGateway = mongoose.model("registerGateway");
var Gateway = mongoose.model("gateway");
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

//GET Edit access page for app users

router.get("/access/:id", function(req,res,next){
	var access_token = req.params.id;
	
	ApplicationUsers.findOne({access_token : access_token}, function(err, user){
		var gateways = user.gateways;
		var app_id = user.app_id;
		RegisterGateway.findOne({app_id: app_id},function(err,app){
			var gateways = []
			if(app){
				gateways = app.gateways;
				Gateway.find({_id : {$in: gateways}}, function(err, app_gateways){
					res.render("application/edit_user_access", {gateways : app_gateways, access_token: access_token,app_id: app_id});		
				});
			}
			
		})
	});
});

router.post("/access", function(req,res,next){
	var access_token = req.body.access_token;
	var app_id = req.body.app_id;
	var gateways = req.body.gateways;
	Gateway.find({_id : {$in : gateways}}, function(err, gateway_objects){
		ApplicationUsers.update({access_token : access_token},{
		gateways : gateways,
		gateway_objects : gateway_objects
		},function(err, app_user){
			res.redirect("/applications/"+app_id+"/users");
		});
	});
});

//GET static update of app users
// router.get("/access/:id", function(req,res,next){
// 	var access_token = req.params.id;
// 	ApplicationUsers.update({access_token : access_token},{
// 		gateways: []
// 	},
// 	function(err, user){
// 		res.json(user);
// 	});
// });

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

//DELETE APP users

router.get("/delete/:id/users",function(req, res, next){
	var id = req.params.id;
	console.log(id);
	ApplicationUsers.remove({_id: id}).exec();	
	res.redirect("/home");
});

module.exports = router;