const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Supondo que você tenha uma rota de autenticação

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes); // Defina suas rotas

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
