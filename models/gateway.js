var mongoose = require("mongoose");
var schema = mongoose.Schema;
var hat = require("hat");

var gatewaySchema = new schema({
	name: {type: String, required: true, index: {unique: true}},
	owner: {type: String, required: true},
	meta_data: {type: Array, required: true},
	static_data: {type: Array, required: true},
	sensor_data: {type: Array, required: true},
	gateway_type_id : {type: String, required: true},
	gateway_no: {type: String, default: hat()},
	created_on: {type: Date, default: Date.now}
});

module.exports = mongoose.model("gateway",gatewaySchema);