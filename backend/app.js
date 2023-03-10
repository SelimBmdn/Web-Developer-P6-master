const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const path = require('path');


const stuffRoutes = require ('./routes/sauces');
const userRoutes = require ('./routes/user');

require('dotenv').config() ;
const helmet = require("helmet");

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

  app.use(bodyParser.json());

  app.use('/api/sauces', stuffRoutes);

  app.use('/api/auth', userRoutes);
  app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app;

mongoose.connect(process.env.MONGODB_URL,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

  //mongoose.set('strictQuery', true);mongoose.set('strictQuery', true);
  //mongoose.set('strictQuery', false);