$( "form" ).submit(function( event ) {
	event.preventDefault();
	var formArray = $( this ).serializeArray();
	var postData = {};
	postData.name = formArray[0].value
	postData.options = [];
	for (var i = 1; i < formArray.length; i++) {
		postData.options.push(formArray[i].value);
	}

	$.ajax({
		type: "POST",
		url: "api/poll",
		data: JSON.stringify(postData),
		success: function(){ alert('Poll created'); },
		dataType: "json",
		contentType : "application/json"
	});
});