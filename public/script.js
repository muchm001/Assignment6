var workoutForm = document.getElementById("newExercise");

workoutForm.addEventListener("submit",function(e)
{
	e.preventDefault();          //Stops the DOM from updating

	/* Set up new request */

	var req = new XMLHttpRequest();
	var queryString = '/insert';

	/* Set up parameters */

	var parameterString = "eName="+workoutForm.elements.eName.value+
		"&reps="+workoutForm.elements.reps.value+
		"&weight="+workoutForm.elements.weight.value+
		"&date="+workoutForm.elements.date.value+
		"&lbs="+workoutForm.elements.lbs.value;

	/* Request to server */

	req.open("GET", queryString + "?" + parameterString,true); /* Asynchronous call */
	req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
	req.addEventListener('load',function(){
		if(req.status >= 200 && req.status < 400){
			console.log('req sent successfully');
			var response = JSON.parse(req.responseText);
			var id = response.workouts;   /* Exercise information */

			/* Update exercise information */
			var tbl = document.getElementById("workoutTable");
			var newRow = tbl.insertRow(-1);			//Add row at end of table

			/* ID */
			var idCell = document.createElement('td');
			idCell.textContent = id;
			idCell.style.display="none"; /* Don't want to show the id to the users */
			newRow.appendChild(idCell);

			/* Name */
			var nameCell = document.createElement('td');
			nameCell.textContent =workoutForm.elements.eName.value;
			newRow.appendChild(nameCell);

			/* Reps */
			var repCell = document.createElement('td');
			repCell.textContent = workoutForm.elements.reps.value;
			newRow.appendChild(repCell);

			/* Weight */
			var weightCell = document.createElement('td');
			weightCell.textContent = workoutForm.elements.weight.value;
			newRow.appendChild(weightCell);

			/* Pounds or Kilograms */

			var lbsCell = document.createElement('td');
			lbsCell.textContent = workoutForm.elements.lbs.value;
			newRow.appendChild(lbsCell);

			/* Date */
			var dateCell = document.createElement('td');
			dateCell.textContent =workoutForm.elements.date.value;
			newRow.appendChild(dateCell);

			/* Edit Button */
			var editBtnCell = document.createElement('td');
			editBtnCell.innerHTML = '<a href="/updateWorkout?id='+id+'"><input type="button" value="Edit Exercise"></a>';
			newRow.appendChild(editBtnCell);

			/* Delete Button */
			var deleteBtnCell = document.createElement('td');
			deleteBtnCell.innerHTML = '<input type="button" value="Delete" onclick="deleteExercise(\'workoutTable\', this, '+ id +')">';
			newRow.appendChild(deleteBtnCell);			//Append cells at the end of the row

		}

		else
		{
			console.log('there was an error');
		}
	});

	req.send(queryString + "?" + parameterString);
});

function deleteExercise(tbl,curRow,rowID){

	var table = document.getElementById(tbl);
	var rowCount = table.rows.length;

	var req = new XMLHttpRequest();
	var queryString = '/delete';

	//Make GET Delete Request
	req.open("GET", queryString + "?id=" + rowID,true);
	req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
	req.addEventListener('load',function()
	{
		if(req.status >= 200 && req.status < 400)
		{
			console.log('del req sent');
		}

		else
		{
			console.log('there was an error');
		}
	});

	req.send(queryString + "?id=" + rowID);

	for(var i = 0; i < rowCount; i++){
		var row = table.rows[i];

		if(row==curRow.parentNode.parentNode){
			table.deleteRow(i);
		}
	}
}