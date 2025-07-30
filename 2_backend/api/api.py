import requests  # Biblioteca para hacer solicitudes HTTP

# Configuración de Beebotte
channel = "tu_canal"  # Nombre de tu canal en Beebotte
resource = "tu_recurso"  # Nombre del recurso que quieres recuperar
token = "tu_token"  # Tu token de autenticación
url = f"https://api.beebotte.com/v1/data/read/{channel}/{resource}"  # Endpoint de la API de Beebotte

# Encabezados para la solicitud HTTP, incluyendo el token de autenticación
headers = {
    "X-Auth-Token": token
}

# Realiza la solicitud GET a la API de Beebotte
response = requests.get(url, headers=headers)

# Verifica si la solicitud fue exitosa (código 200)
if response.status_code == 200:
    data = response.json()  # Convierte la respuesta a JSON
    print("Datos recuperados:", data)
else:
    # Si hubo un error, muestra el código de error
    print("Error al recuperar los datos:", response.status_code)
