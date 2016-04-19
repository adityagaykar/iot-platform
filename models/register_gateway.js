var mongoose = require("mongoose");
var schema = mongoose.Schema;

var registerGatewaySchema = new schema({
	owner: {type: String, required: true},
	gateways : {type : Array, required: true},
	gateway_objects : {type: Array, required: true},
	app_id : {type : String, required: true},	
	created_on: {type: Date, default: Date.now}
});

module.exports = mongoose.model("registerGateway",registerGatewaySchema);