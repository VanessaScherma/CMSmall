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

exports.updatePage = (page, pageId) => {
  return new Promise ((resolve, reject) => {
    const sql = 'UPDATE page SET title=?, authorId=?, creationDate=DATE(?), publicationDate=DATE(?) WHERE id=?';
    db.run(sql, [page.title, page.authorId, page.creationDate, page.publicationDate, pageId], function(err) {
      if(err) {
        console.log(err);
        reject(err);
      }
      else resolve(this.lastID);
    });
  });
};

exports.deletePage = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM page WHERE id = ?';
    db.run(sql, [id], (err) => {
      if (err) {
        reject(err);
      } else
        resolve(null);
    });
  });
}

/** CONTENTS **/

// get all the contents of a given page
exports.listContentsOf = (pageId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM content WHERE pageId = ?';
    db.all(sql, [pageId], (err, rows) => {
      if (err) {
        reject(err);
      }
      const contents = rows.map((c) => new Content(c.id, c.type, c.body, c.pageId, c.pageOrder));
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

exports.updateContent = (content, contentId) => {
  return new Promise ((resolve, reject) => {
    const sql = 'UPDATE content SET type=?, body=?, pageId=?, pageOrder=? WHERE id=?';
    db.run(sql, [content.type, content.body, content.pageId, content.pageOrder, contentId], function(err) {
      if(err) {
        console.log(err);
        reject(err);
      }
      else resolve(this.lastID);
    });
  });
};

exports.deleteContents = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM content WHERE pageId = ?';
    db.run(sql, [id], (err) => {
      if (err) {
        reject(err);
      } else
        resolve(null);
    });
  });
}


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

exports.checkAdmin = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM user WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err)
        reject(err);
      if (row == undefined)
        resolve({error: 'User not found.'}); 
      else {
        const admin = row.admin;
        resolve(admin);
      }
    });
  });
};

/** WEBSITE **/
exports.getWebsiteName = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT name FROM website';
    db.all(sql, [], (err, row) => {
      if (err) {
        reject(err);
      }
      const name = row;
      resolve(name);
    });
  });
}

exports.updateWebsiteName = (name) => {
  return new Promise ((resolve, reject) => {
    const sql = 'UPDATE website SET name=?';
    db.run(sql, [name.name], function(err) {
      if(err) {
        console.log(err);
        reject(err);
      }
      else resolve(this);
    });
  });
};