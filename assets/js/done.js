var oelna = window.oelna || {};
oelna.done = window.oelna.done || {};

//fail silently, if console is not available
if(typeof console === 'undefined') {
	console = {};
	console.log = function() {
		return;
	}
}

jQuery(document).ready(function($) {
	oelna.done.webapp = window.navigator.standalone;
	oelna.done.domain = document.domain;
	oelna.done.dbsupport = 'indexedDB' in window;
	oelna.done.db;
	oelna.done.main_table = $('#test');
	oelna.done.editmode = 0;
	oelna.done.show_days = 7;
	oelna.done.weekdays = ['Su', 'Mo','Tu','We','Th','Fr','Sa'];
	oelna.done.clickevent = (Modernizr.touch) ? 'touchend' : 'click'; //use click for non-touch devices, kill 600ms delay for touchscreens

	console.log('init DB: '+oelna.done.dbsupport);

	if(oelna.done.dbsupport) {
		var version = 4;
		var open_request = indexedDB.open('done', version);

		open_request.onupgradeneeded = function(e) {
			oelna.done.db = e.target.result;

			console.log('running onupgradeneeded');

			if(!oelna.done.db.objectStoreNames.contains('tasks')) {
				oelna.done.db.createObjectStore('tasks', {autoIncrement: true});
			}

			if(!oelna.done.db.objectStoreNames.contains('times')) {
				var store = oelna.done.db.createObjectStore('times', {autoIncrement: true});
				store.createIndex('datelink', ['id', 'date'], {unique: true});
			}

		}

		open_request.onerror = function(e) {
			console.log('DB error');
		}

		open_request.onsuccess = function(e) {
			oelna.done.db = e.target.result;
			console.log('DB success: '+oelna.done.db);

			get_tasks(function(data) {
				//init the table view with days
				init_table(oelna.done.show_days);

				//loop over the single rows
				for(i in data) {
					add_row(data[i].title, i);
				}
			});

		};

		//indexedDB.deleteDatabase("done")
	}

	function get_tasks(callback) {
		var transaction = oelna.done.db.transaction(['tasks'], 'readonly');
		var store = transaction.objectStore('tasks');

		var range = IDBKeyRange.lowerBound(0); //get everything in the store
		var request = store.openCursor(range);

		var data = [];
		request.onsuccess = function(e) {
			var result = e.target.result;

			if(result) {
				data.push(result.value);
				result.continue();

			} else {
				callback(data);
			}
		};
	};

	function add_task(title) {

		var transaction = oelna.done.db.transaction(['tasks'], 'readwrite');
		var store = transaction2.objectStore('tasks');

		var index = {
			title: title
		}

		var request = store2.add(index);

		request.onerror = function(e) {
			console.log("Error",e.target.error.name);
			//some type of error handler
		}

		request.onsuccess = function(e) {
			//added successfully
		}
	};

	function add_link(date, row) {

		var transaction = oelna.done.db.transaction(['times'], 'readwrite');
		var store = transaction.objectStore('times');

		var index = {
			id: row,
			date: date
		}

		var request = store.add(index);

		request.onerror = function(e) {
			console.log("Error",e.target.error.name);
			//some type of error handler
		}

		request.onsuccess = function(e) {
			//added successfully
		}
	};

	function remove_link(date, row) {

		var transaction = oelna.done.db.transaction(['times'], 'readwrite');
		var store = transaction.objectStore('times');

		var index = {
			id: row,
			date: date
		}

		var request = store.add(index);

		request.onerror = function(e) {
			console.log("Error",e.target.error.name);
			//some type of error handler
		}

		request.onsuccess = function(e) {
			//added successfully
		}
	};

	function init_table(amount, startdate) {
		if(!amount || amount < 1) var amount = 7;

		if(startdate) {
			var next_day = startdate;
		} else {
			//begin display on monday
			var today = new Date();
			var day = today.getDay();
			if(day !== 1) today.setHours(-24 * (day-1));
			var next_day = new Date(today);
		}
		var today = new Date(); //reset to actual today

		var header_row = $('<tr>').attr('id', 'header').append('<th></th>');
		oelna.done.main_table.append(header_row);

		for(var i=0; i<amount; i++) {
			var today_string = '';
			if(next_day.toDateString() === today.toDateString()) {
				today_string = ' class="today"';
			}

			var pretty_date = oelna.done.weekdays[next_day.getDay()]+' '+next_day.getDate()+'.'+(next_day.getMonth()+1)+'.';
			var standard_date = next_day.getFullYear()+'-'+(next_day.getMonth()+1)+'-'+next_day.getDate();

			header_row.append('<th data-date="'+standard_date+'"'+today_string+'>'+pretty_date+'</th>');

			//increase by 1
			next_day.setDate(next_day.getDate()+1);
		}
	};

	function clear_table() {
		oelna.done.main_table.empty();
	};

	function add_row(title, id) {
		if(!title) return;

		var first_row = oelna.done.main_table.find('tr:eq(0)');
		var length = first_row.find('th, td').length;

		var row = $('<tr>').attr('data-itemid', id).append('<th>'+title+'</th>');

		for(var i=0; i<length-1; i++) {
			var index = first_row.find('th').eq(i+1);

			row.append('<td><input type="checkbox" value="1" data-date="'+index.data('date')+'" /></th>');

			//todo: fill in data from DB
		}

		//add_task(title);

		oelna.done.main_table.append(row);
	};

	function edit_mode_on() {
		var first_column = oelna.done.main_table.find('tr:gt(0)').find('th:eq(0)');

		oelna.done.editmode = 1;
		first_column.addClass('edit');
	};

	function edit_mode_off() {
		var first_column = oelna.done.main_table.find('tr:gt(0)').find('th:eq(0)');

		oelna.done.editmode = 0;
		first_column.removeClass('edit');
	};

	function parse_date(input) {
		var parts = input.split('-');

		return new Date(parts[0], parts[1]-1, parts[2]);
	};

	function date_to_string(input) {
		return input.getFullYear()+'-'+(input.getMonth()+1)+'-'+input.getDay();
	};

	function echo_date(input) {
		console.log(input.getDate()+'.'+input.getMonth()+'.'+input.getFullYear());
	};

	$(document).on('click', 'table input', function(e) {

		var row_id = $(this).parents('tr').eq(0).data('itemid');
		console.log(row_id);

		var date = $(this).data('date');
		console.log('clicked date '+date);


		//weird counterintuitive javascript behavior
		if($(this).is(':checked')) {
			//check the checkbox and add to DB
			add_link(date, row_id);
		} else {
			//uncheck and remove from the DB
			remove_link(date, row_id);
		}

	});

	$(document).on('click', '#add', function(e) {
		e.preventDefault();
		if(oelna.done.editmode) edit_mode_off(); //disable edit mode first

		var title = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);
		add_row(title, 4);

		//todo: add to DB
	});

	$(document).on('click', '#edit', function(e) {
		e.preventDefault();

		if(oelna.done.editmode == 0) {
			edit_mode_on();
		} else {
			edit_mode_off();
		}
	});

	$(document).on('click', '.edit', function(e) {
		var item = e.target.innerHTML;

		if(window.confirm('Really remove item '+item+'?')) {
			$(e.target).parent().remove();
		}

		//todo: remove from DB
	});

	$(document).on('click', '#prev, #next', function(e) {
		e.preventDefault();

		var first_row = oelna.done.main_table.find('tr:eq(0)');

		if($(this).attr('id') == 'prev') {
			var first_day = parse_date(first_row.find('th:eq(1)').data('date'));
			first_day.setDate(first_day.getDate()-7);

			var start = first_day;
		} else {
			var last_day = parse_date(first_row.find('th:eq('+(first_row.find('th').length-1)+')').data('date'));

			var start = last_day;
			start.setDate(start.getDate() + 1);
		}

		//get the data from the DB
		get_tasks(function(data) {
			clear_table();

			//init the table view with days
			init_table(oelna.done.show_days, start);

			//loop over the single rows
			for(i in data) {
				add_row(data[i].title, i);
			}
		});
	});





});

//indexedDB.deleteDatabase("done")