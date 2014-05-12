var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId; //not needed here, but may be needed in another model file

CacheSchema = new Schema({
	query: {type: String, "default": ''},
	result: {type: String},
	created_at: {type: Date, "default": Date.now}
});

Cache = mongoose.model('Cache', CacheSchema); //name of collection is 'users'

module.exports.Cache = Cache;
module.exports.Schema = CacheSchema;