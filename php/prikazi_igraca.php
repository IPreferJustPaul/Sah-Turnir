<?php

include "konekcija_sa_bazom.php";

$rezultat = $baza->query("
SELECT *
FROM igraci
ORDER BY id DESC
");

$igraci = array();

while ($red = $rezultat->fetchArray(SQLITE3_ASSOC)) {
    $igraci[] = $red;
}

echo json_encode($igraci, JSON_UNESCAPED_UNICODE);

?>