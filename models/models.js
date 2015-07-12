/**
 * Models
 */

exports.knex = require('knex')({
	client: 'pg',
	connection: process.env.DATABASE_URL
});

var bookshelf = require('bookshelf')(knex);

/**
 * Table: polls
 */
exports.Poll = bookshelf.Model.extend({
	tableName: 'polls',
	options: function() {
		return this.hasMany(PollOption, 'poll_id');
	}
});

/**
 * Table: options
 */
exports.PollOption = bookshelf.Model.extend({
	tableName: 'options',
	poll: function() {
		return this.belongsTo(Poll, 'id');
	}
});
