var bracketState = [];
var matchResults = [];
var allePlayers = [];
var bracketBaseElo = {};

var btnDodajIgraca = document.getElementById("btnDodajIgraca");
var btnPrikaziIgraca = document.getElementById("btnPrikaziIgraca");
var btnSacuvajIzmene = document.getElementById("btnSacuvajIzmene");
var btnLeaderboard = document.getElementById("btnLeaderboard");

var formaSekcija = document.getElementById("formaSekcija");
var igraciSekcija = document.getElementById("igraciSekcija");
var leaderboardSekcija = document.getElementById("leaderboardSekcija");

var patientForm = document.getElementById("patientForm");
var editForm = document.getElementById("editForm");

var imeInput = document.getElementById("ime");
var prezimeInput = document.getElementById("prezime");
var eloInput = document.getElementById("elo");

var modalUredi = new bootstrap.Modal(document.getElementById("modalUredi"));

btnDodajIgraca.addEventListener("click", prikaziFormu);
btnPrikaziIgraca.addEventListener("click", prikaziIgraca);
patientForm.addEventListener("submit", dodajIgraca);
btnSacuvajIzmene.addEventListener("click", sacuvajIzmene);
btnLeaderboard.addEventListener("click", prikaziLeaderboard);

document.getElementById("foto").addEventListener("change", function () {
  var preview = document.getElementById("fotoPreview");
  var file = this.files[0];
  if (file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.classList.remove("d-none");
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
    preview.classList.add("d-none");
  }
});

function prikaziFormu() {
  formaSekcija.classList.remove("d-none");
  igraciSekcija.classList.add("d-none");
  leaderboardSekcija.classList.add("d-none");
}

function dodajIgraca(e) {
  e.preventDefault();
  var ime = imeInput.value.trim();
  var prezime = prezimeInput.value.trim();
  var elo = parseInt(eloInput.value);
  if (ime == "" || prezime == "" || isNaN(elo)) {
    alert("Unesi ispravne podatke.");
    return;
  }
  var podaci = new FormData(patientForm);
  var zahtev = new XMLHttpRequest();
  zahtev.open("POST", "php/dodaj_igraca.php", true);
  zahtev.onload = function () {
    alert(zahtev.responseText);
    patientForm.reset();
    prikaziIgraca();
  };
  zahtev.send(podaci);
}

function prikaziIgraca() {
  formaSekcija.classList.add("d-none");
  igraciSekcija.classList.remove("d-none");
  leaderboardSekcija.classList.add("d-none");
  var zahtev = new XMLHttpRequest();
  zahtev.open("GET", "php/prikazi_igraca.php", true);
  zahtev.onload = function () {
    var svi = JSON.parse(zahtev.responseText);
    svi.sort(function (a, b) { return a.id - b.id; });
    allePlayers = svi;
    var igraci = svi.slice(0, 16);
    while (igraci.length < 16) { igraci.push(null); }
    initBracketState(igraci);
    ucitajBracket(igraci);
  };
  zahtev.send();
}

function initBracketState(igraci) {
  bracketState = [[], [], [], []];
  for (var i = 0; i < 8; i++) {
    bracketState[0].push([igraci[i * 2] || null, igraci[i * 2 + 1] || null]);
  }
  bracketState[1] = [[null, null], [null, null], [null, null], [null, null]];
  bracketState[2] = [[null, null], [null, null]];
  bracketState[3] = [[null, null]];

  matchResults = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null],
    [null, null],
    [null]
  ];

  bracketBaseElo = {};
  for (var i = 0; i < igraci.length; i++) {
    if (igraci[i]) bracketBaseElo[igraci[i].id] = igraci[i].elo;
  }
}

function resetBracket() {
  for (var r = 1; r <= 3; r++) {
    for (var m = 0; m < bracketState[r].length; m++) {
      bracketState[r][m] = [null, null];
    }
  }
  for (var r = 0; r < matchResults.length; r++) {
    for (var m = 0; m < matchResults[r].length; m++) {
      matchResults[r][m] = null;
    }
  }
  renderBracket();
  saveAll();
}

function eloChangeForMatch(id0, id1) {
  var e0 = bracketBaseElo[id0] || 0;
  var e1 = bracketBaseElo[id1] || 0;
  return 5 + Math.floor(Math.abs(e0 - e1) / 100);
}

