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

const isLoggedInAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.admin === 1) {
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
app.get('/api/pages', (req, res) => {
  if (req.isAuthenticated()) {
    // Logged-in user, send all pages
    dao.listPages()
      .then((pages) => res.json(pages))
      .catch(() => res.status(500).end());
  } else {
    // Send only published pages
    dao.listPublishedPages()
      .then((pages) => res.json(pages))
      .catch(() => res.status(500).end());
  }
});


// GET /api/pages/<id>
app.get('/api/pages/:id', isLoggedIn,
[ check('id').isInt({ min: 1 }) ],
  async (req, res) => {
  try {
    const page = await dao.getPage(req.params.id);
    if (page.error) res.status(404).json(page);
    else res.json(page);
  } catch {
    res.status(500).end();
  }
});

// GET /api/pages/<id>/contents
app.get('/api/pages/:id/contents',
[ check('id').isInt({ min: 1 }) ],
 async (req, res) => {
  try {
    const contents = await dao.listContentsOf(req.params.id);
    if(contents.error) res.status(404).json(contents);
    else res.json(contents);
  } catch {
    res.status(500).end();
  }
});

app.post(
  '/api/pages',
  isLoggedIn,
  [
    check('page.title').isLength({ min: 1 }),
    check('page.authorId').isInt({ min: 1 }),
    check('page.creationDate').isDate({ format: 'YYYY-MM-DD', strictMode: true }),
    check('page.publicationDate').optional().isDate({ format: 'YYYY-MM-DD', strictMode: true }),
    check('contents.*.type').isLength({ min: 1 }),
    check('contents.*.body').isLength({ min: 1 }),
    check('contents.*.pageOrder').isInt({ min: 1 }),
  ],
  async (req, res) => {
    const { page, contents } = req.body;

    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(', ') });
    }

    const authorId = userDao.checkAdmin(req.user.id) === 1 ? page.authorId : req.user.id;

    try {
      const createdPage = await dao.createPage({ ...page, authorId });
      const pageId = createdPage.id;
      
      const createdContents = await Promise.all(
        contents.map(content => dao.createContent({ ...content, pageId }))
      );

      res.json({ pageId, createdContents });
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of new page: ${err}` });
    }
  }
);

app.put(
  '/api/pages/:id',
  isLoggedIn,
  [
    check('id').isInt({ min: 1 }),
    check('title').isLength({ min: 1 }),
    check('authorId').isInt({ min: 1 }),
    check('publicationDate').optional().isDate({ format: 'YYYY-MM-DD', strictMode: true }),
    check('contents.*.id').optional().isInt({ min: 1 }),
    check('contents.*.type').isLength({ min: 1 }),
    check('contents.*.body').isLength({ min: 1 }),
    check('contents.*.pageOrder').isInt({ min: 1 })
  ],
  async (req, res) => {
  

    const pageId = req.params.id;
    const pageToUpdate = {
      ...req.body.page,
      authorId: userDao.checkAdmin(req.user.id) === 1 ? req.body.authorId : req.user.id, // Use user.id if user is not an admin
    };
    console.log(pageToUpdate);
    const contentsToUpdate = req.body.contents;

    try {
      // Update page
      await dao.updatePage(pageToUpdate, pageId);

      // Update or create contents
      for (const content of contentsToUpdate) {
        if (content.id && content.id > 0) {
          // Update existing content
          await dao.updateContent(content, content.id);
        } else {
          // Create new content
          await dao.createContent(content, pageId);
        }
      }

      res.json({ message: 'Page and contents updated successfully' });
    } catch (err) {
      res.status(503).json({ error: `Failed to update page and contents: ${err}` });
    }
  }
);

app.delete(
  '/api/pages/:id',
  isLoggedIn,
  [check('id').isInt({ min: 1 })],
  async (req, res) => {
    try {
      const page = await dao.getPage(req.params.id);
    console.log(page);
    console.log(req.user.id);
      if (!page) {
        return res.status(404).json({ error: `Page ${req.params.id} not found` });
      }

      if (userDao.checkAdmin(req.user.id) === 1 || page.authorId === req.user.id) {
        await dao.deletePage(req.params.id);
        await dao.deleteContents(req.params.id);
        return res.status(200).json({});
      }
      return res.status(403).json({ error: 'Not authorized to delete this page' });
    } catch (err) {
      res.status(503).json({ error: `Database error during the deletion of page ${req.params.id}: ${err}` });
    }
  }
);


// ------------ USERS
// GET /api/users
app.get('/api/users', (req, res) => {
  userDao.getUsers()
    .then((users) => res.json(users))
    .catch(() => res.status(500).end());
});


// -------- WEBSITE NAME
app.get('/api/website', (req, res) => {
  dao.getWebsiteName()
    .then((name) => res.json(name))
    .catch(() => res.status(500).end());
});

app.put('/api/website', isLoggedInAdmin,
  [check('name').isLength({ min: 1, max: 100 })],
  async (req, res) => {
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