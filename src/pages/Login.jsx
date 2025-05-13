import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { styled, createGlobalStyle } from 'styled-components';

// Estilos globais para o box-sizing e a fonte
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
  }
`;

// Estilos usando styled-components
const CadastroContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
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

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Login - Wall & Tea';
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    if (!email || !senha) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem(data.mensagem);
        console.log('Usuário logado:', data.usuario);
        // Salvar o token no localStorage
        localStorage.setItem('token', data.token); // Assumindo que o token vem em data.token
        alert('Login realizado com sucesso! Você será redirecionado para a página inicial.');
        navigate('/home');
      } else {
        setErro(data.erro || 'Credenciais inválidas. Tente novamente.');
      }
    } catch (error) {
      setErro('Erro ao conectar com o servidor.');
      console.error('Erro ao fazer login:', error);
    }
  };

  return (
    <>
      <GlobalStyle />
      <CadastroContainer>
        <FormContainer>
          <Title>Bem-vindo (a) de volta!</Title>
          {mensagem && <p style={{ color: 'green' }}>{mensagem}</p>}
          {erro && <p style={{ color: 'red' }}>{erro}</p>}
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
          <Button type="submit" onClick={handleLogin}>Entrar</Button>
          <FooterText>
            Não tem uma conta? <LoginLink to="/cadastro">Registre-se</LoginLink>
          </FooterText>
        </FormContainer>
      </CadastroContainer>
    </>
  );
}

export default Login;
