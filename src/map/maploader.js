"use strict";
const fs = require("fs"); // фс
const path = require("path"); // патх
const https = require("https"); // хттпс

/**
 * Получает тип карты с ddnet.org
 * @param {string} mapName - Имя карты
 * @returns {Promise<string>} - Тип карты
 */
function fetchMapType(mapName) {
  const url = `https://ddnet.org/maps/?json=${encodeURIComponent(mapName)}`; // сылОчка1
  return new Promise((resolve, reject) => {
    https.get(url, (res) => { // Получаем ответ
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch map type: ${res.statusCode}`)); // пропердоливаемся1
        return;
      }

      let rawData = ""; // не приготовненная дата
      res.on("data", (chunk) => (rawData += chunk)); // плюсуем чанки
      res.on("end", () => { // КОНЕЦ
        try { // пытаемся, пытаемся...
          const json = JSON.parse(rawData); // парсим жсон
          const type = json.type.toLowerCase(); // типа
          if (json && type) { // если есть жсон и тип
            resolve(type); // резолвим тип
          } else { // иначе
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
  if (fs.existsSync(filePath)) {
    return Promise.resolve(filePath); // если карта уже есть, резолвим путь а точнее отдыхаем и не напрягаемся1
  }

  const url = `https://raw.githubusercontent.com/ddnet/ddnet-maps/master/types/${type}/maps/${mapName}.map`; // сылОчка2

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(MAP_DIR_DM)) {
      reject(new Error(`Directory does not exist: ${MAP_DIR_DM}`)); // Директории нет, отдыхаем и не напрягаемся2
      return;
    }
    const fileStream = fs.createWriteStream(filePath); // начинаем стримить на твич
    https.get(url, (res) => { // Получаем ответ
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download map: ${res.statusCode}`)); // пропердоливаемся5
        return;
      }

      res.pipe(fileStream); // пипе
      fileStream.on("finish", () => { // финиш
        fileStream.close(); // завершаем стрим и отдыхаем и не напрягаемся3
        resolve(filePath); // резолвим путь
      });
    }).on("error", (err) => {
      fs.unlink(filePath, () => reject(err)); // пропердоливаемся6 и удаляем файл
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
  try { // пытаемся
    await downloadMap(mapName, type, MAP_DIR);  // ждемс
    return true; // да
  } catch { // фак, провалились
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
  const type = await fetchMapType(mapName); // получаем тип карты
  return await tryDownloadMap(mapName, type, MAP_DIR); // пытаемся загрузить карту и возвращаем результат
}

/**
 * Расширенные функции для работы с картами
 */
const advanced = {
  downloadMap,
  tryDownloadMap
}

// Экспортируем функции для использования в других модулях
module.exports = {
  fetchMapType, // получитьТипКарты
  loadMap, // загрузитьКарту
  advanced // продвинутые или расширенные, или пашёл ты
};
