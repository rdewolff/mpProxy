var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId; //not needed here, but may be needed in another model file

ApplicationSchema = new Schema({
	property: {type: String},
	value: {type: String},
	created_at: {type: Date, "default": Date.now}
});

Application = mongoose.model('Application', ApplicationSchema); //name of collection is 'users'

module.exports.Application = Application;
module.exports.Schema = ApplicationSchema;