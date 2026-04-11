import * as ddbot from './index.js';

const IP = '26.230.124.233';
const PORT = 8303;

const bot = new ddbot.Bot();

const container = new ddbot.ModuleContainer(bot);
const chat = container.registerModule(ddbot.StandardModules.Chat);
const playerList = container.registerModule(ddbot.StandardModules.PlayerList);

const lookAt = container.registerModule(ddbot.InputModules.LookAt, { priority: 10 });
const follow = container.registerModule(ddbot.InputModules.Follow, { priority: 11 });
const autoHammer = container.registerModule(ddbot.InputModules.AutoHammer, { priority: 100, radius: 60 });

bot.on('connect', () => {
    console.log('connect');

    setTimeout(() => {
        const players = playerList.list.filter(([id]) => id !== bot.OwnID);
        if (players.length > 0) {
            const [targetId, data] = players[0];
            console.log(`Following player: ${data.clientInfo.name} (id: ${targetId})`);
            follow.followPlayer(targetId);
        }

        console.log('LookAt fixed coordinates 480, 5440 (15, 170 tiles)');
        lookAt.setTarget(480, 5440);
    }, 1000);
});

chat.on('chat', (msg, autor, text, team, client_id) => {
    console.log(`(${team}, ${client_id}) ${autor}: ${text}`);
});

bot.on('disconnect', (reason) => {
    console.log('disconnect', reason);
});

(async () => {
    await bot.connect(IP, PORT, 20000);

    process.on('SIGINT', async () => {
        console.log('\nexit');
        container.destroy();
        await bot.disconnect();
        process.exit(0);
    });
})();
