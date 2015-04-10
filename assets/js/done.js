var oelna = window.oelna || {};
oelna.done = window.oelna.done || {};

//fail silently, if console is not available
if(typeof console === 'undefined') {
	console = {};
	if(oelna.done.debug) console.log = function() {
		return;
	}
}

db.open({
	name: 'done',
	version: 1,
	schema: {
		tasks: {
			key: {
				keyPath: 'id',
				autoIncrement: true
			},
			indexes: {
				title: { unique: true }
			}
		},
		times: {
			key: { keyPath: 'id', autoIncrement: true },
			indexes: {
				task: {},
				date: {}
			}
		}
	}
}).done(function(server){

	jQuery(document).ready(function($) {
		oelna.done.webapp = window.navigator.standalone; //currently unused
		oelna.done.domain = document.domain; //currently unused
		oelna.done.main_table = $('#tasks');
		oelna.done.editmode = 0;
		oelna.done.show_days = 7;
		oelna.done.weekdays = ['Su', 'Mo','Tu','We','Th','Fr','Sa'];
		oelna.done.clickevent = ('ontouchstart' in document.documentElement) ? 'touchend' : 'click'; //use click for non-touch devices, kill 600ms delay for touchscreens
		oelna.done.debug = false;

		if(oelna.done.debug) console.log('DOM init. ', server);

		render_view();

		function render_view(offset, clear) {
			get_tasks(function(data) {
				if(clear === true) clear_table();

				//init the table view with days
				init_table(oelna.done.show_days, offset);

				//loop over the single rows
				for(i in data) {
					add_row(data[i].title, data[i].id);
				}
			});
		};

		function get_tasks(callback) {
			server.query('tasks').filter().execute().done(function(data) {
				//if(oelna.done.debug) console.log(data);

				callback(data);
			});
		};

		function add_task(title, callback) {
			server.add('tasks', {
				title: title
			}).then(function(item) {
				//added successfully
				if(oelna.done.debug) console.log('added task: ', item[0]);

				if(callback) callback(title, item[0].id, true); //title, id, is_new
			});
		};

		function remove_task(id) {
			//remove all connected dates first
			server.query('times')
				.filter(function(item) {
					if(item.task == id) return true;
					else return false;
				})
				.execute()
				.then(function(results) {
					if(oelna.done.debug) console.log(results);

					for(i in results) {
						server.remove('times', results[i].id).then(function(key) {
							if(oelna.done.debug) console.log('removed linked item # ', key);
						});
					}
				});

			server.remove('tasks', id).then(function(key) {
				if(oelna.done.debug) console.log('removed task # ', key);
			});
		};

		function add_link(date, row, callback) {
			server.add('times', {
				task: row,
				date: date
			}).then(function(item) {
				//added successfully
				if(oelna.done.debug) console.log('added time: ', item);

				if(callback) callback(item);
			});
		};

		function remove_link(date, row) {
			if(oelna.done.debug) console.log('remove link.');

			server.query('times')
				.filter(function(item) {
					if(item.task == row && item.date == date) return true;
					else return false;
				})
				.execute()
				.then(function(results) {

					if(results[0].id) {
						server.remove('times', results[0].id).then(function(key) {
							if(oelna.done.debug) console.log('removed item # ', key);
						});
					}

				});
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

		function add_row(title, id, is_new) {
			if(!title) return;

			var first_row = oelna.done.main_table.find('tr:eq(0)');
			var length = first_row.find('th, td').length;

			var row = $('<tr>').attr('data-itemid', id).append('<th>'+title+'</th>');

			var dates = [];
			for(var i=0; i<length-1; i++) {
				var index = first_row.find('th').eq(i+1);

				dates.push(index.data('date'));
				row.append('<td><input type="checkbox" value="1" data-date="'+index.data('date')+'" /></th>');
			}

			if(!is_new) {

				//todo: get indexes from the DB?
				server.query('times')
					.filter(function(item) {
						//this is probably way inefficient
						if(item.task == id && (jQuery.inArray(item.date, dates))) return true;
						else return false;
					})
					.execute()
					.then(function(results) {
						//check all boxes that have database entries
						for(j in results) {
							$('tr[data-itemid="'+id+'"]').find('input[data-date="'+results[j].date+'"]').attr('checked', 'checked');
						}
					});
			}

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
			if(oelna.done.debug) console.log(input.getDate()+'.'+input.getMonth()+'.'+input.getFullYear());
		};

		$(document).on(oelna.done.clickevent, 'table input', function(e) {

			var row_id = $(this).parents('tr').eq(0).data('itemid');
			if(oelna.done.debug) console.log(row_id);

			var date = $(this).data('date');
			if(oelna.done.debug) console.log('clicked date '+date);


			//weird counterintuitive javascript behavior
			if($(this).is(':checked')) {
				//check the checkbox and add to DB
				add_link(date, row_id);
			} else {
				//uncheck and remove from the DB
				remove_link(date, row_id);
			}

		});

		$(document).on(oelna.done.clickevent, '#add', function(e) {
			e.preventDefault();
			if(oelna.done.editmode) edit_mode_off(); //disable edit mode first

			//create a random title
			//var title = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);
			//add_row(title, 4, true);

			var title = window.prompt('Create new task', '');
			if(title) {
				//add_row(title, false, true);
				add_task(title, add_row);
			}

		});

		$(document).on(oelna.done.clickevent, '#clear', function(e) {
			e.preventDefault();

			if(window.confirm('Warning: this deletes absolutely everything in the database! Continue?')) {
				indexedDB.deleteDatabase('undefined'); //why is the database still called 'undefined'?
				document.location.reload();
			}
		});

		$(document).on(oelna.done.clickevent, '#edit', function(e) {
			e.preventDefault();

			if(oelna.done.editmode == 0) {
				edit_mode_on();
			} else {
				edit_mode_off();
			}
		});

		$(document).on(oelna.done.clickevent, '.edit', function(e) {
			var id = $(e.target).parent().data('itemid');
			var title = e.target.innerHTML;

			if(window.confirm('Really remove item '+title+'?')) {
				remove_task(id); //remove from DB
				$(e.target).parent().remove();
			}
		});

		$(document).on(oelna.done.clickevent, '#prev, #next', function(e) {
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
			render_view(start, true);

		});

	});



}).fail(function(error){
	console.error('An error occured: ', error);
});