function onPlayerClick(round, match, slot) {
  var player = bracketState[round][match][slot];
  if (!player) return;
  var newResult = slot === 0 ? 0 : 1;
  var currentResult = matchResults[round][match];
  if (currentResult === newResult) {
    matchResults[round][match] = null;
    if (round < 3) {
      cascadeClear(round + 1, Math.floor(match / 2), match % 2);
    }
  } else {
    matchResults[round][match] = newResult;
    if (round < 3) {
      var nextRound = round + 1;
      var nextMatch = Math.floor(match / 2);
      var nextSlot = match % 2;
      cascadeClear(nextRound, nextMatch, nextSlot);
      bracketState[nextRound][nextMatch][nextSlot] = player;
    }
  }
  renderBracket();
  saveAll();
}

function onTieClick(round, match) {
  var p0 = bracketState[round][match][0];
  var p1 = bracketState[round][match][1];
  if (!p0 || !p1) return;
  if (matchResults[round][match] === 'tie') {
    matchResults[round][match] = null;
  } else {
    matchResults[round][match] = 'tie';
    if (round < 3) {
      cascadeClear(round + 1, Math.floor(match / 2), match % 2);
    }
  }
  renderBracket();
  saveAll();
}

function cascadeClear(round, match, slot) {
  if (round > 3 || !bracketState[round] || match >= bracketState[round].length) return;
  bracketState[round][match][slot] = null;
  if (round < 3) {
    cascadeClear(round + 1, Math.floor(match / 2), match % 2);
  }
}

function computePoints() {
  var points = {};
  for (var r = 0; r < 4; r++) {
    for (var m = 0; m < bracketState[r].length; m++) {
      var p0 = bracketState[r][m][0];
      var p1 = bracketState[r][m][1];
      var result = matchResults[r] ? matchResults[r][m] : null;
      if (result === null || !p0 || !p1) continue;
      if (!(p0.id in points)) points[p0.id] = 0;
      if (!(p1.id in points)) points[p1.id] = 0;
      if (result === 0) { points[p0.id] += 1; }
      else if (result === 1) { points[p1.id] += 1; }
      else if (result === 'tie') { points[p0.id] += 0.5; points[p1.id] += 0.5; }
    }
  }
  return points;
}

function computeEloChanges() {
  var changes = {};
  for (var r = 0; r < 4; r++) {
    for (var m = 0; m < bracketState[r].length; m++) {
      var p0 = bracketState[r][m][0];
      var p1 = bracketState[r][m][1];
      var result = matchResults[r] ? matchResults[r][m] : null;
      if (result === null || result === 'tie' || !p0 || !p1) continue;
      if (!(p0.id in changes)) changes[p0.id] = 0;
      if (!(p1.id in changes)) changes[p1.id] = 0;
      var delta = eloChangeForMatch(p0.id, p1.id);
      if (result === 0) { changes[p0.id] += delta; changes[p1.id] -= delta; }
      else if (result === 1) { changes[p1.id] += delta; changes[p0.id] -= delta; }
    }
  }
  return changes;
}

function saveAll() {
  sacuvajBracket();
  azurirajPoene();
}

function azurirajPoene() {
  var pointsMap = computePoints();
  var lista = [];
  for (var i = 0; i < allePlayers.length; i++) {
    var p = allePlayers[i];
    lista.push({
      id: p.id,
      poeni: pointsMap[p.id] || 0
    });
  }
  var zahtev = new XMLHttpRequest();
  zahtev.open("POST", "php/postavi_poene.php", true);
  zahtev.setRequestHeader("Content-Type", "application/json");
  zahtev.send(JSON.stringify(lista));
}

function sacuvajBracket() {
  var advancement = [];
  for (var r = 1; r <= 3; r++) {
    var round = [];
    for (var m = 0; m < bracketState[r].length; m++) {
      var match = bracketState[r][m];
      round.push([match[0] ? match[0].id : null, match[1] ? match[1].id : null]);
    }
    advancement.push(round);
  }
  var podaci = { advancement: advancement, results: matchResults, baseElo: bracketBaseElo };
  var zahtev = new XMLHttpRequest();
  zahtev.open("POST", "php/sacuvaj_bracket.php", true);
  zahtev.setRequestHeader("Content-Type", "application/json");
  zahtev.send(JSON.stringify(podaci));
}

