import React, { useEffect, useState } from 'react';
import { styled, createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Bar, Line, Pie } from 'react-chartjs-2'; // Importe Line e Pie
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    ArcElement, // Necessário para gráficos de setor
    LineElement, // Necessário para gráficos de linha
    PointElement, // Necessário para pontos em gráficos de linha
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import TransactionTable from './TransactionTable';
import { nav } from 'framer-motion/client';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels, ArcElement, LineElement, PointElement); // Registre os novos elementos

// --- Global Styles and Styled Components ---
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
        background-color: #f0f2f5; /* Light background for better contrast */
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
    justify-content: flex-start; /* Alinha o conteúdo ao topo */
    width: 100%;
    overflow: hidden;
    padding: 20px;
`;

const HomeContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 100vh;
    width: 100%;
`;

// Novo contêiner para a linha superior (Saldo, Receitas, Despesas)
const TopRow = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-around;
    gap: 20px;
    margin-bottom: 20px;
    flex-wrap: wrap; /* Permite quebrar em telas menores */

    @media (min-width: 769px) {
        flex-wrap: nowrap;
        justify-content: space-between; /* Alinha bem nas laterais */
    }
`;

const Saldo = styled.div`
    flex: 1; /* Permite que ocupe o espaço disponível */
    min-width: 300px; /* Largura mínima para o Saldo */
    text-align: left;
    background-color: #108886;
    color: #FFFFFF;
    padding: 15px 20px;
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    font-size: 1.2em;
    display: flex;
    align-items: center;
    justify-content: center; /* Centraliza o texto verticalmente */
    height: 100%; /* Ajusta a altura flexivelmente */

    @media (max-width: 768px) {
        width: 100%;
        flex: none; /* Desativa o flex para ocupar 100% */
    }
`;

// Contêiner para Receitas e Despesas
const Financeiro = styled.div`
    flex: 1; /* Permite que ocupe o espaço disponível */
    min-width: 300px; /* Largura mínima para Receitas/Despesas */
    display: flex;
    flex-direction: column; /* Coloca Receitas e Despesas uma em cima da outra */
    gap: 20px;
    height: 100%; /* Ocupa a altura total disponível dentro de TopRow */

    @media (max-width: 768px) {
        width: 100%;
        flex: none; /* Desativa o flex para ocupar 100% */
    }
`;

const Receitas = styled.div`
    text-align: left;
    background-color: #108886;
    color: #FFFFFF;
    padding: 15px 20px;
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    flex: 1; /* Permite que ocupe o espaço disponível dentro do Financeiro */
    min-width: 150px;
    font-size: 1.1em;
`;

const Despesas = styled.div`
    text-align: left;
    background-color: #DA4141;
    color: #FFFFFF;
    padding: 15px 20px;
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    flex: 1; /* Permite que ocupe o espaço disponível dentro do Financeiro */
    min-width: 150px;
    font-size: 1.1em;
`;

// Contêiner para os dois gráficos
const Charts = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: flex-start; /* Alinha os gráficos ao topo se tiverem alturas diferentes */
    gap: 20px;
    margin-bottom: 20px;
    flex-wrap: wrap;

    @media (min-width: 769px) {
        flex-wrap: nowrap;
        justify-content: space-around;
    }
`;

const ChartWrapper = styled.div`
    flex: 1; /* Permite que ocupe o espaço disponível */
    min-width: 45%; /* Garante que ocupe quase metade, com espaço para gap */
    max-width: 50%; /* Limita a largura máxima */
    display: flex;
    flex-direction: column;
    gap: 20px;
    @media (max-width: 768px) {
        width: 100%;
        max-width: 100%;
    }
`;

const ChartContainer = styled.div`
    padding: 20px;
    width: 100%;
    height: 400px; /* Altura fixa para ambos os gráficos */
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    border-radius: 15px;
    text-align: left;
    background-color: #FFFFFF;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const LogoutButton = styled.button`
    background-color: #dc3545;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s ease, transform 0.2s ease;
    margin-top: 30px;
    margin-bottom: 20px;

    &:hover {
        background-color: #c82333;
        transform: translateY(-2px);
    }
    &:active {
        transform: translateY(0);
    }
