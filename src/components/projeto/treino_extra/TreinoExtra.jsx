import React from "react";
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { FitnessCenterOutlined } from "@mui/icons-material";
import Styles from "./TreinoExtra.module.css";

const img1 = "https://fittech500.blob.core.windows.net/imagens-spectrum/Card.jpg";
const img2 = "https://fittech500.blob.core.windows.net/imagens-spectrum/Ex.jpg";
const img3 = "https://fittech500.blob.core.windows.net/imagens-spectrum/baixa-itensidade.jpg";
const img4 = "https://fittech500.blob.core.windows.net/imagens-spectrum/Ex2.jpg";

const TreinoExtra = () => {
    const [open, setOpen] = React.useState(false);
    const [cardValue, setCardValue] = React.useState(0);


    const cards = [
        { description: "Cardio (Alta Intensidade)", duration: "30 MINUTOS", backgroundImage: img1, texto: "Alternância entre exercícios intensos e descanso. Queima gordura e melhora o condicionamento em pouco tempo. Exemplos: sprints, burpees." },
        { description: "Funcional", duration: "30 MINUTOS", backgroundImage: img2, texto: "O treino funcional foca em movimentos naturais do corpo para melhorar força, flexibilidade e equilíbrio. Incorpora exercícios variados." },
        { description: "Cardio (Baixa Itencidade)", duration: "20 MINUTOS", backgroundImage: img3, texto: "O cardio de baixa intensidade envolve atividades como caminhada ou ciclismo em ritmo moderado, ideal para queima gradual de calorias." },
        { description: "Alongamento", duration: "10 MINUTOS", backgroundImage: img4, texto: "O alongamento é essencial para flexibilidade e prevenção de lesões, consistindo em esticar músculos para melhorar amplitude de movimento." }
    ];


    return (
        <>
            <div className={Styles.box_extra}>
                {cards.map((card, index) => (
                    <div key={index} className={Styles.card} style={{ backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.9) 20%, rgba(0, 0, 0, 0) 80%), url(${card.backgroundImage})` }} onClick={() => { setOpen(true); setCardValue(index) }}>
                        <div className={Styles.card_body}>
                            <h5>{card.description}</h5>
                            <h6>{card.duration}</h6>
                        </div>
                    </div>
                ))}

            </div >

            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={open}
                onClose={() => setOpen(false)}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Sheet
                    variant="outlined"
                    sx={{
                        maxWidth: 500,
                        borderRadius: 'md',
                        p: 3,
                        boxShadow: 'lg',
                        backgroundColor: "var(--preto-tom-menor)",
                        color: "white"
                    }}>

                    <ModalClose variant="plain" sx={{ m: 1 }} />
                    <Typography
                        component="h2"
                        id="modal-title"
                        level="h4"
                        textColor="white"
                        fontWeight="lg"
                        mb={1}>{cards[cardValue].description}</Typography>

                    <Typography id="modal-desc" textColor="white" textAlign={"justify"}>
                        <b>Descrição:</b>  {cards[cardValue].texto}
                    </Typography>

                    <br />
                    <Typography id="modal-desc" textColor="white" textAlign={"justify"}>
                        <b>Duração:</b> {cards[cardValue].duration}
                    </Typography>

                    <Stack direction="row" spacing={2} marginTop={3}>
                        <Button variant="outlined" onClick={() => setOpen(false)}>Fechar</Button>
                        <Button variant="contained" color="success" endIcon={<FitnessCenterOutlined />}>Fazer treino</Button>
                    </Stack>

                </Sheet>
            </Modal>
        </>
    );
}

export default TreinoExtra;