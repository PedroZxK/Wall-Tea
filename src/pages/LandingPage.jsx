import React, { useState, useEffect } from 'react';
import { styled, createGlobalStyle } from 'styled-components';
import { Link } from 'react-router-dom';
// eslint-disable-next-line
import { motion, AnimatePresence } from 'framer-motion';

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

const NavButtons = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const NavButton = styled(Link)`
  background-color: #FFFFFF;
  color: #0D4147;
  padding: 8px 16px;
  border-radius: 5px;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const LeftButton = styled(Link)`
  background-color: #108886;
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 5px;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.2s ease;

  &:hover {
    background-color:rgb(14, 103, 101);
  }
`;

const Footer = styled.footer`
  background-color: #0D4147;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: auto;
  bottom: 0;
`;

const SocialLogos = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
`;

const Logo = styled.img`
  height: 30px;
  transition: transform 0.2s ease-in-out, filter 0.2s ease-in-out;

  &:hover {
    transform: scale(1.2);
    filter: grayscale(0.8);
  }
`;

const Copyright = styled.p`
  color: #FFFFFF;
  font-size: 0.9em;
`;

const MainContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1;
  overflow: hidden;
`;

const Section = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  width: 100%;
  max-width: 100%;
`;

const LeftText = styled.div`
  flex: 1;
  width: 100%;
`;

const RightImage = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

const OpacityImageRight = styled.img`
  max-width: 100%;
  height: auto;
  mask-image: linear-gradient(to left, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
`;

const LeftImage = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-start;
  width: 100%;
