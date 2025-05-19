require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


const PESAPAL_URL = process.env.PESAPAL_API_URL;
const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
const callbackURL =  process.env.PESAPAL_CALLBACK_URL;
const phone = "0743878261";

let accessToken = '';
let tokenExpiry = 0;

//GET PESAPAL TOKEN.
async function getPesapalToken(){
    const now = Date.now();
    // use access token if still valid.
    if (accessToken && tokenExpiry > now ) {
        return accessToken;
    }
    const credentials = {
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
    };
    try {
        const response = await
        axios.post(`${PESAPAL_URL}/v3/api/Auth/RequestToken`, credentials,{
            headers: {
                'Content-Type':
                'application/json'
            }
        });
        accessToken = response.data.token;
        tokenExpiry = now + 4 * 60 * 1000;// token valid for 4 mins for safety.
        return accessToken;
}
catch (error) {
    console.error("Error getting access token:", error?.response?.data || error.message);
    throw new Error('Failed to get access token');
}} 
// create payment request.
app.post('/pay', async (req, res) => {
    try{
        const { amount, email } = 
        req.body;
        if (!amount || !email) {
            return
            res.status(400).json({error: "Amount and email are required"})
        };
    console.log('Recieved /pay request:', req.body);
    const accessToken = await
    getPesapalToken();
    const orderDetails = {
        id: "ORDER-" + Date.now(),
        currency: "USD",
        amount: amount,
        description: "Buying coins in chat app",
        callback_url: callbackURL,
        notification_id: "f1d363c3-d803-4529-b209-dbdfacd3c8b5",
        billing_address: {
            email_address: email,
            phone_number:"0743878261",
            country_code: "KE",
            first_name: "Ssenabulya",
            last_name: "Rahim",
            line_1: "Street 123",
            city: "Kampala",
            state: "Central",
            postal_code: "00100",
            zip_code: "00100"
        }
    };
    
        
        const response = await
        axios.post(`${PESAPAL_URL}/v3/api/Transactions/SubmitOrderRequest`,
            orderDetails, {
                headers: {Authorization: `Bearer ${accessToken}`,
            "Content-Type": 
        "application/json"}
            }
        );
        console.log("Pesapal response:", response.data);
        const {
            redirect_url, 
            order_tracking_id } = 
            response.data;
        console.log("Redirect user to:", redirect_url);
        res.json ({
            redirect_url, order_tracking_id
        });
        
    } catch (error) {
        console.error("Payment error:", error?.response?.data || error.message);
        res.status(500).json({error: "Payment failed"});
    }
});

// check payment status
app.get('/payment-status/:order_id', async (req, res) => {
    const token = await getPesapalToken();
    const orderID = req.params.order_id;
    
    try {
        const response = await axios.
        get(
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
            error.response?.data || error.message
        );
        res.status(500).json({error:"Could not check status"});
    }
});


// payment callback.
app.post('/payment-callback', (req, res) => {
    console.log('Received payment from pesapal:', req.body);
    res.status(200).json({
        message: 'IPN recieved successfully'
    });
});

// Route to get access token
app.get('/token', async (req, res) => {
    const token = await
    getPesapalToken();
    if (token) {
        res.json({ token });
    } else {
        res.status(500).json({ error: "Failed to get token"});
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('Pesapal backend is working');
})

// start server.
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 