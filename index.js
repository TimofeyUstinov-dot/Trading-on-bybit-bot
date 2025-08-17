// Подключение библиотек
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');

// Создание приложения
const app = express();

// Настройки торговли
const symbol = "ETHUSDT";
const usdt_amount = 100;
const leverage = 10;

// Ключи Bybit testnet
const BYBIT_API_KEY = 'YOUR_TESTNET_API_KEY';
const BYBIT_API_SECRET = 'YOUR_TESTNET_API_SECRET';

let messages = [];
let lastError = null;

app.use(bodyParser.json());

// Функция расчёта количества (qty) на основе usdt_amount и leverage
function calculateQty(price) {
    const total = usdt_amount * leverage;
    return (total / price).toFixed(2); // округление до 0.01
}

// Отправка ордера на Bybit testnet с подписью
async function sendToBybit(tradingViewSignal) {
    try {
        const timestamp = Date.now().toString();
        const recvWindow = '5000';
        const signalType = tradingViewSignal.signal;
        const isOpen = signalType === 'open_long' || signalType === 'open_short';
        const isClose = signalType === 'close_long' || signalType === 'close_short';
        const isLong = signalType.includes('long');

        let orderBody;
        const price = tradingViewSignal.price || tradingViewSignal.stop_loss || 3000;
        const qty = calculateQty(price);

        if (isOpen) {
            const side = isLong ? 'Buy' : 'Sell';
            orderBody = {
                category: 'linear',
                symbol: symbol,
                side,
                orderType: 'Market',
                qty,
                timeInForce: 'GTC'
            };
            const stopLoss = Number(tradingViewSignal.stop_loss);
            if (!isNaN(stopLoss) && stopLoss > 0) {
                orderBody.stopLoss = stopLoss.toFixed(2);
            }
        } else if (isClose) {
            const side = isLong ? 'Sell' : 'Buy';
            orderBody = {
                category: 'linear',
                symbol: symbol,
                side,
                orderType: 'Market',
                qty,
                reduceOnly: true,
                timeInForce: 'GTC'
            };
        } else {
            throw new Error(`Неизвестный тип сигнала: ${signalType}`);
        }

        const paramsStr = timestamp + BYBIT_API_KEY + recvWindow + JSON.stringify(orderBody);
        const signature = crypto.createHmac('sha256', BYBIT_API_SECRET).update(paramsStr).digest('hex');

        const response = await axios.post('https://api-testnet.bybit.com/v5/order/create', orderBody, {
            headers: {
                'X-BYBIT-API-KEY': BYBIT_API_KEY,
                'X-BYBIT-SIGN': signature,
                'X-BYBIT-TIMESTAMP': timestamp,
                'X-BYBIT-RECV-WINDOW': recvWindow,
                'Content-Type': 'application/json'
            }
        });

        return { success: true, response: response.data, sentOrder: orderBody };
    } catch (err) {
        const now = new Date().toISOString();
        lastError = {
            error: err?.response?.data || err.message,
            time: now
        };
        return { success: false, error: lastError };
    }
}

// Экспорт приложения для Passenger
module.exports = app;
