<?php

include "konekcija_sa_bazom.php";

$id = $_POST["id"];

$red = $baza->querySingle("SELECT foto FROM igraci WHERE id = " . intval($id), true);
if ($red && !empty($red["foto"])) {
    $putanjaFoto = __DIR__ . "/../" . $red["foto"];
    if (file_exists($putanjaFoto)) {
        unlink($putanjaFoto);
    }
}

$upit = $baza->prepare("DELETE FROM igraci WHERE id = :id");
$upit->bindValue(":id", $id);
$rezultat = $upit->execute();

if ($rezultat) {
    echo "Unos uspešno obrisan.";
} else {
    echo "Greška pri brisanju.";
}

?>
