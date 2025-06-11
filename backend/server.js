
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
require('dotenv').config();
const bcrypt = require('bcrypt');
const multer = require('multer');

const port = 3000;
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'walltea'
};

app.use('/auth', authRoutes);

// --- Rotas de Relatórios e Usuário (sem alterações aqui) ---

app.get('/api/expenses', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: 'Parâmetro userId é obrigatório' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT c.name AS category, SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) AS total_spent
            FROM transacoes t
            JOIN categorias c ON t.category_id = c.id
            WHERE t.usuario_id = ?
            GROUP BY c.name;
        `, [userId]);
        res.json(rows);
        await connection.end();
    } catch (error) {
        console.error('Erro ao buscar despesas por categoria:', error);
        res.status(500).json({ error: 'Erro ao buscar despesas por categoria' });
    }
});

app.get('/api/budgets', async (req, res) => {
    const { userId, month, year } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'Parâmetro userId é obrigatório' });
    }

    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    let query = `
        SELECT
            b.id,
            b.category_id,
            c.name AS category_name,
            b.budgeted,
            COALESCE(SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END), 0) AS spent
        FROM
            budgets b
        JOIN
            categorias c ON b.category_id = c.id
        LEFT JOIN
            transacoes t ON b.category_id = t.category_id AND b.usuario_id = t.usuario_id
            AND MONTH(t.transaction_date) = ? AND YEAR(t.transaction_date) = ?
        WHERE
            b.usuario_id = ? AND b.month = ? AND b.year = ?
        GROUP BY b.id, c.name, b.budgeted, b.category_id;
    `;
    const queryParams = [currentMonth, currentYear, userId, currentMonth, currentYear];

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(query, queryParams);

        const [unbudgetedExpenses] = await connection.execute(`
            SELECT
                c.id AS category_id,
                c.name AS category_name,
                0 AS budgeted,
                SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) AS spent
            FROM
                transacoes t
            JOIN
                categorias c ON t.category_id = c.id
            LEFT JOIN
                budgets b ON t.category_id = b.category_id AND t.usuario_id = b.usuario_id
                AND b.month = ? AND b.year = ? AND b.usuario_id = ?
            WHERE
                t.usuario_id = ? AND MONTH(t.transaction_date) = ? AND YEAR(t.transaction_date) = ?
                AND b.id IS NULL
            GROUP BY
                c.id, c.name;
        `, [currentMonth, currentYear, userId, userId, currentMonth, currentYear]);

        const combinedDataMap = new Map();

        rows.forEach(item => {
            combinedDataMap.set(item.category_id, {
                id: item.id,
                category_id: item.category_id,
                category_name: item.category_name,
                budgeted: parseFloat(item.budgeted),
                spent: parseFloat(item.spent)
            });
        });

        unbudgetedExpenses.forEach(item => {
            if (!combinedDataMap.has(item.category_id)) {
                combinedDataMap.set(item.category_id, {
                    id: null,
                    category_id: item.category_id,
                    category_name: item.category_name,
                    budgeted: parseFloat(item.budgeted),
                    spent: parseFloat(item.spent)
                });
            }
        });

        res.json(Array.from(combinedDataMap.values()));
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

        if (senha && senha !== '********') {
            const hashedPassword = await bcrypt.hash(senha, 10);
            sql += ', senha = ?';
            values.push(hashedPassword);
        }

        sql += ' WHERE id = ?';
        values.push(userId);
        await connection.execute(sql, values);

        // Após o update, busque o usuário novamente para retornar os dados atualizados
        const [userResult] = await connection.execute(
            'SELECT id, nome, email, foto FROM usuarios WHERE id = ?',
            [userId]
        );

        await connection.end();

        if (userResult.length > 0) {
            const user = userResult[0];

            // TRANSFORME O BUFFER DA FOTO EM BASE64 ANTES DE ENVIAR
            if (user.foto) {
                const base64String = Buffer.from(user.foto).toString('base64');
                user.foto = `data:image/jpeg;base64,${base64String}`;
            }

            res.json(user); // Agora envia o usuário com a foto já formatada
        } else {
            res.status(404).json({ error: 'Usuário não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

// --- Rotas de Transações (sem alterações aqui) ---

app.post('/api/transactions', async (req, res) => {
    const { category_id, description, entity, payment_method, transaction_date, amount, userId } = req.body;

    if (!description || !transaction_date || amount === undefined || !category_id || !userId) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando ou valor inválido.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        await connection.execute(`
            INSERT INTO transacoes (category_id, description, entity, payment_method, transaction_date, amount, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `, [category_id, description, entity, payment_method, transaction_date, amount, userId]);

        await connection.execute(
            'UPDATE usuarios SET saldo = saldo + ? WHERE id = ?',
            [amount, userId]
        );

        if (amount < 0) {
            const transactionMonth = new Date(transaction_date).getMonth() + 1;
            const transactionYear = new Date(transaction_date).getFullYear();

            const [spentTotalForCategory] = await connection.execute(`
                SELECT COALESCE(SUM(ABS(amount)), 0) as totalSpent
                FROM transacoes
                WHERE usuario_id = ? AND category_id = ? AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ? AND amount < 0;
            `, [userId, category_id, transactionMonth, transactionYear]);

            await connection.execute(`
                UPDATE budgets
                SET spent = ?
                WHERE usuario_id = ? AND category_id = ? AND month = ? AND year = ?;
            `, [spentTotalForCategory[0].totalSpent, userId, category_id, transactionMonth, transactionYear]);
        }

        res.status(201).json({ message: 'Transação adicionada com sucesso' });
        await connection.end();

    } catch (error) {
        console.error('Erro ao adicionar transação:', error.message, error);
        res.status(500).json({ error: 'Erro ao adicionar transação' });
    }
});

app.put('/api/transactions/:id', async (req, res) => {
    const transactionId = req.params.id;
    const { description, entity, payment_method, transaction_date, amount, category_id, userId } = req.body;

    if (!description || !transaction_date || amount === undefined || !category_id || !userId) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando ou valor inválido para atualização.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        const [oldTransactionRows] = await connection.execute(
            'SELECT amount, category_id, transaction_date FROM transacoes WHERE id = ? AND usuario_id = ?',
            [transactionId, userId]
        );

        if (oldTransactionRows.length === 0) {
            await connection.end();
            return res.status(404).json({ error: 'Transação não encontrada ou você não tem permissão para editá-la.' });
        }
        const oldAmount = parseFloat(oldTransactionRows[0].amount);
        const oldCategoryId = oldTransactionRows[0].category_id;
        const oldTransactionDate = new Date(oldTransactionRows[0].transaction_date);
        const oldTransactionMonth = oldTransactionDate.getMonth() + 1;
        const oldTransactionYear = oldTransactionDate.getFullYear();

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
                id = ? AND usuario_id = ?;
            `,
            [description, entity, payment_method, transaction_date, amount, category_id, transactionId, userId]
        );

        if (result.affectedRows > 0) {
            const balanceAdjustment = amount - oldAmount;
            await connection.execute(
                'UPDATE usuarios SET saldo = saldo + ? WHERE id = ?',
                [balanceAdjustment, userId]
            );

            const newTransactionMonth = new Date(transaction_date).getMonth() + 1;
            const newTransactionYear = new Date(transaction_date).getFullYear();

            const recomputeCategories = new Set();
            if (oldAmount < 0) recomputeCategories.add(`${oldCategoryId}-${oldTransactionMonth}-${oldTransactionYear}`);
            if (amount < 0) recomputeCategories.add(`${category_id}-${newTransactionMonth}-${newTransactionYear}`);

            for (const key of recomputeCategories) {
                const [catId, month, year] = key.split('-').map(Number);
                const [spentTotal] = await connection.execute(`
                    SELECT COALESCE(SUM(ABS(amount)), 0) as totalSpent
                    FROM transacoes
                    WHERE usuario_id = ? AND category_id = ? AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ? AND amount < 0;
                `, [userId, catId, month, year]);

                await connection.execute(`
                    UPDATE budgets
                    SET spent = ?
                    WHERE usuario_id = ? AND category_id = ? AND month = ? AND year = ?;
                `, [spentTotal[0].totalSpent, userId, catId, month, year]);
            }

            res.json({ message: 'Transação atualizada com sucesso!' });
        } else {
            res.status(404).json({ error: 'Transação não encontrada ou você não tem permissão para editá-la.' });
        }
        await connection.end();
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar transação.' });
    }
});

