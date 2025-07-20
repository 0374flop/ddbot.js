const { BotManager } = require('./src/bot/index');

async function example() {
    const botManager = new BotManager();

    // Создаем и подключаем бота с включенным переподключением
    const botName = await botManager.createAndConnectBot(
        '127.0.0.1:8303', 
        'TestBot', 
        { 
            identity: 'test',
            reconnect: true  // Включаем автоматическое переподключение
        }
    );

    if (botName) {
        console.log(`Bot created: ${botName}`);
        
        // Получаем объект бота с событиями
        const bot = botManager.getBot(botName);
        
        // Настраиваем обработчики событий
        bot.on('connect', () => {
            console.log(`🎉 Bot ${botName} connected to server!`);
        });
        
        bot.on('disconnect', (reason) => {
            console.log(`😢 Bot ${botName} disconnected: ${reason}`);
        });
        
        bot.on('message', (msg) => {
            console.log(`💬 Bot ${botName} received message:`, msg);
        });
        
        bot.on('error', (error) => {
            console.error(`❌ Bot ${botName} error:`, error);
        });
        
        // Проверяем статус
        console.log(`Is connected: ${bot.isConnected()}`);
        
        // Работаем с движением бота
        const movement = bot.movement;
        if (movement) {
            // Примеры управления движением
            // movement.runLeft();
            // movement.jump();
            // movement.say('Hello from bot!');
            
            // Прямое управление движением
            // movement.runLeft();
            // movement.jump(true);
            // movement.setAim(100, 200);
            
            // Проверка состояния
            // console.log('Is frozen:', movement.isFrozen());
            // console.log('Character state:', movement.getCharacterState());
        }
        
        // Переподключение (автоматическое, если включено в параметрах)
        // Метод reconnect() больше не доступен - переподключение происходит автоматически
        // при отключении, если параметр reconnect: true
        
        // Отключение
        // await bot.disconnect();
        
        // Отключение всех ботов
        // await botManager.disconnectAllBots();
    }
}

// Запускаем пример
example().catch(console.error); 