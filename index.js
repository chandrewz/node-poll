var express = require('express');
var app = express();

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
	var db = require('pg-bricks').configure(process.env.DATABASE_URL);
	db.select().from('polls').where('id', 1).rows(function(e) {
		console.log(e);
		response.send(e)
	});

})

app.get('/api/:id', function(req, res) {
	response.send('OK');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
