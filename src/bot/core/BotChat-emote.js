const logger = require('../../logger').getLogger('BotChatEmote');

class BotChatEmote {
    constructor(client) {
        this.client = client;
        this.game = client.game;
        this.movement = client.movement;
        
        // Базовые настройки
        this.chatEnabled = true;
        this.emoteEnabled = true;
        this.emoteInterval = null;
        this.emoteIntervalMs = 500;
    }

    // === БАЗОВЫЙ ЧАТ ===

    // Отправка сообщения
    say(message) {
        if (!this.chatEnabled) {
            logger.info('Chat is disabled');
            return false;
        }

        try {
            this.game.Say(message);
            return true;
        } catch (error) {
            logger.error('Error sending message:', error);
            return false;
        }
    }

    // Включение/выключение чата
    setChatEnabled(enabled) {
        this.chatEnabled = enabled;
    }

    // === БАЗОВЫЕ ЭМОЦИИ ===

    // Отправка эмоции
    emote(emoteType) {
        if (!this.emoteEnabled) {
            logger.info('Emotes are disabled');
            return false;
        }

        try {
            this.game.Emote(emoteType);
            return true;
        } catch (error) {
            logger.error('Error sending emote:', error);
            return false;
        }
    }

    // Автоматические эмоции
    startAutoEmote(emoteType = 2, intervalMs = 500) {
        if (this.emoteInterval) {
            this.stopAutoEmote();
        }

        this.emoteInterval = setInterval(() => {
            try {
                if (this.emoteEnabled) {
                    this.emote(emoteType);
                } else {
                    this.stopAutoEmote();
                }
            } catch (error) {
                logger.error('Error in auto emote:', error);
                this.stopAutoEmote();
            }
        }, intervalMs);

        logger.info(`Auto emote started with type ${emoteType}, interval ${intervalMs}ms`);
    }

    // Остановка автоматических эмоций
    stopAutoEmote() {
        if (this.emoteInterval) {
            clearInterval(this.emoteInterval);
            this.emoteInterval = null;
            logger.info('Auto emote stopped');
        }
    }

    // Включение/выключение эмоций
    setEmoteEnabled(enabled) {
        this.emoteEnabled = enabled;
        if (!enabled) {
            this.stopAutoEmote();
        }
    }

    // === ОЧИСТКА ===

    // Очистка ресурсов
    cleanup() {
        this.stopAutoEmote();
        this.chatEnabled = false;
        this.emoteEnabled = false;
    }
}

module.exports = BotChatEmote;
