import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

// --- Styled Components ---

const TableContainer = styled.div`
    width: 80%;
    margin-top: 20px;
    box-shadow: 6px 7px 6px -4px rgba(0,0,0,0.75);
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #fff;
    padding: 20px;
`;

const SearchBarContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 10px 20px;
    border: 1px solid #ccc;
    border-radius: 25px;
`;

const SearchButton = styled.button`
    background-color: #108886;
    border: none;
    border-radius: 50%;
    color: white;
    width: 40px;
    height: 40px;
    margin-left: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
        background-color: #0d6b69;
    }
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHead = styled.thead`
    background-color: #c3fefc;
`;

const TableHeader = styled.th`
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
`;

const TableRow = styled.tr`
    &:nth-child(even) {
        background-color: #f9f9f9;
    }
`;

const TableCell = styled.td`
    padding: 10px;
    border-bottom: 1px solid #eee;
    text-align: left;
`;

const Button = styled.button`
    background-color: #108886;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s ease;
    margin-top: 10px;

    &:hover {
        background-color: #0d6b69;
    }
`;

const IconButton = styled.button`
    background-color: #108886;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-size: 0.9em;

    &:hover {
        background-color: #0d6b69;
    }
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
`;

const ModalOverlay = styled.div`
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

const ModalContent = styled.div`
    background: white;
    padding: 30px;
    border-radius: 10px;
    width: 400px;
    max-width: 90%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    position: relative;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
    border: none;
    background: transparent;
    font-size: 1.2rem;
    cursor: pointer;
`;

const InputGroup = styled.div`
    margin-bottom: 15px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
`;

const Input = styled.input`
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
`;

// --- Component Function ---

const TransactionTable = () => {
    const [transactions, setTransactions] = useState([]);
    const [newTransaction, setNewTransaction] = useState({
        descricao: '',
        entidade: '',
        pagamento: '',
        data: '',
        valor_total: '',
        categoria_id: '',
    });
    const [showModal, setShowModal] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const userId = localStorage.getItem('userId');
    const [successMessage, setSuccessMessage] = useState('');

    const fetchTransactions = useCallback(async () => {
        if (userId) {
            try {
                const response = await fetch(`http://localhost:3000/api/transactions?userId=${userId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                return data;
            } catch (error) {
                console.error("Erro ao buscar transações:", error);
                throw error;
            }
        }
        return [];
    }, [userId]);

    const fetchCategorias = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3000/api/categorias');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setCategorias(data);
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
            alert('Erro ao buscar categorias: ' + error.message);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchCategorias();
                const data = await fetchTransactions();
                setTransactions(data);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            }
        };
        loadData();
    }, [fetchCategorias, fetchTransactions, userId]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewTransaction(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (userId) {
            try {
                const response = await fetch('http://localhost:3000/api/transactions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...newTransaction,
                        userId: userId,
                    }),
                });
                if (response.ok) {
                    setNewTransaction({ descricao: '', entidade: '', pagamento: '', data: '', valor_total: '', categoria_id: '' });
                    const updatedTransactions = await fetchTransactions();
                    setTransactions(updatedTransactions);
                    setSuccessMessage('Transação adicionada com sucesso!');
                    setTimeout(() => setSuccessMessage(''), 3000);
                    setShowModal(false);
                } else {
                    const errorData = await response.json();
                    alert('Erro ao adicionar transação: ' + errorData.error);
                }
            } catch (error) {
                alert('Erro ao adicionar transação: ' + error.message);
            }
        } else {
            alert('Usuário não autenticado. Por favor, faça login.');
        }
    };

    const filteredTransactions = transactions.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <TableContainer>
            <SearchBarContainer>
                <SearchInput 
                    type="text" 
                    placeholder="Pesquisar transações..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <SearchButton>🔍</SearchButton>
            </SearchBarContainer>

            <h3 style={{ color: '#108886', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Transações 
                <span 
                    style={{ fontWeight: 'normal', cursor: 'pointer' }} 
                    onClick={() => setShowModal(true)}
                >+</span>
                <ActionButtons>
                    <IconButton>Editar</IconButton>
                    <IconButton>Excluir</IconButton>
                </ActionButtons>
            </h3>

            <StyledTable>
                <TableHead>
                    <tr>
                        <TableHeader>Descrição</TableHeader>
                        <TableHeader>Entidade</TableHeader>
                        <TableHeader>Pagamento</TableHeader>
                        <TableHeader>Data</TableHeader>
                        <TableHeader>Valor Total</TableHeader>
                    </tr>
                </TableHead>
                <tbody>
                    {filteredTransactions.map(transaction => (
                        <TableRow key={transaction.id}>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>{transaction.entity}</TableCell>
                            <TableCell>{transaction.payment_method}</TableCell>
                            <TableCell>{new Date(transaction.transaction_date).toLocaleDateString()}</TableCell>
                            <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}</TableCell>
                        </TableRow>
                    ))}
                </tbody>
            </StyledTable>

            {showModal && (
                <ModalOverlay>
                    <ModalContent>
                        <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
                        <h4>Adicionar Nova Transação</h4>
                        <form onSubmit={handleSubmit}>
                            <InputGroup>
                                <Label htmlFor="descricao">Descrição:</Label>
                                <Input
                                    type="text"
                                    id="descricao"
                                    name="descricao"
                                    value={newTransaction.descricao}
                                    onChange={handleInputChange}
                                    required
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label htmlFor="entidade">Entidade:</Label>
                                <Input
                                    type="text"
                                    id="entidade"
                                    name="entidade"
                                    value={newTransaction.entidade}
                                    onChange={handleInputChange}
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label htmlFor="pagamento">Pagamento:</Label>
                                <Input
                                    type="text"
                                    id="pagamento"
                                    name="pagamento"
                                    value={newTransaction.pagamento}
                                    onChange={handleInputChange}
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label htmlFor="data">Data:</Label>
                                <Input
                                    type="date"
                                    id="data"
                                    name="data"
                                    value={newTransaction.data}
                                    onChange={handleInputChange}
                                    required
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label htmlFor="valor_total">Valor Total:</Label>
                                <Input
                                    type="number"
                                    id="valor_total"
                                    name="valor_total"
                                    value={newTransaction.valor_total}
                                    onChange={handleInputChange}
                                    required
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label htmlFor="categoria_id">Categoria:</Label>
                                <select
                                    id="categoria_id"
                                    name="categoria_id"
                                    value={newTransaction.categoria_id}
                                    onChange={handleInputChange}
                                    required
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
                                >
                                    <option value="">Selecione a Categoria</option>
                                    {categorias.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </InputGroup>
                            {successMessage && (
                                <p style={{ color: 'green', marginBottom: '10px', fontWeight: 'bold' }}>
                                    {successMessage}
                                </p>
                            )}
                            <Button type="submit">Adicionar Transação</Button>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}
        </TableContainer>
    );
};

export default TransactionTable;
