<?php

include "konekcija_sa_bazom.php";

$json = file_get_contents("php://input");
$lista = json_decode($json, true);

if (!$lista) {
    http_response_code(400);
    echo "Nema podataka.";
    exit();
}

foreach ($lista as $unos) {
    $upit = $baza->prepare("UPDATE igraci SET poeni = :poeni WHERE id = :id");
    $upit->bindValue(":poeni", $unos["poeni"]);
    $upit->bindValue(":id", $unos["id"]);
    $upit->execute();
}

echo "ok";

?>
