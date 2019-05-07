import jwt from 'jsonwebtoken';

// check if Token exists as a query parameter and attach token to request as attribute
const checkTokenMiddleware = (req, res, next) => {
    // Get auth token from query parameter
    if (req.query && req.query.token) {
      const jwtToken = req.query.token;
      req.token = jwtToken; // Attach token to the request attribute
      next();
    } else {
      res.sendStatus(403);
    }
};

// Verify Token validity and attach token data as request attribute
const verifyToken = (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRETKEY, (err, authData) => {
        if(err) {
            res.sendStatus(403);
        } else {
            return req.authData = authData;
        }
    })
};

// Create a token and send it to the client for further access.
const signToken = (req, res) => {
    jwt.sign({userId: req.user._id}, process.env.JWT_SECRETKEY, {expiresIn:'5 min'}, (err, token) => {
        if(err){
            res.sendStatus(500);
        } else {
            res.json({token});
        }
    });
}

export { checkTokenMiddleware, verifyToken, signToken };