const { botManager } = require('./src/bot/index-core');
const { connectAIToBot, disconnectAIFromBot } = require('./src/AI/core/BotConnectpy');

async function test() {
  const botName = await botManager.createAndConnectBot('57.128.201.180:8309', 'Urawa', {
    identity: {
      name: 'Urawa',
      clan: '.',
      skin: '',
      use_custom_color: 1,
      color_body: 16711680,
      color_feet: 16711680,
      country: -1
    },
    reconnect: false
  });
  connectAIToBot(botName);
  console.log(`[testAi] Bot ${botName} создан и подключён к ai.py`);
  setTimeout(() => {
    disconnectAIFromBot(botName);
    botManager.disconnectAllBots();
    console.log('[testAi] Тест завершён');
    setTimeout(() => {
        process.exit(0);
    }, 1000);
  }, 30000);
}

test();
