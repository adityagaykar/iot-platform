var express = require('express');
var sha1 = require('sha1');
var router = express.Router();
var mongoose = require('mongoose');
var Dataset = mongoose.model("dataset");
var Application = mongoose.model("applications");
var ApplicationUsers = mongoose.model("ApplicationUsers");
var hat = require('hat');
var Rule = mongoose.model("rule");
var Gateway = mongoose.model("gateway");
var helper = require("../utils/helper");
var UserRule = mongoose.model("userrule");
var servers = require("../utils/servers");
var requestify = require("requestify");
var logic_server = servers.logic_server;


/*POST: Register app*/

router.post("/v1.0/register",function(req,res,next){
	var registration_key = req.body.registration_key;
	var name = req.body.name;
	console.log("Name : "+name);
	console.log("registration_key : "+registration_key);
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
	var gateway_id = header.gateway_id;
	var sensor_ids = {};
	for(sensor of sensorList){
		UserRule.find({status: "enable", gateway_id: gateway_id, sensor_id: sensor.sensor_type}, function(err, rules){			
			for(rule of rules){
				var continue_check = false;
				var curr = new Date();
				if(rule.last_triggered == "-1"){
					//fire rigthaway: first trigger					
					continue_check = true;
				} else {									
					var diff = parseInt((curr.getTime() - parseInt(rule.last_triggered))/60000);
					if(diff >= rule.frequency){						
						continue_check = true;
					} 						
				}		
				if(continue_check){	

					var condition = rule.condition;
					var threshold = rule.threshold;
					var sensor_value = sensor.sensor_data[0].value;
					var trigger = false;
					switch(condition){
						case "<":
							sensor_value = parseInt(sensor_value);
							threshold = parseInt(rule.threshold);
							if( sensor_value < threshold)
								trigger = true;
						break;
						case ">":
							sensor_value = parseInt(sensor_value);
							threshold = parseInt(rule.threshold);
							if( sensor_value > threshold)
								trigger = true;
						break;
						case "=":
							if(sensor_value == threshold)
								trigger = true;
						break;
					}
					if(trigger){
						UserRule.update({_id: rule._id},{
							last_triggered : curr.getTime()+""
						},function(err, updated_rule){
							//do nothing
						});	
						//store event info in dataset
						//forward packet to logic server
						Rule.findOne({_id: rule.rule_id},function(err, app_rule){
							console.log("Sending request ...");
							requestify.post("http://"+logic_server.hostname+":"+logic_server.port+"/api/v1.0/callback", {
							    callback: app_rule.uri,
							    sensor_data: js_code
							})
							.then(function(response) {
							    // Get the response body (JSON parsed or jQuery object for XMLs)
							    console.log(">"+response.getBody());
							});	
						});
						
					} else {
						console.log("Not triggered : "+sensor_value+" | "+condition+" | "+threshold);
					}
					
				} else {
					//wait for next trigger
					console.log("waiting for next trigger");
				}				
			}
		});
	}
	//console.log(sensorList);
	// var arr = Object.keys(body.sensor_data);
	// var result = "waiting";
	// for( var i in sensorList){
	// 	var currSensorType = sensorList[i].sensor_type;	
	// 	var currSensorList = sensorList[i].sensor_data;	
	// 	//console.log(sensorData);
	// 	for( var j in currSensorList){
	// 		var sensorData = { value : currSensorList[j].value };			
	// 		// Rule.find({"sensor_type" : {$in : currSensorType}},function(err,rules){	
	// 		// 	//execute every rule associated with the sensor
	// 		// 	for( var r in rules){
	// 		// 		var params = [rules[r].condition, rules[r].callback];
	// 		// 		console.log("FOR : "+params);
	// 		// 		result = helper.executeRule(sensorData, params, sensorList[j]);			
	// 		// 	}
	// 		// });	
	// 	}
			
	// }
	//console.log(sensorList);
	res.send("success");
	//res.json(header);
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

/*GET user gateway rules*/

router.get("/v1.0/rules/:access_token",function(req, res, next){
	var access_token = req.params.access_token;
	//check what gateways are assigned to user app
	ApplicationUsers.findOne({access_token: access_token},function(err, user){
		if(user){
			var gateways = user.gateways;

			//get gateway types for gateways assigned
			Gateway.find({_id: {$in: gateways}}, function(err, user_gateways){
				var gatewayTypes = [];
				for(g of user_gateways){
					gatewayTypes.push(g.gateway_type_id);
				}
				console.log("Gateway Types : "+gatewayTypes);
				//get corresponding rules for that gateway types and sensor type
				Rule.find({gateway_type_id: {$in: gatewayTypes}}).lean().exec(function(err, rules){
					var updated_rules = [];
					(function(){
						for(var i in rules){
							(function(rulex){
								var rule = {};// = rulex;
								rule["gateways"] = [];						
								for(g of user_gateways){
									if(g.gateway_type_id == rules[i].gateway_type_id){
										rule.gateways.push(g);
										console.log("Adding gateway ..." + g.name);
									} else {
										console.log("Not Adding gateway ..." + g.name);
									}
								}
								rulex["gateways"] = rule;
								updated_rules.push(rulex);							
								console.log(JSON.stringify(rulex));
							})(rules[i]);						
						}
					})();
					res.json(updated_rules);
				});
			});
		} else {
			var error = "Error: invalid access token";
			//return list of rule templates
			res.json(error);
		}
	})	
});
/*
var mongoose = require("mongoose");
var schema = mongoose.Schema;
var sha1 = require('sha1');
var ruleSchema = new schema({
	uid: {type: String, required: true},
	name: {type: String, required: true},
	threshold : {type: String, required: true},
	condition : {type: String, required: true},
	rule_id : {type: String, required: true},
	status : {type: String, required: true},
	frequency : {type: String, required: true},
	gateway_name:{type: String, required: true},
	gateway_id:{type: String, required: true},
	sensor_id:{type: String, required: true},
	created_on: {type: Date, default: Date.now}
});

module.exports = mongoose.model("rule",ruleSchema);
*/

/*POST user rule*/
router.post("/v1.0/rules/:access_token/add",function(req, res, next){
	var access_token = req.body.access_token;
	var app_id = req.body.app_id;
	var name = req.body.name;
	var threshold = req.body.threshold;
	var condition = req.body.condition;
	var rule_id = req.body.rule_id;
	var rule_name = req.body.rule_name;
	var status = req.body.status;
	var frequency = req.body.frequency;
	var gateway_id = req.body.gateway_id;
	var gateway_name = req.body.gateway_name;
	var sensor_id = req.body.sensor_id;
	UserRule.create({
		access_token: access_token,
		name: name,
		app_id: app_id,
		threshold: threshold,
		condition: condition,
		rule_id: rule_id,
		rule_name: rule_name,
		status: status,
		frequency: frequency,
		gateway_id: gateway_id,
		gateway_name: gateway_name,
		sensor_id : sensor_id
	}, function(err, rule){
		res.json(rule);
	});
});

/*UPDATE user rules*/
/*POST user rule*/
router.post("/v1.0/rules/:access_token/update",function(req, res, next){
	var _id = req.body.id;
	var name = req.body.name;
	var threshold = req.body.threshold;
	var condition = req.body.condition;
	var status = req.body.status;
	var frequency = req.body.frequency;	
	UserRule.update({_id: _id},{
		name: name,
		threshold: threshold,
		condition: condition,
		status: status,
		frequency: frequency		
	}, function(err, rule){
		res.json(rule);
	});
});

/*Delete user rule*/
router.post("/v1.0/rules/:access_token/delete",function(req, res, next){
	var _id = req.body.id;
	UserRule.remove({_id: _id}).exec();	
	res.send("success");
});



module.exports = router;