var mongoose = require("mongoose");
var schema = mongoose.Schema;
//planning to use this for analytics in future, no work for now
var datasetSchema = new schema({
	name: {type: String, required: true, index: {unique: true}},
	owner: {type: String, required: true},
	dataset : {type: Object, required: false},
	app_id : {type : String, required: true},
	created_on: {type: Date, default: Date.now}
});

module.exports = mongoose.model("dataset",datasetSchema);