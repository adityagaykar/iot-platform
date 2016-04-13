var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var sha1 = require('sha1');
var Application = mongoose.model("applications");
var Gateway = mongoose.model("gateway");
var GatewayType = mongoose.model("gatewayType");

/* GET login page. */
router.get('/', function(req, res, next) {
	var user = req.session.user;
	if(user)
		res.redirect("/home");
	var errorMessage = req.session.error;
	res.render('login', { errorMessage : errorMessage});
});

/* Registration form */
router.get('/signup', function(req, res, next) {
	var user = req.session.user;
	if(user)
		res.redirect("/home");
	var errorMessage = req.session.error;
	res.render('signup', { errorMessage : errorMessage});
});


/*POST:Register form*/
router.post('/signup',function(req,res, next){
	var name = req.body.username;
	var password = sha1(req.body.password);

	User.create({
		name: name,
		password: password
	},function(err,user){
		if(err)
			throw err;
		res.redirect("/");
	});

});

/*GET Admin home page*/
router.get('/adminhome',function(req,res,next){
	var user = req.session.user;
	if(user){
		if(user.name == "admin"){
			GatewayType.find({},function(err,types){
				Gateway.find({},function(err, data){
					res.render("adminhome",{user: user, gateways: data, types : types});	
				});	
			});						
		} else {
			res.redirect("/home");
		}
	} else {
		req.session.error = "Please login";
		res.redirect("/");
	}
});


/*GET:Home page*/
router.get('/home',function(req,res,next){
	var user = req.session.user;
	if(user && user.name == "admin")
		res.redirect("/adminhome");
	else if(user){
		User.findOne({name:user.name, password:user.password},function(err,user){
			if (err)
				throw err;
			if (user){

				Application.find({owner : user._id},function(err, data){				
					res.render("home",{user : user, applications : data});
				});
			} else {
				req.session.error = "Invalid Username";
				res.redirect("/");
			}
		});
	} else {
		req.session.error = "Please login";
		res.redirect("/");
	}
});

/* login */
router.get('/login', function(req, res, next) {
	var user = req.session.user;
	if(user.name == "admin")
		res.redirect("/adminhome");
	else
		res.redirect("/home");
});

/* POST: login */

router.post('/login',function(req,res, next){
	var name = req.body.username;
	var password = sha1(req.body.password);
	console.log(name);
	console.log(password);
	User.findOne({name:name, password:password},function(err,user){
		if (err)
			throw err;
		if (user){
			req.session.user = user;
			if(user.name == "admin")
				res.redirect("/adminhome");
			else
				res.redirect("/home");
		} else {
			req.session.error = "Invalid Username";
			res.redirect("/");
		}
	});

});

/*GET: logout */

router.get("/logout",function(req,res,next){
	var user = req.session.user;
	if(user)
		delete req.session.user;
	if(req.session.error)
		delete req.session.error;
	res.redirect("/");
});
module.exports = router;
