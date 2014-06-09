
// var proxy = require('../lib/proxy');

var app = module.exports = require('derby').createApp('directory', __filename);

// TODO: add const to store URL and DB path etc..
/*
app.config = {
  collection : {
    adminConfig : 'adminConfig',
    href : ''
  }
}*/

global.app = app;

app.use(require('d-bootstrap'));
//app.loadViews(__dirname + '/views');
//app.loadStyles(__dirname);
app.loadViews (__dirname+'/../../views');
// app.loadStyles(__dirname+'/../../styles');

app.component(require('d-connection-alert'));
app.component(require('d-before-unload'));

/******************************************************************************
 * Home
 ******************************************************************************/
app.get('/', function(page, model) {

  // Model manipulation test
  console.log('***** model manipulation start *****');
  config = model.at('admin.config');
  model.subscribe(config, function(err){
    if (err) next(err);
    config.set('lapin');
    config.set({
      user: 'lapin',
      password: 'superlapin',
      url: 'impressivelapin!',
      note: {
        premier: 'bla',
        deuxieme: 'rebla'
      }
    });
    console.log(config.get('user'));
    // config.set({user: 'chamelle'}); // this removes all the others data
    // user = config.scope('note.permier'); user.set('chamelle'); // this is not working either
    config.set({
      user: 'chamelle',
      password: config.get('password'),
      url: config.get('url'),
      note: {
        premier : config.get('note.premier'),
        deuxieme: 'deuxième note'
      }
    })
    console.log(config.get('user'));
    config.set('erased'); // change structure
    console.log(config.get('user'));

  });

  console.log('***** model manipulation stop *****');

  page.render('home');
});

/******************************************************************************
 * Config
 ******************************************************************************/
// TODO: clean whole functions once going live
app.get('/admin/config', function(page, model, params, next) {

  // use a single document to store the data and follow good practice
  var adminConfig = model.root.query('adminConfig', {});
  // get the data
  adminConfig.fetch(function(err) {
    var objId; // store the ID of the element to store the admin config
    // if no document exist in the collection, we add it
    if (adminConfig.get().length == 0) { // adminConfig.get() might be enough to test
      objId = model.root.add('adminConfig', {
        source: 'https://mp-ria-X.zetcom.com/instanceName',
        username: 'username',
        password: 'pwd'
      });
    }
      // debug : console.log('adding '+objId);
    /* debug :
    } else {
      objId = adminConfig.get()[0].id; // find the ID of the first existing object
      // debug : console.log('retrieving '+objId);
    } */
    page.render('adminConfigEdit');

  });
});

app.component('adminConfigEdit', AdminForm);
function AdminForm() {};

AdminForm.prototype.init = function(model) {
  // use a single document to store the data and follow good practice
  var adminConfig = model.root.query('adminConfig', {});

  adminConfig.subscribe(function(err) {
    // TODO: Derby issue? Data still not there when added from app.get() route... derby's too fast!
    if (adminConfig.get().length > 0) {
        var objId = adminConfig.get()[0].id;
        // TODO: store the ID in a temp variable
    } else {
      // refresh page
      app.history.push('/admin/config');
    }

    // debug : console.log('objId='+objId);
    // change the scope of the subscription to the ID of the object found
    model.ref('_page.adminConfig', model.root.at('adminConfig.'+objId));

  });
};

AdminForm.prototype.runSynchronizer = function() {
  console.log('runSynchronizer() click');

  var model = this.model;
  // this will trigger the change on the server side & pass config data object to server
  model.root.add('adminSync', {
    start: Date()
    , config: model.get('_page.adminConfig')
    // , mapping: model.get('mapping') // TODO: pass the mapping from here directly? check if this make sense
  });

};

AdminForm.prototype.runParser = function() {
  var model = this.model;
  // TODO: proxy.parseData(model.root.set('cache.modules'), model);
};

AdminForm.prototype.stopSynchronizer = function() {
  var model = this.model;
  // TODO: model.root.set('sync.inProgress', false); // force finish
};

AdminForm.prototype.clearSynchronizerLog = function() {
  var model = this.model;
  // TODO: model.root.set('sync.log', '');
};

/******************************************************************************
 * Mapping
 ******************************************************************************/

app.get('/admin/mapping', function(page, model, params, next) {
  var mappingQuery = model.query('mapping', {});
  mappingQuery.subscribe(function(err) {
    if (err) return next(err);
    page.render('adminMappingList');
  });
});

app.get('/admin/mapping/:id', function(page, model, params, next) {
  if (params.id === 'new') {
    return page.render('adminMappingEdit');
  }
  var mapping = model.at('mapping.' + params.id);
  mapping.subscribe(function(err) {
    if (err) return next(err);
    if (!mapping.get()) return next();
    model.ref('_page.mapping', mapping);
    page.render('adminMappingEdit');
  });
});

app.component('adminMappingList:list', AdminMappingList);
function AdminMappingList() {}
AdminMappingList.prototype.init = function(model) {
  model.ref('mapping', model.root.sort('mapping', nameAscending));
}

app.component('adminMappingEdit:form', AdminMappingEditForm);
function AdminMappingEditForm() {}

AdminMappingEditForm.prototype.done = function() {
  var model = this.model;
  if (!model.get('mapping.id')) {
    model.root.add('mapping', model.get('mapping'));
  }
  app.history.push('/admin/mapping');
};

AdminMappingEditForm.prototype.cancel = function() {
  app.history.back();
}

AdminMappingEditForm.prototype.deleteMapping = function() {
  // Update model without emitting events so that the page doesn't update
  this.model.silent().del('mapping');
  app.history.back();
};

/******************************************************************************
 * People
 ******************************************************************************/

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
