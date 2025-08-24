// server.js

// Carrega as variáveis de ambiente (sua chave secreta da Stripe)
require('dotenv').config();

// Importa as bibliotecas necessárias
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();

// Configurações do servidor
app.use(cors()); // Permite que o frontend se comunique com este servidor
app.use(express.json()); // Permite que o servidor entenda JSON
app.use(express.static('.')); // Serve arquivos estáticos (como o index.html) da pasta raiz

const PORT = 4242; // Porta em que o servidor vai rodar

// Função para calcular o valor final do pedido em centavos
const calculateOrderAmount = (items) => {
    // No futuro, você deve verificar os preços aqui no servidor para mais segurança.
    const { price, applyDiscount } = items[0];
    let finalPrice = parseFloat(price);

    if (applyDiscount) {
        finalPrice *= 0.90; // Aplica o desconto de 10%
    }
    // A Stripe exige o valor na menor unidade da moeda (centavos para BRL)
    return Math.round(finalPrice * 100);
};

// Rota principal para criar a Intenção de Pagamento
app.post('/create-payment-intent', async (req, res) => {
    const { items } = req.body;

    try {
        // Cria uma Intenção de Pagamento na Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: calculateOrderAmount(items),
            currency: 'brl', // Moeda: Real Brasileiro
            automatic_payment_methods: {
                enabled: true, // Permite que a Stripe sugira os melhores métodos de pagamento
            },
        });

        // Envia a chave 'client_secret' de volta para o frontend
        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Inicia o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}!`));
