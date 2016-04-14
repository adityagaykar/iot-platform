var mongoose = require("mongoose");
var schema = mongoose.Schema;
var hat = require("hat");
var sensorTypeSchema = new schema({
	name: {type: String, required: true, index: {unique: true}},
	type_of_output_fields :{type: Array, required: true},
	owner: {type: String, required: true},
	created_on: {type: Date, default: Date.now},
});

module.exports = mongoose.model("sensorType",sensorTypeSchema);