app.delete('/api/transactions/:id', async (req, res) => {
    const transactionId = req.params.id;
    const userId = req.query.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado. userId é obrigatório para exclusão.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [transactionRows] = await connection.execute(
            'SELECT amount, category_id, transaction_date FROM transacoes WHERE id = ? AND usuario_id = ?',
            [transactionId, userId]
        );

        if (transactionRows.length === 0) {
            await connection.end();
            return res.status(404).json({ error: 'Transação não encontrada ou você não tem permissão para excluí-la.' });
        }

        const transactionAmount = parseFloat(transactionRows[0].amount);
        const transactionCategoryId = transactionRows[0].category_id;
        const transactionDate = new Date(transactionRows[0].transaction_date);
        const transactionMonth = transactionDate.getMonth() + 1;
        const transactionYear = transactionDate.getFullYear();

        const [result] = await connection.execute(
            `DELETE FROM transacoes WHERE id = ? AND usuario_id = ?;`,
            [transactionId, userId]
        );

        if (result.affectedRows > 0) {
            await connection.execute(
                'UPDATE usuarios SET saldo = saldo - ? WHERE id = ?',
                [transactionAmount, userId]
            );

            if (transactionAmount < 0) {
                const [remainingSpent] = await connection.execute(`
                    SELECT COALESCE(SUM(ABS(amount)), 0) as totalSpent
                    FROM transacoes
                    WHERE usuario_id = ? AND category_id = ? AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ? AND amount < 0;
                `, [userId, transactionCategoryId, transactionMonth, transactionYear]);

                await connection.execute(`
                    UPDATE budgets
                    SET spent = ?
                    WHERE usuario_id = ? AND category_id = ? AND month = ? AND year = ?;
                `, [remainingSpent[0].totalSpent, userId, transactionCategoryId, transactionMonth, transactionYear]);
            }

            res.json({ message: 'Transação excluída com sucesso!' });
        } else {
            res.status(404).json({ error: 'Transação não encontrada ou você não tem permissão para excluí-la.' });
        }
        await connection.end();
    } catch (error) {
        console.error('Erro ao excluir transação:', error);
        res.status(500).json({ error: 'Erro interno ao excluir transação.' });
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
                t.category_id,
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

// --- REVISED: /api/incomes now sums values in 'rendas' table ---
app.post('/api/incomes', async (req, res) => {
    const { userId, month, year, salary, sideGigs } = req.body;

    // --- ADD THESE CONSOLE.LOGS ---
    console.log('SERVER RECEIVING INCOME DATA:');
    console.log('  userId:', userId);
    console.log('  month (raw from client):', month);
    console.log('  year (raw from client):', year);
    console.log('  salary:', salary);
    console.log('  sideGigs:', sideGigs);
    // --- END ADDED LOGS ---

    if (!userId || !month || !year || salary === undefined || sideGigs === undefined) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const mesFormatted = `${year}-${String(month).padStart(2, '0')}`;
        console.log('  mesFormatted (for DB):', mesFormatted); // Add this too
        // ... (rest of your /api/incomes route code)

        // Fetch old income values for balance adjustment BEFORE update/insert
        const [existingIncome] = await connection.execute(
            `SELECT salario, bicos FROM rendas WHERE usuario_id = ? AND mes = ?`,
            [userId, mesFormatted]
        );

        let oldSalary = 0;
        let oldSideGigs = 0;

        if (existingIncome.length > 0) {
            oldSalary = parseFloat(existingIncome[0].salario);
            oldSideGigs = parseFloat(existingIncome[0].bicos);
        }

        // Insert or Update income in 'rendas' table, adding to existing values
        await connection.execute(`
            INSERT INTO rendas (usuario_id, mes, salario, bicos, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
            salario = salario + VALUES(salario), bicos = bicos + VALUES(bicos), updatedAt = NOW();
        `, [userId, mesFormatted, salary, sideGigs]);

        // Adjust user's balance based on the change in income
        const balanceChange = (parseFloat(salary) - oldSalary) + (parseFloat(sideGigs) - oldSideGigs);
        await connection.execute(
            'UPDATE usuarios SET saldo = saldo + ? WHERE id = ?',
            [balanceChange, userId]
        );

        res.status(201).json({ message: 'Renda atualizada com sucesso!' });
        await connection.end();
    } catch (error) {
        console.error('Erro ao adicionar/atualizar renda:', error);
        res.status(500).json({ error: 'Erro ao adicionar/atualizar renda' });
    }
});


app.get('/api/incomes-monthly', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: 'Parâmetro userId é obrigatório' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`
            SELECT
                mes,
                salario,
                bicos
            FROM
                rendas
            WHERE
                usuario_id = ?
            ORDER BY
                mes ASC;
        `, [userId]);

        res.json(rows);
        await connection.end();
    } catch (error) {
        console.error('Erro ao buscar rendas mensais:', error);
        res.status(500).json({ error: 'Erro ao buscar rendas mensais' });
    }
});


