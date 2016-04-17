var express = require('express');
var sha1 = require('sha1');
var router = express.Router();
var mongoose = require('mongoose');
var Gateway = mongoose.model("gateway");
var GatewayType = mongoose.model("gatewayType");
var hat = require('hat');

//GET Gateways
router.get("/view/:id",function(req, res, next){	
	
	Gateway.find({},function(err, data){
		if(data.length > 0)
			res.render("gateways/view",{gateways : data});
		else
			res.redirect("/adminhome");
	});
});

//Add Gateway2
router.get("/add",function(req,res,next){
	GatewayType.find({}, function(err,data){
		res.render("gateways/add",{types : JSON.stringify(data)});	
	});
	
});

//POST Gateway
router.post("/", function(req, res, next){	
	var owner = req.session.user._id;		
	var number_of_instance = (req.body.variable)
	var gateway_type_id = (req.body.type)	
	GatewayType.find({"_id":gateway_type_id},function(err, data){		
			{	var meta_data=[];				
				var k=0;
				for (var field in data[0].meta_data) {
				  if (data[0].meta_data.hasOwnProperty(field)) {
				    var x=data[0].meta_data[k]
				    var val=req.body[x];				    
				    var key = x;
					var obj = {};
					obj[key] = val;
				    meta_data.push(obj);		

				    k++;
				  }
				}
				
				var static_data=[];				
				k=0;
				for (var field in data[0].static_data) {
				  if (data[0].static_data.hasOwnProperty(field)) {
				    var x=data[0].static_data[k]
				    var val=req.body[x];				    
				    var key = x;
					var obj = {};
					obj[key] = val;
				    static_data.push(obj);				   
				    console.log(key+":"+val+"\n")	
				    k++;
				  }
				}
				
				for(var i=0;i<number_of_instance;i++){
					var newname = hat();										
					 Gateway.create({
						name :  data[0].name+"_"+newname,
						owner : owner,
						gateway_type_id : gateway_type_id,	
						static_data:static_data,
						sensor_data:data[0].sensor_data,	
						meta_data:meta_data,				
					}, function(err, dataset){
						if( err)
							res.send(err);						
					})
				}
				res.redirect("/adminhome");
			}
	});

});


//DELETE Dataset

router.get("/delete/:id",function(req, res, next){
	var id = req.params.id;

	Gateway.remove({_id: id}).exec();	
	res.redirect("/adminhome");
});

router.get("/edit/:id",function(req, res, next){
	var id = req.params.id;
	Gateway.find({"_id":id},function(err, data){		
			res.render("gateways/edit",{types : JSON.stringify(data[0])});				
	});
});

router.post("/edit",function(req, res, next){
	var gateway_id = req.body.id;	
	var newname = req.body.name;
	var meta_data=[],static_data=[];					
	res.redirect("/");
	for( var params in req.body){
	    var ans = params.split("_");	    
	    if(ans[0]=="metadata"){
	    	var key = ans[1];
			var obj = {};
			obj[key] = req.body[params];
			meta_data.push(obj);		
	    }else if(ans[0]=="staticdata"){
	    	var key = ans[1];
			var obj = {};
			obj[key] = req.body[params];
			static_data.push(obj);
	    }
	}		

	Gateway.update({"_id": gateway_id}, {
	 	name: newname,
		static_data:static_data,
		meta_data:meta_data 	    
		}, function(err, numberAffected) {
			if(err)
			   	console.log(err)
		   else{
			   	console.log(numberAffected.ok+" rows affected");
			   			   
			}		
	});				
	
});

module.exports = router;