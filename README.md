# Trading IQ  

**Trading IQ — это система для автоматической торговли на бирже Bybit.**  
Она объединяет стратегии на **TradingView (Pine Script)** и торгового бота на **Python/Flask** и **Node.js**, который принимает сигналы и отправляет ордера в Bybit через REST API.  

## 🚀 Возможности
- Поддержка стратегий TradingView (пример: Chandelier Exit + ZLSMA).
- Передача сигналов через Webhook (JSON).
- Автоматическая работа с Bybit API (открытие/закрытие сделок, стоп-лосс по ATR).
- Логирование сигналов и экспорт истории в Excel.
- Веб-интерфейс для мониторинга сигналов.
- Развертывание на Fly.io, Replit или Beget.

## ⚡️ Стек технологий
- TradingView Pine Script  
- Python (Flask, Pandas, openpyxl, pybit)  
- Node.js (Express, Axios, Crypto)  
- Bybit REST API v5  

## 📂 Структура проекта
- **pinescript/** — стратегии и индикаторы для TradingView  
- **python-bot/** — Flask бот для Bybit  
- **node-server/** — Node.js сервер для сигналов  
- **examples/** — примеры JSON сигналов и логов торговли  
