import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Estilos usando styled-components
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  min-height: 100vh;
`;

const WelcomeTitle = styled.h2`
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const WelcomeText = styled.p`
  color: #555;
  margin-bottom: 30px;
  text-align: center;
  font-size: 1.1em;
  line-height: 1.5;
`;

const ChartContainer = styled.div`
  width: 80%;
  max-width: 600px;
  margin-bottom: 30px;
`;

const LogoutButton = styled.button`
  background-color: #dc3545;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #c82333;
}
`;

// Função placeholder para buscar os dados das despesas do seu backend
const fetchExpenses = async () => {
  // Substitua esta simulação pela sua chamada real à API
  console.log("Home: Simulando busca de dados das despesas...");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { category: 'Alimentação', value: 480 },
        { category: 'Internet', value: 100 },
        { category: 'Luz', value: 90 },
        { category: 'Lazer', value: 100 },
        { category: 'Transporte', value: 140 },
        { category: 'Saúde', value: 50 },
      ]);
    }, 1000); // Simula um pequeno delay da chamada à API
  });
};

function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expensesData, setExpensesData] = useState(null);

  useEffect(() => {
    document.title = 'Home - Wall & Tea';
    const token = localStorage.getItem('token');
    console.log("Home: Verificando token:", token);

    if (token) {
      setIsLoggedIn(true);
      console.log("Home: Usuário autenticado. Token encontrado:", token);
      // Buscar os dados das despesas APENAS se o usuário estiver logado
      fetchExpenses()
        .then((data) => {
          setExpensesData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Home: Erro ao buscar dados das despesas:", error);
          setLoading(false);
        });
    } else {
      setIsLoggedIn(false);
      setLoading(false);
      console.log("Home: Usuário não autenticado, redirecionando para /login");
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    console.log('Home: Usuário deslogado, redirecionando para /login');
    navigate('/login');
  };

  // Prepara os dados para o gráfico
  const chartData = expensesData
    ? {
      labels: expensesData.map((expense) => expense.category),
      datasets: [
        {
          label: 'Despesas por Categoria',
          data: expensesData.map((expense) => expense.value),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    }
    : null;

  if (loading) {
    return (
      <HomeContainer>
        <p>Carregando dados das despesas...</p>
      </HomeContainer>
    );
  }

  if (!isLoggedIn) {
    console.log("Home: Usuário não está logado, não renderizando conteúdo.");
    return null;
  }

  return (
    <HomeContainer>
      <WelcomeTitle>Visão Geral de Despesas</WelcomeTitle>
      <WelcomeText>
        Aqui está um resumo visual das suas despesas por categoria.
      </WelcomeText>
      {expensesData && (
        <ChartContainer>
          <Pie data={chartData} />
        </ChartContainer>
      )}
      <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
    </HomeContainer>
  );
}

export default Home;