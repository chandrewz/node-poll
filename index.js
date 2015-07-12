var express = require('express');
var app = express();

// for parsing application/json
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// for validating input
var expressValidator = require('express-validator');
app.use(expressValidator({
	customValidators: {
		isArray: function(value) {
			return Array.isArray(value);
		}
	}
}));

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

/**
 * Routes
 */
var PollController = require('./controllers/PollController');

app.get('/', function(request, response) { response.render('pages/index'); });
app.get('/poll', function(request, response) { response.render('pages/poll'); });
app.get('/poll/:id', function(request, response) { PollController.getPoll(request, response) });
app.get('/api/polls', function(request, response) { PollController.getAllPolls(request, response); });
app.get('/api/poll/:id', function(request, response) { PollController.getPoll(request, response); });
app.post('/api/poll', function(request, response) { PollController.createPoll(request, response); });
app.put('/api/poll/:id/vote', function(request, response) { PollController.vote(request, response); });
app.get('/api/options', function(request, response) { PollController.getAllOptions(request, response); });
app.get('/api/option/:id', function(request, response) { PollController.getOption(request, response); });

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
