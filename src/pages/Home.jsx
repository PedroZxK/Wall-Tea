import React, { useEffect, useState, useCallback } from 'react';
import { styled, createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import TransactionTable from './TransactionTable';
import avatarPadrao from '../assets/avatar.png';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels, ArcElement, LineElement, PointElement);

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
        background-color: #f0f2f5;
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
    transition: color 0.3s ease-in-out;


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

    &:hover, &.active {
      color: #0D4147;
    }

    &:hover::before, &.active::before {
        opacity: 1;
        border-radius: 10px;
    }
`;

// ALTERAÇÃO: Removido o hover do avatar individual, pois o container cuidará disso
const UserAvatarInNav = styled.img`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid white;
`;

// NOVO: Container para agrupar a foto e o nome do usuário
const UserInfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    margin-left: 20px;
    padding: 4px;
    border-radius: 8px;
    transition: background-color 0.2s ease-in-out;

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
`;

const UserNameInNav = styled.span`
    color: #FFFFFF;
    font-size: 0.75em; /* Tamanho pequeno para não poluir a navbar */
    margin-top: 4px;
    font-weight: 600;
    user-select: none; /* Impede que o texto seja selecionado ao clicar */
`;

const MainContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
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

const TopRow = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-around;
    gap: 20px;
    margin-bottom: 20px;
    flex-wrap: wrap;

    @media (min-width: 769px) {
        flex-wrap: nowrap;
        justify-content: space-between;
    }
`;

const Financeiro = styled.div`
    flex: 1;
    min-width: 300px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    height: 100%;
    background-color: transparent;

    @media (max-width: 768px) {
        width: 100%;
        flex: none;
    }
`;

const Receitas = styled.div`
    text-align: left;
    background-color: #4CAF50; /* Green for Income */
    color: #FFFFFF;
    padding: 15px 20px;
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    flex: 1;
    min-width: 150px;
    font-size: 1.1em;
`;

const Despesas = styled.div`
    text-align: left;
    background-color: #DA4141; /* Red for Expenses */
    color: #FFFFFF;
    padding: 15px 20px;
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    flex: 1;
    min-width: 150px;
    font-size: 1.1em;
`;

const SaldoIndividualDisplay = styled.div`
    text-align: left;
    background-color: #108886; /* Color for Saldo */
    color: #FFFFFF;
    padding: 15px 20px;
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    flex: 1;
    min-width: 150px;
    font-size: 1.1em;
`;


const Charts = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 20px;
    flex-wrap: wrap;

    @media (min-width: 769px) {
        flex-wrap: nowrap;
        justify-content: space-around;
    }
`;

const ChartWrapper = styled.div`
    flex: 1;
    min-width: 300px; // FIX: Ensures a minimum width on smaller screens before wrapping
    max-width: 100%;  // FIX: Allows the chart to take full width on smaller screens
    display: flex;
    flex-direction: column;
    gap: 20px;

    @media (min-width: 769px) {
        max-width: 50%; // Re-apply max-width for larger screens
    }
`;

const ChartContainer = styled.div`
    padding: 20px;
    width: 100%;
    min-height: 400px; // FIX: Changed from height to min-height to allow content to grow
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    border-radius: 15px;
    text-align: center; // FIX: Center the title
    background-color: #FFFFFF;
    display: flex;
    flex-direction: column;
    justify-content: flex-start; // FIX: Align items to the top
    align-items: center;

    // FIX: Container for the chart canvas to control its size relative to the parent
    & > div {
        position: relative;
        width: 100%;
        flex-grow: 1;
    }
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
    max-width: 1500px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    border-radius: 15px;
    background-color: #FFFFFF;
    padding: 20px;
    margin: 20px auto;
    display: flex;
    justify-content: center;
`;

const chartColors = [
    'rgba(102, 170, 223, 0.8)',
    'rgba(56, 204, 201, 0.8)',
    'rgba(67, 200, 236, 0.8)',
    'rgba(145, 70, 149, 0.8)',
    'rgba(119, 98, 166, 0.8)',
    'rgba(107, 130, 187, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 99, 132, 0.8)',
];

// --- Novos Styled Components para a página de Relatórios ---
const ReportsContent = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1200px;
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
    flex-wrap: wrap;
    width: 100%;
    gap: 20px;
    justify-content: center;
    align-items: flex-start;
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
    flex: 2;
    min-width: 300px; // FIX: Allow it to shrink on smaller screens
    display: flex;
    flex-direction: column;
    gap: 20px;
    @media (max-width: 992px) { // FIX: Adjust breakpoint for better layout flow
        width: 100%;
        min-width: unset;
        max-width: 100%;
    }
`;

const PieChartContainer = styled(ChartContainer)`
    min-height: 500px;
    justify-content: flex-start;
    padding-top: 10px;

    canvas {
        margin-top: 10px;
    }
`;

const LineChartContainer = styled(ChartContainer)`
    min-height: 450px;
    justify-content: flex-start;
    padding-top: 10px;
`;

const MonthlyDataTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    background-color: #FFFFFF;
    border-radius: 15px;
    overflow: hidden;
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
        text-align: right;
    }
`;

