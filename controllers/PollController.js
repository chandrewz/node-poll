/**
 * Models
 */
var models = require('../models/models');
var knex = models.knex;
var Poll = models.Poll;
var PollOption = models.PollOption;

exports.getPoll = function(request, response) {
	Poll.where({ id: request.params.id }).fetch({ withRelated: ['options'] }).then(function(poll) {
		response.send(poll.toJSON());
	});
}