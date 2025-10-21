"use strict";
const BotManager = require('./bot'); // Импортируем BotManager из модуля bot.js
const bot = new BotManager(); // Создаем экземпляр BotManager

module.exports = { bot, BotManager }; // Экспортируем bot и BotManager для использования в других модулях