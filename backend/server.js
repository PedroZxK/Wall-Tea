const express = require("express");
const cors = require("cors");
const db = require("./models");
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

db.sequelize.sync().then(() => {
    console.log("Banco sincronizado com Sequelize");
});

app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await db.Usuario.findOne({ where: { email } });

        if (!usuario) {
            return res.status(401).json({ erro: 'Usuário não encontrado.' });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ erro: 'Senha incorreta.' });
        }

        return res.status(200).json({
            mensagem: 'Login realizado com sucesso!',
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
            },
            token: 'fake-token',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao realizar login.' });
    }
});

app.post('/api/cadastro', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        const usuarioExistente = await db.Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ erro: 'Email já cadastrado.' });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const novoUsuario = await db.Usuario.create({
            nome,
            email,
            senha: senhaCriptografada,
        });

        return res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!',
            usuario: {
                id: novoUsuario.id,
                nome: novoUsuario.nome,
                email: novoUsuario.email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
    }
});

app.get('/api/expenses', async (req, res) => {
    try {
        const expenses = await db.expenses.findAll();
        const response = expenses.map(item => ({
            category: item.category,
            value: item.value
        }));
        res.status(200).json(response);
    } catch (error) {
        console.error('Erro ao buscar gastos:', error);
        res.status(500).json({ error: 'Erro ao buscar os gastos' });
    }
});

app.get('/api/budgets', async (req, res) => {
    try {
        const budgets = await db.budgets.findAll();
        const response = budgets.map(item => ({
            category: item.category,
            budgeted: item.budgeted,
            spent: item.spent
        }));
        res.status(200).json(response);
    } catch (error) {
        console.error('Erro ao buscar orçamentos:', error);
        res.status(500).json({ error: 'Erro ao buscar os orçamentos' });
    }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
