
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
const users = [];

// Check if username already exists in users records
const isValid = (username) => {
  return typeof username === 'string' && users.some((user) => user.username === username.trim());
};

// Check if username and password match recorded users
const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

// Task 7: Log in as a registered user
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required.'
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: 'Invalid username or password.'
    });
  }

  const accessToken = jwt.sign({ username }, 'access', {
    expiresIn: '1h'
  });

  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({
    message: 'User successfully logged in',
    accessToken
  });
});

// Task 8: Add or modify a book review (supports review via query param or request body)
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user?.username || req.session?.authorization?.username;
  const review = req.query.review || req.body.review;

  if (!username) {
    return res.status(403).json({ message: 'User not logged in' });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({
      message: 'A non-empty review is required.'
    });
  }

  books[isbn].reviews[username] = review.trim();

  return res.status(200).json({
    message: `Review for ISBN ${isbn} by user '${username}' added/updated successfully.`,
    reviews: books[isbn].reviews
  });
});

// Task 9: Delete a book review posted by this specific user
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user?.username || req.session?.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: 'User not logged in' });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({
      message: `You have not reviewed this book.`
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: `Review for ISBN ${isbn} posted by '${username}' deleted successfully.`,
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;

