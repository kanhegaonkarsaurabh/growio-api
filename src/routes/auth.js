import { Router } from 'express';
import passport from 'passport';
import passportConfig from '../config/passport-config';
import { isAuthenticated, signToken } from '../config/authJwt';

const router = Router();

// Actual authentication route
router.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
  }),
);

// callback url upon successful google authentication
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  signToken(req, res);
});

// Verification route to check if authentication works
router.get('/verify', isAuthenticated, (req, res) => {
  res.json(req.authData);
});

export default router;
