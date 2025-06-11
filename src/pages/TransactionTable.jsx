import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import lupaIcon from '../assets/lupa.png'; // Make sure this path is correct

// --- Styled Components ---

const TableContainer = styled.div`
    // FIX: Changed width from 200% to 100% to prevent horizontal overflow.
    width: 100%;
    margin-top: 20px;
    border-radius: 10px;
    overflow-x: auto; // FIX: Allows table to scroll horizontally on small screens if needed.
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #fff;
    padding: 20px;
`;

const SearchBarContainer = styled.div`
    width: 100%;
    max-width: 500px; // Added max-width for better appearance
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

    img {
        width: 20px;
        height: 20px;
        filter: invert(100%);
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
    padding: 12px 15px; // Increased padding
    text-align: left;
    border-bottom: 1px solid #ddd;
    font-size: 0.9em;
    color: #0D4147;
`;

const TableRow = styled.tr`
    &:nth-child(even) {
        background-color: #f9f9f9;
    }
    &:hover {
        background-color: #f1f1f1;
    }
`;

const TableCell = styled.td`
    padding: 12px 15px; // Increased padding
    border-bottom: 1px solid #eee;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: ${props => props.$maxWidth || '200px'}; // Set a default max-width
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

const ActionButton = styled.button`
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

const DeleteButton = styled.button`
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

const Select = styled.select`
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
`;

const Message = styled.p`
    margin-top: 10px;
    margin-bottom: 10px;
    font-weight: bold;
    color: ${props => props.type === 'success' ? 'green' : 'red'};
    text-align: center;
