var proxy = require('../server/proxy');

var app = module.exports = require('derby').createApp('directory', __filename);

global.app = app;

app.use(require('d-bootstrap'));
//app.loadViews(__dirname + '/views');
// app.loadStyles(__dirname);
app.loadViews (__dirname+'/../../views');
app.loadStyles(__dirname+'/../../styles');

app.component(require('d-connection-alert'));
app.component(require('d-before-unload'));

app.get('/', function(page, model) {
  page.render('home');
});

// sorry but we need jquery, especially for ajax
if (!typeof window == 'undefined') {
  if (!window.$) require('../../public/jquery-1.8.3.min.js');
}


/* ADMIN */

app.get('/admin', function(page, model, params, next) {

  model.subscribe('sync', function() {
    page.render('admin');
  });

});

app.component('admin', AdminForm);
function AdminForm() {}

AdminForm.prototype.runSynchronizer = function() {
  console.log("client runSynchronizer");
  var model = this.model;
  // this will trigger the change on the server side
  model.root.set('sync.start', Date());
};

AdminForm.prototype.runParser = function() {
  console.log("client runParser");
  var model = this.model;
  proxy.parseData(model.root.set('cache.modules'), model);
}

AdminForm.prototype.stopSynchronizer = function() {
  console.log("client stopSynchronizer");
  var model = this.model;
  model.root.set('sync.inProgress', false); // force finish
}

AdminForm.prototype.clearSynchronizerLog = function() {
  console.log("client clearSynchronizerLog");
  var model = this.model;
  model.root.set('sync.log', '');
}

/* MAPPING */

app.get('/mapping', function(page, model, params, next) {

  model.subscribe('sync', function() {
    page.render('mapping')
  });

});

/* PEOPLE */

app.get('/people', function(page, model, params, next) {
  var peopleQuery = model.query('people', {});
  peopleQuery.subscribe(function(err) {
    if (err) return next(err);
    page.render('people');
  });
});

app.get('/people/:id', function(page, model, params, next) {
  if (params.id === 'new') {
    return page.render('edit');
  }
  var person = model.at('people.' + params.id);
  person.subscribe(function(err) {
    if (err) return next(err);
    if (!person.get()) return next();
    model.ref('_page.person', person);
    page.render('edit');
  });
});

app.component('people:list', PeopleList);
function PeopleList() {}
PeopleList.prototype.init = function(model) {
  model.ref('people', model.root.sort('people', nameAscending));
};

function nameAscending(a, b) {
  var aName = (a && a.name || '').toLowerCase();
  var bName = (b && b.name || '').toLowerCase();
  if (aName < bName) return -1;
  if (aName > bName) return 1;
  return 0;
}

app.component('edit:form', EditForm);
function EditForm() {}

EditForm.prototype.done = function() {
  var model = this.model;
  if (!model.get('person.name')) {
    var checkName = model.on('change', 'person.name', function(value) {
      if (!value) return;
      model.del('nameError');
      model.removeListener('change', checkName);
    });
    model.set('nameError', true);
    this.nameInput.focus();
    return;
  }
  console.log(model.get('person.id'));
  if (!model.get('person.id')) {

    model.root.add('people', model.get('person'));
  }
  app.history.push('/people');
};

EditForm.prototype.cancel = function() {
  app.history.back();
};

EditForm.prototype.deletePerson = function() {
  // Update model without emitting events so that the page doesn't update
  this.model.silent().del('person');
  app.history.back();
};