`;

const OpacityImageLeft = styled.img`
  max-width: 100%;
  height: auto;
  mask-image: linear-gradient(to right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
`;

const RightAlignedText = styled.div`
  flex: 1;
  padding-left: 20px;
  width: 100%;
`;

const FerramentasSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FerramentaItem = styled(Section)`
  margin-bottom: 40px;
  width: 100%;
`;

const sectionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

function App() {
  const [activeSection, setActiveSection] = useState('conheca');

  useEffect(() => {
    document.title = "Início - Wall & Tea";
  }, []);

  const handleNavClick = (section) => {
    setActiveSection(section);
  };

  return (
    <>
      <GlobalStyle />
      <Navbar>
        <NavLinks>
          <NavItem
            onClick={() => handleNavClick('conheca')}
            className={activeSection === 'conheca' ? 'active' : ''}
          >
            Conheça a Wall&Tea
          </NavItem>
          <NavItem
            onClick={() => handleNavClick('instituicao')}
            className={activeSection === 'instituicao' ? 'active' : ''}
          >
            Instituição
          </NavItem>
          <NavItem
            onClick={() => handleNavClick('ferramentas')}
            className={activeSection === 'ferramentas' ? 'active' : ''}
          >
            Ferramentas
          </NavItem>
        </NavLinks>
        <NavButtons>
          <NavButton to="/login">Entrar</NavButton>
          <NavButton to="/cadastro">Criar uma conta</NavButton>
        </NavButtons>
      </Navbar>

      <MainContent>
        <AnimatePresence mode='wait'>
          {activeSection === 'conheca' && (
            <motion.div
              key="conheca"
              variants={sectionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ width: '100%' }}
            >
              <Section>
                <LeftText style={{ width: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <p style={{ fontSize: '3rem', marginBottom: '-2rem' }}>Administre</p>
                  <p style={{ fontSize: '3rem', fontWeight: "bold", color: '#108886', fontStyle: 'italic', marginBottom: '-2rem' }}>seu dinheiro</p>
                  <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>por aqui!</p>
                  <LeftButton to="/cadastro">Criar uma conta</LeftButton>
                </LeftText>
                <RightImage style={{ width: '100%' }}>
                  <OpacityImageRight src="src\assets\moneyCount.png" alt="Contagem de Dinheiro" />
                </RightImage>
              </Section>
              <Section style={{ width: '100%' }}>
                <LeftImage style={{ width: '100%' }}>
                  <OpacityImageLeft src="src\assets\womanComputer.png" alt="Mulher no Computador" />
                </LeftImage>
                <RightAlignedText style={{ width: '100%' }}>
                  <p style={{ width: '900px', textAlign: 'right', fontSize: '1.1rem' }}> <span style={{ color: '#108886', fontWeight: 'bold' }}>Organize sua vida financeira de um jeito simples e visual. </span>Registre suas despesas e receitas, estabeleça limites de gastos por categoria com nossos orçamentos flexíveis e planeje seu futuro definindo metas financeiras. Nossa ferramenta ainda oferece insights e dicas sobre como usar melhor o seu dinheiro, trazendo mais tranquilidade para o seu dia a dia. <span style={{ color: '#108886', fontWeight: 'bold' }}>Comece a transformar sua relação com o dinheiro.</span></p>
                </RightAlignedText>
              </Section>
            </motion.div>
          )}

          {activeSection === 'instituicao' && (
            <motion.div
              key="instituicao"
              variants={sectionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ width: '100%' }}
            >
              <Section style={{ width: '100%' }}>
                <LeftText style={{ width: '100%' }}>
                  <h2 style={{ textAlign: 'left', fontSize: '3rem', color: '#108886' }}>SENAI - Félix Guisard</h2>
                  <p style={{ width: '900px', textAlign: 'left', fontSize: '1.1rem' }}>O SENAI é um dos cinco maiores complexos de educação profissional do mundo e o maior da América Latina. A rede SENAI-SP engloba 92 unidades fixas, incluindo a escola SENAI Félix Guisard, localizada na cidade de Taubaté.</p>
                  <p style={{ width: '900px', textAlign: 'left', fontSize: '1.1rem' }}>Oferecemos cursos para as qualificações de mecânica, metalurgia, eletricidade, eletrônica, automação, segurança do trabalho, logística, gestão, tecnologia da informação, em um ambiente de ensino projetado para oferecer capacitação profissional e especialização técnica. Contamos com laboratórios de metrologia, hidráulica, pneumática, impressão 3D, informática e oficinas de automobilística, soldagem, caldeiraria, mecânica geral, ferramentaria e plásticos.</p>
                </LeftText>
                <RightImage style={{ width: '100%' }}>
                  <OpacityImageRight src="src\assets\senai.png" alt="SENAI" />
                </RightImage>
              </Section>
            </motion.div>
          )}

          {activeSection === 'ferramentas' && (
            <motion.div
              key="ferramentas"
              variants={sectionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ width: '100%' }}
            >
              <FerramentasSection style={{ width: '100%' }}>
                <FerramentaItem style={{ width: '100%' }}>
                  <LeftText style={{ width: '100%' }}>
                    <h2 style={{ textAlign: 'left', fontSize: '3rem', color: '#0D4147' }}>Controle de Gastos mensais</h2>
                    <p style={{ width: '900px', textAlign: 'left', fontSize: '1.5rem', color: '#108886', fontStyle: 'italic' }}>Saiba onde vai cada centavo!</p>
                    <p style={{ width: '900px', textAlign: 'left', fontSize: '1.1rem', color: '#000000' }}>Registre facilmente suas despesas e receitas diárias. Visualize um resumo claro do seu fluxo de caixa mensal e identifique seus principais padrões de gastos.</p>
                  </LeftText>
                  <RightImage style={{ width: '100%' }}>
                    <OpacityImageRight src="src\assets\moneyHand.png" alt="Controle de Gastos" />
                  </RightImage>
                </FerramentaItem>

                <FerramentaItem style={{ width: '100%' }}>
                  <LeftImage style={{ width: '100%' }}>
                    <OpacityImageLeft src="src\assets\moneyCalc.png" alt="Orçamentos" />
                  </LeftImage>
                  <RightAlignedText style={{ width: '100%' }}>
                    <h2 style={{ textAlign: 'right', fontSize: '3rem', color: '#0D4147' }}>Orçamentos</h2>
                    <p style={{ width: '900px', textAlign: 'right', fontSize: '1.5rem', color: '#108886', fontStyle: 'italic' }}>Defina seus limites, mantenha o controle.</p>
                    <p style={{ width: '900px', textAlign: 'right', fontSize: '1.1rem' }}>Crie orçamentos personalizados para diferentes categorias (como alimentação, transporte, lazer). Acompanhe em tempo real quanto você já gastou e evite estourar o planejado.</p>
                  </RightAlignedText>
                </FerramentaItem>

                <FerramentaItem style={{ width: '100%' }}>
                  <LeftText style={{ width: '100%' }}>
                    <h2 style={{ textAlign: 'left', fontSize: '3rem', color: '#0D4147' }}>Metas Financeiras</h2>
                    <p style={{ width: '800px', textAlign: 'left', fontSize: '1.5rem', color: '#108886', fontStyle: 'italic' }}>Transforme sonhos em planos concretos.</p>
                    <p style={{ width: '800px', textAlign: 'left', fontSize: '1.1rem', color: '#000000' }}>Estabeleça seus objetivos financeiros, seja uma viagem, a entrada de um imóvel ou uma reserva de emergência. Monitore seu progresso e mantenha a motivação para alcançar o que deseja.</p>
                  </LeftText>
                  <RightImage style={{ width: '100%' }}>
                    <OpacityImageRight src="src\assets\moneyGraph.png" alt="Metas Financeiras" />
                  </RightImage>
                </FerramentaItem>

                <FerramentaItem style={{ width: '100%' }}>
                  <LeftImage style={{ width: '100%' }}>
                    <OpacityImageLeft src="src\assets\womanTalk.png" alt="Feedback" />
                  </LeftImage>
                  <RightAlignedText style={{ width: '100%' }}>
                    <h2 style={{ textAlign: 'right', fontSize: '3rem', color: '#0D4147' }}>Feedbacks e Sugestões</h2>
                    <p style={{ width: '900px', textAlign: 'right', fontSize: '1.5rem', color: '#108886', fontStyle: 'italic' }}>Decisões mais inteligentes para o seu dinheiro.</p>
                    <p style={{ width: '900px', textAlign: 'right', fontSize: '1.1rem' }}>Receba análises sobre seus hábitos financeiros e sugestões práticas da Wall&Tea. Descubra oportunidades de economia e entenda como otimizar o uso do seu dinheiro com base nos seus próprios dados.</p>
                  </RightAlignedText>
                </FerramentaItem>
              </FerramentasSection>
            </motion.div>
          )}
        </AnimatePresence>
      </MainContent>

      <Footer>
        <SocialLogos>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
            <Logo src="src\assets\instagram.png" alt="Instagram" />
          </a>
          <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
            <Logo src="src\assets\linkedin.png" alt="LinkedIn" />
          </a>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            <Logo src="src\assets\facebook.png" alt="Facebook" />
          </a>
        </SocialLogos>
        <Copyright>2025 SENAI. Todos os direitos reservados.</Copyright>
      </Footer>
    </>
  );
}

export default App;
