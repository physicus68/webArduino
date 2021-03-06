let port;
let textEncoder;
let textDecoder;
let writer;
let reader;
let dataView;

/*********************************************************************************************
 *        Gestion des controles
 ********************************************************************************************/

but_connection = document.getElementById("connection");
but_connection.addEventListener("click", connectionPortSerie);

but_envoi = document.getElementById("envoi");
but_envoi.addEventListener("click", envoiPortSerie);

but_stop = document.getElementById("stop");
but_stop.addEventListener("click", stopPortSerie);

vue = document.getElementById("data-vue");

but_copy_data = document.getElementById("copier-presse-papier");
but_copy_data.addEventListener("click", copierDonneesTable);

canvas = document.getElementById("canvas-graphe");
ctx = canvas.getContext("2d");

/*********************************************************************************************
 *        Gestion du port Série
 ********************************************************************************************/

// Commande START
async function envoiPortSerie() {
  clearDonnees();
  // trame de commande d'acquisition
  let T = document.getElementById("DT").value; // période d'échantillonage
  let N = document.getElementById("N").value; // nombre de points
  if (Number(N) < 1) {
    N = "1";
  }
  var A = "";
  A =
    A +
    (document.getElementById("A0").checked ? "1" : "0") +
    (document.getElementById("A1").checked ? "1" : "0") +
    (document.getElementById("A2").checked ? "1" : "0") +
    (document.getElementById("A3").checked ? "1" : "0") +
    (document.getElementById("A4").checked ? "1" : "0") +
    (document.getElementById("A5").checked ? "1" : "0"); // voies de mesures analogiques

  let trame = "START;" + T + ";" + N + ";" + A + ";*";
  await writer.write(trame); // commande envoyée
}
// Commande STOP
async function stopPortSerie() {
  await writer.write("STOP;*"); // commande envoyée
}

// Connection au port série
async function connectionPortSerie() {
  try {
    // ouverture du port
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    // paramétrage en écriture (mode texte)
    textEncoder = new TextEncoderStream();
    textEncoder.readable.pipeTo(port.writable);
    writer = textEncoder.writable.getWriter();
    // paramétrage en lecture (mode texte)
    textDecoder = new TextDecoderStream();
    port.readable.pipeTo(textDecoder.writable);
    // lecture en boucle du port série
    while (port.readable) {
      const reader = textDecoder.readable.getReader();
      try {
        let ligne = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          for (let c in value) {
            if (value[c] === "\n") {
              ligne = ligne + "";
            } else if (value[c] === "\r") {
              if (ligne.length > 0) {
                addDonnes(ligne);
              }
              ligne = "";
            } else {
              ligne = ligne + value[c];
            }
          }
        }
      } catch (error) {
        console.log("erreur : " + error);
      } finally {
        reader.releaseLock();
      }
    }
  } catch {
    alert("Connection série impossible");
  }
}

/********************************************************************************************
 *        Gestion des données (modèle), appelle les vues ensuite
 ********************************************************************************************/

let donnees = [];
let delta_temps;

function clearDonnees() {
  donnees = [];
  clearVues();
  updateVues();
  // calcul du pas temporel d'échantillonage en seconde
  delta_temps = 0.001 * Number(document.getElementById("DT").value);
}

function addDonnes(ligne) {
  valeurs = ligne.split(";");
  valeurs.pop();
  // conversion numérique
  valeurs.forEach(function (v, i) {
    valeurs[i] = Number(v);
  });

  // la première valeur est le temps en seconde
  valeurs[0] = valeurs[0] * delta_temps;
  donnees.push(valeurs);
  updateVues();
}

/// On appelle ici les différentes vues à rafraichir
function updateVues() {
  ajoutLigneTable(donnees[donnees.length - 1]);
  //tracerGraphique(donnees);
  tracerPoint(donnees[donnees.length - 1]);
}
/// On appelle ici les différentes vues à initialiser (raz)
function clearVues() {
  clearTable();
  clearGraphique();
}

/*********************************************************************************************
 *       Liste des Vues, elles seront mises à jour par le modèle
 ********************************************************************************************/

