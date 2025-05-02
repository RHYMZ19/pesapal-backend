const axios = require("axios");

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3VzZXJkYXRhIjoiMzUzYzEzZjAtNDhiZC00MWNmLWE3YTctZGMwNWQ1MGFlZDUyIiwidWlkIjoiTWxzaWxFS005VzlQbnRRa0FiazAybE9WOU50bWpQSzUiLCJuYmYiOjE3NDU5NTMxNzYsImV4cCI6MTc0NTk1MzQ3NiwiaWF0IjoxNzQ1OTUzMTc2LCJpc3MiOiJodHRwOi8vcGF5LnBlc2FwYWwuY29tLyIsImF1ZCI6Imh0dHA6Ly9wYXkucGVzYXBhbC5jb20vIn0.QNUnMzZR9yOW45FQv4sVj3LLasZ5DH9KtowpC436d3c";

const registerIPN = async () => {
    const url = "https://pay.pesapal.com/v3/api/NotificationURL/Register";

    const data = {
        url: "https://pesapal-backend-xy2z.onrender.com/payment-callback",
        ipn_notification_type: "GET"
    };
    try { 
        const response = await
        axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-type": "application/json"
            }
        });
        console.log("Registered IPN URL:");
        console.log('Full Pesapal response:',JSON.stringify(response.data,null,2));
        console.log('Notification ID:',response.data.notification_id);
    } catch (error) {
        console.error("Failed to register IPN:", error.response?.data || error.message);
    }
};

registerIPN();