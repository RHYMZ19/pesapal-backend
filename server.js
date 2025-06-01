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
const MERCHANT_REFERENCE_PREFIX = 'baby';

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
        
    const accessToken = await
    getPesapalToken();
    const merchantReference = MERCHANT_REFERENCE_PREFIX + Date.now();
    const payload = {
        id: merchantReference,
        currency: "KES",
        amount: req.body.amount,
        description: req.body.description,
        callback_url: callbackURL,
        redirect_mode: 'TOP_WINDOW',
        notification_id: "f1d363c3-d803-4529-b209-dbdfacd3c8b5",
        branch: 'Main Branch',
        billing_address: {
            email_address: req.body.email,
            phone_number: req.body.phone,
            country_code: "KE",
            first_name: req.body.firstName || "Ssenabulya",
            middle_name: req.body.middleName || "",
            last_name: req.body.lastName || "Rahim",
            line_1: "Street 123",
            line_2: '',
            city: "Kampala",
            state: "Central",
            postal_code: "",
            zip_code: ""
        }
    };
    
        
        const response = await
        axios.post(`${PESAPAL_URL}/v3/api/Transactions/SubmitOrderRequest`,
            payload, {
                headers: {Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            "Content-Type": 
        "application/json"}
            }
        );
        
        if (response.status === 200 && response.data.redirect_url) {
            res.json({
                redirectUrl: response.data.redirect_url
            });
        } else {
            res.status(500).json({ error: 'Payment initiation failed', details: response.data});
        }
        
    } catch (error) {
        console.error("SubmitOrderRequest error:", error.response?.data || error.message);
        res.status(500).json({error: "Payment initiation failed", details: error.message});
    }
});

// check payment status
app.get('/payment-callback', async (req, res) => {
    const orderTrackingId = req.query.OrderTrackingId;

    if (!orderTrackingId) return
    res.status(400).send('Missing OrderTrackingId');
    
    
    
    try {
        const token = await getPesapalToken();
        const statusResponse = await axios.
        get(
            `${PESAPAL_URL}v3/api/Transactions/GetTransactionStatus?
            orderTrackingId=${OrderTrackingId}`,
            {
                 headers:
                 { Authorization: `Bearer ${token}`}
            }
        );
        res.json({
            message: 'Payment status fetched successfully',
            status: statusResponse.data
        });
    } catch (error) {
        console.error("Error checking transaction status:",
            error.response?.data || error.message
        );
        res.status(500).json({error:"Could not check status"});
    }
});


// payment callback.
app.post('/payment-ipn', async (req, res) => {
    const {OrderTrackingId} = req.body;

    if (!OrderTrackingId) return
    res.status(400).send('Missing OrderTrackingId');

    try {
        const token = await getPesapalToken();

        const statusResponse = await axios.get(
            `${PESAPAL_URL}v3/api/Transactions/GetTransactionStatus?
            orderTrackingId=${OrderTrackingId}`,
            {
                headers:
                { 'Authorization': `Bearer ${token}`}
           }
        );

        console.log('IPN payment status:', statusResponse.data);
        res.status(200).send('OK');
    } catch (error) {
        console.error('IPN GetTransactionStatus error:', error.response?.data || error.message);
        res.status(500).send('Error processing IPN');
    }
});

// Route to get access token
app.get('/token', async (req, res) => {
    try{
    const token = await
    getPesapalToken();
        res.json({ token });
    } catch (error) {
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