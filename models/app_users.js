var mongoose = require("mongoose");
var schema = mongoose.Schema;

var applicationUserSchema = new schema({
	name: {type: String, required: true},
	app_id: {type: String, required: true},	
	access_token: {type: String, required: true},
	gateways : {type: Array, default: Array},
	gateway_objects : {type: Array, default: Array},
	created_on: {type: Date, default: Date.now}
});

module.exports = mongoose.model("ApplicationUsers",applicationUserSchema);