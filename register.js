const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const port = 3003;

const connection = mysql.createConnection({
  host: '194.164.63.21',
  user: 'nedy',
  password: 'Nedved91$',
  database: 'm2l',
});

connection.connect((error) => {
  if (error) {
    console.error('Erreur de connexion à la base de données :', error);
    throw error;
  }
  console.log('MySQL Database is connected successfully');
});

app.use(cors());
app.use(express.json());

const rolesPath = path.join(__dirname, 'roles.json');
const roles = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
const role = roles.utilisateur;

app.post('/register', (req, res) => {
  const { nom, prenom, email, password, ddn } = req.body;

  if (nom && prenom && email && password && ddn) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Erreur lors du hachage du mot de passe :', err);
        return res.status(500).json({ error: 'Erreur de serveur interne' });
      }

      const confirmationToken = uuidv4();

      connection.query(
        'INSERT INTO utilisateur (nom, prenom, ddn, email, mdp, role, verified, confirmation_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [nom, prenom, ddn, email, hashedPassword, role, 0, confirmationToken],
        (error, results) => {
          if (error) {
            console.error('Erreur lors de l\'enregistrement de l\'utilisateur :', error);
            return res.status(500).json({ error: 'Erreur de serveur interne' });
          }

          console.log('Utilisateur enregistré avec succès');
          res.status(200).json({ message: 'Enregistrement réussi' });

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

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Erreur lors de l\'envoi de l\'email de confirmation :', error);
            } else {
              console.log('Email envoyé : ' + info.response);
            }
          });
        }
      );
    });
  } else {
    res.status(400).send('Veuillez fournir toutes les informations nécessaires pour l\'enregistrement');
  }
});

app.get('/confirmation', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send('Token de confirmation manquant');
  }

  connection.query('SELECT * FROM utilisateur WHERE confirmation_token = ?', [token], (error, results) => {
    if (error) {
      console.error('Erreur lors de la recherche de l\'utilisateur par token :', error);
      return res.status(500).send('Erreur de serveur interne');
    }

    if (results.length === 0) {
      return res.status(404).send('Token de confirmation invalide');
    }

    const userId = results[0].id;

    connection.query('UPDATE utilisateur SET verified = 1, confirmation_token = NULL WHERE id = ?', [userId], (updateError, updateResults) => {
      if (updateError) {
        console.error('Erreur lors de la mise à jour de la confirmation de l\'email :', updateError);
        return res.status(500).send('Erreur de serveur interne');
      }

      if (updateResults.affectedRows > 0) {
        console.log('Email confirmé avec succès pour l\'utilisateur ID :', userId);
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
