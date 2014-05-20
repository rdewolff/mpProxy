exports.install = function(framework) {
  framework.route('/admin/', adminHome);
  framework.route('/admin/config/', adminConfig);
}

function adminHome() {
  var self = this;
  // TODO plug with Mongoose, cf https://github.com/totaljs/examples/blob/master/angularjs-mongodb-rest-resources/controllers/user.js
  //var Admin = self.model('admin');

  console.log('admin home');
  self.view('admin');

}

function adminConfig() {
  var self = this;
  // TODO plug with data stored in DB

  console.log('admin config');
  self.view('admin');
  
}
