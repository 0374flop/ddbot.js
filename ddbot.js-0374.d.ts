declare module 'ddbot.js-0374' {
  import { EventEmitter } from 'events';

  /**
   * Информация об идентичности бота (скин, клан, цвета и т.д.)
   */
  export interface BotIdentity {
    name?: string;
    clan?: string;
    skin?: string;
    use_custom_color?: number;
    color_body?: number;
    color_feet?: number;
    country?: number;
  }

  /**
   * Параметры для создания бота
   */
  export interface BotParameters {
    /** Идентичность бота (скин, клан, цвета) */
    identity?: BotIdentity;
    /** Переподключаться ли боту при разрыве соединения */
    reconnect?: boolean;
    /** Количество попыток переподключения (-1 для бесконечного) */
    reconnectAttempts?: number;
    /** Использовать ли случайную задержку при переподключении (0-1 сек) */
    randreconnect?: boolean;
  }

  /**
   * Информация о боте
   */
  export interface BotInfo {
    client: any;
    fulladdress: string;
    originalName: string;
    parameter: BotParameters;
    isConnected: boolean;
    createdAt: number;
  }

  /**
   * Информация об игроке на сервере
   */
  export interface PlayerInfo {
    client_id: number;
    name: string;
    clan: string;
    country: number;
    team: number;
    skin: string;
    x: number | null;
    y: number | null;
  }

  /**
   * Детали карты
   */
  export interface MapDetails {
    map_name: string;
    map_url?: string;
  }

  /**
   * Менеджер ботов для управления несколькими ботами
   */
  export class BotManager extends EventEmitter {
    /**
     * Создает нового бота
     * @param fulladdress - Полный адрес сервера (IP:порт)
     * @param botName - Имя бота
     * @param parameter - Параметры бота
     * @returns Уникальное имя бота или null в случае ошибки
     */
    createBot(
      fulladdress: string,
      botName: string,
      parameter?: BotParameters
    ): Promise<string | null>;

    /**
     * Подключает бота к серверу
     * @param botName - Уникальное имя бота
     * @returns true если подключение успешно
     */
    connectBot(botName: string): Promise<boolean>;

    /**
     * Отключает бота от сервера
     * @param botName - Уникальное имя бота
     * @returns true если отключение успешно
     */
    disconnectBot(botName: string): Promise<boolean>;

    /**
     * Отключает всех ботов
     * @returns Результаты отключения каждого бота
     */
    disconnectAllBots(): Promise<Array<PromiseSettledResult<boolean>>>;

    /**
     * Получает информацию о боте
     * @param botName - Уникальное имя бота
     * @returns Информация о боте или null
     */
    getBotInfo(botName: string): BotInfo | null;

    /**
     * Проверяет, подключен ли бот
     * @param botName - Уникальное имя бота
     * @returns true если бот подключен
     */
    isBotConnected(botName: string): boolean;

    /**
     * Проверяет, заморожен ли бот
     * @param botName - Уникальное имя бота
     * @returns true если бот заморожен
     */
    isFreezeBot(botName: string): boolean;

    /**
     * Устанавливает состояние заморозки бота
     * @param botName - Уникальное имя бота
     * @param isFrozen - true для заморозки, false для разморозки
     */
    setFreezeBot(botName: string, isFrozen: boolean): void;

    /**
     * Получает список всех активных ботов
     * @returns Массив имен всех активных ботов
     */
    getAllActiveBots(): string[];

    /**
     * Получает клиент бота
     * @param botName - Уникальное имя бота
     * @returns Клиент бота или null
     */
    getBotClient(botName: string): any | null;

    /**
     * Удаляет бота из менеджера
     * @param botName - Уникальное имя бота
     * @returns true если бот был удален
     */
    removeBot(botName: string): boolean;

    /**
     * Получает объект бота с событиями
     * @param botName - Уникальное имя бота
     * @returns Объект бота или null
     */
    getBot(botName: string): any | null;

    /**
     * Получает список игроков на сервере
     * @param botName - Уникальное имя бота
     * @returns Массив игроков
     */
    getPlayerList(botName: string): PlayerInfo[];

    /**
     * Получает имя игрока по его ID
     * @param botName - Уникальное имя бота или массив игроков
     * @param clientId - ID клиента игрока
     * @returns Имя игрока или null
     */
    getPlayerName(botName: string | PlayerInfo[], clientId: number): string | null;

    // События
    on(event: `${string}:connect`, listener: () => void): this;
    on(event: `${string}:connected`, listener: () => void): this;
    on(event: `${string}:disconnect`, listener: (reason: string, reconnectTime?: number) => void): this;
    on(event: `${string}:disconnected`, listener: (reason: string, reconnectTime?: number) => void): this;
    on(event: `${string}:reconnect`, listener: (reconnectTime: number) => void): this;
    on(event: `${string}:snapshot`, listener: (snapshot: any) => void): this;
    on(event: `${string}:message`, listener: (msg: object) => void): this;
    on(event: `${string}:ChatNoSystem`, listener: (msgraw: object, autormsg: string, text: string, team: number, client_id: number) => void): this;
    on(event: `${string}:ChatRaw`, listener: (msgraw: object, autormsg: string, text: string, team: number, client_id: number) => void): this;
    on(event: `${string}:error`, listener: (error: Error) => void): this;
    on(event: `${string}:map_details`, listener: (mapDetails: MapDetails) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }

  /**
   * Объект с классом BotManager и логгером из модуля Loger0374
   */
  export interface BotClassAndLogger {
    BotManager: typeof BotManager;
    logDebuger: any;
  }

  /** Экземпляр BotManager */
  export const bot: BotManager;

  /** Класс BotManager и логгер */
  export const botClassAndLoger: BotClassAndLogger;
}