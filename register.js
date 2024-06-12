const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid'); // Génère token

const port = 3003;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'm2l',
});

connection.connect(function (error) {
  if (error) {
    throw error;
  } else {
    console.log('MySQL Database is connected Successfully');
  }
});

const app = express();

app.use(cors());
app.use(express.json());

// Charger les rôles utilisateur ou admin dans le fichier roles.json
const rolesPath = path.join(__dirname, 'roles.json');
const roles = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
const role = roles.utilisateur;

// Charger les variables d'environnement
dotenv.config();

app.post('/register', (req, res) => {
  const { nom, prenom, email, password, ddn } = req.body;

  if (nom && prenom && email && password && ddn) {
    // Hash du mot de passe avant l'enregistrement
    bcrypt.hash(password, 10, function (err, hashedPassword) {
      if (err) {
        console.error('Erreur lors du hachage du mot de passe :', err);
        res.status(500).json({ error: 'Erreur de serveur interne' });
        return;
      }

      // Fonction pour générer un token unique
      const confirmationToken = uuidv4();

      connection.query('INSERT INTO utilisateur (nom, prenom, ddn, email, mdp, role, verified, confirmation_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [nom, prenom, ddn, email, hashedPassword, role, 0, confirmationToken], function (error, results) {

          if (error) {
            console.error('Erreur de requête SQL lors de l\'enregistrement :', error);
            res.status(500).json({ error: 'Erreur de serveur interne' });
            return;
          }

          console.log('Utilisateur enregistré avec succès');
          res.status(200).json({ message: 'Enregistrement réussi' });

          // nodemailer pour l'envoi des mails lors de l'inscription de l'utilisateur
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            }
          });

          const mailOptions = {
            from: 'maison@ligue.com',
            to: email,
            subject: 'Confirmation d\'email',
            text: `Cliquez sur le lien suivant pour confirmer votre email : http://localhost:3000/confirmation?token=${confirmationToken}`
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log('Erreur lors de l\'envoi de l\'email :', error);
            } else {
              console.log('Email envoyé : ' + info.response);
            }
          });
        });
    });
  } else {
    res.status(400).send('Veuillez fournir toutes les informations nécessaires pour l\'enregistrement');
  }
});

app.get('/confirmation', (req, res) => {
  const token = req.query.token;
  console.log('Page de confirmation atteinte');

  // Vérifiez si le token est présent dans l'URL
  if (!token) {
    res.status(400).send('Token de confirmation manquant');
    return;
  }

  // Recherchez l'utilisateur dans la base de données en utilisant le token
  connection.query('SELECT * FROM utilisateur WHERE confirmation_token = ?', [token], (error, results) => {
    if (error) {
      console.error('Erreur lors de la recherche de l\'utilisateur par token :', error);
      res.status(500).send('Erreur de serveur interne');
      return;
    }

    // Vérifiez si aucun utilisateur n'est trouvé avec ce token
    if (results.length === 0) {
      res.status(404).send('Token de confirmation invalide');
      return;
    }

    // Mettez à jour le champ "verified" de l'utilisateur à 1 et "confirmation_token" à NULL
    const userId = results[0].id;
    connection.query('UPDATE utilisateur SET verified = 1, confirmation_token = NULL WHERE id = ?', [userId], (updateError, updateResults) => {
      if (updateError) {
        console.error('Erreur lors de la mise à jour de la colonne "verified" :', updateError);
        res.status(500).send('Erreur de serveur interne');
        return;
      }

      // Vérifiez si l'utilisateur est mis à jour avec succès
      if (updateResults.affectedRows > 0) {
        console.log('Email confirmé, vérifié à 1 pour l\'utilisateur ID :', userId);
        res.status(200).send('Email confirmé avec succès');
      } else {
        console.error('Aucune ligne mise à jour, utilisateur non trouvé après recherche par ID');
        res.status(500).send('Erreur de serveur interne');
      }
    });
  });
});


app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});

module.exports = connection;
