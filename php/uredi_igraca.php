<?php

include "konekcija_sa_bazom.php";

$id = $_POST["id"];
$ime = $_POST["ime"];
$prezime = $_POST["prezime"];
$elo = $_POST["elo"];
$poeni = $_POST["poeni"];

$novaFoto = null;

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
        $staraFoto = $baza->querySingle("SELECT foto FROM igraci WHERE id = " . intval($id), true);
        if ($staraFoto && !empty($staraFoto["foto"])) {
            $putanjaStare = __DIR__ . "/../" . $staraFoto["foto"];
            if (file_exists($putanjaStare)) unlink($putanjaStare);
        }
        $novaFoto = "uploads/" . $novoIme;
    } else {
        echo "Greška pri čuvanju fotografije.";
        exit();
    }
}

if ($novaFoto !== null) {
    $upit = $baza->prepare("
    UPDATE igraci SET
        ime = :ime,
        prezime = :prezime,
        elo = :elo,
        poeni = :poeni,
        foto = :foto
    WHERE id = :id
    ");
    $upit->bindValue(":foto", $novaFoto);
} else {
    $upit = $baza->prepare("
    UPDATE igraci SET
        ime = :ime,
        prezime = :prezime,
        elo = :elo,
        poeni = :poeni
    WHERE id = :id
    ");
}

$upit->bindValue(":id", $id);
$upit->bindValue(":ime", $ime);
$upit->bindValue(":prezime", $prezime);
$upit->bindValue(":elo", $elo);
$upit->bindValue(":poeni", $poeni);

$rezultat = $upit->execute();

if ($rezultat) {
    echo "Unos uspešno izmenjen.";
} else {
    echo "Greška pri izmeni.";
}

?>
