const db = require("../models");

exports.getAll = async (req, res) => {
  try {
    const data = await db.expenses.findAll();
    const response = data.map(item => ({
      name: item.category,
      value: item.value
    }));
    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar despesas:", error.message); // <- Log no console
    res.status(500).json({ error: "Erro ao buscar despesas." });
  }
};
