module.exports = (sequelize, Sequelize) => {
  const Expense = sequelize.define("expense", {
    category: {
      type: Sequelize.STRING,
    },
    value: {
      type: Sequelize.FLOAT,
    },
    createdAt: {       // Adicionado createdAt
      type: Sequelize.DATE,
    },
    updatedAt: {       // Adicionado updatedAt
      type: Sequelize.DATE,
    },
  }, {
    tableName: "expenses",
  });

  return Expense;
};