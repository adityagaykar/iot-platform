var mongoose = require("mongoose");
var schema = mongoose.Schema;

var applicationUserSchema = new schema({
	name: {type: String, required: true, index: {unique: true}},
	app_id: {type: String, required: true},	
	access_token: {type: String, required: true},
	created_on: {type: Date, default: Date.now}
});

module.exports = mongoose.model("ApplicationUsers",applicationUserSchema);