`;

const TransactionTableWrapper = styled.div`
    width: 100%;
    max-width: 1000px; /* Keeps your max-width */
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    border-radius: 15px;
    background-color: #FFFFFF;
    padding: 20px;
    margin: 20px auto; /* This is key for centering and adding vertical space */
    display: flex; /* Added to potentially help with inner centering if needed */
    justify-content: center; /* Centers content horizontally within this wrapper */
`;

const chartColors = [
    'rgba(102, 170, 223, 0.8)', // Light Blue
    'rgba(56, 204, 201, 0.8)',  // Teal
    'rgba(67, 200, 236, 0.8)',  // Sky Blue
    'rgba(145, 70, 149, 0.8)',  // Purple
    'rgba(119, 98, 166, 0.8)',  // Lavender
    'rgba(107, 130, 187, 0.8)', // Steel Blue
    'rgba(255, 159, 64, 0.8)',  // Orange
    'rgba(75, 192, 192, 0.8)',  // Green
    'rgba(153, 102, 255, 0.8)', // Medium Purple
    'rgba(255, 99, 132, 0.8)',  // Red
];

// --- Novos Styled Components para a página de Relatórios ---
const ReportsContent = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1200px; /* Largura máxima para a página de relatórios */
    padding: 20px;
    gap: 20px;
    align-items: center;
`;

const ReportsTitle = styled.h2`
    text-align: center;
    color: #0D4147;
    margin-bottom: 30px;
    font-size: 2em;
    width: 100%;
`;

const ReportsGrid = styled.div`
    display: flex;
    flex-wrap: wrap; /* Permite quebrar em telas menores */
    width: 100%;
    gap: 20px;
    justify-content: center; /* Centraliza as colunas */
    align-items: flex-start; /* Alinha as colunas pelo topo */
`;

const LeftReportsColumn = styled.div`
    flex: 1;
    min-width: 300px;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    @media (max-width: 768px) {
        width: 100%;
        max-width: 100%;
    }
`;

const RightReportsColumn = styled.div`
    flex: 2; /* Ocupa o dobro de espaço da coluna esquerda */
    min-width: 600px;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    @media (max-width: 768px) {
        width: 100%;
        min-width: unset; /* Remove min-width para mobile */
        max-width: 100%;
    }
`;

const PieChartContainer = styled(ChartContainer)`
    height: 350px; /* Altura específica para gráficos de pizza */
    justify-content: flex-start; /* Alinha título ao topo */
    padding-top: 10px;

    canvas {
        margin-top: 10px;
    }
`;

const LineChartContainer = styled(ChartContainer)`
    height: 450px; /* Altura para gráfico de linha */
    justify-content: flex-start;
    padding-top: 10px;
`;

const MonthlyDataTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    background-color: #FFFFFF;
    border-radius: 15px;
    overflow: hidden; /* Garante que o border-radius funcione */
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);

    th, td {
        border: 1px solid #ddd;
        padding: 12px;
        text-align: left;
    }

    th {
        background-color: #108886;
        color: white;
        font-weight: bold;
    }

    tr:nth-child(even) {
        background-color: #f2f2f2;
    }

    tr:hover {
        background-color: #e0e0e0;
    }

    td:last-child {
        text-align: right; /* Alinha valores monetários à direita */
    }
`;

const ChartLegend = styled.div`
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 10px;
    font-weight: bold;
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`;

const LegendColorBox = styled.span`
    width: 20px;
    height: 20px;
    background-color: ${props => props.color};
    border-radius: 4px;
`;


// --- Fetch Functions (mantidas iguais, não inseridas para brevidade, mas devem estar no arquivo) ---
const fetchTransactions = async (userId) => {
    console.log("Home: Buscando dados das transações da API para o usuário:", userId);
    try {
        const transactionsResponse = await fetch(`http://localhost:3000/api/transactions?userId=${userId}`);
        if (!transactionsResponse.ok) {
            throw new Error(`HTTP error! status: ${transactionsResponse.status}`);
        }
        const transactionsData = await transactionsResponse.json();
        console.log("Dados recebidos da API (Transações):", transactionsData);
        return transactionsData;
    } catch (error) {
        console.error("Home: Erro ao buscar dados das transações da API:", error);
        throw error;
    }
};

