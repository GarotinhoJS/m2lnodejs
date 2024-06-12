const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');


const app = express();
const port = 8082;

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: '194.164.63.21',
  user: 'nedy',
  password: 'Nedved91$',
  database: 'm2l',
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
  } else {
    console.log('Connecté à la base de formation');
  }
});

app.get('/formations', (req, res) => {
  const sql = 'SELECT * FROM formation';

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
    }

    // Envoyez le résultat en réponse
    res.json(result);
  });
});




app.get('/formation/:id', (req, res) => {
  const formationId = req.params.id;
  const sql = 'SELECT * FROM formation WHERE id = ?'; 

  db.query(sql, [formationId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
    }

    // Envoyez le résultat en réponse
    res.json(result[0]); // Supposant qu'il ne doit y avoir qu'une seule formation avec cet ID
  });
});


app.post('/inscription', (req, res) => {
  const { utilisateur, formation } = req.body;

  if (!utilisateur || !formation) {
    return res.status(400).json({ error: 'Veuillez fournir un utilisateur et une formation pour l\'inscription' });
  }

  const requeteEmail = 'SELECT email FROM utilisateur WHERE id = ?';

  db.query(requeteEmail, [utilisateur], (err, resultatEmail) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
    }

    if (resultatEmail.length === 0 || !resultatEmail[0].email) {
      return res.status(404).json({ error: 'Utilisateur non trouvé ou adresse e-mail introuvable' });
    }

    const email = resultatEmail[0].email;

    // Maintenant, exécutez la requête INSERT pour l'inscription
    const requeteInscription = 'INSERT INTO inscription (utilisateur, formation) VALUES (?, ?)';
    db.query(requeteInscription, [utilisateur, formation], (err, resultat) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
      }

      res.json({ success: true, message: 'Inscription réussie' });

      // nodemailer pour l'envoi des e-mails lors de l'inscription de l'utilisateur
      const transporteur = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'warnitox@gmail.com',
          pass: 'dkid tgtt miha qbvn',
        },
      });

      const optionsMail = {
        from: 'maison@ligue.com',
        to: email,
        subject: 'Mail de confirmation',
        text: `Vous êtes bien inscrit à la formation`,
      };

      transporteur.sendMail(optionsMail, function (erreur, info) {
        if (erreur) {
          console.log(erreur);
        } else {
          console.log('E-mail envoyé : ' + info.response);
        }
      });
    });
  });
});



app.get('/inscriptions/:utilisateurId', (req, res) => {
  const utilisateurId = req.params.utilisateurId;
  const sql = `
    SELECT inscription.id, inscription.date, formation.nom AS formation
    FROM inscription
    JOIN formation ON inscription.formation = formation.id
    WHERE inscription.utilisateur = ?
  `;

  db.query(sql, [utilisateurId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
    }

    console.log("Résultat de la requête SQL:", result); // Ajout de console.log pour vérifier les résultats de la requête SQL
    res.json(result);
  });
});



app.get('/nombreinscriptionform', (req, res) => {
  const sql = 'SELECT formation.id,  COUNT(inscription.id) AS count FROM formation LEFT JOIN inscription ON formation.id = inscription.formation GROUP BY formation.id';

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
    }
 
    // Envoyez le résultat en réponse
    res.json(result);
  });
});


// Endpoint pour générer et télécharger un certificat PDF
app.get('/certificat/:inscriptionId', (req, res) => {
  const inscriptionId = req.params.inscriptionId;

  // Récupérer les informations de l'inscription depuis la base de données
  const sql = `
    SELECT utilisateur.nom AS nom, utilisateur.prenom AS prenom, inscription.date AS date, formation.nom AS formation_nom
    FROM inscription
    JOIN utilisateur ON inscription.utilisateur = utilisateur.id
    JOIN formation ON inscription.formation = formation.id
    WHERE inscription.id = ?
  `;

  db.query(sql, [inscriptionId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de la récupération des données d\'inscription' });
    }

    // Vérifier si l'inscription existe
    if (result.length === 0) {
      return res.status(404).json({ error: 'Inscription non trouvée' });
    }

    // Générer le certificat PDF
    const doc = new PDFDocument();
    const fileName = `${result[0].nom}_${result[0].prenom}_certificate.pdf`;

    doc.pipe(fs.createWriteStream(fileName));

    doc.fontSize(20).text('Certificat de Réussite', { align: 'center' });
    doc.fontSize(14).text(`Ceci certifie que ${result[0].nom} ${result[0].prenom} a terminé avec succès la formation "${result[0].formation_nom}".`);
    doc.fontSize(12).text(`Date de réussite : ${new Date(result[0].date).toLocaleDateString()}`, { align: 'right' });

    doc.end();

    // Envoyer le certificat PDF en réponse
    res.setHeader('Content-Type', 'application/pdf');
    res.download(fileName, fileName);
  });
});



app.get('/listeform/:id', (req, res) => {
  const formationId = req.params.id;

  const sql = 'SELECT formation.nom AS formation_nom, GROUP_CONCAT(utilisateur.nom) AS liste_utilisateurs FROM formation LEFT JOIN inscription ON formation.id = inscription.formation LEFT JOIN utilisateur ON inscription.utilisateur = utilisateur.id WHERE formation.id = ? GROUP BY formation.id';

  db.query(sql, [formationId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
    }
 
    // Envoyez le résultat en réponse
    res.json(result);
  });
});

// liste des avis d'utilisateur
app.post('/avis', (req, res) => {
  const { utilisateur_id, formation_id, avis, note } = req.body;
  const sql = 'INSERT INTO avis (utilisateur_id, formation_id, avis, note) VALUES (?, ?, ?, ?)';
  db.query(sql, [utilisateur_id, formation_id, avis, note], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'avis' });
    }
    res.json({ success: true, message: 'Avis ajouté avec succès' });
  });
});
app.get('/formationavis/:id', (req, res) => {
  const formationavisId = req.params.id;

  const sqlFormation = 'SELECT * FROM formation WHERE id = ?';
  const sqlAvis = `
    SELECT avis.*, utilisateur.nom AS utilisateur_nom
    FROM avis
    JOIN utilisateur ON avis.utilisateur_id = utilisateur.id
    WHERE avis.formation_id = ?
  `;

  db.query(sqlFormation, [formationavisId], (err, formationResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de la récupération de la formation' });
    }

    db.query(sqlAvis, [formationavisId], (err, avisResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de la récupération des avis' });
      }

      res.json({
        formation: formationResult[0],
        avis: avisResult
      });
    });
  });
});

//requête pour récupérer les formations par sport
app.get('/formations/sport/:sport', (req, res) => {
  const sport = req.params.sport;
  const sql = 'SELECT * FROM formation WHERE sport = ?'; 

  db.query(sql, [sport], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
    }

    // Envoyez le résultat en réponse
    res.json(result);
  });
});




app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
