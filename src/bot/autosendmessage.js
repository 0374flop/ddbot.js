let list = ['PENIS'];

function getRandomAnswer(customList) {
    const Answers = customList && customList.length ? customList : list;
    const index = Math.floor(Math.random() * Answers.length);
    return Answers[index];
}

async function OnMessage(bot, botName) {
    bot.on(`${botName}:message`, (msg) => {
        const client = bot.getBotClient(botName);
        const Answer = getRandomAnswer();

        if (!msg || typeof msg.message !== 'string') return;

        const utilisateur = msg.utilisateur?.InformationDuBot;
        let autormsg = utilisateur?.name || false;

        if (autormsg && Answer) {
            client.game.Say(Answer);
        }
    });
}

function setlist(newlist) {
    list = newlist;
}

module.exports = { OnMessage, getRandomAnswer, setlist };