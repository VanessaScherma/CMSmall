'use strict';

// imports
const express = require('express');
const morgan = require('morgan');
const { check, validationResult } = require('express-validator');
const cors = require('cors');
const dao = require('./pcw-dao');
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
  credentials: true,
};
app.use(cors(corsOptions));

// Passport: set up local strategy
passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    const user = await userDao.getUser(username, password);
    if (!user) return cb(null, false, 'Incorrect username or password.');

    return cb(null, user);
  })
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authorized' });
};

app.use(
  session({
    secret: "shhhhh... it's a secret!",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.authenticate('session'));

/*** Utility Function ***/

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};

/* ROUTES */

// ----------------- AUTHENTICATION ---------

// POST /api/sessions
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).send(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err) return next(err);

      // req.user contains the authenticated user, we send all the user info back
      return res.status(201).json(req.user);
    });
  })(req, res, next);
});

// GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else res.status(401).json({ error: 'Not authenticated' });
});

// DELETE /api/session/current
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// ------------ PAGES AND CONTENTS ------------

// GET /api/pages
app.get('/api/pages', (request, response) => {
  dao.listPages()
    .then((pages) => response.json(pages))
    .catch(() => response.status(500).end());
});

// GET /api/pages/<id>
app.get('/api/pages/:id', isLoggedIn, async (req, res) => {
  try {
    const page = await dao.getPage(req.params.id);
    if (page.error) res.status(404).json(page);
    else res.json(page);
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
app.post(
  '/api/pages',
  isLoggedIn,
  [
    check('title').isLength({ min: 1, max: 160 }),
    check('creationDate').isDate({ format: 'YYYY-MM-DD', strictMode: true }),
  ],
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ error: errors.array().join(', ') }); // error message is a single string with all error joined together
    }

    const page = {
      title: req.body.title,
      authorId: req.body.authorId,
      creationDate: req.body.creationDate,
      publicationDate: req.body.publicationDate,
    };

    try {
      const result = await dao.createPage(page);
      res.json(result);
    } catch (err) {
      console.log(err);
      res
        .status(503)
        .json({
          error: `Database error during the creation of new page: ${err}`,
        });
    }
  }
);

// GET /api/pages/<id>/contents
app.get('/api/pages/:id/contents', async (req, res) => {
  try {
    const contents = await dao.listContentsOf(req.params.id);
    res.json(contents);
  } catch {
    res.status(500).end();
  }
});

// POST /api/contents
app.post(
  '/api/contents',
  isLoggedIn,
  [
    check('type').isLength({ min: 1, max: 160 }),
    check('body').isLength({ min: 1 }),
    check('pageId').isNumeric(),
    check('pageOrder').isNumeric(),
  ],
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ error: errors.array().join(', ') }); // error message is a single string with all error joined together
    }

    const content = {
      type: req.body.type,
      body: req.body.body,
      pageId: req.body.pageId,
      pageOrder: req.body.pageOrder,
    };

    try {
      const result = await dao.createContent(content);
      res.json(result);
    } catch (err) {
      res
        .status(503)
        .json({
          error: `Database error during the creation of new page: ${err}`,
        });
    }
  }
);

// PUT /api/pages/<id>
app.put(
  '/api/pages/:id',
  isLoggedIn,
  [
    check('title').isLength({ min: 1, max: 160 }),
    check('creationDate').isDate({ format: 'YYYY-MM-DD', strictMode: true }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(422).json({ errors: errors.array() });
    }

    const pageToUpdate = req.body;
    const pageId = req.params.id;

    try {
      await dao.updatePage(pageToUpdate, pageId);
      res.status(200).end();
    } catch {
      res
        .status(503)
        .json({ error: `Impossible to update page #${pageId}.` });
    }
  }
);

// PUT /api/content
app.put(
  '/api/contents/:id',
  isLoggedIn,
  [check('body').isLength({ min: 1, max: 1000 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const contentToUpdate = req.body;
    const contentId = req.params.id;

    try {
      await dao.updateContent(contentToUpdate, contentId);
      res.status(200).end();
    } catch {
      res
        .status(503)
        .json({ error: `Impossible to update content #${contentId}.` });
    }
  }
);

app.delete(
  '/api/pages/:id',
  isLoggedIn,
  [check('id').isInt()],
  async (req, res) => {
    try {
      await dao.deletePage(req.params.id);
      res.status(200).json({});
    } catch (err) {
      res
        .status(503)
        .json({
          error: `Database error during the deletion of page ${req.params.id}: ${err} `,
        });
    }
  }
);

app.delete(
  '/api/pages/:id/contents',
  isLoggedIn,
  [check('id').isInt()],
  async (req, res) => {
    try {
      await dao.deleteContents(req.params.id);
      res.status(200).json({});
    } catch (err) {
      res
        .status(503)
        .json({
          error: `Database error during the deletion of page ${req.params.id}: ${err} `,
        });
    }
  }
);

// ------------ USERS
// GET /api/users
app.get('/api/users', async (req, res) => {
  try {
    const users = await userDao.getUsers();
    if (users.error) res.status(404).json(users);
    else res.json(users);
  } catch {
    res.status(500).end();
  }
});

// GET /api/users/:id
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await userDao.checkAdmin(req.params.id);
    if (user.error) res.status(404).json(user);
    else res.json(user);
  } catch {
    res.status(500).end();
  }
});

// -------- WEBSITE NAME
app.get('/api/website', (req, res) => {
  dao.getWebsiteName()
    .then((name) => res.json(name))
    .catch(() => res.status(500).end());
});

app.put('/api/website', [], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const name = req.body;

  try {
    await dao.updateWebsiteName(name);
    res.status(200).end();
  } catch {
    res.status(503).json({ error: `Impossible to update the name of the website.` });
  }
});

// start the server
app.listen(port, () => console.log(`API listening at http://localhost:${port}`));