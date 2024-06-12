const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const port = 8085;

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
    console.log('Admin connecté');
  }
});

app.get('/nombreutilisateur', (req, res) => {
  const sql = 'SELECT COUNT(id) AS count FROM utilisateur';

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
    }

    // Envoyez le résultat en réponse
    res.json(result);
  });
});
app.get('/formation', (req, res) => {
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
//UTILISATEUR
app.get('/utilisateur', (req, res) => {
  const sql = 'SELECT * FROM utilisateur';

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
    }

    // Envoyez le résultat en réponse
    res.json(result);
  });
});




//  afficher utilisateur Selectionnés 

app.get('/utilisateur/:id', (req, res) => {
  const formationId = req.params.id;
  const sql = 'SELECT * FROM utilisateur WHERE id = ?'; 


  db.query(sql, [formationId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
    }

    // Envoyez le résultat en réponse
    res.json(result[0]); // Supposant qu'il ne doit y avoir qu'une seule formation avec cet ID
  });
});


app.delete('/supputilisateur/:id', (req, res) => {


  const supputilid = req.params.id;
  const sql = 'DELETE FROM utilisateur WHERE id = ?';

  db.query(sql, [supputilid], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
    }

    // Envoyez l'utilisateur supprimé en réponse
    res.json({ deletedUser: result }); 
  });
}); 


app.put('/updatutilisateur/:id', (req, res) => {

  
  const nom = req.body.nom;
  const prenom = req.body.prenom;
  const email = req.body.email;
  const ddn = req.body.ddn;
  const utilid = req.params.id;
  const sql = 'UPDATE utilisateur SET nom=?, prenom=?, ddn=?, email=? WHERE id=?';

  // Provide all the values in the correct order in the array
  const values = [nom, prenom, ddn, email, utilid];
  console.log(values, utilid);
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
    }
    res.json({ success: true, message: 'Utilisateur mis à jour avec succès.' });
  });
});


// FIN UTILISATEUR


app.get('/suppformation', (req, res) => {
  const formid = req.params.id;
  const sql = 'DELETE FROM formation WHERE id = ?'; 

  db.query(sql, [formid], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
    }

    // Envoyez le résultat en réponse
    res.json(result[0]); // Supposant qu'il ne doit y avoir qu'une seule formation avec cet ID
  });
});
 

app.put('/updateformation/:id', (req, res) => {

  
  const nom = req.body.nom;
  const sport = req.body.sport;
  const description = req.body.description;
  const date = req.body.date;
  const formid = req.params.id;
  const sql = 'UPDATE formation SET nom=?, sport=?, description=?, date=? WHERE id=?';

  // Provide all the values in the correct order in the array
  const values = [nom, sport, description, date, formid];
  console.log(values, formid);
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
    }
    res.json({ success: true, message: 'Utilisateur mis à jour avec succès.' });
  });
});


app.delete('/suppinscription/:id', (req, res) => {
  const inscriptionid = req.params.id;
  const sql = 'DELETE FROM inscription WHERE id = ?';

  db.query(sql, [inscriptionid], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
    }

    res.json(result); 
  });
});


app.get('/nombreformation', (req, res) => {
    const sql = 'SELECT COUNT(id) AS count FROM formation';
  
    db.query(sql, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
      }
  
      // Envoyez le résultat en réponse
      res.json(result);
    });
  });



  app.get('/nombreinscription', (req, res) => {
    const sql = 'SELECT COUNT(id) AS count FROM inscription';
  
    db.query(sql, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
      }
   
      // Envoyez le résultat en réponse
      res.json(result);
    });
  });

  app.get('/nombreinscriptionform', (req, res) => {
    const sql = 'SELECT COUNT(id) AS count FROM inscription where formation = ?';
  
    db.query(sql, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
      }
   
      // Envoyez le résultat en réponse
      res.json(result);
    });
  });








app.post('/inscription', (req, res) => {
  const { utilisateur, formation } = req.body;


  if (!utilisateur || !formation) {
    return res.status(400).json({ error: 'Veuillez fournir un utilisateur et une formation pour l\'inscription' });
  }

  const sql = 'INSERT INTO inscription (utilisateur, formation) VALUES (?, ?)';
 
  db.query(sql, [utilisateur, formation], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
    }

    
    res.json({ success: true, message: 'Inscription réussie' });
  });
});



app.get('/inscriptions/:utilisateurId', (req, res) => {
  const utilisateurId = req.params.utilisateurId;
  const sql = 'SELECT * FROM inscription WHERE utilisateur = ?';

  db.query(sql, [utilisateurId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
    }

    res.json(result); 
  });
});


app.get('/utilinscrit', (req, res) => {
  const sql = 'SELECT COUNT(DISTINCT utilisateur.id) AS nombre_inscrits FROM utilisateur INNER JOIN inscription ON utilisateur.id = inscription.utilisateur';

  db.query(sql, (err, result) => {
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
