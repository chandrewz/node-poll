/**
 * Create a poll.
 */
$('#create-poll').submit(function( event ) {
	event.preventDefault();
	var formArray = $( this ).serializeArray();

	// properly create json from form
	var postData = {};
	postData.name = formArray[0].value
	postData.options = [];
	for (var i = 1; i < formArray.length; i++) {
		if (formArray[i].length !== 0 && formArray[i].value.trim()) {
			postData.options.push(formArray[i].value);
		}
	}
	postData.track_ip = $('#track').is(':checked');

	$.ajax({
		type: 'POST',
		url: '/api/poll',
		data: JSON.stringify(postData),
		success: function(data) {
			$('#modal-title').text('Wow, poll created!');
			$('#modal-body').html('You can see your poll here: <a href="http://node-poll.herokuapp.com/poll/' + data.id + '">http://node-poll.herokuapp.com/poll/' + data.id + '</a>');
			$('#modal').modal('show');
		},
		dataType: 'json',
		contentType : 'application/json'
	});
});

/**
 * If the last option is filled, add another option.
 */
function lastOption() {
	$('.last-option').on('input', function() {
		$('#options').append('<div class="form-group"><input name="option" type="text" class="form-control floating-label last-option" placeholder="Enter poll option"></div>')
		$(this).removeClass('last-option');
		$(this).unbind();
		lastOption();
	});
}
lastOption();

/**
 * Vote on a poll.
 */
$('#poll').submit(function(event) {
	event.preventDefault();
	var option = { option_id: $('input[name="option"]:checked', '#poll').val() };
	$.ajax({
		type: 'PUT',
		url: '/api/poll/' + $('#poll').attr('data-id') + '/vote',
		data: JSON.stringify(option),
		success: function(data) {
			$('#modal-title').text('Your vote is cast!');
			$('#modal-body').html('You can see the poll results here: <a href="http://node-poll.herokuapp.com/poll/' + data.poll_id + '/results">http://node-poll.herokuapp.com/poll/' + data.poll_id + '/results</a>');
			$('#modal').modal('show');
		},
		statusCode: {
			403: function() {
				$('#modal-title').text('You have already voted.');
				$('#modal-body').html('Someone from this IP has already voted on this poll.');
				$('#modal').modal('show');
			}
		}
		dataType: 'json',
		contentType : 'application/json'
	});
});