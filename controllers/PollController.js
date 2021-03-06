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
 * TODO: Paging
 */
exports.getAllPolls = function(request, response, json) {
	Poll.fetchAll().then(function(polls) {
		if (polls) {
			var polls = polls.toJSON();
			if (json) {
				response.send(polls);
			} else {
				response.render('pages/polls', { polls: polls });
			}
		} else {
			response.status(404).send({msg: 'No polls found.'});
		}
	});
}

/**
 * GET /api/poll/:id
 * GET /poll/:id
 * GET /poll/:id/results
 * Find a poll by id and returns it with the related poll options.
 */
exports.getPoll = function(request, response, json) {
	Poll.where({ id: request.params.id }).fetch({ withRelated: ['options'] }).then(function(poll) {
		if (poll) {
			if (json) {
				response.send(poll.toJSON());
			} else {
				var p = poll.toJSON();
				if (request.url.indexOf('results') === -1) {
					// poll page view
					response.render('pages/poll', { poll: p, options: p.options });
				} else {
					// poll results view
					p.total = 0;
					for (i in p.options) {
						p.total += p.options[i].votes;
					}
					response.render('pages/results', { poll: p, options: p.options });
				}
			}
		} else {
			response.status(404).send({msg: 'No poll found.'});
		}
	});
}

/**
 * GET /api/options
 * Find all poll options, without corresponding parent polls.
 */
exports.getAllOptions = function(request, response) {
	PollOption.fetchAll().then(function(options) {
		if (options) {
			response.send(options.toJSON());
		} else {
			response.status(404).send({msg: 'No options found.'});
		}
	});
}

/**
 * GET /api/option/:id
 * Find poll option with its related poll.
 */
exports.getOption = function(request, response) {
	PollOption.where({ id: request.params.id }).fetch({ withRelated: ['poll'] }).then(function(option) {
		if (option) {
			response.send(option.toJSON());
		} else {
			response.status(404).send({msg: 'No option found.'});
		}
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

	request.check('option_id', 'Invalid option_id.').notEmpty().isInt();
	if (request.validationErrors()) {
		response.send(util.inspect(errors), 400);
		return;
	}

	var pollId = request.params.id;
	var optionId = request.body.option_id;
	var ipAddress = request.headers['x-forwarded-for'] ? request.headers['x-forwarded-for'].split(',')[0] : request.connection.remoteAddress;

	// fetch option by poll id and option id
	PollOption.where({
		id: optionId,
		poll_id: pollId
	}).fetch({ withRelated: ['poll'] }).then(function(option) {

		// check if poll cares about ip
		var track = option.related('poll').get('track_ip');
		if (track) {
			// track the ip
			IpAddress.where({ poll_id: pollId, ip_address: ipAddress }).fetch().then(function(ip) {
				if (ip) {
					// this ip has already voted on this poll
					response.status(403).send({msg: ipAddress + ' has already voted.'});
				} else {
					// increment vote by 1
					new PollOption({
						id: optionId,
						poll_id: pollId
					}).save({ votes: option.get('votes') + 1 }, { patch: true }).then(function(option) {
						// save the ip address
						new IpAddress({ poll_id: pollId, ip_address: ipAddress }).save().then(function(ip) {
							response.send(option.toJSON());
						});
					});
				}
			})
		} else {
			// no ip needed to be tracked, increment vote by 1
			new PollOption({
				id: optionId,
				poll_id: pollId
			}).save({ votes: option.get('votes') + 1 }, { patch: true }).then(function(option) {
				response.send(option.toJSON());
			});
		}
	});
}