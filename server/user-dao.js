'use strict';

const { db } = require('./db');
const crypto = require('crypto');

// Function to retrieve a user based on email and password
exports.getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM user WHERE email = ?';

    // Query the database to find a user with the provided email
    db.get(sql, [email], (err, row) => {
      if (err) { 
        reject(err); // If there's an error, reject the promise with the error
      }
      else if (row === undefined) { 
        resolve(false); // If no user is found, resolve the promise with false
      }
      else {
        // Create a user object with id, username, and name from the database row
        const user = { id: row.id, username: row.email, name: row.name };
        
        // Use crypto to hash the provided password using the stored salt value
        crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
          if (err) reject(err); // If there's an error, reject the promise with the error

          // Compare the hashed password with the stored hashed password
          if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
            resolve(false); // If passwords don't match, resolve the promise with false
          else
            resolve(user); // If passwords match, resolve the promise with the user object
        });
      }
    });
  });
};

// Function to retrieve a user based on user id
exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM user WHERE id = ?';

    // Query the database to find a user with the provided id
    db.get(sql, [id], (err, row) => {
      if (err) { 
        reject(err); // If there's an error, reject the promise with the error
      }
      else if (row === undefined) { 
        resolve({ error: 'User not found!' }); // If no user is found, resolve the promise with an error object
      }
      else {
        // Create a user object with id, username, and name from the database row
        const user = { id: row.id, username: row.email, name: row.name };
        resolve(user); // Resolve the promise with the user object
      }
    });
  });
};


// Get id and name of all the users
exports.getUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, name FROM user';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      // Map the rows to User objects
      const users = rows.map((u) => new User(u.id, u.name));
      resolve(users);
    });
  });
};

// Check if a user is an admin
exports.checkAdmin = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM user WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err)
        reject(err);
      if (row == undefined)
        resolve({ error: 'User not found.' });
      else {
        const admin = row.admin;
        resolve(admin);
      }
    });
  });
};