const ChartLegend = styled.div`
    display: flex;
    justify-content: center;
    flex-wrap: wrap; // Allow legend to wrap
    gap: 20px;
    margin-bottom: 15px;
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

const IncomeFormContainer = styled.div`
    width: 100%;
    max-width: 900px;
    padding: 20px;
    background-color: #FFFFFF;
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const IncomeForm = styled.form`
    display: flex;
    gap: 15px;
    width: 100%;
    max-width: 600px;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-end;
`;

const IncomeInputGroup = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 150px;
    flex: 1;
`;

const IncomeLabel = styled.label`
    font-size: 0.9em;
    color: #333;
    margin-bottom: 5px;
    font-weight: bold;
`;

const IncomeInput = styled.input`
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 1em;
`;

const IncomeButton = styled.button`
    background-color: #108886;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s ease;
    align-self: flex-end;
    height: 42px; // Match input height

    &:hover {
        background-color: #0d6b69;
    }
`;

const Message = styled.p`
    margin-top: 10px;
    font-weight: bold;
    color: ${props => props.type === 'success' ? 'green' : 'red'};
`;

const BudgetFormContainer = styled.div`
    width: 100%;
    max-width: 900px;
    padding: 20px;
    background-color: #FFFFFF;
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const BudgetForm = styled.form`
    display: flex;
    gap: 15px;
    width: 100%;
    max-width: 600px;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-end;
`;

const BudgetInputGroup = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 150px;
    flex: 1;
`;

const BudgetLabel = styled.label`
    font-size: 0.9em;
    color: #333;
    margin-bottom: 5px;
    font-weight: bold;
`;

const BudgetSelect = styled.select`
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 1em;
    background-color: white;
`;

const BudgetInput = styled.input`
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 1em;
`;

const BudgetButton = styled.button`
    background-color: #108886;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s ease;
    align-self: flex-end;
    height: 42px; // Match input height

    &:hover {
        background-color: #0d6b69;
    }
`;

const BudgetsTableContainer = styled.div`
    width: 100%;
    max-width: 1000px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    border-radius: 15px;
    background-color: #FFFFFF;
    padding: 20px;
    margin: 20px auto;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const BudgetsTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;

    th, td {
        border: 1px solid #ddd;
        padding: 10px;
        text-align: left;
    }

    th {
        background-color: #108886;
        color: white;
    }

    tr:nth-child(even) {
        background-color: #f2f2f2;
    }
`;

const ProgressBarContainer = styled.div`
    width: 100%;
    background-color: #e0e0e0;
    border-radius: 5px;
    margin-top: 5px;
    overflow: hidden;
`;

const ProgressBarFill = styled.div`
    height: 20px;
    background-color: ${props => props.percentage > 100 ? '#DA4141' : '#4CAF50'};
    width: ${props => Math.min(props.percentage, 100)}%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 0.8em;
    transition: width 0.5s ease-in-out;
`;

const BudgetMonthSelector = styled.div`
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap; // Allow to wrap on small screens

    label {
        font-weight: bold;
        color: #0D4147;
    }

    select {
        padding: 8px;
        border-radius: 8px;
        border: 1px solid #ccc;
    }
`;

const ActionButton = styled.button` /* Reusing from TransactionTable style for consistency */
    background-color: #108886;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-size: 0.9em;
    margin-right: 5px;

    &:hover {
        background-color: #0d6b69;
    }
`;

const DeleteButton = styled.button` /* Reusing from TransactionTable style for consistency */
    background-color: #DA4141;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-size: 0.9em;

    &:hover {
        background-color: #c03030;
    }
`;

const ModalOverlay = styled.div` /* Reusing from TransactionTable style for consistency */
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div` /* Reusing from TransactionTable style for consistency */
    background: white;
    padding: 30px;
    border-radius: 10px;
    width: 400px;
    max-width: 90%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    position: relative;
`;

const CloseButton = styled.button` /* Reusing from TransactionTable style for consistency */
    position: absolute;
    top: 10px;
    right: 10px;
    border: none;
    background: transparent;
    font-size: 1.2rem;
    cursor: pointer;
`;

const InputGroup = styled.div` /* Reusing from TransactionTable style for consistency */
    margin-bottom: 15px;
`;

const Label = styled.label` /* Reusing from TransactionTable style for consistency */
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
`;

const Input = styled.input` /* Reusing from TransactionTable style for consistency */
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
`;
const Select = styled.select` /* Reusing from TransactionTable style for consistency */
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
`;


// --- Fetch Functions ---
const fetchTransactions = async (userId) => {
    try {
        const transactionsResponse = await fetch(`http://localhost:3000/api/transactions?userId=${userId}`);
        if (!transactionsResponse.ok) {
            throw new Error(`HTTP error! status: ${transactionsResponse.status}`);
        }
        const transactionsData = await transactionsResponse.json();
        return transactionsData;
    } catch (error) {
        console.error("Home: Erro ao buscar dados das transações da API:", error);
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
        return userData.saldo;
    } catch (error) {
        console.error("Error fetching user saldo:", error);
        throw error;
    }
};

