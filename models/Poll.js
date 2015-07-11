var Poll = bookshelf.Model.extend({
	tableName: 'polls',
	options: function() {
		return this.hasMany(PollOption, 'poll_id');
	}
});