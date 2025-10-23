"use strict";
const fs = require("fs"); // фс
const path = require("path"); // патх
const https = require("https"); // хттпс
const DebugLogger = require("../debug"); // дебаглоггер
const logDebuger = new DebugLogger("MapLoader", false, true); // создаем дебагер
const logdebug = logDebuger.logDebug.bind(logDebuger); // закидываем сюда чтобы писать короче

/**
 * Получает тип карты с ddnet.org
 * @param {string} mapName - Имя карты
 * @returns {Promise<string>} - Тип карты
 */
function fetchMapType(mapName) {
  logdebug("Fetching map type for:", mapName);
  const url = `https://ddnet.org/maps/?json=${encodeURIComponent(mapName)}`; // сылОчка1
  return new Promise((resolve, reject) => {
    logdebug("Requesting URL:", url);
    https.get(url, (res) => { // Получаем ответ
      logdebug("Received response with status code:", res.statusCode);
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch map type: ${res.statusCode}`)); // пропердоливаемся1
        return;
      }

      let rawData = ""; // не приготовненная дата
      res.on("data", (chunk) => (rawData += chunk)); // плюсуем чанки
      res.on("end", () => { // КОНЕЦ
        logdebug("end of data received");
        try { // пытаемся, пытаемся...
          const json = JSON.parse(rawData); // парсим жсон
          const type = json.type.toLowerCase(); // типа
          if (json && type) { // если есть жсон и тип
            logdebug("Fetched map type:", type);
            resolve(type); // резолвим тип
          } else { // иначе
            logdebug("Map type not found in response");
            reject(new Error("Map type not found in response")); // пропердоливаемся2
          }
        } catch (e) { // е
          reject(new Error("Failed to parse map type JSON")); // пропердоливаемся3
        }
      });
    }).on("error", reject); // еще раз пропердоливаемся4
  });
}

/** Загрузка карты по имени и типу
 * @param {string} mapName - Имя карты
 * @param {string} type - Тип карты
 * @param {string} MAP_DIR_DM - Папка для загрузки карты
 * @returns {Promise<string>} - Путь к загруженной карте
 */
function downloadMap(mapName, type, MAP_DIR_DM) {
  const filePath = path.join(MAP_DIR_DM, `${mapName}.map`); // прикидываем путь
  logdebug("Downloading map:", mapName, "of type:", type, "to:", filePath);
  if (fs.existsSync(filePath)) {
    logdebug("Map already exists at:", filePath);
    return Promise.resolve(filePath); // если карта уже есть, резолвим путь а точнее отдыхаем и не напрягаемся1
  }

  const url = `https://raw.githubusercontent.com/ddnet/ddnet-maps/master/types/${type}/maps/${mapName}.map`; // сылОчка2
  logdebug("Map download URL:", url);
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(MAP_DIR_DM)) {
      reject(new Error(`Directory does not exist: ${MAP_DIR_DM}`)); // Директории нет, отдыхаем и не напрягаемся2
      return;
    }
    const fileStream = fs.createWriteStream(filePath); // начинаем стримить на твич
    https.get(url, (res) => { // Получаем ответ
      logdebug("Received response with status code:", res.statusCode);
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download map: ${res.statusCode}`)); // пропердоливаемся5
        return;
      }

      res.pipe(fileStream); // пипе
      fileStream.on("finish", () => { // финиш
        logdebug("Map downloaded to:", filePath);
        fileStream.close(); // завершаем стрим и отдыхаем и не напрягаемся3
        resolve(filePath); // резолвим путь
      });
    }).on("error", (err) => {
      logdebug("Error downloading map:", err.message);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);// пропердоливаемся6 и удаляем файл, если он есть конечно
      reject(err); 
    });
  });
}

/** 
 * Пытается загрузить карту и возвращает успех или неудачу
 * @param {string} mapName - Имя карты
 * @param {string} type - Тип карты
 * @param {string} MAP_DIR - Папка для загрузки карты
 * @returns {Promise<boolean>} - Успех или неудача загрузки
 */
async function tryDownloadMap(mapName, type, MAP_DIR) {
  logdebug("Trying to download map:", mapName, "of type:", type);
  try { // пытаемся
    await downloadMap(mapName, type, MAP_DIR);  // ждемс
    return true; // да
  } catch (e) { // фак, провалились
    logdebug("Failed to download map:", JSON.stringify(e.message, null, 2));
    return false; // нет
  }
}

/**
 * Загружает карту по имени в указанную папку
 * @param {string} mapName - Имя карты
 * @param {string} MAP_DIR - Папка для загрузки карты
 * @returns {Promise<boolean>} - Успех или неудача загрузки
 */
async function loadMap(mapName, MAP_DIR) {
  logdebug("Loading map:", mapName, "into directory:", MAP_DIR);
  const type = await fetchMapType(mapName); // получаем тип карты
  return await tryDownloadMap(mapName, type, MAP_DIR); // пытаемся загрузить карту и возвращаем результат
}

/**
 * Расширенные функции для работы с картами
 */
const advanced = {
  downloadMap,
  tryDownloadMap,
  logDebuger // экспортируем дебаглоггер
}

// Экспортируем функции
module.exports = {
  fetchMapType, // получитьТипКарты
  loadMap, // загрузитьКарту
  advanced // продвинутые или расширенные, или пашёл ты
};
