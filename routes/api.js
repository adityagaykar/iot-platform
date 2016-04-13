var express = require('express');
var sha1 = require('sha1');
var router = express.Router();
var mongoose = require('mongoose');
var Dataset = mongoose.model("dataset");
var Application = mongoose.model("applications");
var ApplicationUsers = mongoose.model("ApplicationUsers");
var hat = require('hat');
var Rule = mongoose.model("rule");
var helper = require("../utils/helper");

/*POST: Register app*/

router.post("/v1.0/register",function(req,res,next){
	var registration_key = req.body.registration_key;
	var name = req.body.name;
	//console.log("Name : "+name);
	//console.log("registration_key : "+registration_key);
	if(!name || !registration_key){
		var error = { error : "Invalid request: missing name or registration_key"};
		res.json(error);
	}	
	Application.findOne({registration_key: registration_key},function(err,data){
		if(data){
			//console.log("Data : "+data);
			ApplicationUsers.create({
				name: name,
				app_id: data._id,
				access_token: hat()				
			},function(err,user){
				console.log(err+" "+user);
				res.json(user);
			});
		} else {
			var error = { error : "Invalid registration_key"};
			res.json(error);
		}
	});
});

/*POST event api*/
router.post("/v1.0/event",function(req,res,next){
	var js_code = req.body.js_code;
	js_code = eval("x = "+js_code);
	var header = js_code.header;
	var sensorList = js_code["body"];
	//console.log(sensorList);
	// var arr = Object.keys(body.sensor_data);
	// var result = "waiting";
	for( var i in sensorList){
		var currSensorType = sensorList[i].sensor_type;	
		var currSensorList = sensorList[i].sensor_data;	
		//console.log(sensorData);
		for( var j in currSensorList){
			var sensorData = { value : currSensorList[j].value };	
			
			Rule.find({"sensor_type" : {$in : currSensorType}},function(err,rules){	
				//execute every rule associated with the sensor
				for( var r in rules){
					var params = [rules[r].condition, rules[r].callback];
					console.log("FOR : "+params);
					result = helper.executeRule(sensorData, params, sensorList[j]);			
				}
			});	
		}
			
	}
	//console.log(sensorList);
	
	res.send("success");
});

router.get("/v1.0/event",function(req,res,next){
	res.send("success");
});

router.post("/", function(req,res,next){
	var dataset = req.body.data;
	var arr = []
	for( data in dataset ){
		console.log(data);
		arr.push(data)
	}
	
	Rule.find({"sensors" : {$in : arr}},function(err,rules){
		var result = "waiting";
		// for( i in rules){
		// 	var sensors = rules[i].sensors			
		// 	rule = eval("x = "+rules[i].rule);						
		// 	if(!helper.evaluateCondition(rule, dataset)){
		// 		//
		// 	} else {
		// 		result += "\n"+rules[i]+" triggered";
		// 	}			
		// }
		for( i in rules){
			var rule = eval(rules[i].rule);
			console.log(rule);			
			result = helper.executeRule(dataset, rule);
			//console.log("FOR : "+result);
		}
		res.send(result);
	});
	
	
});

module.exports = router;