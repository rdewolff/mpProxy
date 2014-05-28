// shared code to synchronize data
// can be used from client or server

require('./series'); // run functions in series

module.exports = {
  getAllFields: getAllFields,
  parseData: parseData,
  detected: detected
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
