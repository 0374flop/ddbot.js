"use strict";
const { BotManager, logDebuger } = require('./bot'); // Импортируем BotManager из модуля bot.js
const bot = new BotManager(); // Создаем экземпляр BotManager

module.exports = { bot, BotManager, logDebuger }; // Экспортируем bot, BotManager, logDebuger