<?php

session_start();

$greska = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $korisnickoIme = $_POST["korisnicko_ime"];
    $lozinka = $_POST["lozinka"];

    if ($korisnickoIme == "admin" && $lozinka == "12345") {
        $_SESSION["ulogovan"] = true;
        $_SESSION["korisnik"] = $korisnickoIme;

        header("Location: index.php");
        exit();
    } else {
        $greska = "Pogrešno korisničko ime ili lozinka.";
    }
}

?>

<!doctype html>
<html lang="sr">
<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Prijava</title>

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
    >

    <link rel="stylesheet" href="style.css">
</head>

<body>

    <div class="container py-5">

        <div class="row justify-content-center">

            <div class="col-12 col-md-5">

                <div class="app-box p-4 p-md-5">

                    <h1 class="main-title text-center mb-4">
                        Prijava
                    </h1>

                    <?php if ($greska != "") { ?>

                        <div class="alert alert-danger">
                            <?php echo $greska; ?>
                        </div>

                    <?php } ?>

                    <form method="POST" action="login.php">

                        <div class="mb-3">
                            <label class="form-label">
                                Korisničko ime
                            </label>

                            <input
                                type="text"
                                name="korisnicko_ime"
                                class="form-control"
                                required
                            >
                        </div>

                        <div class="mb-3">
                            <label class="form-label">
                                Lozinka
                            </label>

                            <input
                                type="password"
                                name="lozinka"
                                class="form-control"
                                required
                            >
                        </div>

                        <button
                            type="submit"
                            class="btn btn-primary w-100"
                        >
                            Prijavi se
                        </button>

                    </form>

                    <p class="text-muted text-center mt-3 mb-0">
                        Demo login: admin / 12345
                    </p>

                </div>

            </div>

        </div>

    </div>

</body>
</html>