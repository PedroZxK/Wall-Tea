import React, { useState, useEffect } from 'react';
import { styled, createGlobalStyle } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  body {
    font-family: 'Inter', sans-serif;
    margin: 0;
  }
  html, body {
    height: 100%;
    background-color: #108886;
  }
  #root {
    padding: 0;
  
`;

const CadastroContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 93vh;
  padding: 0;
  width: 100%;
`;

const FormContainer = styled.div`
  background-color: #ffffff;
  padding: 60px;
  border-radius: 90px;
  width: 500px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #000000;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  color: #000000;
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  text-align: left;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #656ed3;
  border-radius: 15px;
  color: #000000;
  background-color: #ffffff;
  font-size: 16px;
  transition: border-color 0.5s ease;

  &:focus {
    outline: none;
    border-color: rgb(18, 91, 99);
    box-shadow: 0 0 5px rgba(18, 91, 99, 0.3);
  }
`;

const Button = styled.button`
  background-color: #0d4147;
  color: #ffffff;
  padding: 12px 20px;
  border: none;
  border-radius: 50px;
  width: 100%;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 20px;

  &:hover {
    background-color: #082e32;
  }
`;

const FooterText = styled.p`
  color: #000000;
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
`;

const LoginLink = styled(Link)`
  font-weight: bold;
  color: #000000;
  text-decoration: none;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.2);
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
  }
`;

function Cadastro() {
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    if (!nome || !username || !email || !senha || !confirmarSenha) {
      setErro('Tentativa de registro sem preencher os campos.');
      return;
    }

    if (/[^a-zA-Z0-9_.]/.test(username)) {
      setErro('Não é Permitido Espaços ou Símbolos no nome de usuário.');
      return;
    }

    if (username === 'usuarioexistente') {
      setErro('Nome de usuário já existe.');
      return;
    }

    if (senha.length < 8) {
      setErro('Senha muito curta, < 8 caracteres.');
      return;
    }

    if (!/\d/.test(senha) && !/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
      setErro('Senha não contém números ou símbolos.');
      return;
    }

    if (!/[A-Z]/.test(senha)) {
      setErro('Senha não contém letras maiúsculas.');
      return;
    }

    if (!/[a-z]/.test(senha)) {
      setErro('Senha não contém letras minúsculas.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('Senha não coincide com a confirmação.');
      return;
    }

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      setErro('Endereço de email inválido.');
      return;
    }

    if (email === 'email@existente.com') {
      setErro('Email já cadastrado.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, username, email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem(data.mensagem);
        setNome('');
        setUsername('');
        setEmail('');
        setSenha('');
        setConfirmarSenha('');
        alert('Cadastro realizado com sucesso! Você será redirecionado para a página de login.');
        navigate('/login');
      } else {
        setErro(data.erro || 'Erro ao cadastrar usuário');
      }
    } catch (error) {
      setErro('Erro ao conectar com o servidor');
      console.error('Erro ao cadastrar:', error);
    }
  };

  useEffect(() => {
    document.title = 'Cadastro - Wall & Tea';
  }, []);

  return (
    <>
      <GlobalStyle />
      <CadastroContainer>
        <FormContainer>
          <Title>Registrar-se</Title>
          {mensagem && <p style={{ color: 'green' }}>{mensagem}</p>}
          {erro && <p style={{ color: 'red' }}>{erro}</p>}
          <InputGroup>
            <Label htmlFor="nome">Nome Completo:</Label>
            <Input
              type="text"
              id="nome"
              placeholder="Insira o seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <Label htmlFor="username">Nome de Usuário:</Label>
            <Input
              type="text"
              id="username"
              placeholder="Insira o seu nome de usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <Label htmlFor="email">Endereço de Email:</Label>
            <Input
              type="email"
              id="email"
              placeholder="Insira o seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <Label htmlFor="senha">Senha:</Label>
            <Input
              type="password"
              id="senha"
              placeholder="Insira a sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <Label htmlFor="confirmarSenha">Confirmar Senha:</Label>
            <Input
              type="password"
              id="confirmarSenha"
              placeholder="Confirme a sua senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </InputGroup>
          <Button type="submit" onClick={handleCadastro}>Registrar</Button>
          <FooterText>
            Eu tenho uma conta!{' '}
            <LoginLink to="/login">Entrar</LoginLink>
          </FooterText>
        </FormContainer>
      </CadastroContainer>
    </>
  );
}

export default Cadastro;
