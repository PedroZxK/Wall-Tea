const express = require('express');
const cors = require('cors'); // Importe o middleware cors
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Use o middleware cors para permitir todas as origens (para desenvolvimento)
app.use(express.json()); // Para que o backend possa entender o JSON que o frontend envia

app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
