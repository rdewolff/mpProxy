/*jslint node: true*/
var proxy = require('../lib/proxy');

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

    /******************************************************************************
     * Detect synchronisation trigger
     ******************************************************************************/
    model.subscribe('adminSync', function(err, msg){

      console.log('server subscribed');

      // this listen on the change done by the client.
      model.on('all', 'adminSync.*', function(id, message, args, p4) { // id = key, message = value
        console.log('SERVER CHANGES ' + Date());
        console.log("id      :" + id);
        console.log("message :" + message);
        console.dir(args);
        // console.dir(p4);

        // TODO: show that synchronizer is running somewhere in the model
        
        //model.root.set('sync.inProgress', true); // only 1 sync at a time
        //model.root.set('sync.log',  model.root.get('sync.log') + '\nRun synchronizer : ' + model.root.get('sync.lastsync'));
        // model.root.set('adminConfig.'+id+'.mode', 2);
        //var adminConfig = model.at();
        // model.root.set('adminConfig.'+id+'.username', 'SERVER_SIDE_CHANGE_L0VE!');
        //console.log("sync.start change detected server side");

        // trigger proxy synch
        proxy.syncInit(model, args.config.source, args.config.username, args.config.password);

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
