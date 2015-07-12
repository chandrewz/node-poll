/**
 * Models
 */
var models = require('../models/models');
var knex = models.knex;
var Poll = models.Poll;
var PollOption = models.PollOption;

var util = require('util');

/**
 * GET /api/polls
 * Find all polls with their names. No poll options included.
 */
exports.getAllPolls = function(request, response) {
	Poll.fetchAll().then(function(polls) {
		response.send(polls.toJSON());
	});
}

/**
 * GET /api/poll/:id
 * Find a poll by id and returns it with the related poll options.
 */
exports.getPoll = function(request, response) {
	Poll.where({ id: request.params.id }).fetch({ withRelated: ['options'] }).then(function(poll) {
		response.send(poll.toJSON());
	});
}

/**
 * GET /api/options
 * Find all poll options, without corresponding parent polls.
 */
exports.getAllOptions = function(request, response) {
	PollOption.fetchAll().then(function(options) {
		response.send(options.toJSON());
	});
}

/**
 * GET /api/option/:id
 * Find poll option with its related poll.
 */
exports.getOption = function(request, response) {
	PollOption.where({ id: request.params.id }).fetch({ withRelated: ['poll'] }).then(function(option) {
		console.log(option);
		response.send(option.toJSON());
	});
}

/**
 * POST /api/poll
 * Creates a poll.
 */
exports.createPoll = function(request, response) {

	// validations
	request.check('topic', 'Invalid poll topic.').notEmpty();
	request.check('options', 'Invalid poll options.').isArray();
	var errors = request.validationErrors();
	if (errors) {
		response.send(util.inspect(errors), 400);
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

}

/**
 * PUT /api/poll/:id/vote
 * Vote on a poll option.
 */
exports.vote = function(request, response) {

	request.check('option_id', 'Invalid option_id.').notEmpty().isInt();
	var errors = request.validationErrors();
	if (errors) {
		response.send(util.inspect(errors), 400);
		return;
	}

	// fetch option by poll id and option id
	PollOption.where({
		id: request.body.option_id,
		poll_id: request.params.id
	}).fetch({ withRelated: ['options'] }).then(function(option) {
		// increment vote by 1
		new PollOption({
			id: request.body.option_id,
			poll_id: request.params.id
		}).save({ votes: option.get('votes') + 1 }, { patch: true }).then(function(option) {
			response.send(option.toJSON());
		});
	});
}