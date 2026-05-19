<?php

include "konekcija_sa_bazom.php";

$baza->exec("CREATE TABLE IF NOT EXISTS bracket_stanje (id INTEGER PRIMARY KEY, podaci TEXT)");

$json = file_get_contents("php://input");

if (!$json) {
    http_response_code(400);
    echo "Nema podataka.";
    exit();
}

$upit = $baza->prepare("INSERT OR REPLACE INTO bracket_stanje (id, podaci) VALUES (1, :podaci)");
$upit->bindValue(":podaci", $json);
$rezultat = $upit->execute();

echo $rezultat ? "ok" : "greska";

?>
