class BotMovement {
    constructor(client) {
        this.client = client;
        this.movement = client.movement;
        this.game = client.game;
    }

    // Основные движения
    runLeft() {
        this.movement.RunLeft();
    }

    runRight() {
        this.movement.RunRight();
    }

    stop() {
        this.movement.RunStop();
    }

    // Прыжки и крюк
    jump(value = true) {
        this.movement.Jump(value);
    }

    hook(value = true) {
        this.movement.Hook(value);
    }

    // Прицеливание и стрельба
    setAim(x, y) {
        this.movement.SetAim(x, y);
    }

    fire() {
        this.movement.Fire();
    }

    // Оружие
    nextWeapon() {
        this.movement.NextWeapon();
    }

    prevWeapon() {
        this.movement.PrevWeapon();
    }

    // Чат
    say(message) {
        this.game.Say(message);
    }

    // Убийство
    kill() {
        this.game.Kill();
    }

    // Флаг чата
    setChatting(flag) {
        this.movement.FlagChatting(flag);
    }

    // Комплексные движения
    moveLeft() {
        this.stop();
        this.runLeft();
    }

    moveRight() {
        this.stop();
        this.runRight();
    }

    // Прыжок с остановкой
    jumpAndStop() {
        this.jump(true);
        setTimeout(() => this.jump(false), 100);
    }

    // Крюк с остановкой
    hookAndStop() {
        this.hook(true);
        setTimeout(() => this.hook(false), 100);
    }

    // Получение состояния персонажа
    getCharacterState() {
        const myDDNetChar = this.client.SnapshotUnpacker.getObjExDDNetCharacter(this.client.SnapshotUnpacker.OwnID);
        if (!myDDNetChar) return null;

        return {
            isFrozen: myDDNetChar.m_FreezeEnd !== 0,
            freezeEnd: myDDNetChar.m_FreezeEnd,
            position: {
                x: myDDNetChar.m_X,
                y: myDDNetChar.m_Y
            },
            velocity: {
                x: myDDNetChar.m_VelX,
                y: myDDNetChar.m_VelY
            },
            direction: myDDNetChar.m_Direction,
            jumps: myDDNetChar.m_Jumps,
            hook: {
                x: myDDNetChar.m_TargetX,
                y: myDDNetChar.m_TargetY
            }
        };
    }

    // Проверка заморозки
    isFrozen() {
        const state = this.getCharacterState();
        return state ? state.isFrozen : false;
    }

    // Автоматическое убийство при заморозке
    autoKillOnFreeze(timeout = 15000) {
        const state = this.getCharacterState();
        if (state && state.isFrozen) {
            setTimeout(() => {
                const currentState = this.getCharacterState();
                if (currentState && currentState.isFrozen) {
                    this.kill();
                }
            }, timeout);
        }
    }
}

module.exports = BotMovement;
