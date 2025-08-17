const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
    const signal = req.body;
    console.log("Signal received:", signal);

    try {
        const response = await axios.post("https://api.bybit.com/v5/order/create", {
            category: "linear",
            symbol: "ETHUSDT",
            side: signal.signal === "open_long" ? "Buy" : "Sell",
            orderType: "Market",
            qty: "0.01",
            timeInForce: "GoodTillCancel"
        });
        console.log("Bybit response:", response.data);
    } catch (err) {
        console.error("Error sending to Bybit:", err.message);
    }

    res.json({ status: "ok" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
