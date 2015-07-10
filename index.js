var express = require('express');
var app = express();

var knex = require('knex')({
  client: 'pg',
  connection: process.env.DATABASE_URL
});

var bookshelf = require('bookshelf')(knex);

var Poll = bookshelf.Model.extend({
  tableName: 'polls'
});

// db.insert('polls', {'question': 'Who is the greatest?'});
// var pg = require('pg');

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
	response.send(
		knex('polls').join('options', 'polls.id', 'options.poll_id').where('polls.id', 1).toJSON()
	);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
