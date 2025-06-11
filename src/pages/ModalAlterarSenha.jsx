/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { styled } from 'styled-components';

// Estilos para o Modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const ModalContent = styled.div`
  background-color: #fff;
  padding: 30px 40px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px;
  position: relative;
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-30px)'};
  transition: transform 0.3s ease;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
  line-height: 1;
  &:hover {
    color: #000;
  }
`;

const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 25px;
  color: #333;
  text-align: center;
  font-size: 1.5em;
  font-weight: 700;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 0.9em;
  color: #555;
  margin-bottom: 8px;
  font-weight: 600;
  display: block;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #DDE2E5;
  border-radius: 8px;
  font-size: 1em;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #108886;
    box-shadow: 0 0 0 3px rgba(16, 136, 134, 0.2);
  }
`;

const ModalButton = styled.button`
  width: 100%;
  background-color: #108886;
  color: #FFFFFF;
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 700;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0d6b69;
  }
`;

const Message = styled.p`
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 8px;
  font-weight: 500;
  color: #fff;
  text-align: center;
  background-color: ${props => props.type === 'success' ? '#2F855A' : '#C53030'};
`;


function ModalAlterarSenha({ isOpen, onClose, userId }) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const cleanForm = () => {
    setMessage({ text: '', type: '' });
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
  }

  const handleClose = () => {
    cleanForm();
    onClose();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (novaSenha !== confirmarSenha) {
      setMessage({ text: 'As novas senhas não conferem.', type: 'error' });
      return;
    }
    if (novaSenha.length < 6) {
        setMessage({ text: 'A nova senha deve ter pelo menos 6 caracteres.', type: 'error' });
        return;
    }

    try {
      const response = await fetch(`http://localhost:3000/usuarios/${userId}/senha`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.message, type: 'success' });
        setTimeout(() => {
          handleClose(); // Fecha o modal e limpa o form após o sucesso
        }, 2000);
      } else {
        setMessage({ text: data.error, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Erro ao conectar com o servidor.', type: 'error' });
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={handleClose}>
      <ModalContent isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>&times;</CloseButton>
        <Title>Alterar Senha</Title>
        {message.text && <Message type={message.type}>{message.text}</Message>}
        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="senhaAtual">Senha Atual</Label>
            <Input id="senhaAtual" type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} required />
          </InputGroup>
          <InputGroup>
            <Label htmlFor="novaSenha">Nova Senha</Label>
            <Input id="novaSenha" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required />
          </InputGroup>
          <InputGroup>
            <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
            <Input id="confirmarSenha" type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required />
          </InputGroup>
          <ModalButton type="submit">Salvar Nova Senha</ModalButton>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
}

export default ModalAlterarSenha;