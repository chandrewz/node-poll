/**
 * Models
 */
var models = require('../models/models');
var knex = models.knex;
var Poll = models.Poll;
var PollOption = models.PollOption;
var IpAddress = models.IpAddress;

var util = require('util');

/**
 * GET /api/polls
 * Find all polls with their names. No poll options included.
 */
exports.getAllPolls = function(request, response) {
	Poll.fetchAll().then(function(polls) {
		if (polls) {
			response.send(polls.toJSON());
		} else {
			response.send({msg: 'No polls found.'}, 404);
		}
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
	request.check('name', 'Invalid poll name.').notEmpty();
	request.check('options', 'Invalid poll options.').isArray();
	request.sanitize('track_ip').toBoolean();
	var errors = request.validationErrors();
	if (errors) {
		response.send(util.inspect(errors), 400);
		return;
	}

	new Poll({ name: request.body.name, track_ip: request.body.track_ip }).save().then(function(poll) {
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
				options: optionsArray,
				track_ip: poll.get('track_ip')
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

	console.log(1)

	request.check('option_id', 'Invalid option_id.').notEmpty().isInt();
	var errors = request.validationErrors();
	if (errors) {
		console.log(1.1)
		response.send(util.inspect(errors), 400);
		return;
	}

	console.log(2)

	var pollId = request.params.id;
	var optionId = request.body.option_id;

	// fetch option by poll id and option id
	PollOption.where({
		id: optionId,
		poll_id: pollId
	}).fetch({ withRelated: ['poll'] }).then(function(option) {

		console.log(3)
		console.log(option);
		console.log(option.related('poll'))
		console.log(option.related('poll').attributes)

		// check if poll cares about ip
		var track = option.related('poll').track_ip;
		if (track) {
			console.log(3.1)
			IpAddress.where({ poll_id: pollId, ip_address: request.ip }).fetch().then(function(ip) {
				if (ip) {
					// this ip has already voted on this poll
					response.send({msg: request.ip + ' has already voted.'}, '400');
					return;
				}
			})
		}
		console.log(4)

		// increment vote by 1
		new PollOption({
			id: optionId,
			poll_id: pollId
		}).save({ votes: option.get('votes') + 1 }, { patch: true }).then(function(option) {
			if (track) {
				// if ip should be tracked
				new IpAddress({ poll_id: pollId, ip_address: request.ip }).save().then(function(ip) {
					response.send(ip.toJSON());
				});
			} else {
				response.send(option.toJSON());
			}
		});
	});
}