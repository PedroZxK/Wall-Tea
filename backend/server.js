const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
require('dotenv').config();
const bcrypt = require('bcrypt');
const multer = require('multer'); // Certifique-se de que multer está importado

const port = 3000;
app.use(cors()); // Permite requisições de diferentes origens
app.use(express.json()); // Permite que o Express parseie JSON no corpo das requisições

// Serve arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'walltea'
};

app.use('/auth', authRoutes);

// --- Rotas de Relatórios e Usuário (Mantenha as que já existem) ---

app.get('/api/expenses', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT c.name AS category, SUM(e.value) AS total_spent
            FROM expenses e -- A tabela 'expenses' parece estar faltando na sua query original
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

app.get('/api/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT id, nome, email, saldo, foto
            FROM usuarios
            WHERE id = ?;
        `, [userId]);

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Usuário não encontrado' });
        }
        await connection.end();
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
    }
});

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

// --- Rotas de Transações ---

app.post('/api/transactions', async (req, res) => {
    const { category_id, description, entity, payment_method, transaction_date, amount, userId } = req.body; // Nomes ajustados para consistência

    if (!description || !transaction_date || !amount || !category_id || !userId) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(`
            INSERT INTO transacoes (category_id, description, entity, payment_method, transaction_date, amount, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `, [category_id, description, entity, payment_method, transaction_date, amount, userId]);

        res.status(201).json({ message: 'Transação adicionada com sucesso' });
        await connection.end();

    } catch (error) {
        console.error('Erro ao adicionar transação:', error.message, error);
        res.status(500).json({ error: 'Erro ao adicionar transação' });
    }
});

app.post('/api/rendas', async (req, res) => {
    const { userId, mes, salario, bicos } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(`
            INSERT INTO rendas (usuario_id, mes, salario, bicos)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            salario = salario + ?, bicos = bicos + ?;
        `, [userId, mes, salario, bicos, salario, bicos]);

        res.status(201).json({ message: 'Renda adicionada com sucesso' });
        await connection.end();
    } catch (error) {
        console.error('Erro ao adicionar renda:', error);
        res.status(500).json({ error: 'Erro ao adicionar renda' });
    }
});

app.post('/api/rendas', async (req, res) => {
    const { userId, mes, salario, bicos } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(`
            INSERT INTO rendas (usuario_id, mes, salario, bicos)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            salario = salario + ?, bicos = bicos + ?;
        `, [userId, mes, salario, bicos, salario, bicos]);

        res.status(201).json({ message: 'Renda adicionada com sucesso' });
        await connection.end();
    } catch (error) {
        console.error('Erro ao adicionar renda:', error);
        res.status(500).json({ error: 'Erro ao adicionar renda' });
    }
});

app.post('/api/budgets', async (req, res) => {
    const { userId, categoryId, budgeted } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(`
            INSERT INTO budgets (usuario_id, category_id, budgeted, spent, createdAt, updatedAt)
            VALUES (?, ?, ?, 0, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
            budgeted = ?;
        `, [userId, categoryId, budgeted, budgeted]);

        res.status(201).json({ message: 'Orçamento atualizado com sucesso' });
        await connection.end();
    } catch (error) {
        console.error('Erro ao atualizar orçamento:', error);
        res.status(500).json({ error: 'Erro ao atualizar orçamento' });
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
            SELECT
                t.id,
                t.description,
                t.entity,
                t.payment_method,
                t.transaction_date,
                t.amount,
                t.category_id, -- Adicionado para facilitar a edição no frontend
                c.name as category_name
            FROM
                transacoes t
            JOIN
                categorias c ON t.category_id = c.id
            WHERE
                t.usuario_id = ?
            ORDER BY
                t.transaction_date DESC;
        `, [userId]);
        res.json(rows);
        await connection.end();
    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        res.status(500).json({ error: 'Erro ao buscar transações' });
    }
});

// Rota para ATUALIZAR uma transação (PUT)
app.put('/api/transactions/:id', async (req, res) => {
    const transactionId = req.params.id;
    const { description, entity, payment_method, transaction_date, amount, category_id, userId } = req.body; // userId adicionado para segurança

    // Validar se os campos obrigatórios estão presentes
    if (!description || !transaction_date || !amount || !category_id || !userId) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando para atualização' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            `
            UPDATE transacoes
            SET
                description = ?,
                entity = ?,
                payment_method = ?,
                transaction_date = ?,
                amount = ?,
                category_id = ?
            WHERE
                id = ? AND usuario_id = ?; -- Garantir que apenas o dono da transação pode editar
            `,
            [description, entity, payment_method, transaction_date, amount, category_id, transactionId, userId]
        );

        if (result.affectedRows > 0) {
            res.json({ message: 'Transação atualizada com sucesso!' });
        } else {
            // Se affectedRows for 0, pode ser que a transação não exista ou o userId não corresponda
            res.status(404).json({ error: 'Transação não encontrada ou você não tem permissão para editá-la.' });
        }
        await connection.end();
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar transação.' });
    }
});

// Rota para EXCLUIR uma transação (DELETE)
app.delete('/api/transactions/:id', async (req, res) => {
    const transactionId = req.params.id;
    const userId = req.query.userId; // Obter userId do query parameter para verificação de segurança

    if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado. userId é obrigatório para exclusão.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        // Excluir a transação, verificando se o usuário logado é o dono
        const [result] = await connection.execute(
            `DELETE FROM transacoes WHERE id = ? AND usuario_id = ?;`,
            [transactionId, userId]
        );

        if (result.affectedRows > 0) {
            res.json({ message: 'Transação excluída com sucesso!' });
        } else {
            // Se affectedRows for 0, a transação não existe ou o userId não corresponde
            res.status(404).json({ error: 'Transação não encontrada ou você não tem permissão para excluí-la.' });
        }
        await connection.end();
    } catch (error) {
        console.error('Erro ao excluir transação:', error);
        res.status(500).json({ error: 'Erro interno ao excluir transação.' });
    }
});

app.get('/api/categorias', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT id, name FROM categorias;
        `);
        res.json(rows);
        await connection.end();
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});