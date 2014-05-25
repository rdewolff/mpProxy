var ria = require('mpRiaApi');

// 4th Express
var express = require('express');

// In the fourth Express middleware all made ​​in separate modules
// Account for each individually connected
var session = require('express-session');

// Connect the store
var connectStore, sessionStore;
if (process.env.REDIS_HOST) {
    var redis = require('redis');

    var redisClient;
    redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
    if (process.env.REDIS_PASSWORD) redisClient.auth(process.env.REDIS_PASSWORD);

    connectStore = require('connect-redis')(session);
    sessionStore = new connectStore({host: process.env.REDIS_HOST, port: process.env.REDIS_PORT, pass: process.env.REDIS_PASSWORD});
} else {
    connectStore = require('connect-mongo')(session);
    sessionStore = new connectStore({url: process.env.MONGO_URL});
}

// Error handler - I brought it into separate folder,
// Not to otvekal
var midError = require('./error');

var derby = require('derby');

// BrowserChannel - analogue socket.io from Google - transport used
// Derby, for transmitting data from the browser to the server

// LiveDbMongo - Mongo driver for the derby - can reactively update data
var racerBrowserChannel = require('racer-browserchannel');
var liveDbMongo = require('livedb-mongo');

// Connect the mechanism for creating bundles browserify
derby.use(require('racer-bundle'));

exports.setup = function setup(app, options) {

    // Initialize the database (here usually connects more and redis)
    var store = derby.createStore({
        db: liveDbMongo(process.env.MONGO_URL + '?auto_reconnect', {safe: true}),
        redis: redisClient
    });

    // server side model watching
    var model = store.createModel();
    // subscribe to changes
    model.subscribe('sync', function(err, msg){

      // this listen on the change done by the client.
      model.on('change', 'sync.start', function(id, message) {

        console.log('sync.start');

        model.root.set('sync.inProgress', true); // only 1 sync at a time
        model.root.set('sync.log',  model.root.get('sync.log') + '\nRun synchronizer : ' + model.root.get('sync.lastsync'));

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
            model.root.set('data.AvailableModules', data);
            // debug
            //console.dir('\nerror: ' + err);
            // console.log("\nData: %j", JSONdata); // show all json format
            model.root.set('sync.log', model.root.get('sync.log') + ' getModuleList() done.')
          }, 'array');


          // TODO do this for all the required modules
          ria.getAllObjectFromModule('Object', function(err, data) {

            model.root.set('cache.modules', data);
            model.root.set('sync.log', model.root.get('sync.log') + ' getAllObjectFromModule() done.')
            // debug
            //model.root.set('sync.log', JSON.stringify(data));
            // finish sync properly
            model.root.set('sync.end', Date());
            model.root.set('sync.inProgress', false); // finished
            model.root.set('sync.duration', (Date.parse(model.root.get('sync.end'))-Date.parse(model.root.get('sync.start')))/1000)

          }, 'json');

        });

      });

    });


    var expressApp = express()

    // Here, the application gives its "bundle"
    // (Thus processed requests to / derby / ...)
    expressApp.use(app.scripts(store));

    if (options && options.static) {
        expressApp.use(require('serve-static')(options.static));
    }

    // Here in the bundle is added klietsky script browserchannel,
    // And returns processing middleware client messages
    // (Browserchannel based on longpooling - ie processed here
    // Requests to / channel)
    expressApp.use(racerBrowserChannel(store));

    // In req added method getModel, allows a standard
    // Express-ovskim controller to read and write to the database, see createUserId
    expressApp.use(store.modelMiddleware());

    expressApp.use(require('cookie-parser')(process.env.SESSION_COOKIE));
    expressApp.use(session({
        secret: process.env.SESSION_SECRET,
        store: sessionStore
    }));

    expressApp.use(createUserId);

    // Here we register controllers derby applications
    // They will be triggered when the user is taking pages from the server
    expressApp.use(app.router());

    // Default Route - generate a 404 error
    expressApp.all('*', function (req, res, next) {
        next('404: ' + req.url);
    });

    // Error handler
    expressApp.use(midError());

    return expressApp;
}

// Forwarding of user id-session model derby
// If the session id is not - generate random
function createUserId(req, res, next) {
    var model = req.getModel();
    var userId = req.session.userId;
    if (!userId) userId = req.session.userId = model.id();
    model.set('_session.userId', userId);
    next();
}
