import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const HomeContainer = styled.div`
  padding: 20px;
  min-height: 100vh;
  background-color: #f4f4f4;
`;

const DashboardSection = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0px 3px 6px rgba(0,0,0,0.1);
  margin-bottom: 30px;
`;

const ChartContainer = styled.div`
  height: 300px;
`;

const BudgetItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const BudgetCategory = styled.div`
  width: 120px;
  font-weight: bold;
`;

const ProgressBarContainer = styled.div`
  flex: 1;
  height: 10px;
  background-color: #ddd;
  border-radius: 5px;
  overflow: hidden;
  margin: 0 10px;
`;

const ProgressBar = styled.div`
  height: 100%;
  background-color: teal;
`;

const BudgetValues = styled.div`
  width: 150px;
  text-align: right;
`;

const LogoutButton = styled.button`
  padding: 10px 20px;
  background-color: #e53935;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
`;

function Home() {
  const navigate = useNavigate();
  const [expensesData, setExpensesData] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchExpenses = async () => {
      try {
        const res = await fetch('/api/expenses'); // Correct URL
        if (!res.ok) {
          throw new Error(`Failed to fetch expenses: ${res.status}`);
        }
        const data = await res.json();
        setExpensesData(data);
      } catch (err) {
        console.error('Erro ao buscar gastos:', err);
      }
    };

    const fetchBudgets = async () => {
      try {
        const res = await fetch('/api/budgets'); // Correct URL
         if (!res.ok) {
          throw new Error(`Failed to fetch budgets: ${res.status}`);
        }
        const data = await res.json();
        setBudgetStatus(data);
      } catch (err) {
        console.error('Erro ao buscar orçamentos:', err);
      }
    };

    fetchExpenses();
    fetchBudgets();
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <HomeContainer>Carregando...</HomeContainer>;

  return (
    <HomeContainer>
      <DashboardSection>
        <h2>Gastos por Categoria</h2>
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expensesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Gasto (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </DashboardSection>

      <DashboardSection>
        <h2>Status dos Orçamentos</h2>
        {budgetStatus.map((item, index) => {
          const percent = item.budgeted > 0 ? (item.spent / item.budgeted) * 100 : 0;
          return (
            <BudgetItem key={index}>
              <BudgetCategory>{item.category}</BudgetCategory>
              <ProgressBarContainer>
                <ProgressBar style={{ width: `${percent}%` }} />
              </ProgressBarContainer>
              <BudgetValues>
                R${item.spent.toFixed(2)} / R${item.budgeted.toFixed(2)}
              </BudgetValues>
            </BudgetItem>
          );
        })}
      </DashboardSection>

      <LogoutButton onClick={handleLogout}>Sair</LogoutButton>
    </HomeContainer>
  );
}

export default Home;
