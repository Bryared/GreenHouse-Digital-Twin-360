import serial
import time
import json
import paho.mqtt.client as mqtt

# Configuración del puerto serie (ajusta si tu Arduino aparece en otro)
PUERTO = "/dev/ttyACM0"
BAUDIOS = 9600

# Configuración de Beebotte
MQTT_BROKER = "mqtt.beebotte.com"
MQTT_PORT = 1883
MQTT_TOKEN = "token_gPYxwnX02f1Cgy6C"  # Tu nuevo token
CHANNEL = "invernadero"  # Usa tu canal en Beebotte
RESOURCE = "humedad_de_suelo"   # Nombre del recurso donde guardar los datos

# Inicializar cliente MQTT
client = mqtt.Client()
client.username_pw_set(MQTT_TOKEN)
client.connect(MQTT_BROKER, MQTT_PORT, 60)

def publish(resource, data):
    """Publica un dato en Beebotte"""
    topic = f"{CHANNEL}/{resource}"
    payload = json.dumps({
        "channel": CHANNEL,
        "resource": resource,
        "write": True,
        "data": data
    })
    client.publish(topic, payload)

try:
    # Conectar con el Arduino
    arduino = serial.Serial(PUERTO, BAUDIOS, timeout=1)
    time.sleep(2)  # Esperar a que el Arduino se inicialice
    print(f"Conexión establecida con Arduino en {PUERTO}")

    while True:
        if arduino.in_waiting > 0:
            dato = arduino.readline().decode("utf-8").strip()
            if dato.isdigit():
                humedad = int(dato)
                print(f"Humedad del suelo: {humedad}%")
                publish(RESOURCE, humedad)  # Enviar a Beebotte
                time.sleep(5)  # Enviar cada 5 segundos

except serial.SerialException:
    print(f"No se pudo abrir el puerto {PUERTO}. Verifica el nombre del dispositivo.")
except KeyboardInterrupt:
    print("\nPrograma terminado por el usuario.")
finally:
    if 'arduino' in locals() and arduino.is_open:
        arduino.close()
        print("Puerto serie cerrado.")