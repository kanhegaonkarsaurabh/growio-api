import { Router } from 'express';
import mongoose from 'mongoose';
import mongodb from 'mongodb';
import crypto from 'crypto';
import colors from 'colors';

const User = mongoose.model('User');
const Garden = mongoose.model('Garden');
const ObjectId = mongodb.ObjectID;

import {
  createConnection,
  getConnectionUrl,
  getGoogleAccountFromCode,
} from '../config/google-config';
import { isAuthenticated, signToken } from '../config/authJwt';

const router = Router();

// Create the google url to be sent to the client.
function urlGoogle() {
  const auth = createConnection(); // this is from previous step
  const url = getConnectionUrl(auth);
  return url;
}

const loginWithGoogle = async (req, res) => {
  const url = urlGoogle();
  res.json({
    url,
  });
};

const addToDb = async profile => {
  console.log(
    `LOG: Adding user: ${profile.id} to the database and creating his garden`.yellow,
    profile,
  );
  const uidHash = crypto
    .createHmac('sha256', profile.id.toString())
    .digest('hex')
    .slice(0, 24); // input: googleId --> hash() --> output: 24 byte hex string

  // check if user already exists
  const currentUser = await User.findOne({ _id: new ObjectId(uidHash) });
  if (!currentUser) {
    // Create a new garden for the user
    const garden = await new Garden({
      name: `${profile.name}'s Garden`,
    }).save();

    // register user and return
    const newUser = await new User({
      email: profile.email,
      _id: new ObjectId(uidHash),
      gardenId: garden._id,
      name: profile.name,
      settings: {
        notifications: false
      },
      location: {
        coordinates: [-117.23755359649657, 32.88110087702036]
      }
    }).save();
  }
  return profile;
};

// function that does db crud
const getGoogleProfile = async code => {
  const profile = await getGoogleAccountFromCode(code);
  return addToDb(profile);
};

router.get('/google', loginWithGoogle);

// callback url upon successful google authentication
router.get('/google/callback', (req, res) => {
  let code = '';
  // extract code
  if (req && req.query) {
    code = req.query.code;
  }

  getGoogleProfile(code).then(profile => signToken(profile.id, res));
});

// Verification route to check if authentication works
router.get('/verify', isAuthenticated, (req, res) => {
  res.json(req.authData);
});

export default router;
