// shared code to synchronize data
// can be used from client or server

// TODO when enabling mpRiaApi an error breaks node
// var ria = require('mpRiaApi');
var series = require('./series'); // run functions in series

module.exports = {
  /*getAllFields: getAllFields,
  parseData: parseData,
  detected: detected, */
  syncInit : syncInit
}

function syncInit(model) {

  console.log('sync.start');

  // mpRiaApi go!
  ria.setCreditentials(model.root.get('sync.username'), model.root.get('sync.password'));
  ria.setInstanceUrl(model.root.get('sync.url'));

  // TODO handle error
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
}

function getAllFields(data) {
  console.log("getAllFields");

}

function parseData(data, model) {
  console.log("parseData");
  // example from mpRiaApi :
  /*
  // this get the full module name : msg.application.modules[0].module[0].$.name
  for (var i = msg.application.modules[0].module.length - 1; i >= 0; i--) {
    // debug console.log(msg.application.modules[0].module[i].$.name);
    moduleNames[i] = {content: msg.application.modules[0].module[i].$.name};
  };
  */

}
/**
 * Detect super fire!
 * @param fire Object to use to detect fire!
 */
function detected(fire) {
    console.log('test');
}
