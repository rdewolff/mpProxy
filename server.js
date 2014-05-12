var Hapi = require('hapi');
var mongoose = require('mongoose');

var server = Hapi.createServer('0.0.0.0', parseInt(process.env.PORT, 10) || 3000);

server.route({
  method: 'GET',
  path: '/status',
  handler: function(req, reply) {
    reply('No data');
  }
});

/******************************************************************************
 Hapi hacking
 *****************************************************************************/

server.route({
  method: 'GET'
, path: '/'
, handler: function(req, reply) {
    reply('i am a beautiful butterfly');
    console.dir("1");
  }
});

server.route({
  method: 'GET',
  path: '/quotes',
  handler: function(req, reply) {
    reply(quotes);
  }
});

server.route({
  method: 'GET',
  path: '/random',
  handler: function(req, reply) {
    var id = Math.floor(Math.random() * quotes.length);
    reply(quotes[id]);
  }
})

server.route({
  method: 'GET'
, path: '/quote/{id?}'
, handler: function(req, reply) {
    if (req.params.id) {
      if (quotes.length <= req.params.id) {
        return reply('No quote found.').code(404);
      }
      return reply(quotes[req.params.id]);
    }
    reply(quotes);
  }
});

server.route({
  method: 'POST'
, path: '/quote'
, config: {
    handler: function(req, reply) {
      var newQuote = {
        author: req.payload.author
      , text: req.payload.text
      };
      quotes.push(newQuote); 
      reply(newQuote);
    }
  /*, validate: { // TODO generating error, cannot find the Hapy.types.String() function ?!!?
      payload: {
        author: Hapi.types.String().required()
      , text: Hapi.types.String().required()
      }
    }*/
  }
});

server.route({
  method: 'DELETE'
, path: '/quote/{id}'
, handler: function(req, reply) {
    if (quotes.length <= req.params.id) {
      return reply('No quote found.').code(404);
    }
    quotes.splice(req.params.id, 1);
    reply(true);
  }
});

server.start();
