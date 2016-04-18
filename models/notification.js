var mongoose = require("mongoose");
var schema = mongoose.Schema;

var notificationSchema = new schema({
	access_token: {type: String, required: true},
	message: {type: String, required: true},
	time_stamp: {type: String, required: true},
	created_on: {type: Date, default: Date.now}
});

module.exports = mongoose.model("notifications",notificationSchema);