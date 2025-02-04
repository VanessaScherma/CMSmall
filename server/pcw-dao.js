const sqlite = require('sqlite3');
const { Page, Content } = require('./PCUModels');

// Open the database
const { db } = require('./db');

const dayjs = require('dayjs');


/** PAGES **/

// Get all the pages
exports.listPages = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM page';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      // Map the rows to Page objects
      const pages = rows.map((p) => new Page(p.id, p.title, p.authorId, p.creationDate, p.publicationDate));
      resolve(pages);
    });
  });
};

// Get published pages only
exports.listPublishedPages = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM page';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      // Map the rows to Page objects
      const pages = rows.map((p) => new Page(p.id, p.title, p.authorId, p.creationDate, p.publicationDate));

      const currentDate = dayjs();

      // Filter published pages based on publication date
      const filteredPages = pages.filter((page) =>
        dayjs(page.publicationDate) <= currentDate
      );

      resolve(filteredPages);
    });
  });
};


// Get a page given its id
exports.getPage = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM page WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err)
        reject(err);
      if (row == undefined)
        resolve({ error: 'Page not found.' });
      else {
        // Create a Page object with the retrieved data
        const page = new Page(row.id, row.title, row.authorId, row.creationDate, row.publicationDate);
        resolve(page);
      }
    });
  });
};

// Create a new page
exports.createPage = (page) => {
  console.log(page);
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO page (title, authorId, creationDate, publicationDate) VALUES(?, ?, DATE(?), DATE(?))';
    db.run(sql, [page.title, page.authorId, page.creationDate, page.publicationDate], function (err) {
      if (err) {
        reject(err);
      }
      // Return the newly created page object with additional DB properties
      resolve(exports.getPage(this.lastID));
    });
  });
};

// Update a page
exports.updatePage = (page, pageId) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE page SET title=?, publicationDate=DATE(?), authorId=? WHERE id=?';
    db.run(sql, [page.title, page.publicationDate, page.authorId, pageId], function (err) {
      if (err) {
        reject(err);
      }
      if (this.changes !== 1) {
        resolve({ error: 'No page was updated' });
      } else resolve({ msg: 'Page updated ' });
    });
  });
};

// Delete a page
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
};

/** CONTENTS **/

// Get all the contents of a given page
exports.listContentsOf = (pageId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM content WHERE pageId = ?';
    db.all(sql, [pageId], (err, rows) => {
      if (err) {
        reject(err);
      }
      if (rows.length === 0)
        resolve({ error: 'Contents not found.' });
      else {
      // Map the rows to Content objects
      const contents = rows.map((c) => new Content(c.id, c.type, c.body, c.pageId, c.pageOrder));
      resolve(contents);
      }
    });
  });
};


// Create a new content
exports.createContent = (content) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO content (type, body, pageId, pageOrder) VALUES (?, ?, ?, ?)';
    db.run(sql, [content.type, content.body, content.pageId, content.pageOrder], function (err) {
      if (err) {
        reject(err);
      }
      resolve(this.lastID);
    });
  });
};

// Update a content
exports.updateContent = (content, contentId) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE content SET type=?, body=?, pageOrder=? WHERE id=?';
    db.run(sql, [content.type, content.body, content.pageOrder, contentId], function (err) {
      if (err) {
        reject(err);
      }
      if (this.changes !== 1) {
        resolve({ error: 'No content was updated' });
      } else {
        resolve({ msg: 'Content updated' });
      }
    });
  });
};

// Delete contents of a page
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
};

// Delete a single content
exports.deleteContent = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM content WHERE id = ?';
    db.run(sql, [id], (err) => {
      if (err) {
        reject(err);
      } else
        resolve(null);
    });
  });
};


/** WEBSITE **/

// Get the website name
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
};

// Update the website name
exports.updateWebsiteName = (name) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE website SET name=?';
    db.run(sql, [name.name], function (err) {
      if (err) {
        console.log(err);
        reject(err);
      } else resolve(this);
    });
  });
};
