const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// ROTA DE CADASTRO
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
            res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso', userId: result.insertId }); // Envia userId
        });
    } catch (error) {
        console.error('Erro ao criptografar a senha:', error);
        return res.status(500).json({ erro: 'Erro ao processar o cadastro' });
    }
});

// ROTA DE LOGIN
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    // 1. ADICIONE 'foto' À QUERY SQL
    const sql = 'SELECT id, nome, username, email, senha, foto FROM usuarios WHERE email = ?';

    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao fazer login' });
        if (results.length > 0) {
            const user = results[0];
            const passwordMatch = await bcrypt.compare(senha, user.senha);
            if (passwordMatch) {
                res.status(200).json({
                    mensagem: 'Login bem-sucedido',
                    usuario: {
                        id: user.id,
                        nome: user.nome,
                        username: user.username,
                        email: user.email,
                        // 2. ADICIONE O CAMPO 'foto' AO OBJETO DE RESPOSTA
                        foto: user.foto
                    }
                });
            } else {
                res.status(401).json({ erro: 'Credenciais inválidas' });
            }
        } else {
            res.status(401).json({ erro: 'Credenciais inválidas' });
        }
    });
});

module.exports = router;