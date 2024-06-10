const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');


const port = 3003;

const connection = mysql.createConnection({
  host: '194.164.63.21',
  user: 'nedy',
  password: 'Nedved91$',
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
//  rôles utilisateur ou admin dans le fichier roles.json
const rolesPath = path.join(__dirname, 'roles.json');
const roles = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));

const role = roles.utilisateur;

// env// 
dotenv.config();


//Fin  env//



app.post('/register', (req, res) => {
  const nom = req.body.nom;
  const prenom = req.body.prenom;
  const email = req.body.email;
  const mdp = req.body.password;
  const ddn = req.body.ddn;

  if (nom && prenom && email && mdp && ddn) {
    // Hash du mot de passe avant l'enregistrement
    bcrypt.hash(mdp, 10, function (err, hashedPassword) {
      if (err) {
        console.error('Erreur lors du hachage du mot de passe :', err);
        res.status(500).json({ error: 'Erreur de serveur interne' });
        return;
      }

      
     // Fonction pour générer un token unique


      connection.query('INSERT INTO utilisateur (nom, prenom, ddn, email, mdp, role, verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nom, prenom, ddn, email, hashedPassword, role, 0], function (error, results, fields) {

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
            user: 'warnitox@gmail.com',
            pass: 'dkid tgtt miha qbvn'
          }
        });

        const mailOptions = {
          from: 'maison@ligue.com',
          to: email,
          subject: 'Confirmation d\'email',
          
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
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

  connection.query('SELECT * FROM utilisateur WHERE confirmation_token = ?', [token], (error, results) => {
    if (error) {
      console.error('Erreur lors de la recherche de l\'utilisateur par token :', error);
      res.status(500).send('Erreur de serveur interne');
    } else if (results.length === 0) {
      // Aucun utilisateur trouvé avec ce token
      res.status(404).send('Token de confirmation invalide');
    } else {
      const userId = results[0].id;

      console.log('ID de l\'utilisateur avant mise à jour :', userId);

      connection.query('UPDATE utilisateur SET verified = 1, confirmation_token = NULL WHERE id = ?', [userId], (updateError, updateResults) => {
        if (updateError) {
          console.error('Erreur lors de la mise à jour de la colonne "verified" :', updateError);
          res.status(500).send('Erreur de serveur interne');
        } else {
          console.log("Email confirmé, vérifié à 1");
          console.log('ID de l\'utilisateur après mise à jour :', userId);
          res.status(200).send('Email confirmé avec succès');
        }
      });
    }
  });
});



app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});

module.exports = connection;
