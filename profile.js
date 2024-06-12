const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Configuration de la base de données
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'm2l',
});

db.connect();

// Endpoint pour récupérer les informations de l'utilisateur par ID
app.get('/utilisateur/:id', (req, res) => {
    // Utilisez la syntaxe de paramètre de requête pour extraire l'ID de la requête
    const userId = req.params.id;
  
    // Vérifiez si l'ID est défini
    if (!userId) {
      return res.status(400).json({ error: 'ID utilisateur manquant dans la requête' });
    }
  
    // Utilisez des paramètres de requête sécurisés pour éviter les injections SQL
    const sql = 'SELECT * FROM utilisateur WHERE id = ?';
  
    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de l\'exécution de la requête SQL' });
      }
  
      // Vérifie si l'utilisateur a été trouvé
      if (result.length === 0) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
  
      // E
      res.send(result);
    });
  });
  

app.listen(port, () => {
  console.log(`Serveur Node.js en cours d'exécution sur le port ${port}`);
});
