<?php

session_start();

if (!isset($_SESSION["ulogovan"])) {
    header("Location: login.php");
    exit();
}

readfile("index.html");

?>