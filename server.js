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

let accessToken = null;
let tokenExpiry = null;

//GET PESAPAL TOKEN.
async function getPesapalToken(){
    const now = Date.now();
    // use access token if still valid.
    if (accessToken && tokenExpiry && now < tokenExpiry) {
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
        tokenExpiry = now + (4 * 60 * 1000);// token valid for 4 mins for safety.
        return response.data.token;
}
catch (error) {
    if (error.response) {
        console.error("Pesapal API error:", error.response.data);
    } else if (error.request) {
        console.error("No response received from Pesapal:", error.request);
    } else {
        console.error("Unexpected error:", error.message);
    }
}} 
// create payment request.
app.post('/pay', async (req, res) => {
    const { amount, email } = req.body;
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
        axios.post(`${PESAPAL_URL}/v3/api/Transactions/SubmitOrderRequest`,
            orderDetails, {
                headers: {Authorization: `Bearer ${accessToken}`,
            "Content-Type": 
        "application/json"}
            }
        );
        const {
            redirect_url, order_tracking_id 
        } = response.data;
        console.log("Redirect user to:", redirect_url);
        return {
            redirect_url, order_tracking_id
        }
        
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
            error.response.data
        );
        res.status(500).json({error:"Could not check status"});
    }
});

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3VzZXJkYXRhIjoiMzUzYzEzZjAtNDhiZC00MWNmLWE3YTctZGMwNWQ1MGFlZDUyIiwidWlkIjoiTWxzaWxFS005VzlQbnRRa0FiazAybE9WOU50bWpQSzUiLCJuYmYiOjE3NDUxMjkxNjUsImV4cCI6MTc0NTEyOTQ2NSwiaWF0IjoxNzQ1MTI5MTY1LCJpc3MiOiJodHRwOi8vcGF5LnBlc2FwYWwuY29tLyIsImF1ZCI6Imh0dHA6Ly9wYXkucGVzYXBhbC5jb20vIn0.nz_9nD7cPABOzE946_sGExrg8-8fX32FgfczBJyBjjQ";

async function getNotificationID() {
    const url = "https://pay.pesapal.com/v3/api/Notification/Listener";

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`
            }
        });
        const Listeners = response.data;

        if(Listeners.length === 0) {
            console.log(
                "No notification URLs found. make sure you have registered one in your dashboard."
            );
            return;
        }
        Listeners.forEach((Listener, index) => {
            console.log(`\nNotification 
                Listener ${index + 1}:`);
                console.log(`Notification ID: ${Listener.id}`);
                console.log(`IPN Listener URL: ${Listener.url}`);
                console.log(`Status: ${Listener.status}`);
        });
    } catch (error) {
        console.error("Failed to fetch Notification ID:", error.response?.data || error.message);
    }
}
getNotificationID();

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