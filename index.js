const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const seconnecter = require('./seconnecter'); 
const register = require('./register');
const profile = require('./profile');
const formation = require('./formation');
const admin = require('./admin');

const app = express();
const port = 3004;

// Connexion à la base de données
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

// Utiliser votre module seconnecter
app.use(cors());
app.use(express.json());

app.post('/auth', (req, res) => {
  try {
    seconnecter(req, res, connection);
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ error: 'Erreur de serveur interne' });
  }
});

app.post('/profile', (req, res) => {
  try {
    profile(req, res, connection);
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ error: 'Erreur de serveur interne' });
  }
});

app.post('/formation', (req, res) => {
  try {
    formation(req, res, connection);
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ error: 'Erreur de serveur interne' });
  }
});


app.post('/register', (req, res) => {
  try {
    register(req, res, connection);
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ error: 'Erreur de serveur interne' });
  }
});


app.post('/admin', (req, res) => {
  try {
    profile(req, res, connection);
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ error: 'Erreur de serveur interne' });
  }
});

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});

module.exports = connection;
