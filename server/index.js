'use strict';

// imports
const express = require('express');
const morgan = require('morgan');
const {check, validationResult} = require('express-validator');
const cors = require('cors');
const dao = require('./pc-dao');
const userDao = require('./user-dao');

// Passport-related imports
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');

// init
const app = express();
const port = 3001;

// set up middlewares
app.use(express.json());
app.use(morgan('dev'));
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true
}
app.use(cors(corsOptions));

// Passport: set up local strategy
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await userDao.getUser(username, password);
  if(!user)
    return cb(null, false, 'Incorrect username or password.');
    
  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) { // this user is id + email + name
  return cb(null, user);
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

/*** Utility Functions ***/

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};


/* ROUTES */
// ----------------- AUTHENTICATION ---------
// POST /api/sessions
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).send(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        return res.status(201).json(req.user);
      });
  })(req, res, next);
});

// GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});


// ------------ PAGES AND CONTENTS
// GET /api/pages
app.get('/api/pages', (request, response) => {
  dao.listPages()
  .then(pages => response.json(pages))
  .catch(() => response.status(500).end());
});

// GET /api/pages/<id>
app.get('/api/pages/:id', async(req, res) => {
  try {
    const page = await dao.getPage(req.params.id);
    if(page.error)
      res.status(404).json(page);
    else
      res.json(page);
  } catch {
    res.status(500).end();
  }
});

// GET /api/pages/<id>/contents
app.get('/api/pages/:id/contents', async (req, res) => {
  try {
    const contents = await dao.listContentsOf(req.params.id);
    res.json(contents);
  } catch {
    res.status(500).end();
  }
});

// POST /api/pages
app.post('/api/pages', isLoggedIn,
  [
    check('title').isLength({min: 1, max:160}),
    check('creationDate').isDate({format: 'YYYY-MM-DD', strictMode: true}),
  ],
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }

    // WARN: note that we expect watchDate with capital D but the databases does not care and uses lowercase letters, so it returns "watchdate"
    const page = {
      title: req.body.title,
      authorId: req.user.id,
      creationDate: req.body.creationDate,
      publicationDate: req.body.publicationDate,
    };

    try {
      const result = await dao.createPage(page); // NOTE: createFilm returns the new created object
      res.json(result);
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of new page: ${err}` }); 
    }
  }
);

// ------------ USERS
// GET /api/users
app.get('/api/users', async(req, res) => {
  try {
    const users = await dao.getUsers();
    if(users.error)
      res.status(404).json(users);
    else
      res.json(users);
  } catch {
    res.status(500).end();
  }
});


// start the server
app.listen(port, () => 'API server started');