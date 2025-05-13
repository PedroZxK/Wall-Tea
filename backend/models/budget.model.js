module.exports = (sequelize, Sequelize) => {
  const Budget = sequelize.define("budget", {
    category: {
      type: Sequelize.STRING,
    },
    budgeted: {
      type: Sequelize.FLOAT,
    },
    spent: {
      type: Sequelize.FLOAT,
    },
    createdAt: {       // Adicionado createdAt
        type: Sequelize.DATE,
    },
    updatedAt: {       // Adicionado updatedAt
        type: Sequelize.DATE,
    },
  }, {
    tableName: "budgets",
  });

  return Budget;
};