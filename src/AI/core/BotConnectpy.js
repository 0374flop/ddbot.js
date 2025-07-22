const { botManager, BotMovement } = require('../../bot/index-core');
const py = require('./pyFatherAi');
const fs = require('fs');
const path = require('path');

// botName -> { ai, parsedMap, unsubFns, movement }
const botAIMap = new Map();

function loadParsedMap(mapName) {
  const parsedPath = path.join(__dirname, '../../../data/parsed', `${mapName}.json`);
  if (fs.existsSync(parsedPath)) {
    try {
      return JSON.parse(fs.readFileSync(parsedPath, 'utf8'));
    } catch (e) {
      console.error(`[BotConnectpy] Ошибка чтения карты ${parsedPath}:`, e);
    }
  }
  return null;
}

function connectAIToBot(botName) {
  if (botAIMap.has(botName)) return; // Уже подключён
  const bot = botManager.getBot(botName);
  if (!bot) throw new Error(`Bot ${botName} not found`);
  const ai = py.connectPython('ai.py');
  const movement = bot.movement;
  let parsedMap = null;

  // --- Подписки ---
  const unsubFns = [];

  // map_details
  const mapDetailsHandler = (mapDetails) => {
    if (!mapDetails || !mapDetails.name) return;
    parsedMap = loadParsedMap(mapDetails.name);
    if (parsedMap) {
      console.log(`[BotConnectpy] Parsed map loaded for bot ${botName}: ${mapDetails.name}`);
    } else {
      console.warn(`[BotConnectpy] Parsed map NOT FOUND for bot ${botName}: ${mapDetails.name}`);
    }
  };
  bot.on('map_details', mapDetailsHandler);
  unsubFns.push(() => bot.off('map_details', mapDetailsHandler));

  // snapshot
  const snapshotHandler = (snapshot) => {
    const character = movement.getCharacterState();
    if (!character) return;
    const other_players = Array.isArray(snapshot)
      ? snapshot.filter(obj => obj.type_id === 9 && obj.parsed && obj.parsed.client_id !== movement.client.SnapshotUnpacker.OwnID)
      : [];
    const state = {
      character,
      other_players,
      map: parsedMap || undefined
    };
    ai.send(JSON.stringify(state));
  };
  bot.on('snapshot', snapshotHandler);
  unsubFns.push(() => bot.off('snapshot', snapshotHandler));

  // --- Ответы от ai.py ---
  ai.onResponse((data) => {
    let cmd;
    try {
      cmd = JSON.parse(data);
    } catch (e) {
      console.warn(`[BotConnectpy][${botName}] Не удалось распарсить ответ:`, data);
      return;
    }
    if (!cmd.action) return;
    // Маппинг команд на методы BotMovement
    const actionMap = {
      runleft: () => movement.runLeft(),
      runright: () => movement.runRight(),
      runstop: () => movement.stop(),
      jump: (value) => movement.jump(value !== undefined ? value : true),
      hook: (value) => movement.hook(value !== undefined ? value : true),
      setaim: (x, y) => movement.setAim(x, y),
      fire: () => movement.fire(),
      nextweapon: () => movement.nextWeapon(),
      prevweapon: () => movement.prevWeapon(),
      say: (msg) => movement.say(msg),
      kill: () => movement.kill(),
      setchatting: (flag) => movement.setChatting(flag),
      moveleft: () => movement.moveLeft(),
      moveright: () => movement.moveRight(),
      jumpandstop: () => movement.jumpAndStop(),
      hookandstop: () => movement.hookAndStop(),
    };
    const action = cmd.action.toLowerCase();
    if (action in actionMap) {
      // Передаём параметры, если есть
      if (action === 'jump' || action === 'hook') {
        actionMap[action](cmd.value);
      } else if (action === 'setaim') {
        actionMap[action](cmd.x, cmd.y);
      } else if (action === 'say') {
        actionMap[action](cmd.message);
      } else if (action === 'setchatting') {
        actionMap[action](cmd.flag);
      } else {
        actionMap[action]();
      }
    } else {
      console.warn(`[BotConnectpy][${botName}] Неизвестная команда от ai.py:`, cmd);
    }
  });

  // --- Корректное завершение ai.py при выходе ---
  const sigintHandler = () => {
    ai.kill();
    unsubFns.forEach(fn => fn());
    botAIMap.delete(botName);
  };
  process.on('SIGINT', sigintHandler);
  unsubFns.push(() => process.off('SIGINT', sigintHandler));

  botAIMap.set(botName, { ai, parsedMap, unsubFns, movement });
}

function disconnectAIFromBot(botName) {
  const entry = botAIMap.get(botName);
  if (!entry) return;
  entry.ai.kill();
  entry.unsubFns.forEach(fn => fn());
  botAIMap.delete(botName);
}

module.exports = {
  connectAIToBot,
  disconnectAIFromBot
};