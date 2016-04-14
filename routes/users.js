var express = require('express');
var sha1 = require('sha1');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model("User");

//GET users
router.get("/",function(req,res,next){
	
	User.find(function(err,data){
		res.redirect("/home");
		//res.render("users",{dataset:data});
		//res.send(data);
	});

});

//POST user
router.post("/",function(req,res,next){
	var name = req.body.name;
	var password = req.body.password;
	User.findOne({name:name},function(err,data){
		if(!data){
			User.create({
			name: name,
			password: sha1(password)},function(err,user){
				if(err){
					throw err;
				}
				res.redirect("/");
			});
		}
		else{
			req.session.error = "User name already exists !";
			res.redirect("/");	
		}
	});
});

module.exports = router;