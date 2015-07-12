/**
 * Models
 */

var knex = require('knex')({
	client: 'pg',
	connection: process.env.DATABASE_URL
});

var bookshelf = require('bookshelf')(knex);

/**
 * Table: polls
 */
var Poll = bookshelf.Model.extend({
	tableName: 'polls',
	options: function() {
		return this.hasMany(PollOption, 'poll_id');
	}
});

/**
 * Table: options
 */
var PollOption = bookshelf.Model.extend({
	tableName: 'options',
	poll: function() {
		return this.belongsTo(Poll);
	}
});

/**
 * Table: ip_addresses
 */
var IpAddress = bookshelf.Model.extend({
	tableName: 'ip_addresses',
	poll: function() {
		return this.belongsTo(Poll);
	}
});

exports.knex = knex;
exports.Poll = Poll;
exports.PollOption = PollOption;
exports.IpAddress = IpAddress;