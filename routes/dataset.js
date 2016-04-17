var express = require('express');
var sha1 = require('sha1');
var router = express.Router();
var mongoose = require('mongoose');
var Dataset = mongoose.model("dataset");

//GET datasets
router.get("/:id",function(req, res, next){
	var app_id = req.params.id;
	Dataset.find({app_id : app_id},function(err, data){
		res.render("dataset/view",{dataset : data});
	});
});

// //Add view
// router.get("/add/:id",function(req,res,next){
// 	var app_id = req.params.id;	
// 	res.render("dataset/add",{app_id: app_id});
// });

// //POST Dataset
// router.post("/", function(req, res, next){
// 	var name = req.body.name;
// 	var owner = req.session.user._id;
// 	var app_id = req.body.app_id;
// 	delete req.body.name;
// 	delete req.body.variable;
// 	delete req.body.app_id;

// 	console.log("App id : " + app_id);
// 	var propertiesList = [];
//     for (var property in req.body) {
//         if (req.body.hasOwnProperty(property)) {
//             propertiesList.push(property);
//         }
//     }
//     propertiesList.reverse();

//     var variablesFields = {};
//     for (var i in propertiesList) {
//         console.log(propertiesList[i])
//         variablesFields[propertiesList[i]] = {name:req.body[propertiesList[i]],
//                                     values: Array}; 
//     }

// 	Dataset.create({
// 		name : name,
// 		owner : owner,
// 		app_id : app_id,
// 		dataset : variablesFields
// 	}, function(err, dataset){
// 		if( err)
// 			res.send(err);
// 		else
// 			res.redirect("/datasets/"+app_id);
// 	})
// });


// //DELETE Dataset

// router.get("/delete/:id",function(req, res, next){
// 	var id = req.params.id;
// 	console.log(id);
// 	Dataset.remove({_id: id}).exec();	
// 	res.redirect("/home");
// });

module.exports = router;