// src/public/api.ts

// ✅ Lee el token de forma segura desde las variables de entorno
const CHANNEL_TOKEN = "token_pP0hA2qWlICSEWj8";
const CHANNEL = "Invernadero";

// Mantenemos los nombres de los recursos para mapear la respuesta
export const RESOURCES = {
  Soil1: "FC28_1",
  Soil2: "FC28_2",
  AirQuality: "MQ135",
  Rain: "FC37",
  CapSoil1: "Capacitivo_1",
  CapSoil2: "Capacitivo_2",
  Light: "KY018",
  Temp: "DHT22_Temperatura",
  Hum: "DHT22_Humedad",
  Ultra1: "HC_SR04_1",
  Ultra2: "HC_SR04_2",
  AutoMode: "AutoMode",
  Relay1: "Relay_Bomba",
  Relay2: "Relay_Sirena",
  Relay3: "Relay_LED",
  Relay4: "Relay_Ventilador",
  Relay5: "Relay_Calefactor",
  Relay6: "Relay_Nebulizador",
  Relay7: "Relay_Lluvia",
  Relay8: "Relay_BombaTanque",
};



// 💡 VERSIÓN MEJORADA: Lee todos los recursos en UNA SOLA llamada a la API
export async function readAllResources() {
  if (!CHANNEL_TOKEN) {
    throw new Error("El token de Beebotte no está configurado. Revisa tu archivo .env.local");
  }

  // Este endpoint especial de Beebotte nos da el último valor de TODOS los recursos del canal
  const url = `https://api.beebotte.com/v1/data/read/${CHANNEL}?source=raw&last=true`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      // ✅ ASÍ ES LA AUTENTICACIÓN CORRECTA PARA BEEBOTTE
      "X-Auth-Token": CHANNEL_TOKEN,
    },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  // El resultado es un array, lo convertimos a un objeto más fácil de usar
  // Formato: { "DHT22_Temperatura": 25.1, "Capacitivo_1": 60.3, ... }
  const results: Record<string, any> = {};
  for (const record of data) {
    results[record.resource] = record.data;
  }
  
  return results;
}