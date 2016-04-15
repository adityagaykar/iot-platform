var mongoose = require("mongoose");
var schema = mongoose.Schema;

var ruleSchema = new schema({
	name: {type: String, required: true, index: {unique: true}},
	owner: {type: String, required: true},
	uri : {type: String, required: true},
	app_id : {type : String, required: true},
	gateway_type_id  : {type : String, required: true},
	sensor_type_id  : {type : String, required: true},
	created_on: {type: Date, default: Date.now}
});

module.exports = mongoose.model("rule",ruleSchema);