function ucitajBracket(igraci) {
  var zahtev = new XMLHttpRequest();
  zahtev.open("GET", "php/ucitaj_bracket.php", true);
  zahtev.onload = function () {
    var sacuvano = JSON.parse(zahtev.responseText);
    if (sacuvano) {
      var mapa = {};
      for (var i = 0; i < igraci.length; i++) {
        if (igraci[i]) mapa[igraci[i].id] = igraci[i];
      }
      var adv = sacuvano.advancement || sacuvano;
      if (Array.isArray(adv)) {
        for (var r = 0; r < adv.length; r++) {
          for (var m = 0; m < adv[r].length && m < bracketState[r + 1].length; m++) {
            bracketState[r + 1][m] = [
              adv[r][m][0] ? (mapa[adv[r][m][0]] || null) : null,
              adv[r][m][1] ? (mapa[adv[r][m][1]] || null) : null
            ];
          }
        }
      }
      if (sacuvano.results) matchResults = sacuvano.results;
      if (sacuvano.baseElo) bracketBaseElo = sacuvano.baseElo;
    }
    renderBracket();
  };
  zahtev.send();
}

function getEloDelta(round, match, slot) {
  var p0 = bracketState[round][match][0];
  var p1 = bracketState[round][match][1];
  var result = matchResults[round] ? matchResults[round][match] : null;
  if (result === null || result === 'tie' || !p0 || !p1) return null;
  var delta = eloChangeForMatch(p0.id, p1.id);
  var winner = result === 0 ? 0 : 1;
  if (slot === winner) return "+" + delta;
  return "-" + delta;
}

function renderWinner() {
  var winnerDisplay = document.getElementById("winnerDisplay");
  var finalResult = matchResults[3] ? matchResults[3][0] : null;
  var finalMatch = bracketState[3] ? bracketState[3][0] : null;
  if (finalResult !== null && finalResult !== 'tie' && finalMatch) {
    var winner = finalMatch[finalResult];
    if (winner && winner.foto) {
      document.getElementById("winnerPhoto").src = winner.foto;
      document.getElementById("winnerName").textContent = winner.ime + " " + winner.prezime;
      winnerDisplay.classList.remove("d-none");
      return;
    }
  }
  winnerDisplay.classList.add("d-none");
}

