import React, { useState, useEffect } from 'react';
import { styled, createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import avatarPadrao from '../assets/avatar.png';
import lapisIcon from '../assets/lapis.png';
import setaVoltar from '../assets/seta.png';

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

// Estilos usando styled-components
const PerfilContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f4f4;
`;

const TopRectangle = styled.div`
  background-color: #108886;
  width: 100%;
  height: 40vh;
  position: relative;
  display: flex;
  justify-content: center;
`;

const AvatarWrapper = styled.div`
  position: absolute;
  bottom: -50px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AvatarImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  object-fit: cover;
`;

const EditButton = styled.div`
  position: absolute;
  bottom: 5px;
  right: -5px;
  background-color: #888;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const EditIcon = styled.img`
  width: 15px;
  height: 15px;
`;

const BackButton = styled.img`
  position: absolute;
  top: 20px;
  left: 20px;
  width: 30px;
  height: 30px;
  cursor: pointer;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  width: 80%;
  max-width: 400px;
`;

const Label = styled.label`
  font-size: 0.9em;
  color: #555;
  margin-bottom: 5px;
  text-align: left;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
`;

const BottomActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
  max-width: 400px;
  margin-top: 30px;
`;

const LogoutText = styled.span`
  color: #FF2F2F;
  cursor: pointer;
`;

const SaveButton = styled.button`
  background-color: #0D4147;
  color: #FFFFFF;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
`;

function Perfil() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [primeiroNome, setPrimeiroNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('********');
  const [fotoPerfil, setFotoPerfil] = useState(avatarPadrao);
  const [novaFoto, setNovaFoto] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    document.title = 'Perfil - Wall & Tea';
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserData(user);
        setNome(user.nome);
        const partesNome = user.nome.split(' ');
        setPrimeiroNome(partesNome[0] || '');
        setEmail(user.email);
        if (user.foto) {
          if (user.foto.data && user.foto.type === 'Buffer') {
            let binary = '';
            const bytes = new Uint8Array(user.foto.data);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            setFotoPerfil(`data:image/jpeg;base64,${base64}`);
          } else {
            setFotoPerfil(user.foto);
          }
        }
      } catch (error) {
        console.error('Erro ao analisar os dados do usuário:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleVoltar = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleInputChangeNome = (event) => {
    const value = event.target.value;
    if (value.split(' ').length <= 1) {
      setNome(value);
    }
  };

  const handleSalvarPerfil = async () => {
    console.log('Salvando perfil:', { primeiroNome, email, novaFoto });

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('email', email);
    if (novaFoto) {
      formData.append('fotoPerfil', novaFoto);
    }

    try {
      const response = await fetch(`http://localhost:3000/usuarios/${userData.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Perfil atualizado com sucesso!');
        navigate('/perfil')
      } else {
        const errorData = await response.json();
        alert(`Erro ao atualizar perfil: ${errorData.erro || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao conectar com o servidor.');
    }
  };

  const handleEditarFoto = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        setNovaFoto(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFotoPerfil(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  if (!userData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Carregando...
      </div>
    );
  }

  return (
    <>
      <GlobalStyle />
      <PerfilContainer>
        <TopRectangle>
          <BackButton src={setaVoltar} alt="Voltar" onClick={handleVoltar} />
          <AvatarWrapper>
            <AvatarImage src={fotoPerfil} alt="Foto de Perfil" />
            <EditButton onClick={handleEditarFoto}>
              <EditIcon src={lapisIcon} alt="Editar Foto" />
            </EditButton>
          </AvatarWrapper>
        </TopRectangle>

        <InputGroup>
          <Label htmlFor="Nome">Nome:</Label>
          <Input
            type="text"
            id="Nome"
            value={nome}
            onChange={handleInputChangeNome}
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="email">Endereço de Email:</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="senha">Senha:</Label>
          <Input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </InputGroup>

        <BottomActions>
          <LogoutText onClick={handleLogout}>Sair da Conta</LogoutText>
          <SaveButton onClick={handleSalvarPerfil}>Salvar</SaveButton>
        </BottomActions>
      </PerfilContainer>
    </>
  );
}

export default Perfil;

