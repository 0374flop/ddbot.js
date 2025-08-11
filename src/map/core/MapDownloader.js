const fs = require("fs");
const path = require("path");
const https = require("https");

const MAPS_DIR = path.join(__dirname, "..", "..", "..", "data", "maps");
const PARSED_DIR = path.join(__dirname, "..", "..", "..", "data", "parsed");

function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function fetchMapType(mapName) {
  const url = `https://ddnet.org/maps/?json=${encodeURIComponent(mapName)}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch map type: ${res.statusCode}`));
        return;
      }

      let rawData = "";
      res.on("data", (chunk) => (rawData += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(rawData);
          const type = json.type.toLowerCase();
          if (json && type) {
            resolve(type);
          } else {
            reject(new Error("Map type not found in response"));
          }
        } catch (e) {
          reject(new Error("Failed to parse map type JSON"));
        }
      });
    }).on("error", reject);
  });
}

function downloadMap(mapName, type, MAPS_DIR_DM) {
  const filePath = path.join(MAPS_DIR_DM, `${mapName}.map`);
  if (fs.existsSync(filePath)) {
    return Promise.resolve(filePath);
  }

  const url = `https://raw.githubusercontent.com/ddnet/ddnet-maps/master/types/${type}/maps/${mapName}.map`;

  return new Promise((resolve, reject) => {
    ensureDirExists(MAPS_DIR_DM);
    const fileStream = fs.createWriteStream(filePath);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download map: ${res.statusCode}`));
        return;
      }

      res.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
        resolve(filePath);
      });
    }).on("error", (err) => {
      fs.unlink(filePath, () => reject(err));
    });
  });
}

async function tryDownloadMap(mapName, type, MAP_DIR) {
  try {
    await downloadMap(mapName, type, MAP_DIR);
    return true;
  } catch {
    return false;
  }
}


async function loadMap(mapName, MAP_DIR) {
  let MAPS_DIR_LM = MAPS_DIR;
  if (MAP_DIR) {
    MAPS_DIR_LM = MAP_DIR;
  }
  ensureDirExists(MAPS_DIR_LM);
  const type = await fetchMapType(mapName);
  return await tryDownloadMap(mapName, type, MAPS_DIR_LM);
}

function deleteMapFromCache(mapName) {
  const filePath = path.join(MAPS_DIR, `${mapName}.map`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

module.exports = {
  fetchMapType,
  loadMap,
  deleteMapFromCache,
  MAPS_DIR,
  PARSED_DIR
};
