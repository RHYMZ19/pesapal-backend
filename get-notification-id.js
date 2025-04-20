const axios = require('axios');

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3VzZXJkYXRhIjoiMzUzYzEzZjAtNDhiZC00MWNmLWE3YTctZGMwNWQ1MGFlZDUyIiwidWlkIjoiTWxzaWxFS005VzlQbnRRa0FiazAybE9WOU50bWpQSzUiLCJuYmYiOjE3NDUxMzI3MjcsImV4cCI6MTc0NTEzMzAyNywiaWF0IjoxNzQ1MTMyNzI3LCJpc3MiOiJodHRwOi8vcGF5LnBlc2FwYWwuY29tLyIsImF1ZCI6Imh0dHA6Ly9wYXkucGVzYXBhbC5jb20vIn0.HCaDTctCFNBkrQZCG5NB6GAFjtzKp5YydwqApwEZoTI";

async function getNotificationID() {
    const url = "https://pay.pesapal.com/v3/api/NotificationURL";

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
