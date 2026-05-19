<?php

include "konekcija_sa_bazom.php";

$ime = $_POST["ime"];
$prezime = $_POST["prezime"];
$elo = $_POST["elo"];
$poeni = 0;
$foto = null;

if (isset($_FILES["foto"]) && $_FILES["foto"]["error"] === UPLOAD_ERR_OK) {
    $ext = strtolower(pathinfo($_FILES["foto"]["name"], PATHINFO_EXTENSION));
    $dozvoljeni = ["jpg", "jpeg", "png", "webp", "gif"];
    if (!in_array($ext, $dozvoljeni)) {
        echo "Greška: dozvoljeni formati su jpg, jpeg, png, webp, gif.";
        exit();
    }
    $novoIme = time() . "_" . rand(1000, 9999) . "." . $ext;
    $putanjaFoto = __DIR__ . "/../uploads/" . $novoIme;
    if (move_uploaded_file($_FILES["foto"]["tmp_name"], $putanjaFoto)) {
        $foto = "uploads/" . $novoIme;
    } else {
        echo "Greška pri čuvanju fotografije.";
        exit();
    }
} else {
    echo "Greška: fotografija je obavezna.";
    exit();
}

$upit = $baza->prepare("
INSERT INTO igraci (ime, prezime, elo, poeni, foto)
VALUES (:ime, :prezime, :elo, :poeni, :foto)
");

$upit->bindValue(":ime", $ime);
$upit->bindValue(":prezime", $prezime);
$upit->bindValue(":elo", $elo);
$upit->bindValue(":poeni", $poeni);
$upit->bindValue(":foto", $foto);

$rezultat = $upit->execute();

if ($rezultat) {
    echo "Unos uspešno dodat.";
} else {
    echo "Greška pri dodavanju.";
}

?>
