/* Data Access Object (DAO) module for accessing Pages and Contents */
const sqlite = require('sqlite3');
const { Page, Content, User } = require('./PCModels');

// open the database
const { db } = require('./db');

/** PAGES **/

// get all the pages
exports.listPages = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM page';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      const pages = rows.map((p) => new Page(p.id, p.title, p.authorId, p.creationDate, p.publicationDate));
      resolve(pages);
    });
  });
}

// get a page given its id
exports.getPage = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM page WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err)
        reject(err);
      if (row == undefined)
        resolve({error: 'Page not found.'}); 
      else {
        const page = new Page(row.id, row.title, row.authorId, row.creationDate, row.publicationDate);
        resolve(page);
      }
    });
  });
};

exports.createPage = (page) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO page (title, authorId, creationDate, publicationDate) VALUES(?, ?, DATE(?), DATE(?))';
    db.run(sql, [page.title, page.authorId, page.creationDate, page.publicationDate], function (err) {
      if (err) {
        reject(err);
      }
      // Returning the newly created object with the DB additional properties to the client.
      resolve(exports.getPage(this.lastID));
    });
  });
};


/** CONTENTS **/

// get all the contents of a given page
exports.listContentsOf = (pageId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM content WHERE pageId = ?';
    db.all(sql, [pageId], (err, rows) => {
      if (err) {
        reject(err);
      }
      const contents = rows.map((c) => new Content(c.id, c.type, c.body, c.pageId, c.order));
      resolve(contents);
    });
  });
};

exports.createContent = (content) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO content (type, body, pageId, pageOrder) VALUES(?, ?, ?, ?)';
    db.run(sql, [content.type, content.body, content.pageId, content.pageOrder], function (err) {
      if (err) {
        reject(err);
      }
      // Returning the newly created object with the DB additional properties to the client.
      resolve(this.lastID);
    });
  });
};


/** USERS **/
// get id and name of all the users
exports.getUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, name FROM user';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      const users = rows.map((u) => new User(u.id, u.name));
      resolve(users);
    });
  });
};