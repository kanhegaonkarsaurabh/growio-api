import { Router } from 'express';
import mongoose from 'mongoose';
const User = mongoose.model('User');

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
  // check if user already exists
  const currentUser = await User.findOne({ _id: profile.id });
  if (!currentUser) {
    // register user and return
    const newUser = await new User({
      email: profile.email,
      _id: profile.id,
      name: profile.name,
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
