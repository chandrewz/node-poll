var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var knex = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL
});

/**
 * Models
 */
var bookshelf = require('bookshelf')(knex);
var Poll = bookshelf.Model.extend({
  tableName: 'polls',
  options: function() {
  	return this.hasMany(PollOption, 'poll_id');
  }
});

var PollOption = bookshelf.Model.extend({
	tableName: 'options',
	poll: function() {
		return this.belongsTo(Poll, 'id');
	}
});

/**
 * Routes
 */
app.get('/', function(request, response) {
  // response.render('pages/index')
  // response.send(db)

  response.send('OK');
});

app.get('/api/polls', function(request, response) {
	Poll.fetchAll().then(function(polls) {
		response.send(polls.toJSON());
	});
});

app.post('/api/poll/new', function(request, response) {
	console.log(request.body);
	console.log(request.body.topic);
	Poll.save({name: request.body.topic}).then(function(poll) {
		response.send(poll.toJSON());
	});
	// options = request.body.options;
	// for (i in options) {
	// 	PollOption.save({name: options[i]});
	// }
});

app.get('/api/poll/:id', function(request, response) {
	Poll.where({id: request.params.id}).fetch({withRelated: ['options']}).then(function(poll) {
		response.send(poll.toJSON());
	});
});

app.get('/api/options', function(request, response) {
	PollOption.fetchAll().then(function(options) {
		response.send(options.toJSON());
	});
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
