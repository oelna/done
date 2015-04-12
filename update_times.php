<?php
	date_default_timezone_set('Europe/Berlin');
	$db = new PDO('sqlite:done.sqlite');

	$amount = ($_GET['amount']) ? $_GET['amount'] : 7;

	if($_GET['mode'] && $_GET['mode'] == 'insert') {
		if(!$_GET['task'] || !$_GET['date']) {
			die(json_encode(array('status' => 'error', 'message' => 'Missing parameters')));
		}

		$db->exec('INSERT INTO times (task, date) VALUES ('.$db->quote($_GET['task']).', '.$db->quote($_GET['date']).')');

		$insert_id = $db->lastInsertId();

		echo(json_encode(array('status' => 'success', 'content' => $insert_id)));

	} else if($_GET['mode'] && $_GET['mode'] == 'select') {
		//$start = ($_GET['start']) ? $_GET['start'] : date('Y-n-j'); //todo: start on monday

		$dates = array();
		if($_GET['start']) {
			list($year, $month, $day) = explode('-', $_GET['start']);

			$month = str_pad($month, 2, '0', STR_PAD_LEFT);
			$day = str_pad($day, 2, '0', STR_PAD_LEFT);

			$timestamp = mktime(0,0,0,$month,$day,$year);
		} else {

			$timestamp = strtotime('last monday');
			//echo(date('d.m.Y', $timestamp));
			//echo($timestamp);
		}

		for($i=0; $i<$amount; $i++) {
			$dates[] = date('Y-n-j', $timestamp);

			$timestamp = $timestamp + 60*60*24;
		}

		//var_dump($dates);

		$result = array();
		$sql = 'SELECT * FROM times WHERE date IN("'.implode('","', $dates).'") LIMIT '.$db->quote($amount);

		foreach($db->query($sql) as $row) {
			unset($row[0]);
			unset($row[1]);
			unset($row[2]);

			$result[] = $row;
		}

		echo(json_encode(array('status' => 'success', 'content' => $result)));

	} else if($_GET['mode'] && $_GET['mode'] == 'delete') {
		if($_GET['task'] && $_GET['date']) {
			$db->exec('DELETE FROM times WHERE task = '.$db->quote($_GET['task']).' AND date = '.$db->quote($_GET['date']));
			echo(json_encode(array('status' => 'success')));
		} elseif($_GET['task']) {
			$db->exec('DELETE FROM times WHERE task = '.$db->quote($_GET['task']));
			echo(json_encode(array('status' => 'success')));
		} else {
			die(json_encode(array('status' => 'error', 'message' => 'Missing parameters')));
		}



	} else {
		die(json_encode(array('status' => 'error', 'message' => 'No parameters provided')));

	}

?>