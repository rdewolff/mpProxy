exports.install = function(framework) {
  framework.route('/admin/', adminHome);
  framework.route('/admin/config/', adminConfig);
  framework.route('/admin/config/save', adminConfigSave);
  framework.route('/admin/mapping/', adminMapping);
}

function adminHome() {
  var self = this;
  // TODO plug with Mongoose, cf https://github.com/totaljs/examples/blob/master/angularjs-mongodb-rest-resources/controllers/user.js
  //var Admin = self.model('admin');
  self.view('admin');
}

function adminConfig() {
  var self = this;
  // TODO plug with data stored in DB
  // TODO or use with the "storage" module : https://github.com/totaljs/modules/tree/master/storage
  // self.layout(); // control what layout we want to use for that view
  self.view('adminConfig', {
    Source: framework.config.sourceUrl, 
    Username: framework.config.username, 
    Password: framework.config.password
  });

}

function adminConfigSave() {  

  // always save as first ID
  // TODO
}

function adminMapping () {
  var self = this;
  self.view('adminMapping');
}