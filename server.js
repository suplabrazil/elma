// server.js

// --- ALTERAÇÃO IMPORTANTE ---
// Garante que as variáveis de ambiente (do arquivo .env) sejam carregadas PRIMEIRO.
require('dotenv').config();

// Importa as bibliotecas necessárias
const express = require('express');
// Agora o Stripe será inicializado com a chave que já foi carregada
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');
const cors = require('cors'); // Importa o pacote CORS

const app = express();

// Habilita o CORS para todas as rotas
app.use(cors());

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname)));
// Middleware para interpretar o corpo das requisições como JSON
app.use(express.json());

// Define a porta em que o servidor vai rodar
const PORT = process.env.PORT || 4242;

// Rota principal para servir o seu arquivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para criar a sessão de checkout do Stripe
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { quantity, price, productName } = req.body;

    if (!quantity || !price || !productName) {
      return res.status(400).json({ error: 'Dados do produto ausentes.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: productName,
              images: ['https://iili.io/KHLGPdg.jpg'],
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel.html`,
    });

    res.json({ id: session.id });

  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error);
    res.status(500).json({ error: 'Falha ao criar a sessão de pagamento.' });
  }
});

// Inicia o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
