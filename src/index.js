import 'dotenv/config';
import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';

import models, { connectDb } from './models';
import routes from './routes';

const app = express();

// Application-Level Middleware

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  /* Bunch of code copied off of s/o so as to allow headers on requests */
  let allowedOrigins = ['*'];  // list of url-s
  let origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) > -1) {
      res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Expose-Headers', 'Content-Disposition');

  // Attach all the database as a context to all requests made throughout the app
  req.context = {
    models, 
  }
  next();
});

// Routes

app.use('/users', routes.user);
app.use('/auth', routes.auth);
app.use('/plant', routes.plant);

// Toggle this only when you want to clean and reset the db completely on start
const eraseDatabaseOnSync = true; 

connectDb().then(async () => {  // connect mongodb to our backend app
  if (eraseDatabaseOnSync) {
    await Promise.all([
      models.User.deleteMany({}),
    ]);
  }

  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`),
  );
});


