<?php
	$db = new PDO('sqlite:done.sqlite');

	if($_GET['mode'] && $_GET['mode'] == 'insert') {
		if(!$_GET['title']) {
			die(json_encode(array('status' => 'error', 'message' => 'Missing parameters')));
		}

		$db->exec('INSERT INTO tasks (title) VALUES ('.$db->quote($_GET['title']).')');
		$insert_id = $db->lastInsertId();

		echo(json_encode(array('status' => 'success', 'content' => $insert_id)));

	} else if($_GET['mode'] && $_GET['mode'] == 'select') {

		$result = array();
		$sql = 'SELECT * FROM tasks';
		foreach($db->query($sql) as $row) {
			unset($row[0]);
			unset($row[1]);

			$result[] = $row;
		}

		echo(json_encode(array('status' => 'success', 'content' => $result)));

	} else if($_GET['mode'] && $_GET['mode'] == 'delete' && $_GET['id']) {

		$db->exec('DELETE FROM tasks WHERE id = '.$db->quote($_GET['id']));
		echo(json_encode(array('status' => 'success')));

	} else {

		die(json_encode(array('status' => 'error', 'message' => 'No parameters provided')));

	}






?>