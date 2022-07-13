"use strict";

const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'deploy',
  password: process.env.API_DB_PW, 
  host: 'localhost',
  database: process.env.API_DATABASE, // typically 'api'
  port: 5432,
})


const getAccounts = (request, response) => {
  pool.query('SELECT * FROM Accounts ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getAccountById = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM Accounts WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createAccount = (request, response) => {
  const { name, pics } = request.body;

  pool.query('INSERT INTO Accounts (name, pics) VALUES ($1, $2) RETURNING *', [name, pics], (error, results) => {
    if (error) {
      throw error
    } else if (!Array.isArray(results.rows) || results.rows.length < 1) {
      throw error
    }
    response.status(201).send(`Account added with ID: ${results.rows[0].id}`)
  })
}

const updateAccount = (request, response) => {
  const id = parseInt(request.params.id);
  const { name, pics } = request.body;

  pool.query(
    'UPDATE Accounts SET name = $1, pics = $2 WHERE id = $3 RETURNING *',
    [name, pics, id],
    (error, results) => {
      if (error) {
        throw error
      } 
      if (typeof results.rows == 'undefined') {
        response.status(404).send(`Resource not found`);
      } else if (Array.isArray(results.rows) && results.rows.length < 1) {
        response.status(404).send(`Account not found`);
      } else {
      response.status(200).send(`Account modified with ID: ${results.rows[0].id}`)           
      }
      
    }
  )
}

const deleteAccount = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('DELETE FROM Accounts WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Account deleted with ID: ${id}`)
  })
}


const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getUserById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createUser = (request, response) => {
  const { name, email } = request.body;

  pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email], (error, results) => {
    if (error) {
      throw error
    } else if (!Array.isArray(results.rows) || results.rows.length < 1) {
      throw error
    }
    response.status(201).send(`User added with ID: ${results.rows[0].id}`)
  })
}

const updateUser = (request, response) => {
  const id = parseInt(request.params.id);
  const { name, email } = request.body;

  pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error
      } 
      if (typeof results.rows == 'undefined') {
        response.status(404).send(`Resource not found`);
      } else if (Array.isArray(results.rows) && results.rows.length < 1) {
        response.status(404).send(`User not found`);
      } else {
      response.status(200).send(`User modified with ID: ${results.rows[0].id}`)           
      }
      
    }
  )
}

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id);
  pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`);
  })
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
}