app.get('/api/monthly-financial-data', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: 'Parâmetro userId é obrigatório' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        // Fetch income data from rendas table
        const [incomeRows] = await connection.execute(`
            SELECT
                mes,
                salario,
                bicos
            FROM
                rendas
            WHERE
                usuario_id = ?
            ORDER BY
                mes ASC;
        `, [userId]);

        // Fetch expense data from transacoes table
        const [expenseRows] = await connection.execute(`
            SELECT
                DATE_FORMAT(transaction_date, '%Y-%m') AS month_year,
                SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) AS total_expenses
            FROM
                transacoes
            WHERE
                usuario_id = ?
            GROUP BY
                month_year
            ORDER BY
                month_year ASC;
        `, [userId]);

        const financialDataMap = new Map();

        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

        // Populate financialDataMap from all income and expense entries
        incomeRows.forEach(row => {
            const [yearStr, monthNumStr] = row.mes.split('-');
            const monthName = monthNames[parseInt(monthNumStr) - 1];
            const key = `${monthName}-${yearStr}`;
            const totalIncomeForMonth = parseFloat(row.salario || 0) + parseFloat(row.bicos || 0);

            if (financialDataMap.has(key)) {
                financialDataMap.get(key).income = totalIncomeForMonth;
            } else {
                financialDataMap.set(key, {
                    month: monthName,
                    year: parseInt(yearStr),
                    income: totalIncomeForMonth,
                    expenses: 0
                });
            }
        });

        expenseRows.forEach(row => {
            const [yearStr, monthNumStr] = row.month_year.split('-');
            const monthName = monthNames[parseInt(monthNumStr) - 1];
            const key = `${monthName}-${yearStr}`;

            if (financialDataMap.has(key)) {
                financialDataMap.get(key).expenses = parseFloat(row.total_expenses);
            } else {
                financialDataMap.set(key, {
                    month: monthName,
                    year: parseInt(yearStr),
                    income: 0, // Default income to 0 if only expenses exist for that month
                    expenses: parseFloat(row.total_expenses)
                });
            }
        });

        const result = Array.from(financialDataMap.values()).sort((a, b) => {
            if (a.year !== b.year) {
                return a.year - b.year;
            }
            return monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
        });

        res.json(result);
        await connection.end();
    } catch (error) {
        console.error('Erro ao buscar dados financeiros mensais:', error);
        res.status(500).json({ error: 'Erro ao buscar dados financeiros mensais' });
    }
});


