import 'dotenv/config';
import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';

import models, { connectDb } from './models';
import mongoose from 'mongoose';
import routes from './routes';

const User = mongoose.model('User');
const Plant = mongoose.model('Plant');
const Garden = mongoose.model('Garden');
const PersonalPlant = mongoose.model('PersonalPlant');

const app = express();

// Application-Level Middleware
app.use(cors());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(async (req, res, next) => {
  /* Bunch of code copied off of s/o so as to allow headers on requests */
  let allowedOrigins = ['*']; // list of url-s
  let origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Expose-Headers', 'Content-Disposition');

  // Attach all the database as a context to all requests made throughout the app
  req.context = {
    models,
  };
  next();
});

// Routes
app.use('/users', routes.user);
app.use('/auth', routes.auth);
app.use('/garden', routes.garden);
app.use('/plant', routes.plant);
app.use('/usda', routes.usda);

// Toggle this only when you want to clean and reset the db completely on start
const eraseDatabaseOnSync = process.env.DB_ERASE === 'yes';

connectDb().then(async () => {
  // connect mongodb to our backend app
  if (eraseDatabaseOnSync) {
    await Promise.all([User.deleteMany({}), Garden.deleteMany({}), Plant.deleteMany({}), PersonalPlant.deleteMany({})]);
  }

  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`),
  );
});
