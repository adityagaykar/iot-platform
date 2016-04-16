var express = require('express');
var sha1 = require('sha1');
var router = express.Router();
var mongoose = require('mongoose');
var Gateway = mongoose.model("gateway");
var GatewayType = mongoose.model("gatewayType");
var RegisterGateway = mongoose.model("registerGateway");

//GET datasets
router.get("/view/:id",function(req, res, next){
	var app_id = req.params.id;
	RegisterGateway.find({app_id: app_id},function(err, data){
		res.render("registergateway/view",{gateways : data});
	});
});

//Add view
router.get("/add/:id",function(req,res,next){
	var app_id = req.params.id;
	Gateway.find({},function(err, data){
		res.render("registergateway/add",{app_id : app_id, gateways : data});	
	});
	
});

//POST Dataset
router.post("/", function(req, res, next){
	var gateways = req.body.gateways;	
	var owner = req.session.user._id;	
	var app_id = req.body.app_id;
	console.log(">"+app_id);
	//res.send(JSON.stringify(gateways));
	RegisterGateway.findOne({app_id: app_id},function(err,data){
		if(data){
			RegisterGateway.update({app_id: app_id},{
				owner : owner,
				gateways : gateways,
				app_id : app_id,				
			}, function(err, data){
					if(err)
						res.send(err);
					else
						res.redirect("/applications/home/"+app_id);			
			});
		}else{
			RegisterGateway.create({
				owner : owner,
				gateways : gateways,
				app_id : app_id,				
			}, function(err, data){
					if(err)
						res.send(err);
					else
						res.redirect("/applications/home/"+app_id);			
			});	
		}
		
	});	
});
	

//GET edit Dataset
router.get("/update/:id", function(req, res, next){
	var id = req.params.id;

	Rule.findOne({_id: id},function(err, rule){
		res.render("rules/edit", {name: rule.name, sensors: rule.sensors.join(","),callback: rule.callback, condition: rule.condition, id: rule._id, app_id: rule.app_id});
	});	
});


//POST update dataset
router.post("/update/:id", function(req, res, next){
	var id = req.params.id;
	var name = req.body.name;
	var owner = req.session.user._id;
	var condition = req.body.condition;
	var callback = req.body.callback;
	var app_id = req.body.app_id;
	var sensor_type = req.body.sensor_type;
	console.log("App_id : "+app_id);
	var sensors = req.body.sensors.split(",");
	Rule.update({_id: id},{
		name : name,
		owner : owner,
		callback : callback,
		condition : condition,
		app_id : app_id,
		sensor_type : sensor_type
	}, function(err, curr_rule){
		if( err)
			res.send(err);							
	});
	res.redirect("/rules/"+app_id);

});


//DELETE Dataset

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