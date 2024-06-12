const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: '194.164.63.21',
  user: 'nedy',
  password: 'Nedved91$',
  database: 'm2l',
});

db.connect(err => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
  } else {
    console.log('Connecté à la base de données MySQL');
  }
});

// Gestion de la pré-requête OPTIONS
app.options('*', cors());

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM utilisateur WHERE email = ?';

  db.query(query, [email], (err, result) => {
    if (err) {
      res.status(500).json({ message: 'Erreur lors de la requête SQL' });
    } else if (result.length > 0) {
      const user = result[0];

      bcrypt.compare(password, user.mdp, (err, match) => {
        if (match) {
          res.json({ message: 'Connexion réussie' });
        } else {
          res.status(401).json({ message: 'Adresse e-mail ou mot de passe incorrect' });
        }
      });
    } else {
      res.status(401).json({ message: 'Adresse e-mail ou mot de passe incorrect' });
    }
  });
});

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