const fetchBudgets = async (userId, month, year) => {
    try {
        const response = await fetch(`http://localhost:3000/api/budgets?userId=${userId}&month=${month}&year=${year}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Home: Erro ao buscar dados dos orçamentos da API:", error);
        throw error;
    }
};

const fetchMonthlyFinancialData = async (userId) => {
    try {
        const response = await fetch(`http://localhost:3000/api/monthly-financial-data?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Home: Erro ao buscar dados financeiros mensais:", error);
        throw error;
    }
};

const fetchIncomeSources = async (userId) => {
    try {
        const response = await fetch(`http://localhost:3000/api/incomes-monthly?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Home: Erro ao buscar fontes de renda:", error);
        throw error;
    }
};

const fetchCategories = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/categorias');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        throw error;
    }
};


function Home() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expensesData, setExpensesData] = useState([]);
    const [budgetsChartDisplayData, setBudgetsChartDisplayData] = useState([]);
    const [activeSection, setActiveSection] = useState('inicio');
    const [saldo, setSaldo] = useState(null); // This is the user's actual saldo from the database
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [monthlyFinancialData, setMonthlyFinancialData] = useState([]);
    const [incomeSourcesData, setIncomeSourcesData] = useState([]);
    const [userName, setUserName] = useState('');
    const [userPhoto, setUserPhoto] = useState(avatarPadrao);
    const [categories, setCategories] = useState([]);
    const [selectedBudgetMonth, setSelectedBudgetMonth] = useState(new Date().getMonth() + 1);
    const [selectedBudgetYear, setSelectedBudgetYear] = useState(new Date().getFullYear());

    const userId = localStorage.getItem('userId');

    const [incomeForm, setIncomeForm] = useState(() => {
        const today = new Date();
        const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
        const currentYear = today.getFullYear();
        return {
            salary: '',
            sideGigs: '',
            month: currentMonth,
            year: currentYear,
        };
    });
    const [incomeMessage, setIncomeMessage] = useState({ text: '', type: '' });

    const [budgetForm, setBudgetForm] = useState({
        id: null, // Add ID for editing existing budgets
        categoryId: '',
        budgetedAmount: '',
        month: selectedBudgetMonth, // Add month and year to budget form state
        year: selectedBudgetYear,
    });
    const [budgetMessage, setBudgetMessage] = useState({ text: '', type: '' });
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [isEditingBudget, setIsEditingBudget] = useState(false);


    const loadAllData = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            console.log("Iniciando carregamento de dados para o usuário:", userId);
            const [transactions, budgets, saldoData, monthlyData, incomeSources, fetchedCategories] = await Promise.all([
                fetchTransactions(userId),
                fetchBudgets(userId, selectedBudgetMonth, selectedBudgetYear),
                fetchUserSaldo(userId),
                fetchMonthlyFinancialData(userId),
                fetchIncomeSources(userId),
                fetchCategories(),
            ]);

            setSaldo(saldoData);

            let currentTotalExpenses = 0;
            const categoryExpenses = transactions.reduce((acc, transaction) => {
                const categoryName = transaction.category_name || 'Outros';
                const amount = parseFloat(transaction.amount) || 0;

                if (amount < 0) { // Expense transaction
                    currentTotalExpenses += Math.abs(amount);
                    if (!acc[categoryName]) {
                        acc[categoryName] = 0;
                    }
                    acc[categoryName] += Math.abs(amount);
                }
                return acc;
            }, {});

            setTotalExpenses(currentTotalExpenses);

            const formattedExpensesData = Object.entries(categoryExpenses)
                .filter(([, total]) => total > 0)
                .map(([category, total]) => ({
                    category,
                    value: total,
                }));
            setExpensesData(formattedExpensesData);

            let totalIncomeFromTransactions = 0;
            transactions.forEach(transaction => {
                const amount = parseFloat(transaction.amount) || 0;
                if (amount > 0) {
                    totalIncomeFromTransactions += amount;
                }
            });

            const totalIncomeFromRendas = incomeSources.reduce((sum, item) => sum + parseFloat(item.salario || 0) + parseFloat(item.bicos || 0), 0);
            setTotalIncome(totalIncomeFromRendas + totalIncomeFromTransactions);

            setBudgetsChartDisplayData(budgets);

            const processedMonthlyData = monthlyData.map(d => ({
                month: d.month,
                income: parseFloat(d.income),
                expenses: parseFloat(d.expenses)
            }));
            setMonthlyFinancialData(processedMonthlyData);

            const totalSalary = incomeSources.reduce((sum, item) => sum + parseFloat(item.salario || 0), 0);
            const totalSideGigs = incomeSources.reduce((sum, item) => sum + parseFloat(item.bicos || 0), 0);

            const aggregatedIncomeSources = [
                { source: 'Salário', value: totalSalary },
                { source: 'Bicos', value: totalSideGigs }
            ].filter(item => item.value > 0);
            setIncomeSourcesData(aggregatedIncomeSources);

            setCategories(fetchedCategories);

        } catch (error) {
            console.error("Home: Erro GERAL ao buscar ou processar dados:", error);
        } finally {
            setLoading(false);
        }
    }, [userId, selectedBudgetMonth, selectedBudgetYear]);

    useEffect(() => {
        document.title = 'Home - Wall & Tea';
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && userId && storedUser) {
            setIsLoggedIn(true);
            try {
                const user = JSON.parse(storedUser);
                setUserName(user.nome || 'Usuário');
                if (user.foto) {
                    if (user.foto.data && user.foto.type === 'Buffer') {
                        let binary = '';
                        const bytes = new Uint8Array(user.foto.data);
                        const len = bytes.byteLength;
                        for (let i = 0; i < len; i++) {
                            binary += String.fromCharCode(bytes[i]);
                        }
                        const base64 = btoa(binary);
                        setUserPhoto(`data:image/jpeg;base64,${base64}`);
                    } else if (typeof user.foto === 'string' && user.foto.startsWith('data:image')) {
                        setUserPhoto(user.foto);
                    } else {
                        setUserPhoto(avatarPadrao);
                    }
                } else {
                    setUserPhoto(avatarPadrao);
                }
            } catch (e) {
                console.error("Failed to parse user data from localStorage", e);
                setUserPhoto(avatarPadrao);
            }
            loadAllData();
        } else {
            setIsLoggedIn(false);
            setLoading(false);
            navigate('/login');
        }
    }, [navigate, userId, loadAllData]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        navigate('/login');
    };

    const handleIncomeFormChange = (e) => {
        const { name, value } = e.target;
        setIncomeForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleIncomeSubmit = async (e) => {
        e.preventDefault();
        setIncomeMessage({ text: '', type: '' });

        const targetMonth = parseInt(incomeForm.month, 10);
        const targetYear = parseInt(incomeForm.year, 10);
        const salary = parseFloat(incomeForm.salary) || 0;
        const sideGigs = parseFloat(incomeForm.sideGigs) || 0;

        if (isNaN(targetMonth) || isNaN(targetYear)) {
            setIncomeMessage({ text: 'Mês e Ano devem ser válidos.', type: 'error' });
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/incomes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    month: targetMonth,
                    year: targetYear,
                    salary: salary,
                    sideGigs: sideGigs,
                }),
            });

            if (response.ok) {
                setIncomeMessage({ text: 'Renda registrada com sucesso!', type: 'success' });
                const today = new Date();
                setIncomeForm({
                    salary: '',
                    sideGigs: '',
                    month: String(today.getMonth() + 1).padStart(2, '0'),
                    year: today.getFullYear(),
                });
                loadAllData();
            } else {
                const errorData = await response.json();
                setIncomeMessage({ text: `Erro: ${errorData.error || 'Falha ao registrar renda.'}`, type: 'error' });
            }
            setTimeout(() => setIncomeMessage({ text: '', type: '' }), 5000);
        } catch (error) {
            console.error("Erro ao submeter renda:", error);
            setIncomeMessage({ text: 'Erro ao conectar com o servidor.', type: 'error' });
            setTimeout(() => setIncomeMessage({ text: '', type: '' }), 5000);
        }
    };

    const handleBudgetFormChange = (e) => {
        const { name, value } = e.target;
        setBudgetForm(prev => ({ ...prev, [name]: value }));
    };

    const handleBudgetSubmit = async (e) => {
        e.preventDefault();
        setBudgetMessage({ text: '', type: '' });

        const { id, categoryId, budgetedAmount } = budgetForm;

        if (!categoryId || budgetedAmount === '') {
            setBudgetMessage({ text: 'Por favor, preencha todos os campos do orçamento.', type: 'error' });
            return;
        }

        try {
            const method = isEditingBudget ? 'PUT' : 'POST';
            const url = isEditingBudget ? `http://localhost:3000/api/budgets/${id}` : 'http://localhost:3000/api/budgets';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    categoryId: parseInt(categoryId),
                    budgetedAmount: parseFloat(budgetedAmount),
                    month: selectedBudgetMonth,
                    year: selectedBudgetYear,
                }),
            });

            if (response.ok) {
                setBudgetMessage({ text: `Orçamento ${isEditingBudget ? 'atualizado' : 'definido'} com sucesso!`, type: 'success' });
                setShowBudgetModal(false);
                resetBudgetForm();
                loadAllData();
            } else {
                const errorData = await response.json();
                setBudgetMessage({ text: `Erro: ${errorData.error || 'Falha ao definir orçamento.'}`, type: 'error' });
            }
            setTimeout(() => setBudgetMessage({ text: '', type: '' }), 5000);
        } catch (error) {
            console.error("Erro ao submeter orçamento:", error);
            setBudgetMessage({ text: 'Erro ao conectar com o servidor.', type: 'error' });
            setTimeout(() => setBudgetMessage({ text: '', type: '' }), 5000);
        }
    };

    const resetBudgetForm = () => {
        setBudgetForm({
            id: null,
            categoryId: '',
            budgetedAmount: '',
            month: selectedBudgetMonth,
            year: selectedBudgetYear,
        });
        setIsEditingBudget(false);
    };

    const handleOpenBudgetModalForAdd = () => {
        resetBudgetForm();
        setShowBudgetModal(true);
    };

    const handleOpenBudgetModalForEdit = (budget) => {
        setBudgetForm({
            id: budget.id,
            categoryId: budget.category_id,
            budgetedAmount: budget.budgeted,
            month: selectedBudgetMonth,
            year: selectedBudgetYear,
        });
        setIsEditingBudget(true);
        setShowBudgetModal(true);
    };

    const handleDeleteBudget = async (budgetId) => {
        if (!window.confirm('Tem certeza que deseja excluir este orçamento?')) {
            return;
        }
        setBudgetMessage({ text: '', type: '' });
        try {
            const response = await fetch(`http://localhost:3000/api/budgets/${budgetId}?userId=${userId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setBudgetMessage({ text: 'Orçamento excluído com sucesso!', type: 'success' });
                loadAllData();
            } else {
                const errorData = await response.json();
                setBudgetMessage({ text: `Erro ao excluir orçamento: ${errorData.error || 'Erro desconhecido.'}`, type: 'error' });
            }
            setTimeout(() => setBudgetMessage({ text: '', type: '' }), 5000);
        } catch (error) {
            console.error("Erro ao excluir orçamento:", error);
            setBudgetMessage({ text: 'Erro ao conectar com o servidor para exclusão.', type: 'error' });
            setTimeout(() => setBudgetMessage({ text: '', type: '' }), 5000);
        }
    };


    // --- Chart Data and Options ---
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
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                    }
                }
            },
            datalabels: {
                display: true, anchor: 'end', align: 'end', // FIX: 'end' alignment for better positioning
                formatter: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value),
                color: '#555',
                font: { weight: 'bold' },
                offset: -5, // FIX: Pull label slightly inside the bar
                padding: { top: 10 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Valor (BRL)', font: { size: 14 } },
                ticks: {
                    callback: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                },
            },
            x: {
                title: { display: true, text: 'Categoria', font: { size: 14 } },
                grid: { display: false },
            }
        },
        layout: { padding: { top: 30, bottom: 10, left: 10, right: 20 } } // FIX: Increased top padding for labels
    };

    const budgetsChartData = {
        labels: budgetsChartDisplayData.map(budget => budget.category_name),
        datasets: [
            {
                label: 'Gasto',
                data: budgetsChartDisplayData.map(budget => budget.spent),
                backgroundColor: budgetsChartDisplayData.map(budget => budget.spent <= budget.budgeted ? 'rgba(67, 236, 172, 0.8)' : 'rgba(255, 99, 132, 0.8)'),
                borderColor: budgetsChartDisplayData.map(budget => budget.spent <= budget.budgeted ? 'rgba(67, 236, 172, 1)' : 'rgba(255, 99, 132, 1)'),
                borderWidth: 1,
                barPercentage: 0.8, categoryPercentage: 0.8,
            },
            {
                label: 'Orçado',
                data: budgetsChartDisplayData.map(budget => budget.budgeted),
                backgroundColor: 'rgba(128, 128, 128, 0.2)',
                borderColor: 'rgba(128, 128, 128, 1)',
                borderWidth: 1,
                type: 'bar',
                order: 1,
                datalabels: { display: false }
            }
        ],
    };

    const budgetsChartOptions = {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: {
            title: { display: true, text: 'Status dos Orçamentos', color: '#108886', font: { size: 20, weight: 'bold' }, padding: { bottom: 20 } },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const dataIndex = context.dataIndex;
                        const budgeted = budgetsChartDisplayData[dataIndex]?.budgeted || 0;
                        const spent = budgetsChartDisplayData[dataIndex]?.spent || 0;
                        const remaining = budgeted - spent;
                        const lines = [
                            `Gasto: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(spent)}`,
                            `Orçado: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budgeted)}`,
                            `Restante: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remaining)}`
                        ];
                        return lines;
                    },
                },
            },
            legend: { display: false },
            datalabels: {
                display: true, anchor: 'end', align: 'end',
                formatter: (value, context) => {
                    if (context.dataset.label === 'Gasto') {
                        const dataIndex = context.dataIndex;
                        const budgeted = budgetsChartDisplayData[dataIndex]?.budgeted || 0;
                        const spent = budgetsChartDisplayData[dataIndex]?.spent || 0;
                        if (budgeted === 0) {
                            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(spent);
                        }
                        const percentage = budgeted > 0 ? ((spent / budgeted) * 100).toFixed(0) : 0;
                        return `${percentage}%`;
                    }
                    return null;
                },
                color: '#333', font: { weight: 'bold' },
                offset: 5,
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                title: { display: true, text: 'Valor (BRL)', font: { size: 14 } },
                ticks: {
                    callback: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                },
                grid: { display: false },
            },
            y: {
                grid: { display: false },
                ticks: { font: { size: 12, weight: 'bold' } },
            },
        },
        layout: { padding: { top: 10, bottom: 10, left: 10, right: 40 } } // FIX: Increased right padding for labels
    };

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
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { font: { size: 12 }, boxWidth: 20, padding: 20 } },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}`;
                    }
                }
            },
            datalabels: {
                display: true, color: '#fff',
                formatter: (value, context) => {
                    const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                    const percentage = (value / total * 100);
                    return percentage > 5 ? percentage.toFixed(0) + '%' : ''; // FIX: Only show percentage if it's large enough
                },
                font: { weight: 'bold', size: 12 }, textShadowBlur: 2, textShadowColor: 'rgba(0,0,0,0.8)'
            }
        },
        layout: { padding: 10 }
    };

    const incomeSourcesPieChartData = {
        labels: incomeSourcesData.map(source => source.source),
        datasets: [{
            data: incomeSourcesData.map(source => source.value),
            backgroundColor: ['#4CAF50', '#FFC107'],
            borderColor: ['#388E3C', '#FFA000'],
            borderWidth: 1,
        }]
    };

    const incomeSourcesPieChartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { font: { size: 12 }, boxWidth: 20, padding: 20 } },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}`;
                    }
                }
            },
            datalabels: {
                display: true, color: '#fff',
                formatter: (value, context) => {
                    const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                    const percentage = (value / total * 100);
                    return percentage > 5 ? percentage.toFixed(0) + '%' : ''; // FIX: Only show percentage if large enough
                },
                font: { weight: 'bold', size: 12 }, textShadowBlur: 2, textShadowColor: 'rgba(0,0,0,0.8)'
            }
        },
        layout: { padding: 10 }
    };

    const monthlyLineChartData = {
        labels: monthlyFinancialData.map(data => data.month),
        datasets: [
            {
                label: 'Receitas',
                data: monthlyFinancialData.map(data => data.income),
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                fill: false, tension: 0.3, pointBackgroundColor: '#4CAF50', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5,
            },
            {
                label: 'Despesas',
                data: monthlyFinancialData.map(data => data.expenses),
                borderColor: '#F44336',
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                fill: false, tension: 0.3, pointBackgroundColor: '#F44336', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5,
            },
        ],
    };

    const monthlyLineChartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index', intersect: false,
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        label += `: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y)}`;
                        return label;
                    }
                }
            },
            datalabels: { display: false }
        },
        scales: {
            x: {
                title: { display: true, text: 'Mês', font: { size: 14 } },
                grid: { display: false }
            },
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Valor (BRL)', font: { size: 14 } },
                ticks: {
                    callback: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                }
            }
        },
        layout: { padding: { top: 20, bottom: 20, left: 10, right: 10 } }
    };

    const monthlyIncomeChartData = {
        labels: monthlyFinancialData.map(data => data.month),
        datasets: [
            {
                label: 'Receita (R$/mês)',
                data: monthlyFinancialData.map(data => data.income),
                borderColor: '#108886',
                backgroundColor: 'rgba(16, 136, 134, 0.2)',
                fill: true, tension: 0.4, pointBackgroundColor: '#108886', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5,
            },
        ],
    };

    const monthlyIncomeChartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        label += `: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y)}`;
                        return label;
                    }
                }
            },
            datalabels: { display: false }
        },
        scales: {
            x: {
                title: { display: true, text: 'Mês', font: { size: 14 } },
                grid: { display: false }
            },
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Receita (BRL)', font: { size: 14 } },
                ticks: {
                    callback: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                }
            }
        },
        layout: { padding: { top: 20, bottom: 20, left: 10, right: 10 } }
    };


    if (loading) {
        return (
            <HomeContainer>
                <p>Carregando dados...</p>
            </HomeContainer>
        );
    }

    if (!isLoggedIn) {
        return null;
    }

    // eslint-disable-next-line no-unused-vars
    const handleNavClick = (section) => {
        setActiveSection(section);
    };

    const handleBudgetMonthChange = (e) => {
        const [year, month] = e.target.value.split('-');
        setSelectedBudgetMonth(parseInt(month));
        setSelectedBudgetYear(parseInt(year));
    };

    const getMonthName = (monthNumber) => {
        const date = new Date();
        date.setMonth(monthNumber - 1);
        return date.toLocaleString('pt-BR', { month: 'long' });
    };

    const generateMonthYearOptions = () => {
        const options = [];
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 2;
        const endYear = currentYear + 1;

        for (let year = endYear; year >= startYear; year--) {
            for (let month = 12; month >= 1; month--) {
                const monthName = getMonthName(month);
                const value = `${year}-${String(month).padStart(2, '0')}`;
                options.push(<option key={value} value={value}>{`${monthName.charAt(0).toUpperCase() + monthName.slice(1)} / ${year}`}</option>);
            }
        }
        return options;
    };

    return (
        <>
            <GlobalStyle />
            <HomeContainer>
                <Navbar>
                    <NavLinks>
                        <NavItem onClick={() => setActiveSection('inicio')} className={activeSection === 'inicio' ? 'active' : ''}>
                            Página Inicial
                        </NavItem>
                        <NavItem onClick={() => setActiveSection('relatorios')} className={activeSection === 'relatorios' ? 'active' : ''}>
                            Relatórios
                        </NavItem>
                        <NavItem onClick={() => setActiveSection('orcamentos')} className={activeSection === 'orcamentos' ? 'active' : ''}>
                            Orçamentos
                        </NavItem>
                    </NavLinks>

                    {/* ALTERAÇÃO: O avatar agora está dentro do novo container junto com o nome */}
                    <UserInfoContainer onClick={() => navigate('/perfil')}>
                        <UserAvatarInNav src={userPhoto} alt="User Avatar" />
                        {userName && (
                            <UserNameInNav>
                                {userName.split(' ')[0]} {/* Exibe apenas o primeiro nome */}
                            </UserNameInNav>
                        )}
                    </UserInfoContainer>

                </Navbar>

                <MainContent>
                    {activeSection === 'inicio' && (
                        <>
                            <IncomeFormContainer>
                                <h3>Registrar Renda Mensal</h3>
                                {incomeMessage.text && <Message type={incomeMessage.type}>{incomeMessage.text}</Message>}
                                <IncomeForm onSubmit={handleIncomeSubmit}>
                                    <IncomeInputGroup>
                                        <IncomeLabel htmlFor="salary">Salário:</IncomeLabel>
                                        <IncomeInput
                                            type="number"
                                            id="salary"
                                            name="salary"
                                            value={incomeForm.salary}
                                            onChange={handleIncomeFormChange}
                                            placeholder="Ex: 3000.00"
                                            step="0.01"
                                        />
                                    </IncomeInputGroup>
                                    <IncomeInputGroup>
                                        <IncomeLabel htmlFor="sideGigs">Bicos:</IncomeLabel>
                                        <IncomeInput
                                            type="number"
                                            id="sideGigs"
                                            name="sideGigs"
                                            value={incomeForm.sideGigs}
                                            onChange={handleIncomeFormChange}
                                            placeholder="Ex: 500.00"
                                            step="0.01"
                                        />
                                    </IncomeInputGroup>
                                    <IncomeInputGroup>
                                        <IncomeLabel htmlFor="month">Mês:</IncomeLabel>
                                        <BudgetSelect
                                            id="month"
                                            name="month"
                                            value={incomeForm.month}
                                            onChange={handleIncomeFormChange}
                                        >
                                            {Array.from({ length: 12 }, (_, i) => (i + 1)).map(monthNum => (
                                                <option key={monthNum} value={String(monthNum).padStart(2, '0')}>
                                                    {new Date(0, monthNum - 1).toLocaleString('pt-BR', { month: 'long' })}
                                                </option>
                                            ))}
                                        </BudgetSelect>
                                    </IncomeInputGroup>
                                    <IncomeInputGroup>
                                        <IncomeLabel htmlFor="year">Ano:</IncomeLabel>
                                        <BudgetSelect
                                            id="year"
                                            name="year"
                                            value={incomeForm.year}
                                            onChange={handleIncomeFormChange}
                                        >
                                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(yearNum => (
                                                <option key={yearNum} value={yearNum}>{yearNum}</option>
                                            ))}
                                        </BudgetSelect>
                                    </IncomeInputGroup>
                                    <IncomeButton type="submit">Registrar</IncomeButton>
                                </IncomeForm>
                            </IncomeFormContainer>

                            <TopRow>
                                <Financeiro>
                                    <Receitas>
                                        <p>Receitas: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}</p>
                                    </Receitas>
                                    <Despesas>
                                        <p>Despesas: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpenses)}</p>
                                    </Despesas>
                                    {saldo !== null && (
                                        <SaldoIndividualDisplay>
                                            <p>Saldo Atual: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldo)}</p>
                                        </SaldoIndividualDisplay>
                                    )}
                                </Financeiro>
                            </TopRow>

                            <Charts>
                                <ChartWrapper>
                                    <ChartContainer>
                                        <h3>Despesas por Categoria</h3>
                                        {expensesData.length > 0 ? (
                                            <div>
                                                <Bar data={expensesChartData} options={expensesChartOptions} />
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#666', height: '100%' }}>
                                                <p>Nenhuma despesa para exibir.<br />Registre transações para ver os dados aqui!</p>
                                            </div>
                                        )}
                                    </ChartContainer>
                                </ChartWrapper>

                                <ChartWrapper>
                                    <ChartContainer>
                                        <h3>Status dos Orçamentos</h3>
                                        {budgetsChartDisplayData.length > 0 ? (
                                            <div>
                                                <Bar data={budgetsChartData} options={budgetsChartOptions} />
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#666', height: '100%' }}>
                                                <p>Nenhum orçamento para exibir.<br />Crie um orçamento ou registre uma transação!</p>
                                            </div>
                                        )}
                                    </ChartContainer>
                                </ChartWrapper>
                            </Charts>

                            <TransactionTableWrapper>
                                <TransactionTable onTransactionChange={loadAllData} />
                            </TransactionTableWrapper>
                        </>
                    )}

                    {activeSection === 'relatorios' && (
                        <ReportsContent>
                            <ReportsTitle>Relatórios Financeiros</ReportsTitle>
                            <ReportsGrid>
                                <LeftReportsColumn>
                                    <PieChartContainer>
                                        <h3>Despesas por Categoria</h3>
                                        {expensesData.length > 0 ? (
                                            <div><Pie data={categoryPieChartData} options={categoryPieChartOptions} /></div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#666', height: '100%' }}>
                                                <p>Nenhuma despesa para exibir.</p>
                                            </div>
                                        )}
                                    </PieChartContainer>

                                    <PieChartContainer>
                                        <h3>Fontes de Renda</h3>
                                        {incomeSourcesData.length > 0 ? (
                                            <div><Pie data={incomeSourcesPieChartData} options={incomeSourcesPieChartOptions} /></div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#666', height: '100%' }}>
                                                <p>Nenhuma fonte de renda para exibir.</p>
                                            </div>
                                        )}
                                    </PieChartContainer>
                                </LeftReportsColumn>

                                <RightReportsColumn>
                                    <LineChartContainer>
                                        <h3>Comparativo Mensal (Receitas vs. Despesas)</h3>
                                        <ChartLegend>
                                            <LegendItem><LegendColorBox color="#4CAF50" />Receitas</LegendItem>
                                            <LegendItem><LegendColorBox color="#F44336" />Despesas</LegendItem>
                                        </ChartLegend>
                                        {monthlyFinancialData.length > 0 ? (
                                            <>
                                                <div><Line data={monthlyLineChartData} options={monthlyLineChartOptions} /></div>
                                                <MonthlyDataTable>
                                                    <thead>
                                                        <tr>
                                                            <th>Mês</th>
                                                            <th>Receitas (BRL)</th>
                                                            <th>Despesas (BRL)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {monthlyFinancialData.map((data, index) => (
                                                            <tr key={index}>
                                                                <td>{data.month}</td>
                                                                <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.income)}</td>
                                                                <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.expenses)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </MonthlyDataTable>
                                            </>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#666', height: '100%' }}>
                                                <p>Nenhum dado mensal para exibir.</p>
                                            </div>
                                        )}
                                    </LineChartContainer>

                                    <LineChartContainer>
                                        <h3>Receita por Mês</h3>
                                        {monthlyFinancialData.length > 0 ? (
                                            <div><Line data={monthlyIncomeChartData} options={monthlyIncomeChartOptions} /></div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#666', height: '100%' }}>
                                                <p>Nenhum dado de receita mensal para exibir.</p>
                                            </div>
                                        )}
                                    </LineChartContainer>
                                </RightReportsColumn>
                            </ReportsGrid>
                        </ReportsContent>
                    )}

                    {activeSection === 'orcamentos' && (
                        <>
                            <ReportsTitle>Gestão de Orçamentos</ReportsTitle>

                            <BudgetMonthSelector>
                                <label htmlFor="budgetMonthSelect">Ver Orçamentos de:</label>
                                <select
                                    id="budgetMonthSelect"
                                    value={`${selectedBudgetYear}-${String(selectedBudgetMonth).padStart(2, '0')}`}
                                    onChange={handleBudgetMonthChange}
                                >
                                    {generateMonthYearOptions()}
                                </select>
                                <BudgetButton onClick={handleOpenBudgetModalForAdd} style={{ marginLeft: '10px' }}>
                                    + Adicionar Novo
                                </BudgetButton>
                            </BudgetMonthSelector>

                            {budgetMessage.text && <Message type={budgetMessage.type}>{budgetMessage.text}</Message>}

                            <BudgetsTableContainer>
                                <h3>Orçamentos Detalhados</h3>
                                {budgetsChartDisplayData.length > 0 ? (
                                    <BudgetsTable>
                                        <thead>
                                            <tr>
                                                <th>Categoria</th>
                                                <th>Orçado</th>
                                                <th>Gasto</th>
                                                <th>Restante</th>
                                                <th>Progresso</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {budgetsChartDisplayData.map((budget) => {
                                                const percentage = budget.budgeted > 0 ? (budget.spent / budget.budgeted) * 100 : 0;
                                                const remaining = budget.budgeted - budget.spent;
                                                const categoryName = categories.find(cat => cat.id === budget.category_id)?.name || budget.category_name || 'Desconhecido';
                                                return (
                                                    <tr key={budget.id}>
                                                        <td>{categoryName}</td>
                                                        <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.budgeted)}</td>
                                                        <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.spent)}</td>
                                                        <td style={{ color: remaining < 0 ? 'red' : 'inherit' }}>
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remaining)}
                                                        </td>
                                                        <td>
                                                            <ProgressBarContainer>
                                                                <ProgressBarFill percentage={percentage}>
                                                                    {percentage.toFixed(0)}%
                                                                </ProgressBarFill>
                                                            </ProgressBarContainer>
                                                        </td>
                                                        <td>
                                                            <ActionButton onClick={() => handleOpenBudgetModalForEdit(budget)}>Editar</ActionButton>
                                                            <DeleteButton onClick={() => handleDeleteBudget(budget.id)}>Excluir</DeleteButton>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </BudgetsTable>
                                ) : (
                                    <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Nenhum orçamento definido para este mês e ano.</p>
                                )}
                            </BudgetsTableContainer>

                            {showBudgetModal && (
                                <ModalOverlay>
                                    <ModalContent>
                                        <CloseButton onClick={() => { setShowBudgetModal(false); resetBudgetForm(); }}>×</CloseButton>
                                        <h4>{isEditingBudget ? 'Editar Orçamento' : 'Adicionar Novo Orçamento'}</h4>
                                        <form onSubmit={handleBudgetSubmit}>
                                            <InputGroup>
                                                <Label htmlFor="modalBudgetCategory">Categoria:</Label>
                                                <Select
                                                    id="modalBudgetCategory"
                                                    name="categoryId"
                                                    value={budgetForm.categoryId}
                                                    onChange={handleBudgetFormChange}
                                                    required
                                                >
                                                    <option value="">Selecione uma Categoria</option>
                                                    {categories.map((cat) => (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </InputGroup>
                                            <InputGroup>
                                                <Label htmlFor="modalBudgetAmount">Valor Orçado:</Label>
                                                <Input
                                                    type="number"
                                                    id="modalBudgetAmount"
                                                    name="budgetedAmount"
                                                    value={budgetForm.budgetedAmount}
                                                    onChange={handleBudgetFormChange}
                                                    required
                                                    step="0.01"
                                                />
                                            </InputGroup>
                                            <BudgetButton type="submit">{isEditingBudget ? 'Salvar Alterações' : 'Adicionar Orçamento'}</BudgetButton>
                                        </form>
                                    </ModalContent>
                                </ModalOverlay>
                            )}
                        </>
                    )}
                </MainContent>
                <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
            </HomeContainer>
        </>
    );
}

export default Home;