// --- Rota para adicionar/atualizar orçamentos ---
app.post('/api/budgets', async (req, res) => {
    const { userId, categoryId, budgetedAmount, month, year } = req.body;

    if (!userId || !categoryId || budgetedAmount === undefined || month === undefined || year === undefined) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        const [spentResult] = await connection.execute(`
            SELECT COALESCE(SUM(ABS(amount)), 0) AS current_spent
            FROM transacoes
            WHERE usuario_id = ? AND category_id = ? AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ? AND amount < 0;
        `, [userId, categoryId, month, year]);

        const currentSpent = parseFloat(spentResult[0].current_spent);

        await connection.execute(`
            INSERT INTO budgets (usuario_id, category_id, budgeted, spent, month, year, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
            budgeted = VALUES(budgeted),
            spent = VALUES(spent),
            updatedAt = NOW();
        `, [userId, categoryId, budgetedAmount, currentSpent, month, year]);

        res.status(201).json({ message: 'Orçamento atualizado com sucesso' });
        await connection.end();
    } catch (error) {
        console.error('Erro ao atualizar orçamento:', error);
        res.status(500).json({ error: 'Erro ao atualizar orçamento' });
    }
});

// --- Rota para ATUALIZAR um orçamento existente (PUT) ---
app.put('/api/budgets/:id', async (req, res) => {
    const budgetId = req.params.id;
    const { userId, categoryId, budgetedAmount, month, year } = req.body;

    if (!userId || !categoryId || budgetedAmount === undefined || month === undefined || year === undefined) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando para atualização.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);

        const [spentResult] = await connection.execute(`
            SELECT COALESCE(SUM(ABS(amount)), 0) AS current_spent
            FROM transacoes
            WHERE usuario_id = ? AND category_id = ? AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ? AND amount < 0;
        `, [userId, categoryId, month, year]);

        const currentSpent = parseFloat(spentResult[0].current_spent);

        const [result] = await connection.execute(
            `
            UPDATE budgets
            SET
                category_id = ?,
                budgeted = ?,
                spent = ?,
                month = ?,
                year = ?,
                updatedAt = NOW()
            WHERE
                id = ? AND usuario_id = ?;
            `,
            [categoryId, budgetedAmount, currentSpent, month, year, budgetId, userId]
        );

        if (result.affectedRows > 0) {
            res.json({ message: 'Orçamento atualizado com sucesso!' });
        } else {
            res.status(404).json({ error: 'Orçamento não encontrado ou você não tem permissão para editá-lo.' });
        }
        await connection.end();
    } catch (error) {
        console.error('Erro ao atualizar orçamento:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar orçamento.' });
    }
});

// --- Rota para EXCLUIR um orçamento (DELETE) ---
app.delete('/api/budgets/:id', async (req, res) => {
    const budgetId = req.params.id;
    const userId = req.query.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado. userId é obrigatório para exclusão.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            `DELETE FROM budgets WHERE id = ? AND usuario_id = ?;`,
            [budgetId, userId]
        );

        if (result.affectedRows > 0) {
            res.json({ message: 'Orçamento excluído com sucesso!' });
        } else {
            res.status(404).json({ error: 'Orçamento não encontrado ou você não tem permissão para excluí-lo.' });
        }
        await connection.end();
    } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
        res.status(500).json({ error: 'Erro interno ao excluir orçamento.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});