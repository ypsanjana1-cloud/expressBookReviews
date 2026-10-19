
const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');

const public_users = express.Router();

// Task 6: Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required.'
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: 'Username already exists.'
    });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: 'User successfully registered. Now you can login'
  });
});

// Task 1: Get the book list available in the shop (using Promise callbacks)
public_users.get('/', function (req, res) {
  new Promise((resolve) => {
    resolve(books);
  })
    .then((bks) => {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify(bks, null, 4));
    })
    .catch((err) => {
      return res.status(500).json({ message: 'Error retrieving book list.', error: err.message });
    });
});

// Task 2: Get book details based on ISBN (using Promise callbacks)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error('Book not found.'));
    }
  })
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// Task 3: Get book details based on author (using Promise callbacks)
public_users.get('/author/:author', function (req, res) {
  const authorParam = req.params.author.toLowerCase();

  new Promise((resolve, reject) => {
    const matchingBooks = [];
    const keys = Object.keys(books);

    keys.forEach((isbn) => {
      const book = books[isbn];
      if (
        book.author.toLowerCase() === authorParam ||
        book.author.toLowerCase().includes(authorParam)
      ) {
        matchingBooks.push(book);
      }
    });

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject(new Error('No books found for this author.'));
    }
  })
    .then((matching) => res.status(200).json(matching))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// Task 4: Get book details based on title (using Promise callbacks)
public_users.get('/title/:title', function (req, res) {
  const titleParam = decodeURIComponent(req.params.title).toLowerCase();
  const matchingBooks = {};

  Object.keys(books).forEach((isbn) => {
    const book = books[isbn];
    if (book.title.toLowerCase().includes(titleParam)) {
      matchingBooks[isbn] = book;
    }
  });

  if (Object.keys(matchingBooks).length > 0) {
    return res.status(200).json(matchingBooks);
  }
  return res.status(404).json({ message: 'No books found with this title.' });
});
// Task 5: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  return res.status(200).json(book.reviews);
});

// =============================================================================
// Axios Client Functions for Tasks 10 - 13 (Async/Await and Promises)
// =============================================================================
const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Task 10: Get all books using async/await with Axios
async function getAllBooks() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

// Task 11: Get book details based on ISBN using async/await with Axios
async function getBookByISBN(isbn) {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

// Task 12: Get book details based on Author using async/await with Axios
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(
      `${BASE_URL}/author/${encodeURIComponent(author)}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

// Task 13: Get book details based on Title using async/await with Axios
async function getBooksByTitle(title) {
  try {
    const response = await axios.get(
      `${BASE_URL}/title/${encodeURIComponent(title)}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;

