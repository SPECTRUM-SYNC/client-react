import React, { useState, useEffect, useMemo } from "react";
import styles from "./CardDieta.module.css";
import img1 from "../../../utils/cafe-da-manha.jpg";
import img2 from "../../../utils/almoco.jpg";
import img3 from "../../../utils/lanche.jpg";
import img4 from "../../../utils/jantar.jpg";
import img5 from "../../../utils/ceia.webp";
import ModalDieta from "../modal_dieta/ModalDieta";
import api from "../../../api";
import Button from '@mui/material/Button';
import Checkbox from '@mui/joy/Checkbox';
import Box from '@mui/joy/Box';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Typography from '@mui/joy/Typography';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import CircularProgress from "@mui/material/CircularProgress";
import { getId } from "../../../service/auth";
import { toast } from 'react-toastify';

const CardDieta = ({ onNutrientTotalsUpdate, onCurrentNutrientUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [cardsData, setCardsData] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [qtdCards, setQtdCards] = useState(() => {
    return localStorage.getItem('qtdCards') ? Number(localStorage.getItem('qtdCards')) : 0;
  });
  const [error, setError] = useState(null);

  const [user, setUser] = useState({
    peso: '',
    pesoMeta: '',
    usuario: {
      nome: '',
      dataNascimento: '',
      genero: '',
      altura: '',
      nivelCondicao: '',
      meta: '',
      objetivo: '',
      pontuacao: ''
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/pesos/ultima-insercao/${getId()}`);
        const userData = response.data;
        setUser(userData);
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchData();
  }, []);

  const meta = user.usuario.meta;

  const predefinedCards = useMemo(() => [
    { id: 1, horario: "Café da Manhã - 9:00 AM", img: img1 },
    { id: 2, horario: "Almoço - 12:00 PM", img: img2 },
    { id: 3, horario: "Lanche da tarde - 15:00 PM", img: img3 },
    { id: 4, horario: "Jantar - 19:00 PM", img: img4 },
    { id: 5, horario: "Ceia - 22:00 PM", img: img5 },
  ], []);

  const fetchExistingReceitas = async () => {
    try {
      const id = getId();
      const response = await api.get(`/openai/${id}`);
      return response.data;
    } catch (error) {
      throw new Error("Erro ao buscar receitas existentes: " + error.message);
    }
  };

  const createNewReceitas = async () => {
    try {
      const id = getId();
      const response = await api.get(`/openai/gpt3/${id}`, {
        params: { objetivo: meta, qtdSelecionada: qtdCards },
      });
      return response.data;
    } catch (error) {
      throw new Error("Erro ao criar novas receitas: " + error.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const existingReceitas = await fetchExistingReceitas();

        if (existingReceitas && existingReceitas.length > 0) {
          const numReceitas = Math.min(existingReceitas.length, qtdCards);
          localStorage.setItem('qtdCards', numReceitas);

          const updatedCardsData = predefinedCards.slice(0, numReceitas).map((card, index) => ({
            ...card,
            titulo: existingReceitas[index].nome,
            descricao: existingReceitas[index].modoPreparo,
            carboidratos: Number(existingReceitas[index].carboidratos),
            calorias: Number(existingReceitas[index].calorias),
            gorduras: Number(existingReceitas[index].gorduras),
            proteinas: Number(existingReceitas[index].proteina),
            acucares: existingReceitas[index].acucar,
            tempoPreparo: existingReceitas[index].tempoPreparo,
            ingredientes: existingReceitas[index].ingredientes,
          }));

          setCardsData(updatedCardsData);
          setShowSelectModal(false);

          const totalNutrients = updatedCardsData.reduce(
            (totals, card) => ({
              carboidratos: totals.carboidratos + card.carboidratos,
              calorias: totals.calorias + card.calorias,
              gorduras: totals.gorduras + card.gorduras,
              proteinas: totals.proteinas + card.proteinas,
            }),
            { carboidratos: 0, calorias: 0, gorduras: 0, proteinas: 0 }
          );

          onNutrientTotalsUpdate(totalNutrients);
        } else {
          setShowSelectModal(true);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [onNutrientTotalsUpdate, meta, predefinedCards, qtdCards]);

  const handleGreenButtonClick = (card) => {
    setSelectedCard(card);
  };

  const handleRedButtonClick = (id) => {
    const updatedCards = cardsData.filter((card) => card.id !== id);
    const completedCard = cardsData.find((card) => card.id === id);

    if (completedCard) {
      onCurrentNutrientUpdate((prevTotals) => ({
        carboidratos: prevTotals.carboidratos + completedCard.carboidratos,
        calorias: prevTotals.calorias + completedCard.calorias,
        gorduras: prevTotals.gorduras + completedCard.gorduras,
        proteinas: prevTotals.proteinas + completedCard.proteinas,
      }));
    }

    setCardsData(updatedCards);
  };

  const closeModal = () => {
    setSelectedCard(null);
  };

  const [checkedItems, setCheckedItems] = useState([]);

  const handleStartClick = async () => {
    if (qtdCards === 0) {
      toast.warning("Selecione alguma opção");
    } else {
      try {
        setLoading(true);
        const newReceitas = await createNewReceitas();
        const updatedCardsData = predefinedCards.slice(0, qtdCards).map((card, index) => ({
          ...card,
          titulo: newReceitas[index]?.nome || `Título ${index + 1}`,
          descricao: newReceitas[index]?.modoPreparo || `Descrição ${index + 1}`,
          carboidratos: Number(newReceitas[index]?.carboidratos) || 0,
          calorias: Number(newReceitas[index]?.calorias) || 0,
          gorduras: Number(newReceitas[index]?.gorduras) || 0,
          proteinas: Number(newReceitas[index]?.proteina) || 0,
          acucares: newReceitas[index]?.acucar,
          tempoPreparo: newReceitas[index]?.tempoPreparo,
          ingredientes: newReceitas[index]?.ingredientes,
        }));

        setCardsData(updatedCardsData);
        setShowSelectModal(false);
        localStorage.setItem('qtdCards', qtdCards);

        const totalNutrients = updatedCardsData.reduce(
          (totals, card) => ({
            carboidratos: totals.carboidratos + card.carboidratos,
            calorias: totals.calorias + card.calorias,
            gorduras: totals.gorduras + card.gorduras,
            proteinas: totals.proteinas + card.proteinas,
          }),
          { carboidratos: 0, calorias: 0, gorduras: 0, proteinas: 0 }
        );

        onNutrientTotalsUpdate(totalNutrients);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectChange = (value) => {
    if (checkedItems.includes(value)) {
      setCheckedItems(checkedItems.filter(item => item !== value));
      setQtdCards(0);
    } else {
      setCheckedItems([value]);
      setQtdCards(value);
    }
  };

  return (
    <div className={styles.cards_listener}>
      {showSelectModal && (
        <Modal open={showSelectModal}>
          <ModalDialog sx={{ background: "var(--preto-secundario)" }}>
            <form onSubmit={(e) => e.preventDefault()}>
            <DialogTitle style={{ color: "white" }}>Criando sua dieta Diária personalizada.</DialogTitle>
              <Box>
                <Typography id="topping" level="body-sm" fontWeight="500" fontSize={"18px"} mb={2}>
                  Selecione a quantidade de refeições que você fará (APENAS 1 OPÇÃO)
                </Typography>
                <div role="group" aria-labelledby="topping">
                  <List
                    orientation="horizontal"
                    wrap
                    style={{ width: "100%", display: "flex", justifyContent: "center" }}
                    sx={{
                      '--List-gap': '8px',
                      '--ListItem-radius': '20px',
                    }}>
                    {[3, 4, 5].map((value) => (
                      <ListItem key={value}>
                        <Checkbox
                          overlay
                          disabled={checkedItems.length >= 1 && !checkedItems.includes(value)}
                          disableIcon
                          label={value}
                          color='danger'
                          value={value}
                          checked={checkedItems.includes(value)}
                          onChange={() => handleSelectChange(value)}
                          sx={{
                            '.css-10q1s9e-JoyCheckbox-label': {
                              color: "white",
                              fontWeight: "bold"
                            }
                          }} />
                      </ListItem>
                    ))}
                  </List>
                </div>
              </Box>
              <Button variant='contained' color='success' style={{ marginTop: "20px" }} onClick={handleStartClick}>Gerar dieta</Button>
            </form>
          </ModalDialog>
        </Modal>
      )}

      {loading && (
        <Modal open={true}>
          <ModalDialog sx={{ background: "var(--preto-secundario)" }}>
            <DialogTitle style={{ color: "white" }}>Carregando suas refeições, aguarde...</DialogTitle>
            <div className={styles.loading}>
              <CircularProgress color="primary" />
            </div>
          </ModalDialog>
        </Modal>
      )}

      {error && <p>Erro: {error}</p>}

      {cardsData.length === 0 && !showSelectModal && (
        <div className={styles.parabens}>
          Sem mais refeições por enquanto! Volte amanhã 😊
        </div>
      )}

      {cardsData.map((card) => (
        <div key={card.id} className={styles.card_container}>
          <div className={styles.horario}>{card.horario}</div>
          <div id={`card-${card.id}`} className={styles.card_box}>
            <div className={styles.title_box}>
              <div className={styles.title}>{card.titulo}</div>
            </div>
            <div className={styles.img_box}>
              <img className={styles.img} alt="" src={card.img} />
            </div>
            <div className={styles.box_desc}>
              <div className={styles.sub_text}>Sobre a Refeição:</div>
              <div className={styles.sub_text}>{card.descricao}</div>
            </div>
            <button
              onClick={() => handleGreenButtonClick(card)}
              className={styles.button_green}
            >
              <div className={styles.text_button}>Detalhes</div>
            </button>
            <button
              onClick={() => handleRedButtonClick(card.id)}
              className={styles.button_red}
            >
              <div className={styles.text_button}>Concluir Refeição</div>
            </button>
          </div>
        </div>
      ))}

      {selectedCard && <ModalDieta card={selectedCard} onClose={closeModal} />}
    </div>
  );
};

export default CardDieta;