`;

const TransactionTable = ({ onTransactionChange }) => {
    const [transactions, setTransactions] = useState([]);
    const [newTransaction, setNewTransaction] = useState({
        id: null,
        description: '',
        entity: '',
        payment_method: '',
        transaction_date: '',
        amount: '',
        category_id: '',
        transaction_type: 'expense',
    });
    const [showModal, setShowModal] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const userId = localStorage.getItem('userId');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [isEditing, setIsEditing] = useState(false);

    const fetchTransactions = useCallback(async () => {
        if (userId) {
            try {
                const response = await fetch(`http://localhost:3000/api/transactions?userId=${userId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const formattedData = data.map(trans => ({
                    ...trans,
                    transaction_date: new Date(trans.transaction_date).toISOString().split('T')[0],
                    transaction_type: parseFloat(trans.amount) < 0 ? 'expense' : 'income'
                }));
                setTransactions(formattedData);
            } catch (error) {
                console.error("Erro ao buscar transações:", error);
                setErrorMessage('Erro ao carregar transações. Tente novamente.');
            }
        }
    }, [userId]);

    const fetchCategorias = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3000/api/categorias');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setCategorias(data);
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
            setErrorMessage('Erro ao buscar categorias: ' + error.message);
        }
    }, []);

    useEffect(() => {
        fetchCategorias();
        fetchTransactions();
    }, [fetchCategorias, fetchTransactions]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewTransaction(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setNewTransaction({
            id: null,
            description: '',
            entity: '',
            payment_method: '',
            transaction_date: '',
            amount: '',
            category_id: '',
            transaction_type: 'expense',
        });
        setIsEditing(false);
    };

    const handleOpenModalForAdd = () => {
        resetForm();
        setSuccessMessage('');
        setErrorMessage('');
        setShowModal(true);
    };

    const handleOpenModalForEdit = (transaction) => {
        setSuccessMessage('');
        setErrorMessage('');
        setNewTransaction({
            id: transaction.id,
            description: transaction.description,
            entity: transaction.entity,
            payment_method: transaction.payment_method,
            transaction_date: transaction.transaction_date,
            amount: Math.abs(parseFloat(transaction.amount)),
            category_id: transaction.category_id,
            transaction_type: parseFloat(transaction.amount) < 0 ? 'expense' : 'income'
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        if (userId) {
            let finalAmount = parseFloat(newTransaction.amount);
            if (newTransaction.transaction_type === 'expense') {
                finalAmount = -Math.abs(finalAmount);
            } else {
                finalAmount = Math.abs(finalAmount);
            }

            try {
                const method = isEditing ? 'PUT' : 'POST';
                const url = isEditing
                    ? `http://localhost:3000/api/transactions/${newTransaction.id}`
                    : 'http://localhost:3000/api/transactions';

                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...newTransaction,
                        amount: finalAmount,
                        userId: userId,
                    }),
                });

                if (response.ok) {
                    await fetchTransactions();
                    setSuccessMessage(isEditing ? 'Transação atualizada com sucesso!' : 'Transação adicionada com sucesso!');
                    setTimeout(() => setSuccessMessage(''), 3000);
                    setShowModal(false);
                    resetForm();
                    if (onTransactionChange) {
                        onTransactionChange();
                    }
                } else {
                    const errorData = await response.json();
                    setErrorMessage('Erro ao salvar transação: ' + (errorData.error || 'Erro desconhecido'));
                }
            } catch (error) {
                setErrorMessage('Erro na comunicação com o servidor: ' + error.message);
            }
        } else {
            setErrorMessage('Usuário não autenticado. Por favor, faça login.');
        }
    };

    const handleDelete = async (transactionId) => {
        if (!window.confirm('Tem certeza que deseja excluir esta transação?')) {
            return;
        }
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const response = await fetch(`http://localhost:3000/api/transactions/${transactionId}?userId=${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchTransactions();
                setSuccessMessage('Transação excluída com sucesso!');
                setTimeout(() => setSuccessMessage(''), 3000);
                if (onTransactionChange) {
                    onTransactionChange();
                }
            } else {
                const errorData = await response.json();
                setErrorMessage('Erro ao excluir transação: ' + (errorData.error || 'Erro desconhecido'));
            }
        } catch (error) {
            setErrorMessage('Erro na comunicação com o servidor ao excluir: ' + error.message);
        }
    };

    const filteredTransactions = transactions.filter(transaction =>
        Object.values(transaction).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
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
                <SearchButton>
                    <img src={lupaIcon} alt="Pesquisar" />
                </SearchButton>
            </SearchBarContainer>

            <h3 style={{ color: '#108886', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Transações
                <Button onClick={handleOpenModalForAdd} style={{ marginTop: 0, padding: '5px 10px', fontSize: '0.9em' }}>
                    + Adicionar
                </Button>
            </h3>

            {successMessage && <Message type="success">{successMessage}</Message>}
            {errorMessage && !showModal && <Message type="error">{errorMessage}</Message>}

            <StyledTable>
                <TableHead>
                    <tr>
                        <TableHeader>Código</TableHeader>
                        <TableHeader>Descrição</TableHeader>
                        <TableHeader>Entidade</TableHeader>
                        <TableHeader>Pagamento</TableHeader>
                        <TableHeader>Data</TableHeader>
                        <TableHeader>Valor</TableHeader>
                        <TableHeader>Categoria</TableHeader>
                        <TableHeader>Tipo</TableHeader>
                        <TableHeader>Ações</TableHeader>
                    </tr>
                </TableHead>
                <tbody>
                    {filteredTransactions.map(transaction => (
                        <TableRow key={transaction.id}>
                            <TableCell $maxWidth="60px">{transaction.id}</TableCell>
                            <TableCell $maxWidth="200px">{transaction.description}</TableCell>
                            <TableCell $maxWidth="150px">{transaction.entity}</TableCell>
                            <TableCell $maxWidth="120px">{transaction.payment_method}</TableCell>
                            <TableCell $maxWidth="110px">{transaction.transaction_date}</TableCell>
                            <TableCell $maxWidth="120px">
                                <span style={{ color: parseFloat(transaction.amount) < 0 ? '#DA4141' : '#4CAF50', fontWeight: 'bold' }}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}
                                </span>
                            </TableCell>
                            <TableCell $maxWidth="120px">{transaction.category_name}</TableCell>
                            <TableCell $maxWidth="80px">
                                {parseFloat(transaction.amount) < 0 ? 'Despesa' : 'Receita'}
                            </TableCell>
                            <TableCell $maxWidth="180px">
                                <ActionButtons>
                                    <ActionButton onClick={() => handleOpenModalForEdit(transaction)}>Editar</ActionButton>
                                    <DeleteButton onClick={() => handleDelete(transaction.id)}>Excluir</DeleteButton>
                                </ActionButtons>
                            </TableCell>
                        </TableRow>
                    ))}
                </tbody>
            </StyledTable>

            {showModal && (
                <ModalOverlay>
                    <ModalContent>
                        <CloseButton onClick={() => { setShowModal(false); resetForm(); }}>×</CloseButton>
                        <h4>{isEditing ? 'Editar Transação' : 'Adicionar Nova Transação'}</h4>
                        {errorMessage && <Message type="error">{errorMessage}</Message>}
                        <form onSubmit={handleSubmit}>
                            <InputGroup>
                                <Label htmlFor="description">Descrição:</Label>
                                <Input
                                    type="text" id="description" name="description"
                                    value={newTransaction.description} onChange={handleInputChange} required
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label htmlFor="entity">Entidade:</Label>
                                <Input
                                    type="text" id="entity" name="entity"
                                    value={newTransaction.entity} onChange={handleInputChange}
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label htmlFor="payment_method">Método de Pagamento:</Label>
                                <Input
                                    type="text" id="payment_method" name="payment_method"
                                    value={newTransaction.payment_method} onChange={handleInputChange}
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label htmlFor="transaction_date">Data:</Label>
                                <Input
                                    type="date" id="transaction_date" name="transaction_date"
                                    value={newTransaction.transaction_date} onChange={handleInputChange} required
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label htmlFor="amount">Valor:</Label>
                                <Input
                                    type="number" id="amount" name="amount"
                                    value={newTransaction.amount} onChange={handleInputChange} required step="0.01"
                                />
                            </InputGroup>
                            <InputGroup>
                                <Label htmlFor="transaction_type">Tipo de Transação:</Label>
                                <Select
                                    id="transaction_type" name="transaction_type"
                                    value={newTransaction.transaction_type} onChange={handleInputChange} required
                                >
                                    <option value="expense">Despesa</option>
                                    <option value="income">Receita</option>
                                </Select>
                            </InputGroup>
                            <InputGroup>
                                <Label htmlFor="category_id">Categoria:</Label>
                                <Select
                                    id="category_id" name="category_id"
                                    value={newTransaction.category_id} onChange={handleInputChange} required
                                >
                                    <option value="">Selecione a Categoria</option>
                                    {categorias.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </Select>
                            </InputGroup>
                            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Adicionar Transação'}</Button>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}
        </TableContainer>
    );
};

export default TransactionTable;