var express = require('express');
var sha1 = require('sha1');
var router = express.Router();
var mongoose = require('mongoose');
var Gateway = mongoose.model("gateway");
var GatewayType = mongoose.model("gatewayType");

//GET Gateways
router.get("/view/:id",function(req, res, next){	
	
	Gateway.find({},function(err, data){
		if(data.length > 0)
			res.render("gateways/view",{gateways : data});
		else
			res.redirect("/adminhome");
	});
});

//Add Gateway
router.get("/add",function(req,res,next){
	GatewayType.find({}, function(err,data){
		res.render("gateways/add",{types : data});	
	});
	
});

//POST Gateway
router.post("/", function(req, res, next){
	var name = req.body.name;
	var owner = req.session.user._id;
	var type = req.body.type;
	delete req.body.name;
	delete req.body.variable;
	delete req.body.type;

	var propertiesList = [];
    for (var property in req.body) {
        if (req.body.hasOwnProperty(property)) {
            propertiesList.push(property);
        }
    }

    propertiesList.reverse();

    var variablesFields = {};
    for (var i in propertiesList) {
        console.log(propertiesList[i])
        variablesFields[propertiesList[i]] = {name:req.body[propertiesList[i]],
                                    values: Array}; 
    }

	Gateway.create({
		name : name,
		owner : owner,
		gateway_type_id : type,
		dataset : variablesFields
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

	Gateway.remove({_id: id}).exec();	
	res.redirect("/adminhome");
});

module.exports = router;