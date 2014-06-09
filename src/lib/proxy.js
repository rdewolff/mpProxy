var ria = require('mpRiaApi'); // watchout - mpRiaApi is a server side app - not going to work client side!
var series = require('./series'); // run functions in series

module.exports = {
  syncInit : syncInit
}

var syncData = {
  moduleList: '',
  module : {
    object : ''
  }
};

function syncInit(model, source, username, password) {

  console.log('sync.start');
  /* test model get data from this proxy */
  var adminConfig = model.root.query('adminConfig', {});
  adminConfig.fetch(function(err) {
    console.dir(adminConfig.get());
  });

  // mpRiaApi go!
  ria.setCreditentials(username, password);
  ria.setInstanceUrl(source); // source url
  console.log('model.get():' + model.root.get('adminConfig')); // test access to model working properly
  series.series([
    function(next) {
      ria._login(next);
    },
    function(next) {
      var parentNext = next;
      ria.getModuleList(
        function(err, data){
          syncData.moduleList = data; // save data
          model.root.setNull('data.moduleList', data); // FIXME: only set new value if null
          parentNext();
        }, 'array');
    },
    function(next) {
      var parentNext = next;
      ria.getAllModuleDefinition(
        function(err, data) {
          model.root.set('data.allModuleDefinition', data);
          // TODO: changes the default $ character (cf https://github.com/Leonidas-from-XIV/node-xml2js, option name "attrkey")
          parentNext();
        }
      );
    },
    function(next) {
      var parentNext = next;
      ria.getAllObjectFromModule(
        'Object',
        function(err, data) {
          syncData.module.object = data; // save data
          console.dir(data.application.modules);
          model.root.set('data.object', data.application.modules);
          parentNext();
        },
        'json');
      },
    /* function(next) { async(4, next); },
    function(next) { async(5, next); },
    function(next) { async(6, next); }, */
  ], final);

  /*
  // FIXME: handle error
  ria._login(function() {

    // get the module list
    ria.getModuleList(function(err, data) {
      // debug
      //model.root.set('sync.log', model.root.get('sync.log') + '\nError: ' + err + 'Data' + data );
      // store the data
      model.root.del('data.AvailableModules');
      model.root.set('data.AvailableModules', data);
      // debug
      //console.dir('\nerror: ' + err);
      // console.log("\nData: %j", JSONdata); // show all json format
      model.root.set('sync.log', model.root.get('sync.log') + ' getModuleList() done.')
    }, 'array');


    // TODO do this for all the required modules
    ria.getAllObjectFromModule('Object', function(err, data) {

      model.root.del('cache.modules');
      model.root.set('cache.modules', data);

      // this will enhance the raw structure from RIA
      proxy.parseData(data, model);

      // TODO must be able to parse this from client side directly

      model.root.set('sync.log', model.root.get('sync.log') + ' getAllObjectFromModule() done.')
      // debug
      //model.root.set('sync.log', JSON.stringify(data));
      // finish sync properly
      model.root.set('sync.end', Date());
      model.root.set('sync.inProgress', false); // finished
      model.root.set('sync.duration', (Date.parse(model.root.get('sync.end'))-Date.parse(model.root.get('sync.start')))/1000)

    }, 'json');

  });
  */
}

function final() {
  // store data
  console.log('store data');
  console.dir(syncData);
  console.dir(syncData.module.object);

}

/*
function getAllFields(data) {
  console.log("getAllFields");

}

function parseData(data, model) {
  console.log("parseData");
  // example from mpRiaApi :

  // this get the full module name : msg.application.modules[0].module[0].$.name
  for (var i = msg.application.modules[0].module.length - 1; i >= 0; i--) {
    // debug console.log(msg.application.modules[0].module[i].$.name);
    moduleNames[i] = {content: msg.application.modules[0].module[i].$.name};
  };


}
*/
