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
 * Columns: id, name, track_ip
 */
var Poll = bookshelf.Model.extend({
	tableName: 'polls',
	options: function() {
		return this.hasMany(PollOption, 'poll_id');
	}
});

/**
 * Table: options
 * Columns: id, poll_id, name, votes
 */
var PollOption = bookshelf.Model.extend({
	tableName: 'options',
	poll: function() {
		return this.belongsTo(Poll);
	}
});

/**
 * Table: ip_addresses
 * Column: id, poll_id, ip_address
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