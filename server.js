require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PESAPAL_URL = process.env.PESAPAL_API_URL;
const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
const callbackURL =  process.env.PESAPAL_CALLBACK_URL;

//GET PESAPAL TOKEN.
async function getPesapalToken(){
    const credentials = {
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
    };
}
try {
    const response = await
    axios.post(`${PESAPAL_URL}/Auth/RequestToken`, credentials);
    return response.data.token;
} catch (error) {
    if (error.response) {
        console.error("Pesapal API error:", error.response.data);
    } else if (error.request) {
        console.error("No response received from Pesapal:", error.request);
    } else {
        console.error("Unexpected error:", error.message);
    }
// create payment request.
app.post('/pay', async (req, res) => {
    const { amount, email, } = req.body;
    const token = await
    getPesapalToken();

    const orderDetails = {
        id: "ORDER-" + new
        Data().getTime(),
        currency: "USD",
        amount: amount,
        description: "Buying coins in chat app",
        callback_url: callbackURL,
        Notification_id: "YOUR NOTIFICATION ID",
        billing_address: {
            email_address: email,
            phone_number:phone,
            country_code: "KE",
            first_name: "Ssenabulya",
            last_name: "Rahim"
        }
    };
    try {
        const response = await
        axios.post(`${PESAPAL_URL}/Transactions/SubmitOrderRequest`,
            orderDetails, {
                headers: {Authorization: `Bearer ${token}`}
            }
        );
        res.json({ payment_url:
            response.data.redirect_url
        });
    } catch (error) {
        console.error("Payment error:", error.response.data);
        res.status(500).json({error: "Payment failed"});
    }
});

// check payment status
app.get('/payment-status/:order_id', async (req, res) => {
    const token = await getPesapalToken();
    const orderID = req.params.order_id;
    
    try {
        const response = await
        axios.get(
            `${PESAPAL_URL}/Transactions/GetTransactionStatus?
            orderTrackingId=${orderID}`,
            {
                 headers:
                 { Authorization: `Bearer ${token}`}
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error("Error checking transaction status:",
            error.response.data
        );
        res.status(500).json({error:"Could not check status"});
    }
})

// start server.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})}; 