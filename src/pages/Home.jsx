import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { useNavigate } from 'react-router-dom';

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

const HoyolabImage = styled.img`
  max-width: 80%;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Home - Wall & Tea';
    const token = localStorage.getItem('token');
    console.log("Home: Verificando token:", token);

    if (token) {
      setIsLoggedIn(true);
      console.log("Home: Usuário autenticado. Token encontrado:", token);
    } else {
      setIsLoggedIn(false);
      console.log("Home: Usuário não autenticado, redirecionando para /login");
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    console.log('Home: Usuário deslogado, redirecionando para /login');
    navigate('/login');
  };

  if (loading) {
    return (
      <HomeContainer>
        <p>Carregando...</p>
      </HomeContainer>
    );
  }

  if (!isLoggedIn) {
    console.log("Home: Usuário não está logado, não renderizando conteúdo.");
    return null;
  }

  return (
    <HomeContainer>
      <WelcomeTitle>Bem-vindo(a) à Home!</WelcomeTitle>
      <WelcomeText>
        O jogo.
      </WelcomeText>
      <HoyolabImage
        src="https://upload-os-bbs.hoyolab.com/upload/2024/09/28/372328086/fba9b58c6ff1766b4f59a536535421d8_957607481687062502.png?x-oss-process=image%2Fresize%2Cs_1000%2Fauto-orient%2C0%2Finterlace%2C1%2Fformat%2Cwebp%2Fquality%2Cq_70"
        alt="Imagem da Página Home"
      />
      <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
    </HomeContainer>
  );
}

export default Home;
