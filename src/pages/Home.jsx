import React, { useEffect, useState } from 'react';
import { styled, createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { color } from 'chart.js/helpers';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  body {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
    display: flex;
    min-height: 100vh;
  }
  html {
    scroll-behavior: smooth;
    height: 100%;
    width: 100%;
  }
  #root {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 0;
    max-width: 100%;
  }
`;

const Navbar = styled.nav`
  background-color: #108886;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 10;
  margin-bottom: 0;
`;

const NavLinks = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  width: 100%;
`;

const NavItem = styled.span`
  color: #CACACA;
  margin: 0 20px;
  text-decoration: none;
  cursor: pointer;
  position: relative;
  padding: 10px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #FFFFFF;
    z-index: -1;
    opacity: 0;
    border-radius: 10px;
    transition: opacity 0.3s ease-in-out;
  }

  &:hover::before {
    opacity: 1;
    border-radius: 10px;
  }

  &.active {
    background-color: #FFFFFF;
    color: #0D4147;
    border-radius: 10px;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;
  padding: 20px;
`;

const Charts = styled.div`
    width: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px
`;

const Saldo = styled.div`
  width: 100%;
  text-align: left;
  background-color: #108886;
  color: #FFFFFF;
  padding: 10px;
  border-radius: 30px;
  box-shadow: 6px 7px 6px -4px rgba(0,0,0,0.75);
`;

const Barras = styled.div`
    width: 40%;
    height: 100%;
`;

const Progresso = styled.div`
    width: 60%;
    height: 100%; 
`;

const Financeiro = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 20px;
`;

const Receitas = styled.div`
  text-align: left;
  background-color: #108886;
  color: #FFFFFF;
  padding: 10px;
  border-radius: 30px;
  box-shadow: 6px 7px 6px -4px rgba(0,0,0,0.75);
`;

const Despesas = styled.div`
  text-align: left;
  background-color: #DA4141;
  color: #FFFFFF;
  padding: 10px;
  border-radius: 30px;
  box-shadow: 6px 7px 6px -4px rgba(0,0,0,0.75);
`;

const HomeContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 100vh;
`;

const ChartContainer = styled.div`
    padding: 50px;
    width: 100%;
    height: 100%;
    max-height: 400px;
    box-shadow: 6px 7px 6px -4px rgba(0,0,0,0.75);
    border-radius: 30px;
    text-align: left;
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

const fetchExpenses = async (userId) => {
  console.log("Home: Buscando dados das despesas e saldo da API...");
  try {
    // Busca despesas
    const expensesResponse = await fetch(`http://localhost:3000/api/expenses?userId=${userId}`);
    if (!expensesResponse.ok) {
      throw new Error(`HTTP error! status: ${expensesResponse.status}`);
    }
    const expensesData = await expensesResponse.json();
    const formattedExpensesData = expensesData.map(item => ({
      category: item.category,
      value: item.total_spent
    }));

    return formattedExpensesData;
  } catch (error) {
    console.error("Home: Erro ao buscar dados da API:", error);
    throw error;
  }
};

