var express = require('express');
var sha1 = require('sha1');
var router = express.Router();
var mongoose = require('mongoose');
var Dataset = mongoose.model("dataset");
var Rule = mongoose.model("rule");
var RegisterGateway = mongoose.model("registerGateway");
var Gateway = mongoose.model("gateway");
var GatewayType = mongoose.model("gatewayType");
var SensorType = mongoose.model("sensorType");
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
	RegisterGateway.findOne({app_id : app_id}, function(err, registered_gateways){
		if(registered_gateways){
			var gateways=registered_gateways.gateways;
			Gateway.find({_id: {$in : gateways}},  function(err, app_gateways){
				var type_ids = {};
				//get all app gateway type ids
				for(gateway of app_gateways)
					type_ids[gateway.gateway_type_id] = 1;
				type_ids = Object.keys(type_ids);			
				GatewayType.find({_id: {$in : type_ids}}, function(err, types){
					if(err)
						res.send(err + JSON.stringify(type_ids));
					else
						res.render("rules/add",{app_id : app_id, gateway_types: types});
				})
			});
		} else {
			res.redirect("/home");
		}
	});	
});

//POST rule
router.post("/", function(req, res, next){
	var name = req.body.name;	
	var owner = req.session.user._id;	
	var uri = req.body.uri;
	var app_id = req.body.app_id;
	var gateway_type = req.body.gateway_type;
	var sensor_type = req.body.sensor_type;

	Rule.find({name: name}, function(err, data){
		if(data.length != 0){
			res.redirect("/rules/add/"+app_id);
		} else {
			Rule.create({
				name : name,
				owner : owner,
				uri : uri,
				app_id : app_id,
				gateway_type_id : gateway_type,
				sensor_type_id : sensor_type
			}, function(err, rule){
				if( err)
					res.send(err);
				else
					res.redirect("/rules/"+rule.app_id);			
			});		
		}
	});
});
	
//GET sensors

router.get("/sensortypes/:id", function(req,res,next){
	var gateway_type_id = req.params.id;
	GatewayType.findOne({_id : gateway_type_id}, function(err,type){
		if(type){
			var sensors = type.sensor_data;
			res.json(sensors);
		} else {
			res.json(err);
		}
	});
});


//GET edit rule
router.get("/update/:id", function(req, res, next){
	var id = req.params.id;
	Rule.findOne({_id: id},function(err, rule){
		var app_id = rule.app_id;
		RegisterGateway.findOne({app_id : app_id}, function(err, registered_gateways){
			if(registered_gateways){
				var gateways=registered_gateways.gateways;
				Gateway.find({_id: {$in : gateways}},  function(err, app_gateways){
					var type_ids = {};
					//get all app gateway type ids
					for(gateway of app_gateways)
						type_ids[gateway.gateway_type_id] = 1;
					type_ids = Object.keys(type_ids);
					GatewayType.find({_id: {$in : type_ids}}, function(err, types){
							sensor_types = [];
							for(type of types){
								if(type._id == rule.gateway_type_id){
									type["selected"] = "selected";
									sensor_types = type.sensor_data;
								}
								else
									type["selected"] = "";
							}							
							sensor_selected = []
							for(type of sensor_types){
								if(type == rule.sensor_type_id)
									sensor_selected.push({name: type, selected:"selected"});
								else
									sensor_selected.push({name: type, selected:"notselected"});
							}
							console.log(JSON.stringify(sensor_selected));
							res.render("rules/edit", {name: rule.name,
									uri: rule.uri, sensor_type: rule.sensor_type,
									callback: rule.callback, id: rule._id,
									app_id: rule.app_id, gateway_types: types, sensor_types: sensor_selected});
						
					})
				});
			} else {
				res.redirect("/home");
			}
		});
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
	var gateway_type = req.body.gateway_type;
	var sensor_type = req.body.sensor_type;
	console.log("App_id : "+app_id);
	Rule.update({_id: id},{
		name : name,
		owner : owner,
		callback : callback,
		app_id : app_id,
		uri: uri,
		gateway_type_id : gateway_type,
		sensor_type_id: sensor_type
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