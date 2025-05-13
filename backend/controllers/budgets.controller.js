const db = require("../models");

exports.getAll = async (req, res) => {
  try {
    const data = await db.budgets.findAll();
    res.json(data);
  } catch (error) {
    console.error("Erro ao buscar orçamentos:", error.message);
    res.status(500).json({ error: "Erro ao buscar orçamentos." });
  }
};
