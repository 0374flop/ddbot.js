const bot = require('../../bot');

const registeredHandlers = new Set();

async function Automaploader(botName, mapLoader) {
    // Проверяем, не зарегистрирован ли уже обработчик для этого бота
    const handlerKey = `${botName}:map_details`;
    if (registeredHandlers.has(handlerKey)) {
        return; // Обработчик уже зарегистрирован
    }
    
    registeredHandlers.add(handlerKey);
    
    bot.botCore.botManager.on(`${botName}:map_details`, (mapDetails) => {
        const mapName = mapDetails.map_name;
        mapLoader(mapName);
    });
}

module.exports = Automaploader;