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
		var version = 1;
		var open_request = indexedDB.open('done', version);

		open_request.onupgradeneeded = function(e) {
			oelna.done.db = e.target.result;

			console.log('running onupgradeneeded');

			if(!oelna.done.db.objectStoreNames.contains('tasks')) {
				oelna.done.db.createObjectStore('tasks', {keyPath: 'id'});
			}

			if(!oelna.done.db.objectStoreNames.contains('times')) {
				oelna.done.db.createObjectStore('times', {keyPath: 'id'});
			}

		}

		open_request.onerror = function(e) {
			console.log('DB error');
		}

		open_request.onsuccess = function(e) {
			console.log('DB success');

			oelna.done.db = e.target.result;


		};
	}

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

	function add_row(title) {
		if(!title) return;

		var first_row = oelna.done.main_table.find('tr:eq(0)');
		var length = first_row.find('th, td').length;

		var row = $('<tr>').attr('data-itemid', 0).append('<th>'+title+'</th>');

		for(var i=0; i<length-1; i++) {
			var index = first_row.find('th').eq(i+1);

			row.append('<td><input type="checkbox" value="1" data-date="'+index.data('date')+'" /></th>');

			//todo: fill in data from DB
		}

		oelna.done.main_table.append(row);
	}

	function edit_mode_on() {
		var first_column = oelna.done.main_table.find('tr:gt(0)').find('th:eq(0)');

		oelna.done.editmode = 1;
		first_column.addClass('edit');
	}

	function edit_mode_off() {
		var first_column = oelna.done.main_table.find('tr:gt(0)').find('th:eq(0)');

		oelna.done.editmode = 0;
		first_column.removeClass('edit');
	}

	function parse_date(input) {
		console.log(input);
		var parts = input.split('-');

		return new Date(parts[0], parts[1]-1, parts[2]);
	}

	function echo_date(input) {
		console.log(input.getDate()+'.'+input.getMonth()+'.'+input.getFullYear());
	}

	$(document).on('click', 'table input', function(e) {
		console.log('clicked row #');

		//todo: add link to DB
	});

	$(document).on('click', '#add', function(e) {
		e.preventDefault();
		if(oelna.done.editmode) edit_mode_off(); //disable edit mode first

		var title = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);
		add_row(title);

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
		}

		clear_table();
		init_table(oelna.done.show_days, start);
		add_row('test 1');
		add_row('test 2');
		add_row('test 3');
	});


	init_table(oelna.done.show_days);
	add_row('test 1');
	add_row('test 2');
	add_row('test 3');
});

//oelna.done.db.deleteDatabase('done');