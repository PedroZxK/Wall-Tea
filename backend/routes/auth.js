const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

router.post('/cadastro', async (req, res) => {
  const { nome, username, email, senha } = req.body;

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(senha, salt);
    const sql = 'INSERT INTO usuarios (nome, username, email, senha) VALUES (?, ?, ?, ?)';
    db.query(sql, [nome, username, email, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
      }
      console.log('ID do usuário cadastrado:', result.insertId);
      res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso', userId: result.insertId });
    });
  } catch (error) {
    console.error('Erro ao criptografar a senha:', error);
    return res.status(500).json({ erro: 'Erro ao processar o cadastro' });
  }
});

module.exports = router;
