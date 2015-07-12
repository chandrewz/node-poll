/**
 * Submit the poll.
 */
$( "form" ).submit(function( event ) {
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
		type: "POST",
		url: "api/poll",
		data: JSON.stringify(postData),
		success: function(data) {
			$('#modal-title').text('Wow, poll created!');
			$('#modal-body').html('You can see your poll here: <a href="http://node-poll.herokuapp.com/poll/' + data.id + '">http://node-poll.herokuapp.com/poll/' + data.id + '</a>');
			$('#modal').modal('show');
		},
		dataType: "json",
		contentType : "application/json"
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