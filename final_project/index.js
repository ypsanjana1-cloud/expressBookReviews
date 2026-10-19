
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use(
  '/customer',
  session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true
  })
);

// Verify JWT for protected review routes (supports session & Authorization header)
app.use(['/customer/auth/*', '/customer/auth'], function auth(req, res, next) {
  let token = null;
  let username = null;

  if (req.session && req.session.authorization) {
    token = req.session.authorization['accessToken'];
    username = req.session.authorization['username'];
  } else if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  }

  if (!token) {
    return res.status(403).json({ message: 'User not logged in' });
  }

  jwt.verify(token, 'access', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'User not authenticated' });
    }

    req.user = decoded;
    if (!req.session) {
      req.session = {};
    }
    if (!req.session.authorization) {
      req.session.authorization = {
        accessToken: token,
        username: decoded.username || username
      };
    }
    next();
  });
});

const PORT = 5000;

app.use('/customer', customer_routes);
app.use('/', genl_routes);

app.listen(PORT, () => console.log('Server is running on port ' + PORT));

