var express = require('express');
var app = express();

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

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


/**
 * Routes
 */
app.get('/', function(request, response) {
  // response.render('pages/index')
  // response.send(db)

  response.send('OK');
});

app.get('/api/:id', function(request, response) {
	Poll.where({id: request.params.id}).fetch({withRelated: ['options']}).then(function(poll) {
		response.send(poll.toJSON());
	});
});

app.get('/api/polls', function(request, response) {
	Poll.fetchAll().then(function(poll) {
		response.send(poll.toJSON());
	});
});

app.get('/api/options', function(request, response) {
	PollOption.fetchAll().then(function(pollOption) {
		response.send(pollOption.toJSON());
	});
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
