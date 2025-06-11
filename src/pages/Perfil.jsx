import React, { useState, useEffect, useCallback } from 'react';
import { styled, createGlobalStyle, keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import avatarPadrao from '../assets/avatar.png'; // Garanta que este caminho está correto
import lapisIcon from '../assets/lapis.png';     // Garanta que este caminho está correto
import setaVoltar from '../assets/seta.png';     // Garanta que este caminho está correto

// Animação para o spinner de carregamento
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Estilos Globais para uma base consistente
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
// --- Styled Components Aprimorados ---

const PerfilContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  background-color: #F8F9FA;
`;

const HeaderBanner = styled.div`
  background: linear-gradient(135deg, #108886 0%, #0d6b69 100%);
  width: 100%;
  height: 220px;
  position: relative;
`;

const BackButton = styled.img`
  position: absolute;
  top: 25px;
  left: 25px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  filter: invert(100%);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1) translateX(-3px);
  }
`;

const ProfileContent = styled.div`
  width: 100%;
  max-width: 600px;
  margin-top: -100px; // Puxa o conteúdo para cima, sobrepondo o banner
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px 40px;
`;

const AvatarWrapper = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const AvatarImage = styled.img`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid #FFFFFF;
  background-color: #FFFFFF;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
`;

const EditButton = styled.label`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: #108886;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background-color: #0d6b69;
    transform: scale(1.1);
  }
`;

const EditIcon = styled.img`
  width: 20px;
  height: 20px;
  filter: invert(100%);
`;

// Esconde o input de arquivo, que é ativado pela label (EditButton)
const FileInput = styled.input`
  display: none;
`;

const ProfileCard = styled.div`
  background-color: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 40px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 25px; // Aumenta o espaçamento entre os campos
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Label = styled.label`
  font-size: 0.9em;
  color: #555;
  margin-bottom: 8px;
  font-weight: 600;
`;

const Input = styled.input`
  padding: 14px 16px;
  border: 1px solid #DDE2E5;
  border-radius: 8px;
  font-size: 1em;
  color: #333;
  background-color: #FDFDFD;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &::placeholder {
    color: #A0AEC0;
  }

  &:focus {
    outline: none;
    border-color: #108886;
    box-shadow: 0 0 0 3px rgba(16, 136, 134, 0.2);
  }
`;

const BottomActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 20px;
`;

const LogoutText = styled.span`
  color: #E53E3E;
  cursor: pointer;
  font-size: 0.95em;
  font-weight: 600;
  transition: color 0.3s ease, transform 0.2s ease;

  &:hover {
    color: #C53030;
    transform: translateY(-1px);
  }
`;

const SaveButton = styled.button`
  background-color: #108886;
  color: #FFFFFF;
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(16, 136, 134, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background-color: #0d6b69;
    transform: translateY(-3px);
    box-shadow: 0 6px 14px rgba(16, 136, 134, 0.35);
  }
  &:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(16, 136, 134, 0.3);
  }
`;

const Message = styled.p`
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 8px;
  font-weight: 500;
  color: #fff;
  background-color: ${props => props.type === 'success' ? '#2F855A' : '#C53030'};
  text-align: center;
  width: 100%;
  opacity: ${props => props.show ? 1 : 0};
  transform: ${props => props.show ? 'translateY(0)' : 'translateY(-20px)'};
  transition: opacity 0.3s ease, transform 0.3s ease;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #108886;
  animation: ${spin} 1s linear infinite;
