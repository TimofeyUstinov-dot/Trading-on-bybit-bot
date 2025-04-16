from flask import Flask, request, jsonify
from pybit.unified_trading import HTTP
import os
import json

app = Flask(__name__)

# === НАСТРОЙКИ ИЗ ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ===
api_key = os.getenv("BYBIT_API_KEY")
api_secret = os.getenv("BYBIT_API_SECRET")
symbol = "ETHUSDT"
usdt_amount = float(os.getenv("USDT_AMOUNT", 100))
leverage = int(os.getenv("LEVERAGE", 10))

session = HTTP(api_key=api_key, api_secret=api_secret, testnet=False)

@app.route('/', methods=['POST'])
def webhook():
    try:
        data = json.loads(request.data)
        signal = data.get("signal")
        print(f"[СИГНАЛ] {signal}")

        price_data = session.get_tickers(category="linear", symbol=symbol)
        last_price = float(price_data["result"]["list"][0]["lastPrice"])
        qty = round((usdt_amount * leverage) / last_price, 3)

        if signal == "open_long":
            session.place_order(
                category="linear",
                symbol=symbol,
                side="Buy",
                order_type="Market",
                qty=qty,
                time_in_force="GoodTillCancel"
            )

        elif signal == "close_long":
            session.place_order(
                category="linear",
                symbol=symbol,
                side="Sell",
                order_type="Market",
                qty=qty,
                reduce_only=True
            )

        elif signal == "open_short":
            session.place_order(
                category="linear",
                symbol=symbol,
                side="Sell",
                order_type="Market",
                qty=qty,
                time_in_force="GoodTillCancel"
            )

        elif signal == "close_short":
            session.place_order(
                category="linear",
                symbol=symbol,
                side="Buy",
                order_type="Market",
                qty=qty,
                reduce_only=True
            )

        return jsonify({"status": "ok"})

    except Exception as e:
        print(f"[ОШИБКА В POST] {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv("PORT", 5000)))
