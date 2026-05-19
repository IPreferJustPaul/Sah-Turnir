<?php

$putanja = __DIR__ . "/../baza.db";

$baza = new SQLite3($putanja);

$baza->exec("
CREATE TABLE IF NOT EXISTS igraci (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ime TEXT,
    prezime TEXT,
    elo INTEGER,
    poeni INTEGER,
    foto TEXT
)
");

@$baza->exec("ALTER TABLE igraci ADD COLUMN foto TEXT");

$count = $baza->querySingle("SELECT COUNT(*) FROM igraci");
if ($count == 0) {
    $igraci = [
        ["Magnus",    "Carlsen",   2830, 0],
        ["Hikaru",    "Nakamura",  2780, 0],
        ["Fabiano",   "Caruana",   2760, 0],
        ["Anish",     "Giri",      2740, 0],
        ["Levon",     "Aronian",   2710, 0],
        ["Ian",       "Nepomniachtchi", 2690, 0],
        ["Wesley",    "So",        2660, 0],
        ["Viswanathan","Anand",    2630, 0],
        ["Teimour",   "Radjabov",  2590, 0],
        ["Boris",     "Gelfand",   2540, 0],
        ["Sergei",    "Movsesian", 2480, 0],
        ["Leinier",   "Dominguez", 2420, 0],
    ];

    $stmt = $baza->prepare("INSERT INTO igraci (ime, prezime, elo, poeni) VALUES (:ime, :prezime, :elo, :poeni)");
    foreach ($igraci as $igrac) {
        $stmt->bindValue(':ime',     $igrac[0], SQLITE3_TEXT);
        $stmt->bindValue(':prezime', $igrac[1], SQLITE3_TEXT);
        $stmt->bindValue(':elo',     $igrac[2], SQLITE3_INTEGER);
        $stmt->bindValue(':poeni',   $igrac[3], SQLITE3_INTEGER);
        $stmt->execute();
    }
}

?>
