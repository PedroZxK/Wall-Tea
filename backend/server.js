const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
require('dotenv').config();
const bcrypt = require('bcrypt'); // Adicione bcrypt

const port = 3000;
app.use(cors());

app.use(cors());
app.use(express.json());
// Serve arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

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
            SELECT id, nome, email, saldo, foto
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

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.put('/usuarios/:id', upload.single('fotoPerfil'), async (req, res) => {
    const userId = req.params.id;
    const { nome, email, senha } = req.body;
    let fotoPerfil = req.file ? req.file.buffer : null;

    try {
        const connection = await mysql.createConnection(dbConfig);
        let sql = 'UPDATE usuarios SET nome = ?, email = ?';
        const values = [nome, email];

        if (fotoPerfil) {
            sql += ', foto = ?';
            values.push(fotoPerfil);
        }

        if (senha) {
            const hashedPassword = await bcrypt.hash(senha, 10);
            sql += ', senha = ?';
            values.push(hashedPassword);
        }

        sql += ' WHERE id = ?';
        values.push(userId);
        const [result] = await connection.execute(sql, values);

        if (result.affectedRows > 0) {
            const [userResult] = await connection.execute(
                'SELECT id, nome, email, foto FROM usuarios WHERE id = ?',
                [userId]
            );
            res.json(userResult[0]);
        } else {
            res.status(404).json({ error: 'Usuário não encontrado' });
        }
        await connection.end();
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

app.post('/api/transactions', async (req, res) => {
    const { categoria_id, descricao, entidade, pagamento, data, valor_total, userId } = req.body;

    if (!descricao || !data || !valor_total || !categoria_id || !userId) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(`
            INSERT INTO transacoes (category_id, description, entity, payment_method, transaction_date, amount, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?, ?);
            `, [categoria_id, descricao, entidade, pagamento, data, valor_total, userId]);

        res.status(201).json({ message: 'Transação adicionada com sucesso' });
        await connection.end();

    } catch (error) {
        console.error('Erro ao adicionar transação:', error.message, error);
        res.status(500).json({ error: 'Erro ao adicionar transação' });
    }
});

app.get('/api/transactions', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: 'Parâmetro userId é obrigatório' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT t.description, t.entity, t.payment_method, t.transaction_date, t.amount, c.name as category_name
            FROM transacoes t
            JOIN categorias c ON t.category_id = c.id
            WHERE t.usuario_id = ?
            ORDER BY t.transaction_date DESC;
            `, [userId]);
        res.json(rows);
        await connection.end();
    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        res.status(500).json({ error: 'Erro ao buscar transações' });
    }
});

app.get('/api/categorias', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(`
            SELECT id, name FROM categorias;
            `);

        res.json(rows); // retorna [{ id: 1, name: "Alimentação" }, ...]
        await connection.end();
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
});