const fetchUserSaldo = async (userId) => {
  try {
    const userResponse = await fetch(`http://localhost:3000/api/user/${userId}`);
    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user data: ${userResponse.status}`);
    }
    const userData = await userResponse.json();
    return userData.saldo; // Assumindo que a API retorna { id, nome, email, saldo }
  } catch (error) {
    console.error("Error fetching user saldo:", error);
    throw error;
  }
};


const fetchBudgets = async () => {
  console.log("Home: Buscando dados dos orçamentos da API...");
  try {
    const response = await fetch('http://localhost:3000/api/budgets'); // Rota da API para budgets
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Dados recebidos da API (Budgets):", data); // Log para debug
    return data;
  } catch (error) {
    console.error("Home: Erro ao buscar dados dos orçamentos da API (Budgets):", error);
    throw error;
  }
};

function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expensesData, setExpensesData] = useState(null);
  const [budgetsData, setBudgetsData] = useState(null); // Novo estado para os dados de orçamento
  const [activeSection, setActiveSection] = useState('inicio');
  const [saldo, setSaldo] = useState(null);
  const userId = localStorage.getItem('userId');


  useEffect(() => {
    document.title = 'Home - Wall & Tea';
    const token = localStorage.getItem('token');
    console.log("Home: Verificando token:", token);

    if (token && userId) {
      setIsLoggedIn(true);
      console.log("Home: Usuário autenticado. Token encontrado:", token);

      // Buscar dados
      Promise.all([
        fetchExpenses(userId),
        fetchBudgets(),
        fetchUserSaldo(userId), // Busca o saldo do usuário
      ])
        .then(([expenses, budgets, saldoData]) => {
          setExpensesData(expenses);
          setBudgetsData(budgets);
          setSaldo(saldoData); // Atualiza o estado com o saldo
          setLoading(false);
        })
        .catch((error) => {
          console.error("Home: Erro ao buscar dados:", error);
          setLoading(false);
        });
    } else {
      setIsLoggedIn(false);
      setLoading(false);
      console.log("Home: Usuário não autenticado, redirecionando para /login");
      navigate('/login');
    }
  }, [navigate, userId]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    console.log('Home: Usuário deslogado, redirecionando para /login');
    navigate('/login');
  };

  const expensesChartData = expensesData
    ? {
      labels: expensesData.map((expense) => expense.category),
      datasets: [
        {
          data: expensesData.map((expense) => expense.value),
          backgroundColor: [
            'rgba(102, 170, 223, 0.8)',
            'rgba(56, 204, 201, 0.8)',
            'rgba(67, 200, 236, 0.8)',
            'rgba(145, 70, 149, 0.8)',
            'rgba(119, 98, 166, 0.8)',
            'rgba(107, 130, 187, 0.8)',
          ],
          borderColor: [
            'rgba(38, 194, 129, 1)',
            'rgba(33, 150, 243, 1)',
            'rgba(100, 181, 246, 1)',
            'rgba(156, 39, 176, 1)',
            'rgba(103, 58, 183, 1)',
            'rgba(142, 36, 170, 1)',
          ],
          borderWidth: 1,
        },
      ],
    }
    : null;

  const expensesChartOptions = {
    indexAxis: 'x',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        title: {
          display: true,
        },
        grid: {
          display: false,
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    }
  };

  const budgetsChartData = budgetsData
    ? {
      labels: budgetsData.map(budget => budget.category_name),
      datasets: [
        {
          label: 'Orçado',
          data: budgetsData.map(budget => budget.budgeted),
          backgroundColor: 'rgba(99, 212, 218, 0.5)',
          borderColor: 'rgba(99, 212, 218, 1)',
          borderWidth: 1,
        },
        {
          label: 'Gasto',
          data: budgetsData.map(budget => budget.spent),
          backgroundColor: 'rgba(99, 197, 218, 0.8)',
          borderColor: 'rgba(99, 197, 218, 1)',
          borderWidth: 1,
        },
      ],
    }
    : null;

  const budgetsChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
        },
        grid: {
          display: false,
        },
        ticks: {
          display: false // Esta linha remove os números do eixo X
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
        },
        grid: {
          display: false,
        },
        ticks: {
          display: false // Esta linha remove os números do eixo X
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Status dos Orçamentos',
        color: '#108886',
        font: {
          size: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
      legend: {
        display: false,
      },
    },
  };



  if (loading) {
    return (
      <HomeContainer>
        <p>Carregando dados...</p>
      </HomeContainer>
    );
  }

  if (!isLoggedIn) {
    console.log("Home: Usuário não está logado, não renderizando conteúdo.");
    return null;
  }

  const handleNavClick = (section) => {
    setActiveSection(section);
  };

  return (
    <>
      <GlobalStyle />
      <HomeContainer>
        <Navbar>
          <NavLinks>
            <NavItem
              onClick={() => handleNavClick('inicio')}
              className={activeSection === 'inicio' ? 'active' : ''}
            >
              Página Inicial
            </NavItem>
            <NavItem
              onClick={() => handleNavClick('relatorios')}
              className={activeSection === 'relatorios' ? 'active' : ''}
            >
              Relatórios
            </NavItem>
            <NavItem
              onClick={() => handleNavClick('transacoes')}
              className={activeSection === 'transacoes' ? 'active' : ''}
            >
              Transações
            </NavItem>
            <NavItem
              onClick={() => handleNavClick('orcamentos')}
              className={activeSection === 'orcamentos' ? 'active' : ''}
            >
              Orçamentos
            </NavItem>
          </NavLinks>
        </Navbar>
        <MainContent>
          <Charts>
            <Barras>
              <Saldo>
                {saldo !== null && (
                  <p>Saldo Atual: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}</p>
                )}
              </Saldo>
              {expensesData && (
                <ChartContainer>
                  <Bar data={expensesChartData} options={expensesChartOptions} />
                </ChartContainer>
              )}
            </Barras>
            <Progresso>
              <Financeiro>
                <Receitas>
                  {saldo !== null && (
                    <p>Receitas: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}</p>
                  )}
                </Receitas>
                <Despesas>
                  {saldo !== null && (
                    <p>Despesas: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}</p>
                  )}
                </Despesas>
              </Financeiro>
              {budgetsData && (
                <ChartContainer>
                  <h3>Status dos Orçamentos</h3>
                  <Bar data={budgetsChartData} options={budgetsChartOptions} />
                </ChartContainer>
              )}
            </Progresso>
          </Charts>
        </MainContent>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </HomeContainer>
    </>
  );
}

export default Home;