import Adafruit_DHT  # Biblioteca para sensores DHT22
import spidev  # Para comunicación SPI con el ADC
import time  # Manejo de tiempos y retrasos
import json  # Para manejar datos en formato JSON
import paho.mqtt.client as mqtt  # Cliente MQTT para conectarse a Beebotte
from gpiozero import OutputDevice  # Para controlar los relés

# Configuración de los sensores DHT22
DHT_SENSOR = Adafruit_DHT.DHT22
DHT_PINS = [25, 26, 27]  # Pines GPIO donde están conectados los DHT

# Configuración de los relés
RELE_PINS = {
    "ventilador": 4,  # Pin GPIO para el relé del ventilador
    "calefaccion": 14,
    "focos": 16,
    "extractor": 15,
    "nebulizador": 12,
    "bomba": 13,
    "riego1": 21,
    "riego2": 22,
}
reles = {nombre: OutputDevice(pin, active_high=False, initial_value=True) for nombre, pin in RELE_PINS.items()}  # Configuración de los relés como salida, en estado inicial apagado

# Configuración del cliente MQTT
MQTT_BROKER = "mqtt.beebotte.com"
MQTT_PORT = 1883
MQTT_TOKEN = "tu_token"  # Reemplaza con tu token de Beebotte
CHANNEL = "autoinvernadero"  # Nombre de tu canal en Beebotte

# Inicialización del cliente MQTT
client = mqtt.Client()
client.username_pw_set(MQTT_TOKEN)  # Autenticación con el token
client.connect(MQTT_BROKER, MQTT_PORT, 60)  # Conexión al broker de Beebotte

# Configuración del ADC (MCP3008) para convertir las señales analógicas de los sensores de humedad del suelo
spi = spidev.SpiDev()  # Inicializa la interfaz SPI
spi.open(0, 0)  # Abre el bus SPI en el canal 0
spi.max_speed_hz = 1350000  # Velocidad máxima de comunicación

def read_adc(channel):
    """Lee el valor del canal analógico del ADC (0-7) y lo convierte a un valor digital (0-1023)"""
    adc = spi.xfer2([1, (8 + channel) << 4, 0])  # Envía la solicitud de lectura al ADC
    value = ((adc[1] & 3) << 8) + adc[2]  # Convierte la respuesta a un valor de 10 bits
    return value

def map_adc(value):
    """Convierte el valor digital del ADC (0-1023) a un porcentaje de 0 a 100"""
    return max(0, min(100, int((1 - value / 1023.0) * 100)))  # Escala el valor a un porcentaje

def read_dht_data():
    """Lee los datos de temperatura y humedad de los sensores DHT22"""
    readings = []
    for pin in DHT_PINS:
        humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, pin)  # Intenta leer los datos del sensor DHT22
        readings.append((temperature, humidity))
    return readings

def publish(resource, data):
    """Publica los datos en Beebotte mediante MQTT"""
    topic = f"{CHANNEL}/{resource}"
    payload = json.dumps({  # Convierte los datos a formato JSON
        "channel": CHANNEL,
        "resource": resource,
        "write": True,  # Indica que se van a almacenar en Beebotte
        "data": data
    })
    client.publish(topic, payload)  # Publica los datos en el broker MQTT

def control_system():
    """Función principal que lee los sensores,"""""
    # Lee los datos de los sensores DHT22
    dht_readings = read_dht_data()
    temps = [t for t, h in dht_readings if t is not None]
    hums = [h for t, h in dht_readings if h is not None]

    # Verifica que las lecturas sean válidas
    if not temps or not hums:
        print("Sensor DHT no disponible")
        return

    # Calcula el promedio de temperatura y humedad
    temp_avg = sum(temps) / len(temps)
    hum_avg = sum(hums) / len(hums)

    # Lee y calcula el promedio de humedad del suelo
    hum_suelo = [map_adc(read_adc(i)) for i in range(4)]
    hum_suelo_avg = sum(hum_suelo) / len(hum_suelo)

    # Ejemplo de control: si la temperatura supera 30°C, activa el ventilador
    if temp_avg > 30:
        reles["ventilador"].on()
        publish("rele_ventilador", True)
    else:
        reles["ventilador"].off()
        publish("rele_ventilador", False)

    # Publica los datos de temperatura, humedad y humedad del suelo
    publish("temperatura_1", temps[0])
    publish("humedad_1", hums[0])
    publish("humesuelo_suelo_1", hum_suelo[0])

    # Imprime los valores en consola para monitoreo
    print(f"Temp: {temp_avg:.2f}, Hum: {hum_avg:.2f}, Suelo: {hum_suelo_avg:.2f}")

def main():
    """Función principal que ejecuta el control del sistema cada 3 minutos"""
    while True:
        control_system()  # Llama a la función de control
        time.sleep(180)  # Espera 3 minutos antes de la siguiente lectura

if __name__ == "__main__":
    main()

