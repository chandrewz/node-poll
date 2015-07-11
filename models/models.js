var knex = require('knex')({
	client: 'pg',
	connection: process.env.DATABASE_URL
});

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

exports.knex = knex;
exports.Poll = Poll;
exports.PollOption = PollOption;
