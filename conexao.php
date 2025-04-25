<?php
$hostname = "localhost";
$username = "root";
$password = "";
$database = "wall_tea";

$mysqli = new mysqli($hostname, $username, $password, $database);

if ($mysqli->connect_error) {
    die('Erro na conexão: ' . $mysqli->connect_error);
}