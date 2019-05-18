import { google } from 'googleapis';
import util from 'util';
import request from 'request-promise';

const googleConfig = {
  clientId: '1040294904399-0t57cj80bm54jise3h0vj87fa686ront.apps.googleusercontent.com',
  clientSecret: 'hetbZQ7QIGj_-ZKFhfjwC0I3',
  redirect: 'http://localhost:3000/auth/google/callback',
};

// Create the google auth object which gives us access to talk to google's apis.
function createConnection() {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect,
  );
}

const defaultScope = [
  'https://www.googleapis.com/auth/userinfo.profile', // profile  // name
  'https://www.googleapis.com/auth/userinfo.email', // email
];

// Get a url which will open the google sign-in page and request access to the scope provided (such as calendar events).
function getConnectionUrl(auth) {
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // access type and approval prompt will force a new refresh token to be made each time signs in
    scope: defaultScope,
  });
}

/**
 * Part 2: Take the "code" parameter which Google gives us once when the user logs in, then get the user's email and id.
 */
const getGoogleAccountFromCode = async code => {
  let auth = createConnection();
  const data = await auth.getToken(code);
  const tokens = data.tokens;

  var options = {
    uri: 'https://www.googleapis.com/oauth2/v2/userinfo',
    qs: { oauth_token: tokens.access_token },
    headers: {
      'User-Agent': 'Request-Promise',
    },
    json: true,
  };

  return request(options);
};

export { createConnection, getConnectionUrl, getGoogleAccountFromCode };