`;


function Perfil() {
    const navigate = useNavigate();
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState(avatarPadrao);
    const [novaFoto, setNovaFoto] = useState(null);
    const [userData, setUserData] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '', show: false });

    const showMessage = (text, type) => {
        setMessage({ text, type, show: true });
        setTimeout(() => {
            setMessage(m => ({ ...m, show: false }));
        }, 4000);
    };

    const handleVoltar = () => {
        navigate('/home');
    };

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        navigate('/login');
    }, [navigate]);

    useEffect(() => {
        document.title = 'Meu Perfil - Wall & Tea';
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setUserData(user);
                setNome(user.nome || '');
                setEmail(user.email || '');
                setSenha(''); // Manter vazio por segurança

                // --- CORREÇÃO PRINCIPAL (1) ---
                // Agora, lemos a 'fotoUrl' que o login salvou. Simples e direto.
                if (user.fotoUrl) {
                    setFotoPerfil(user.fotoUrl);
                } else {
                    setFotoPerfil(avatarPadrao);
                }

            } catch (error) {
                console.error('Erro ao processar dados do usuário:', error);
                handleLogout();
            }
        } else {
            navigate('/login');
        }
    }, [navigate, handleLogout]);

    const handleEditarFoto = (event) => {
        const file = event.target.files[0];
        if (file) {
            setNovaFoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPerfil(reader.result); // Mostra a pré-visualização da imagem
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSalvarPerfil = async () => {
        if (!userData || !userData.id) {
            showMessage('Dados do usuário não encontrados.', 'error');
            return;
        }
    
        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('email', email);
        if (senha) {
            formData.append('senha', senha);
        }
        // --- CORREÇÃO PRINCIPAL (2) ---
        // O nome do campo deve ser 'foto', como o backend (multer) espera.
        if (novaFoto) {
            formData.append('foto', novaFoto);
        }
    
        try {
            // Se você colocou a rota PUT em auth.js, a URL deve ser:
            // `http://localhost:3000/auth/usuarios/${userData.id}`
            const response = await fetch(`http://localhost:3000/auth/usuarios/${userData.id}`, {
                method: 'PUT',
                // Para FormData, o browser define o 'Content-Type' automaticamente.
                // Não adicione 'Content-Type': 'application/json' aqui!
                body: formData,
            });
    
            const updatedData = await response.json();
    
            if (response.ok) {
                // O backend agora retorna o usuário atualizado dentro de uma chave 'usuario'
                const userToSave = updatedData.usuario;
                
                // Atualiza o localStorage com os dados mais recentes do servidor
                localStorage.setItem('user', JSON.stringify(userToSave)); 
                setUserData(userToSave);

                // Atualiza os estados do formulário
                setNome(userToSave.nome);
                setEmail(userToSave.email);

                // --- CORREÇÃO PRINCIPAL (3) ---
                // Atualiza a imagem de perfil com a nova URL retornada pelo backend
                if (userToSave.fotoUrl) {
                    setFotoPerfil(userToSave.fotoUrl);
                }

                setSenha('');
                setNovaFoto(null); // Limpa o arquivo da nova foto
                showMessage('Perfil atualizado com sucesso!', 'success');

            } else {
                showMessage(updatedData.erro || 'Erro ao atualizar perfil.', 'error');
            }
        } catch (error) {
            console.error('Erro de conexão ao atualizar perfil:', error);
            showMessage('Não foi possível conectar ao servidor.', 'error');
        }
    };
    
    if (!userData) {
        return (
            <LoadingContainer>
                <Spinner />
            </LoadingContainer>
        );
    }

    return (
        <>
            <GlobalStyle />
            <PerfilContainer>
                <HeaderBanner>
                    <BackButton src={setaVoltar} alt="Voltar" onClick={handleVoltar} />
                </HeaderBanner>
                <ProfileContent>
                    <AvatarWrapper>
                        <AvatarImage src={fotoPerfil} alt="Foto de Perfil" />
                        <EditButton htmlFor="file-upload">
                            <EditIcon src={lapisIcon} alt="Editar Foto" />
                        </EditButton>
                        <FileInput id="file-upload" type="file" accept="image/*" onChange={handleEditarFoto} />
                    </AvatarWrapper>

                    {message.text && <Message type={message.type} show={message.show}>{message.text}</Message>}

                    <ProfileCard>
                       {/* O restante do seu JSX (InputGroup, etc.) permanece o mesmo */}
                       <InputGroup>
                           <Label htmlFor="Nome">Nome Completo</Label>
                           <Input id="Nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
                       </InputGroup>
                       <InputGroup>
                           <Label htmlFor="email">Endereço de Email</Label>
                           <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                       </InputGroup>
                       <InputGroup>
                           <Label htmlFor="senha">Nova Senha</Label>
                           <Input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Deixe em branco para não alterar" />
                       </InputGroup>
                       <BottomActions>
                           <LogoutText onClick={handleLogout}>Sair da Conta</LogoutText>
                           <SaveButton onClick={handleSalvarPerfil}>Salvar Alterações</SaveButton>
                       </BottomActions>
                    </ProfileCard>
                </ProfileContent>
            </PerfilContainer>
        </>
    );
}

export default Perfil;