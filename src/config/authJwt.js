import jwt from 'jsonwebtoken';

// Authentication middleware. Attach this middleware to all protected api routes
const isAuthenticated = (req, res, next) => {
  // Get auth token from query parameter
  if (req.query && req.query.token) {
    const jwtToken = req.query.token;
    req.token = jwtToken; // Attach token to the request attribute
    jwt.verify(req.token, process.env.JWT_SECRETKEY, (err, authData) => {
      if (err) {
        res.status(403).send({
          success: false,
          message: 'Invalid token. Could not authenticate!',
        });
      } else {
        req.authData = authData;
        next();
      }
    });
  } else {
    res.status(403).send({
      success: false,
      message: 'No token provided',
    });
  }
};

// Create a token and send it to the client for further access.
const signToken = (req, res) => {
  jwt.sign(
    { userId: req.user._id },
    process.env.JWT_SECRETKEY,
    { expiresIn: '5 min' },
    (err, token) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.json({ token });
      }
    },
  );
};

export { isAuthenticated, signToken };
