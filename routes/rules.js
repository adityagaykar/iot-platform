var express = require('express');
var sha1 = require('sha1');
var router = express.Router();
var mongoose = require('mongoose');
var Dataset = mongoose.model("dataset");
var Rule = mongoose.model("rule");

//GET rule
router.get("/:id",function(req, res, next){
	var app_id = req.params.id;
	Rule.find({app_id: app_id},function(err, data){
		res.render("rules/view",{rules : data});
	});
});

//Add rule
router.get("/add/:id",function(req,res,next){
	var app_id = req.params.id;
	res.render("rules/add",{app_id : app_id});
});

//POST rule
router.post("/", function(req, res, next){
	var name = req.body.name;	
	var owner = req.session.user._id;	
	var callback = req.body.callback;
	var uri = req.body.uri;
	var app_id = req.body.app_id;
	var sensor_type = req.body.sensor_type;

	Rule.find({name: name}, function(err, data){
		if(data.length != 0){
			res.redirect("/rules/add/"+app_id);
		} else {
			Rule.create({
				name : name,
				owner : owner,
				callback : callback,
				uri : uri,
				app_id : app_id,
				sensor_type : sensor_type
			}, function(err, rule){
				if( err)
					res.send(err);
				else
					res.redirect("/rules/"+rule.app_id);			
			});		
		}
	});
});
	

//GET edit rule
router.get("/update/:id", function(req, res, next){
	var id = req.params.id;

	Rule.findOne({_id: id},function(err, rule){
		res.render("rules/edit", {name: rule.name,uri: rule.uri, sensor_type: rule.sensor_type,callback: rule.callback, id: rule._id, app_id: rule.app_id});
	});	
});


//POST update rule
router.post("/update/:id", function(req, res, next){
	var id = req.params.id;
	var name = req.body.name;
	var owner = req.session.user._id;
	var uri = req.body.uri;
	var callback = req.body.callback;
	var app_id = req.body.app_id;
	var sensor_type = req.body.sensor_type;
	console.log("App_id : "+app_id);
	Rule.update({_id: id},{
		name : name,
		owner : owner,
		callback : callback,
		app_id : app_id,
		uri: uri,
		sensor_type : sensor_type
	}, function(err, curr_rule){
		if( err)
			res.send(err);							
	});
	res.redirect("/rules/"+app_id);
});


//DELETE rule

router.get("/delete/:id",function(req, res, next){
	var id = req.params.id;
	console.log(id);
	Rule.findOne({_id: id},function(err,rule){
		var app_id = rule.app_id;
		Rule.remove({_id:id}).exec();
		res.redirect("/rules/"+rule.app_id);
	});	
});

module.exports = router;