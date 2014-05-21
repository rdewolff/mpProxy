var userSchema = mongoose.Schema({
  alias: String,
  ip: String,
  email: String,
  password: String,
  created: Date
});

var adminSchema = mongoose.Schema({
  source: String,
  username: String,
  password: String,
  synchro: Number
});

/*
var sychroCache = mongoose.Schema({

})
*/

module.exports = mongoose.model('User', userSchema);
module.exports = mongoose.model('Admin', adminSchema);
