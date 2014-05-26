
// transform data from RIA to full web

module.exports = {
  getAllFields: getAllFields,
  parseData: parseData
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