function renderBracket() {
  var popunjeno = 0;
  for (var i = 0; i < bracketState[0].length; i++) {
    for (var p = 0; p < 2; p++) {
      if (bracketState[0][i][p] !== null) popunjeno++;
    }
  }
  document.getElementById("bracketInfo").textContent = popunjeno + " / 16 igrača";

  var roundLabels = ["Round of 16", "Quarterfinals", "Semifinals", "Final"];
  var container = document.getElementById("bracketContainer");
  container.innerHTML = "";

  for (var r = 0; r < 4; r++) {
    var isFinal = r === 3;
    var roundDiv = document.createElement("div");
    roundDiv.className = "bracket-round" + (isFinal ? " bracket-round-final" : "");

    var labelDiv = document.createElement("div");
    labelDiv.className = "bracket-round-label";
    labelDiv.textContent = roundLabels[r];
    roundDiv.appendChild(labelDiv);

    var bodyDiv = document.createElement("div");
    bodyDiv.className = "bracket-round-body";

    for (var m = 0; m < bracketState[r].length; m++) {
      var match = bracketState[r][m];
      var result = matchResults[r] ? matchResults[r][m] : null;
      var p0 = match[0];
      var p1 = match[1];

      var matchDiv = document.createElement("div");
      matchDiv.className = "bracket-match";

      for (var p = 0; p < 2; p++) {
        var player = match[p];
        var playerDiv = document.createElement("div");

        if (player) {
          var isWinner = (result === 0 && p === 0) || (result === 1 && p === 1);
          var isLoser  = (result === 0 && p === 1) || (result === 1 && p === 0);
          var isTied   = result === 'tie';

          var classes = "bracket-player";
          if (isWinner) classes += " bracket-winner";
          else if (isLoser) classes += " bracket-loser";
          else if (isTied) classes += " bracket-tied";
          else classes += " bracket-clickable";

          playerDiv.className = classes;

          var seedHTML = r === 0
            ? '<span class="bracket-seed">' + (m * 2 + p + 1) + '</span>'
            : '';

          var removeHTML = r === 0
            ? '<button class="bracket-remove-btn" title="Ukloni igrača" onclick="event.stopPropagation()">&#x2715;</button>'
            : '';

          playerDiv.innerHTML = seedHTML + '<span class="bracket-name">' + player.ime + " " + player.prezime + '</span>' + removeHTML;

          if (r === 0) {
            (function (igrac) {
              var btn = playerDiv.querySelector(".bracket-remove-btn");
              btn.addEventListener("click", function (e) {
                e.stopPropagation();
                obrisiIgraca(igrac.id, igrac.ime + " " + igrac.prezime);
              });
            })(player);
          }

          if (!isLoser) {
            (function (round, matchIdx, slotIdx) {
              playerDiv.addEventListener("click", function () {
                onPlayerClick(round, matchIdx, slotIdx);
              });
            })(r, m, p);
          }

        } else {
          playerDiv.className = r === 0 ? "bracket-player empty" : "bracket-player tbd";
          if (r === 0) {
            playerDiv.innerHTML = '<span class="bracket-seed">' + (m * 2 + p + 1) + '</span><span>Slobodan slot</span>';
          } else {
            playerDiv.textContent = "TBD";
          }
        }

        matchDiv.appendChild(playerDiv);

        if (p === 0) {
          var tieDiv = document.createElement("div");
          tieDiv.className = "bracket-tie-row";
          if (p0 && p1) {
            var tieBtn = document.createElement("button");
            tieBtn.className = "bracket-tie-btn" + (result === 'tie' ? " bracket-tie-active" : "");
            tieBtn.textContent = "½";
            tieBtn.title = result === 'tie' ? "Klikni da poništiš nerešeno" : "Nerešeno";
            (function (round, matchIdx) {
              tieBtn.addEventListener("click", function () { onTieClick(round, matchIdx); });
            })(r, m);
            tieDiv.appendChild(tieBtn);
          }
          matchDiv.appendChild(tieDiv);
        }
      }

      bodyDiv.appendChild(matchDiv);
    }

    roundDiv.appendChild(bodyDiv);
    container.appendChild(roundDiv);
  }

  renderWinner();
}

function otvoriUrediModal(igrac) {
  document.getElementById("editId").value = igrac.id;
  document.getElementById("editIme").value = igrac.ime;
  document.getElementById("editPrezime").value = igrac.prezime;
  document.getElementById("editElo").value = igrac.elo;
  document.getElementById("editPoeni").value = igrac.poeni;

  var preview = document.getElementById("editFotoPreview");
  var fileInput = document.getElementById("editFoto");
  fileInput.value = "";
  if (igrac.foto) {
    preview.src = igrac.foto;
    preview.classList.remove("d-none");
  } else {
    preview.src = "";
    preview.classList.add("d-none");
  }

  modalUredi.show();
}

document.getElementById("editFoto").addEventListener("change", function () {
  var preview = document.getElementById("editFotoPreview");
  var file = this.files[0];
  if (file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.classList.remove("d-none");
    };
    reader.readAsDataURL(file);
  }
});

function refreshCurrentView() {
  if (!leaderboardSekcija.classList.contains("d-none")) {
    prikaziLeaderboard();
  } else {
    prikaziIgraca();
  }
}

function sacuvajIzmene() {
  var ime = document.getElementById("editIme").value.trim();
  var prezime = document.getElementById("editPrezime").value.trim();
  var elo = parseInt(document.getElementById("editElo").value);
  var poeni = parseInt(document.getElementById("editPoeni").value);
  if (ime == "" || prezime == "" || isNaN(elo) || isNaN(poeni)) {
    alert("Unesi ispravne podatke.");
    return;
  }
  var podaci = new FormData(editForm);
  var zahtev = new XMLHttpRequest();
  zahtev.open("POST", "php/uredi_igraca.php", true);
  zahtev.onload = function () {
    alert(zahtev.responseText);
    modalUredi.hide();
    refreshCurrentView();
  };
  zahtev.send(podaci);
}

