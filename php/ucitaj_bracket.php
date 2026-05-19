<?php

include "konekcija_sa_bazom.php";

$baza->exec("CREATE TABLE IF NOT EXISTS bracket_stanje (id INTEGER PRIMARY KEY, podaci TEXT)");

header("Content-Type: application/json");

$red = $baza->querySingle("SELECT podaci FROM bracket_stanje WHERE id = 1");

if ($red) {
    echo $red;
} else {
    echo "null";
}

?>
