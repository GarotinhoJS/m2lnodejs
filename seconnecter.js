const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 3002;

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'm2l',
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
  } else {
    console.log('Connecté à la base de données MySQL');
  }
});

app.post('/connexion', async (req, res) => {
  const email = req.body.email;
  const mdp = req.body.mot_de_passe;
  const query = 'SELECT * FROM utilisateur WHERE email = ?';
  db.query(query, [email], async (err, result) => {
    if (err) {
      console.error('Erreur lors de la requête à la base de données:', err);
      res.status(500).json({ message: 'Erreur serveur' });
    } else if (result.length > 0) {
      const mdpHash = result[0].mdp;

      try {
        const match = await bcrypt.compare(mdp, mdpHash);
        if (match) {
          console.log('Connexion réussie');
          res.json({ message: 'Connexion réussie', utilisateur: result[0] });
        } else {
          console.log('Email ou mot de passe incorrect');
          res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }
      } catch (error) {
        console.error('Erreur lors de la comparaison des mots de passe:', error);
        res.status(500).json({ message: 'Erreur serveur' });
      }
    } else {
      console.log('Email ou mot de passe incorrect');
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
  });
});

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
