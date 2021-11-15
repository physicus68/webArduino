# webArduino

## Résumé
- Interface web pour Arduino utilisant la nouvelle bibliothèque [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API). 

- On utilise un navigateur (Chrome) pour acquérir des données sur les six ports analogiques numériques d'une platine Arduino Uno (A0 à A5).

- Fonctionne sous Chrome. La liste des [navigateurs compatibles](https://developer.mozilla.org/en-US/docs/Web/API/Serial#browser_compatibility) est en évolution.

## Mode d'emploi
1. Se connecter sur `https://physicus68.github.io/webArduino`
2. Télécharger et installer sur l'Arduino Uno le script `webSerialAquisition.ino`
3. L'arduino est branchée sur le port USB, une des entrées analogique (A0, ... A5) est connectée.
4. Se connecter sur `https://physicus68.github.io/webArduino`
5. Réaliser la connexion (bouton connecter) et choisir le port de la platine Arduino
6. Choisir l'entrée analogique ainsi que le nombre de mesures et l'intervalle de temps
7. Lancer l'acquisition.
8. Le graphique peut être copié sous forme d'image (clique droit) et on peut copier dans le presse papier le tableau de valeurs.

## Important

Le navigateur DOIT être compatible avec l'API Web Serial (Chrome fonctionne)

Pour être utilisé en local, on DOIT lancer un serveur web en local. Par exemple, dans le répertoir où l'on a téléchargé les fichiers `index.html`, `style.css` et `script.js` , on démarre un serveur web avec l'instruction Python `python3 -m http.server` puis avec le navigateur Chrome, on se connecte à l'url `http://localhost:8000`.

