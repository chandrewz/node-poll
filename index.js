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
  option: function() {
  	this.belongsToMany(PollOption);
  }
});

var PollOption = bookshelf.Model.extend({
	tableName: 'options',
	poll: function() {
		this.belongsTo(Poll);
	}
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  // response.render('pages/index')
  // response.send(db)

  response.send('OK');
});

app.get('/db', function (request, response) {

	Poll.where({id: 1}).fetch().then(function(model) {
		response.send(model.toJSON());
	});

})

app.get('/api/:id', function(request, response) {
	Poll.fetchAll({id: 1}).then(function(model) {
		console.log(model.toJSON());
		console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
		console.log(model);
		console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
		console.log(model.option);
	});
	response.send(
		'HELLO'
	);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
