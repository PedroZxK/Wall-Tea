const express = require('express')
const router = express.Router()
const db = require('../db')

// ROTA DE CADASTRO
router.post('/cadastro', (req, res) => {
  const { nome, email, senha } = req.body
  const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)'
  db.query(sql, [nome, email, senha], (err, result) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
    }
    console.log('ID do usuário cadastrado:', result.insertId); // Exemplo de uso
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso', userId: result.insertId });
  });
})

// ROTA DE LOGIN
router.post('/login', (req, res) => {
  const { email, senha } = req.body
  const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?'
  db.query(sql, [email, senha], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao fazer login' })
    if (results.length > 0) {
      res.status(200).json({ mensagem: 'Login bem-sucedido', usuario: results[0] })
    } else {
      res.status(401).json({ erro: 'Credenciais inválidas' })
    }
  })
})

module.exports = router