function obrisiIgraca(id, ime) {
  if (!confirm("Da li sigurno želiš da obrišeš igrača \"" + ime + "\"?")) return;
  var podaci = new FormData();
  podaci.append("id", id);
  var zahtev = new XMLHttpRequest();
  zahtev.open("POST", "php/obrisi_igraca.php", true);
  zahtev.onload = function () {
    alert(zahtev.responseText);
    refreshCurrentView();
  };
  zahtev.send(podaci);
}

function sortLeaderboard(lista, kljuc) {
  var tekstualni = ["ime", "prezime"];
  return lista.slice().sort(function (a, b) {
    if (tekstualni.indexOf(kljuc) !== -1) {
      return (a[kljuc] || "").localeCompare(b[kljuc] || "");
    }
    return (b[kljuc] || 0) - (a[kljuc] || 0);
  });
}

function filterLeaderboard(lista) {
  var filter = document.getElementById("lbFilter").value;
  if (filter === "elo_high") return lista.filter(function (p) { return p.elo > 1500; });
  if (filter === "elo_low")  return lista.filter(function (p) { return p.elo < 1500; });
  if (filter === "has_points") return lista.filter(function (p) { return p.poeni > 0; });
  return lista;
}

function renderLeaderboard(lista) {
  var kljuc = document.getElementById("lbSort").value;
  var sortirana = sortLeaderboard(filterLeaderboard(lista), kljuc);
  var tbody = document.getElementById("leaderboardBody");
  document.getElementById("brojIgracaLb").textContent = lista.length + " igrača";
  tbody.innerHTML = "";
  if (sortirana.length == 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Nema igrača za prikaz.</td></tr>';
    return;
  }
  for (var i = 0; i < sortirana.length; i++) {
    var igrac = sortirana[i];
    var rang = i + 1;
    var rangBadge;
    if (rang == 1) rangBadge = '<span class="rank-badge rank-gold">🥇 1</span>';
    else if (rang == 2) rangBadge = '<span class="rank-badge rank-silver">🥈 2</span>';
    else if (rang == 3) rangBadge = '<span class="rank-badge rank-bronze">🥉 3</span>';
    else rangBadge = '<span class="rank-badge rank-default">' + rang + '</span>';
    var row = document.createElement("tr");
    if (rang <= 3) row.className = "rank-row-" + rang;
    var fotoHTML = igrac.foto
      ? '<img src="' + igrac.foto + '" class="lb-thumb" alt="">'
      : '<div class="lb-thumb lb-thumb-empty"></div>';
    row.innerHTML =
      '<td class="ps-4">' + rangBadge + "</td>" +
      "<td>" + fotoHTML + "</td>" +
      "<td><strong>" + igrac.ime + " " + igrac.prezime + "</strong></td>" +
      '<td><span class="fw-bold text-primary">' + igrac.poeni + "</span></td>" +
      "<td>" + igrac.elo + "</td>" +
      '<td class="pe-3"><div class="d-flex gap-1 justify-content-end">' +
        '<button class="btn btn-outline-secondary btn-sm lb-action-btn" data-action="edit">Uredi</button>' +
        '<button class="btn btn-outline-danger btn-sm lb-action-btn" data-action="delete">Obriši</button>' +
      '</div></td>';
    (function (player) {
      row.querySelector('[data-action="edit"]').addEventListener("click", function () {
        otvoriUrediModal(player);
      });
      row.querySelector('[data-action="delete"]').addEventListener("click", function () {
        obrisiIgraca(player.id, player.ime + " " + player.prezime);
      });
    })(igrac);
    tbody.appendChild(row);
  }
}

var _lbLista = [];

document.getElementById("lbSort").addEventListener("change", function () {
  renderLeaderboard(_lbLista);
});

document.getElementById("lbFilter").addEventListener("change", function () {
  renderLeaderboard(_lbLista);
});

function prikaziLeaderboard() {
  formaSekcija.classList.add("d-none");
  igraciSekcija.classList.add("d-none");
  leaderboardSekcija.classList.remove("d-none");
  var zahtev = new XMLHttpRequest();
  zahtev.open("GET", "php/prikazi_igraca.php", true);
  zahtev.onload = function () {
    _lbLista = JSON.parse(zahtev.responseText);
    renderLeaderboard(_lbLista);
  };
  zahtev.send();
}
