<?php

include "konekcija_sa_bazom.php";

$sql = "
CREATE TABLE IF NOT EXISTS igraci (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ime TEXT,
    prezime TEXT,
    elo INTEGER,
    poeni INTEGER
)
";

$baza->exec($sql);

echo "Baza i tabela su uspešno kreirane.<br>";
echo "Putanja baze: " . $putanja;

?>