const fetchUserSaldo = async (userId) => {
    console.log("Home: Buscando saldo do usuário:", userId);
    try {
        const userResponse = await fetch(`http://localhost:3000/api/user/${userId}`);
        if (!userResponse.ok) {
            throw new Error(`Failed to fetch user data: ${userResponse.status}`);
        }
        const userData = await userResponse.json();
        console.log("Saldo do usuário recebido:", userData.saldo);
        return userData.saldo;
    } catch (error) {
        console.error("Error fetching user saldo:", error);
        throw error;
    }
};

const fetchBudgets = async (userId) => {
    console.log("Home: Buscando dados dos orçamentos da API para o usuário:", userId);
    try {
        const response = await fetch(`http://localhost:3000/api/budgets?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Dados recebidos da API (Budgets):", data);
        return data;
    } catch (error) {
        console.error("Home: Erro ao buscar dados dos orçamentos da API (Budgets):", error);
        throw error;
    }
};

// --- Novas funções de Fetch simuladas para Relatórios ---
// Em um cenário real, você buscaria esses dados do backend
const fetchMonthlyData = async (userId) => {
    console.log("Home: Buscando dados mensais para relatórios para o usuário:", userId);
    // Dados simulados para receitas e despesas mensais
    const monthlyData = [
        { month: 'Jan', income: 3000, expenses: 1500 },
        { month: 'Fev', income: 3200, expenses: 1800 },
        { month: 'Mar', income: 2800, expenses: 1600 },
        { month: 'Abr', income: 3500, expenses: 2000 },
        { month: 'Mai', income: 3100, expenses: 1700 },
        { month: 'Jun', income: 3300, expenses: 1900 },
        { month: 'Jul', income: 2900, expenses: 1650 },
        { month: 'Ago', income: 3600, expenses: 2100 },
        { month: 'Set', income: 3400, expenses: 1850 },
        { month: 'Out', income: 3700, expenses: 2200 },
        { month: 'Nov', income: 3000, expenses: 1750 },
        { month: 'Dez', income: 3800, expenses: 2300 },
    ];
    return new Promise(resolve => setTimeout(() => resolve(monthlyData), 500));
};

const fetchIncomeSources = async (userId) => {
    console.log("Home: Buscando dados de fontes de renda para o usuário:", userId);
    // Dados simulados para fontes de renda
    const incomeSources = [
        { source: 'Trabalho Atual', value: 7000 },
        { source: 'Bicos', value: 3000 },
    ];
    return new Promise(resolve => setTimeout(() => resolve(incomeSources), 500));
};


function Home() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expensesData, setExpensesData] = useState([]);
    const [budgetsChartDisplayData, setBudgetsChartDisplayData] = useState([]);
    const [activeSection, setActiveSection] = useState('inicio');
    const [saldo, setSaldo] = useState(null);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    // Novos estados para dados de relatórios
    const [monthlyFinancialData, setMonthlyFinancialData] = useState([]);
    const [incomeSourcesData, setIncomeSourcesData] = useState([]);

    const userId = localStorage.getItem('userId');


    useEffect(() => {
        document.title = 'Home - Wall & Tea';
        const token = localStorage.getItem('token');
        console.log("Home: Verificando token:", token);

        if (token && userId) {
            setIsLoggedIn(true);
            console.log("Home: Usuário autenticado. Token encontrado:", token);

            // Fetch all data necessary for Home and Reports
            Promise.all([
                fetchTransactions(userId),
                fetchBudgets(userId),
                fetchUserSaldo(userId),
                fetchMonthlyData(userId), // Nova busca
                fetchIncomeSources(userId), // Nova busca
            ])
                .then(([transactions, budgets, saldoData, monthlyData, incomeSources]) => {
                    console.log("Dados Transactions brutos:", transactions);
                    console.log("Dados Budgets brutos:", budgets);
                    console.log("Saldo do usuário:", saldoData);
                    console.log("Dados Mensais:", monthlyData);
                    console.log("Dados Fontes de Renda:", incomeSources);

                    // Processa transações para o gráfico de despesas e totais de receita/despesa
                    const categoryTotals = transactions.reduce((acc, transaction) => {
                        // Certifique-se de que category_name existe, caso contrário use 'Outros'
                        const categoryName = transaction.category_name || 'Outros';
                        const amount = parseFloat(transaction.amount) || 0;

                        if (amount > 0) {
                            acc.income += amount;
                        } else {
                            acc.expenses += Math.abs(amount);
                        }

                        if (!acc.categories[categoryName]) {
                            acc.categories[categoryName] = 0;
                        }
                        acc.categories[categoryName] += Math.abs(amount);
                        return acc;
                    }, { income: 0, expenses: 0, categories: {} });

                    setTotalIncome(categoryTotals.income);
                    setTotalExpenses(Math.abs(categoryTotals.expenses));

                    const formattedExpensesData = Object.entries(categoryTotals.categories).map(([category, total]) => ({
                        category,
                        value: total,
                    }));
                    setExpensesData(formattedExpensesData);

                    // --- Lógica para o gráfico de Orçamentos (direita) ---
                    const combinedBudgetsAndExpensesMap = new Map();

                    budgets.forEach(budget => {
                        const categoryName = budget.category_name;
                        combinedBudgetsAndExpensesMap.set(categoryName, {
                            category_name: categoryName,
                            budgeted: parseFloat(budget.budgeted_amount) || 0,
                            spent: 0,
                        });
                    });

                    formattedExpensesData.forEach(expense => {
                        const categoryName = expense.category;
                        if (combinedBudgetsAndExpensesMap.has(categoryName)) {
                            const existing = combinedBudgetsAndExpensesMap.get(categoryName);
                            existing.spent = expense.value;
                            combinedBudgetsAndExpensesMap.set(categoryName, existing);
                        } else {
                            // Se há uma despesa para uma categoria não orçada, ainda a inclua
                            combinedBudgetsAndExpensesMap.set(categoryName, {
                                category_name: categoryName,
                                budgeted: 0,
                                spent: expense.value,
                            });
                        }
                    });

                    const relevantBudgetsData = Array.from(combinedBudgetsAndExpensesMap.values())
                        .filter(item => item.budgeted > 0 || item.spent > 0); // Filtra para mostrar apenas categorias com orçamento ou gasto

                    setBudgetsChartDisplayData(relevantBudgetsData);
                    setSaldo(saldoData);

                    // Set state for new reports data
                    setMonthlyFinancialData(monthlyData);
                    setIncomeSourcesData(incomeSources);

                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Home: Erro GERAL ao buscar ou processar dados:", error);
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
        localStorage.removeItem('userId');
        setIsLoggedIn(false);
        console.log('Home: Usuário deslogado, redirecionando para /login');
        navigate('/login');
    };

    // --- Dados e Opções para o Gráfico de Despesas (Gráfico Esquerdo - Home) ---
    const expensesChartData = {
        labels: expensesData.map((expense) => expense.category),
        datasets: [
            {
                data: expensesData.map((expense) => expense.value),
                backgroundColor: chartColors.slice(0, expensesData.length),
                borderColor: chartColors.slice(0, expensesData.length).map(color => color.replace('0.8', '1')),
                borderWidth: 1,
            },
        ],
    };

    const expensesChartOptions = {
        indexAxis: 'x',
        responsive: true,
        maintainAspectRatio: false,
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
            },
            datalabels: {
                display: true,
                anchor: 'end',
                align: 'top',
                formatter: function(value) {
                    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
                },
                color: '#0D4147',
                font: {
                    weight: 'bold',
                    size: 12
                },
                offset: 5
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Valor (BRL)',
                    padding: { top: 10, bottom: 0 },
                    font: { size: 14 }
                },
                ticks: {
                    padding: 10,
                    callback: function(value) {
                        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
                    }
                },
                grid: {
                    drawBorder: false
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Categoria',
                    padding: { top: 10, bottom: 0 },
                    font: { size: 14 }
                },
                grid: {
                    display: false,
                },
                ticks: {
                    padding: 5,
                    font: { size: 12 }
                }
            }
        },
        layout: {
            padding: {
                top: 20,
                bottom: 20,
                left: 10,
                right: 10
            }
        }
    };

    // --- Dados e Opções para o Gráfico de Orçamentos (Gráfico Direito - Home) ---
    const budgetsChartData = {
        labels: budgetsChartDisplayData.map(budget => budget.category_name),
        datasets: [
            {
                label: 'Gasto',
                data: budgetsChartDisplayData.map(budget => budget.spent),
                backgroundColor: budgetsChartDisplayData.map(budget => {
                    return budget.spent <= budget.budgeted ? 'rgba(67, 236, 172, 0.8)' : 'rgba(255, 99, 132, 0.8)';
                }),
                borderColor: budgetsChartDisplayData.map(budget => {
                    return budget.spent <= budget.budgeted ? 'rgba(67, 236, 172, 1)' : 'rgba(255, 99, 132, 1)';
                }),
                borderWidth: 1,
                barPercentage: 0.8,
                categoryPercentage: 0.8,
            },
        ],
    };

    const budgetsChartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Status dos Orçamentos',
                color: '#108886',
                font: {
                    size: 20,
                    weight: 'bold'
                },
                padding: { top: 10, bottom: 20 }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const dataIndex = context.dataIndex;
                        const budgeted = budgetsChartDisplayData[dataIndex]?.budgeted || 0;
                        const spent = budgetsChartDisplayData[dataIndex]?.spent || 0;
                        const remaining = budgeted - spent;

                        let label = `Gasto: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(spent)}`;
                        label += `\nOrçado: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budgeted)}`;
                        label += `\nRestante: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remaining)}`;
                        return label;
                    },
                },
            },
            legend: {
                display: false,
            },
            datalabels: {
                display: true,
                anchor: 'end',
                align: 'end',
                formatter: function(value, context) {
                    const dataIndex = context.dataIndex;
                    const budgeted = budgetsChartDisplayData[dataIndex]?.budgeted || 0;
                    const spent = budgetsChartDisplayData[dataIndex]?.spent || 0;
                    return `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(spent)} / ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budgeted)}`;
                },
                color: '#0D4147',
                font: {
                    weight: 'bold',
                    size: 12
                },
                padding: { left: 5 }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Valor (BRL)',
                    padding: { top: 10, bottom: 0 },
                    font: { size: 14 }
                },
                ticks: {
                    callback: function(value) {
                        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
                    },
                    padding: 10,
                    font: { size: 12 }
                },
                grid: {
                    display: false,
                },
                afterFit: (scale) => {
                    const maxBudgetedOrSpent = Math.max(...budgetsChartDisplayData.map(b => b.budgeted || 0), ...budgetsChartDisplayData.map(b => b.spent || 0));
                    scale.max = maxBudgetedOrSpent > 0 ? maxBudgetedOrSpent * 1.2 : 100;
                }
            },
            y: {
                title: {
                    display: false,
                },
                grid: {
                    display: false,
                },
                ticks: {
                    display: true,
                    padding: 15,
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                position: 'left',
                beginAtZero: false,
            },
        },
        layout: {
            padding: {
                top: 20,
                bottom: 20,
                left: 10,
                right: 60
            }
        }
    };

    // --- Dados e Opções para Gráfico de Setor (Categorias - Relatórios) ---
    const categoryPieChartData = {
        labels: expensesData.map(expense => expense.category),
        datasets: [{
            data: expensesData.map(expense => expense.value),
            backgroundColor: chartColors.slice(0, expensesData.length),
            borderColor: chartColors.slice(0, expensesData.length).map(color => color.replace('0.8', '1')),
            borderWidth: 1,
        }]
    };

    const categoryPieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    font: {
                        size: 12,
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}`;
                    }
                }
            },
            datalabels: {
                display: true,
                color: '#fff', // Cor branca para os labels
                formatter: (value, context) => {
                    const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                    const percentage = (value / total * 100).toFixed(1) + '%';
                    return percentage;
                },
                font: {
                    weight: 'bold',
                    size: 12
                },
                textShadowBlur: 2,
                textShadowColor: 'rgba(0,0,0,0.8)'
            }
        }
    };

    // --- Dados e Opções para Gráfico de Setor (Fontes de Renda - Relatórios) ---
    const incomeSourcesPieChartData = {
        labels: incomeSourcesData.map(source => source.source),
        datasets: [{
            data: incomeSourcesData.map(source => source.value),
            backgroundColor: ['#4CAF50', '#FFC107'], // Verde para Trabalho Atual, Amarelo para Bicos
            borderColor: ['#388E3C', '#FFA000'],
            borderWidth: 1,
        }]
    };

    const incomeSourcesPieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    font: {
                        size: 12,
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}`;
                    }
                }
            },
            datalabels: {
                display: true,
                color: '#fff',
                formatter: (value, context) => {
                    const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                    const percentage = (value / total * 100).toFixed(1) + '%';
                    return percentage;
                },
                font: {
                    weight: 'bold',
                    size: 12
                },
                textShadowBlur: 2,
                textShadowColor: 'rgba(0,0,0,0.8)'
            }
        }
    };

    // --- Dados e Opções para Gráfico de Linhas Comparativas (Receitas vs. Despesas Mensais - Relatórios) ---
    const monthlyLineChartData = {
        labels: monthlyFinancialData.map(data => data.month),
        datasets: [
            {
                label: 'Receitas',
                data: monthlyFinancialData.map(data => data.income),
                borderColor: '#4CAF50', // Verde para receitas
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                fill: false,
                tension: 0.3,
                pointBackgroundColor: '#4CAF50',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
            },
            {
                label: 'Despesas',
                data: monthlyFinancialData.map(data => data.expenses),
                borderColor: '#F44336', // Vermelho para despesas
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                fill: false,
                tension: 0.3,
                pointBackgroundColor: '#F44336',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
            },
        ],
    };

    const monthlyLineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // Usaremos uma legenda personalizada
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
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
            },
            datalabels: {
                display: false, // Desabilitar datalabels para o gráfico de linha para não poluir
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Mês',
                    font: { size: 14 }
                },
                grid: {
                    display: false,
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Valor (BRL)',
                    font: { size: 14 }
                },
                ticks: {
                    callback: function(value) {
                        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
                    }
                }
            }
        },
        layout: {
            padding: {
                top: 20,
                bottom: 20,
                left: 10,
                right: 10
            }
        }
    };

    // --- Dados e Opções para Gráfico de Receita (R$/mês) ---
    const monthlyIncomeChartData = {
        labels: monthlyFinancialData.map(data => data.month),
        datasets: [
            {
                label: 'Receita (R$/mês)',
                data: monthlyFinancialData.map(data => data.income),
                borderColor: '#108886', // Cor do teal
                backgroundColor: 'rgba(16, 136, 134, 0.2)',
                fill: true, // Preenche a área abaixo da linha
                tension: 0.4, // Curva da linha
                pointBackgroundColor: '#108886',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
            },
        ],
    };

    const monthlyIncomeChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
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
            },
            datalabels: {
                display: false, // Desabilitar datalabels
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Mês',
                    font: { size: 14 }
                },
                grid: {
                    display: false,
                }
            },
            y: {
                beginAtZero: true,
                max: 5000, // Ajuste o valor máximo do eixo Y
                title: {
                    display: true,
                    text: 'Receita (BRL)',
                    font: { size: 14 }
                },
                ticks: {
                    callback: function(value) {
                        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
                    }
                }
            }
        },
        layout: {
            padding: {
                top: 20,
                bottom: 20,
                left: 10,
                right: 10
            }
        }
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
                    {activeSection === 'inicio' && (
                        <>
                            {/* Nova linha para Saldo, Receitas e Despesas */}
                            <TopRow>
                                {saldo !== null && (
                                    <Saldo>
                                        <p>Saldo Atual: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}</p>
                                    </Saldo>
                                )}
                                <Financeiro>
                                    <Receitas>
                                        <p>Receitas: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}</p>
                                    </Receitas>
                                    <Despesas>
                                        <p>Despesas: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpenses)}</p>
                                    </Despesas>
                                </Financeiro>
                            </TopRow>

                            {/* Contêiner dos dois gráficos */}
                            <Charts>
                                <ChartWrapper> {/* Envolve o ChartContainer para gerenciar flex */}
                                    {expensesData && (
                                        <ChartContainer>
                                            <h3>Despesas por Categoria</h3>
                                            <Bar data={expensesChartData} options={expensesChartOptions} />
                                        </ChartContainer>
                                    )}
                                </ChartWrapper>

                                <ChartWrapper> {/* Envolve o ChartContainer para gerenciar flex */}
                                    {budgetsChartDisplayData.length > 0 && (
                                        <ChartContainer>
                                            <Bar data={budgetsChartData} options={budgetsChartOptions} />
                                        </ChartContainer>
                                    )}
                                    {budgetsChartDisplayData.length === 0 && (
                                        <ChartContainer style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: '#666' }}>
                                            <p>Nenhum orçamento ou despesa registrada para exibir neste gráfico.</p>
                                            <p>Crie um orçamento ou registre uma transação para ver os dados aqui!</p>
                                        </ChartContainer>
                                    )}
                                </ChartWrapper>
                            </Charts>

                            {/* A tabela de transações abaixo dos gráficos, centralizada e com estilo ajustado */}
                            <TransactionTableWrapper>
                                <TransactionTable />
                            </TransactionTableWrapper>
                        </>
                    )}

                    {activeSection === 'relatorios' && (
                        <ReportsContent>
                            <ReportsTitle>Receitas x Despesas</ReportsTitle>
                            <ReportsGrid>
                                <LeftReportsColumn>
                                    {expensesData.length > 0 ? (
                                        <PieChartContainer>
                                            <h3>Despesas por Categoria</h3>
                                            <Pie data={categoryPieChartData} options={categoryPieChartOptions} />
                                        </PieChartContainer>
                                    ) : (
                                        <PieChartContainer style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: '#666' }}>
                                            <p>Nenhuma despesa para exibir neste gráfico.</p>
                                        </PieChartContainer>
                                    )}

                                    {incomeSourcesData.length > 0 ? (
                                        <PieChartContainer>
                                            <h3>Fontes de Renda</h3>
                                            <Pie data={incomeSourcesPieChartData} options={incomeSourcesPieChartOptions} />
                                        </PieChartContainer>
                                    ) : (
                                        <PieChartContainer style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: '#666' }}>
                                            <p>Nenhuma fonte de renda para exibir neste gráfico.</p>
                                        </PieChartContainer>
                                    )}
                                </LeftReportsColumn>

                                <RightReportsColumn>
                                    <LineChartContainer>
                                        <h3>Comparativo Mensal</h3>
                                        <ChartLegend>
                                            <LegendItem><LegendColorBox color="#4CAF50" />Receitas</LegendItem>
                                            <LegendItem><LegendColorBox color="#F44336" />Despesas</LegendItem>
                                        </ChartLegend>
                                        <Line data={monthlyLineChartData} options={monthlyLineChartOptions} />
                                        <MonthlyDataTable>
                                            <thead>
                                                <tr>
                                                    <th>Mês</th>
                                                    <th>Despesas (BRL)</th>
                                                    <th>Receitas (BRL)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {monthlyFinancialData.map((data, index) => (
                                                    <tr key={index}>
                                                        <td>{data.month}</td>
                                                        <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.expenses)}</td>
                                                        <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.income)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </MonthlyDataTable>
                                    </LineChartContainer>

                                    <LineChartContainer>
                                        <h3>Receita (R$/mês)</h3>
                                        <Line data={monthlyIncomeChartData} options={monthlyIncomeChartOptions} />
                                    </LineChartContainer>
                                </RightReportsColumn>
                            </ReportsGrid>
                        </ReportsContent>
                    )}

                    {activeSection === 'orcamentos' && (
                        <div>
                            <h3>Orçamentos</h3>
                            {/* Você pode adicionar seu componente de gerenciamento de orçamento aqui */}
                        </div>
                    )}
                     {activeSection === 'transacoes' && (
                        <div>
                            <h3>Transações</h3>
                            {/* Você pode adicionar seu componente de lista completa de transações aqui */}
                        </div>
                    )}
                </MainContent>
                <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
            </HomeContainer>
        </>
    );
}

export default Home;