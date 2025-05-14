const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
require('dotenv').config();

const port = 3000;
app.use(cors());

app.use(cors());
app.use(express.json());

const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'walltea'
};

app.use('/auth', authRoutes);

app.get('/api/expenses', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(`
            SELECT c.name AS category, SUM(e.value) AS total_spent
            FROM expenses e
            JOIN categorias c ON e.category_id = c.id
            GROUP BY c.name;
        `);

        const formattedExpenses = rows.map(row => ({
            category: row.category,
            total_spent: row.total_spent
        }));

        res.json(formattedExpenses);
        await connection.end();
    } catch (error) {
        console.error('Erro ao buscar despesas:', error);
        res.status(500).json({ error: 'Erro ao buscar despesas' });
    }
});

app.get('/api/budgets', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(`
            SELECT c.name AS category_name, b.budgeted, b.spent
            FROM budgets b
            JOIN categorias c ON b.category_id = c.id;
        `);

        res.json(rows);
        await connection.end();
    } catch (error) {
        console.error('Erro ao buscar orçamentos:', error);
        res.status(500).json({ error: 'Erro ao buscar orçamentos' });
    }
});

// Adicionando a rota para buscar dados do usuário, incluindo o saldo
app.get('/api/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const connection = await mysql.createConnection(dbConfig);
        // Ajustando a consulta para buscar o saldo do usuário
        const [rows] = await connection.execute(`
            SELECT id, nome, email, saldo 
            FROM usuarios 
            WHERE id = ?;
        `, [userId]);

        if (rows.length > 0) {
            res.json(rows[0]); // Retorna o primeiro usuário encontrado
        } else {
            res.status(404).json({ error: 'Usuário não encontrado' });
        }
        await connection.end();
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
