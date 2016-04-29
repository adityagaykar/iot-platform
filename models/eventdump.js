var mongoose = require("mongoose");
var schema = mongoose.Schema;
//planning to use this for analytics in future, no work for now
var eventDumpSchema = new schema({
	dataset : {type: Object, default: Object},	
	created_on: {type: Date, default: Date.now}
});

module.exports = mongoose.model("eventdump",eventDumpSchema);