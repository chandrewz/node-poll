var express = require('express');
var app = express();

// for parsing application/json
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// for validating input
var validator = require('express-validator');
app.use(validator({
	customValidators: {
		isArray: function(value) {
			return Array.isArray(value);
		},
		eachIsNotEmpty: function(values, prop) {
			return values.every(function(val) {
				return validator.notEmpty(val.prop);
			});
		}
	}
}));

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

/**
 * Models
 */
var models = require('./models/models');
var knex = models.knex;
var Poll = models.Poll;
var PollOption = models.PollOption;

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

app.post('/api/poll', function(request, response) {

	// validations
	request.checkBody('topic', 'Invalid poll topic.').notEmpty().isAlpha();
	request.checkBody('options', 'Invalid poll topic.').isArray().eachIsNotEmpty();
	var errors = request.request.validationErrors();
	if (errors) {
		response.send('Validation errors', 400);
		return;
	}

	new Poll({ name: request.body.topic }).save().then(function(poll) {
		optionsArray = [];
		options = request.body.options;
		for (i in options) {
			optionsArray.push({ poll_id: poll.id, name: options[i] });
		}
		// use knex for batch inserts, returning id of inserted options
		knex('options').insert(optionsArray).returning('id').then(function(optionIds) {
			// create a nice json response to send back
			for (i in optionsArray) {
				optionsArray[i] = {
					id: optionIds[i],
					poll_id: poll.id,
					name: optionsArray[i].name,
					votes: 0
				};
			}
			pollResult = {
				id: poll.id,
				name: poll.get('name'),
				options: optionsArray
			};
			response.send(pollResult);
		})
	});
});

app.get('/api/poll/:id', function(request, response) {
	Poll.where({ id: request.params.id }).fetch({ withRelated: ['options'] }).then(function(poll) {
		response.send(poll.toJSON());
	});
});

app.put('/api/poll/:id/vote', function(request, response) {
	// fetch option by poll id and option id
	PollOption.where({
		id: request.body.option_id,
		poll_id: request.params.id
	}).fetch().then(function(option) {
		// increment vote by 1
		new PollOption({
			id: request.body.option_id,
			poll_id: request.params.id
		}).save({ votes: option.get('votes') + 1 }, { patch: true }).then(function(option) {
			response.send(option.toJSON());
		});
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