// Tableau de valeurs  ***********************************************************************/
function clearTable() {
  vue.innerHTML = "t";
  for(let i = 0 ; i < 6 ; i++){
    if( document.getElementById("A"+i).checked ){
      vue.innerHTML = vue.innerHTML +";A"+i;
    }
  }
  vue.innerHTML = vue.innerHTML +"\n";
}
async function ajoutLigneTable(ligne) {
  valeurs = ligne;
  if (valeurs) {
    for (v in valeurs) {
      if (v > 0 && v < valeurs.length) {
        vue.innerHTML = vue.innerHTML + ";";
      }
      if (v == 0) {
        vue.innerHTML = vue.innerHTML + valeurs[v].toFixed(3);
      } else {
        vue.innerHTML = vue.innerHTML + valeurs[v];
      }
    }
    vue.innerHTML = vue.innerHTML + "\n";
  }
  data_vue_conteneur = document.getElementById("data-vue-conteneur");
  if (data_vue_conteneur) {
    data_vue_conteneur.scrollTop = data_vue_conteneur.scrollHeight;
  }
}
function copierDonneesTable() {
  navigator.clipboard.writeText(vue.innerHTML.replaceAll(".", ","));
}

// graphique ***********************************************************************/
liste_couleurs = [
  "rgb(255, 0, 0)",
  "rgb(0, 128, 0)",
  "rgb(65,105,225)",
  "rgb(148,0,211)",
  "rgb(210,105,30)",
  "rgb(112,128,144)",
];
width = canvas.width;
height = canvas.height;
X0 = 20;
Y0 = 30;
XMax = width - 20;
YMax = 25;
x_max = 10; // en secondes
y_max = 1024;
ech_x = 1.0;
ech_y = 1.0;
let prev_valeur =[];

function clearGraphique() {
  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.fillRect(0, 0, width, height);
  tracerAxes();
  tracerLegende();
  prev_valeur =[]
}

function tracerAxes() {
  x_extrem =
    0.001 *
    Number(document.getElementById("DT").value) *
    (Number(document.getElementById("N").value) - 1);
  ctx.strokeStyle = "rgb(50, 50, 50)";
  ctx.lineWidth = 0;
  ctx.beginPath();
  ctx.moveTo(getX(0), getY(0));
  ctx.lineTo(getX(x_extrem), getY(0));
  ctx.lineTo(getX(x_extrem), getY(y_max));
  ctx.lineTo(getX(0), getY(y_max));
  ctx.lineTo(getX(0), getY(0));
  ctx.stroke();

  ctx.font = "15px Arial";
  ctx.fillStyle = "rgb(50, 50, 50)";
  ctx.textAlign = "center";
  ctx.fillText("0.0", getX(0), getY(0) + 20);
  ctx.fillText(x_max, getX(x_max), getY(0) + 20);
  ctx.fillText("t (en s)", getX(x_max * 0.5), getY(0) + 20);
  ctx.fillText("1024", getX(0), getY(1024)-8 );
}

function tracerLegende(){
  code_coul = 0;
  for(let i = 0 ; i < 6 ; i++){
    if( document.getElementById("A"+i).checked ){
      ctx.font = "15px Arial";
      ctx.fillStyle = liste_couleurs[code_coul];
      ctx.fillText("A"+i, 565, YMax+ (code_coul +1 ) * 16);
      code_coul++;
    }
  }
}


function getX(x) {
  x_max =
    0.001 *
    Number(document.getElementById("DT").value) *
    (Number(document.getElementById("N").value) - 1);
  ech_x = (XMax - X0) / x_max;
  return X0 + ech_x * x;
}

function getY(y) {
  ech_y = -(YMax + Y0 - height) / y_max;
  return height - Y0 - y * ech_y;
}


function tracerPoint(valeur) {
  if (valeur) {
    N = valeur.length;
    if (prev_valeur) {
      for (let i = 1; i < N; i++) {
        ctx.beginPath();
        ctx.strokeStyle = liste_couleurs[i-1];
        ctx.moveTo(getX(prev_valeur[0]), getY(prev_valeur[i]));
        ctx.lineTo(getX(valeur[0]), getY(valeur[i]));
        ctx.stroke();
      }
    }
    prev_valeur = valeur;
  }
}

// idéalement utiliser  window.requestAnimationFrame(draw);