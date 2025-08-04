# -*- coding: utf-8 -*-
"""
Script de Predicción de Rendimiento para GDT-360.

Este script carga el modelo de Machine Learning ya entrenado y lo utiliza
para realizar una predicción sobre nuevos datos.

Será llamado por el API de Joel para servir las predicciones al frontend.

Autor: Bryan Vargas (Científico de Datos Jefe, InnovaABC 360)
"""

import joblib
import os
import pandas as pd

# --- 1. CONFIGURACIÓN Y CARGA DEL MODELO ---

# Definir la ruta al modelo entrenado. Es importante que sea relativa
# al script actual para que funcione en cualquier máquina.
RUTA_MODELO = os.path.join(os.path.dirname(__file__), '..', '..', '01_prediction', 'modelo_entrenado', 'prediccion_rendimiento_v1.joblib')

def cargar_modelo(ruta):
    """
    Carga el modelo .joblib desde la ruta especificada.
    
    Args:
        ruta (str): La ruta al archivo del modelo.
        
    Returns:
        El modelo de scikit-learn cargado.
    """
    try:
        print("INFO: Cargando modelo desde:", ruta)
        modelo = joblib.load(ruta)
        print("INFO: ¡Modelo cargado exitosamente!")
        return modelo
    except FileNotFoundError:
        print(f"ERROR: No se encontró el archivo del modelo en {ruta}.")
        print("       Por favor, ejecute primero el script 'entrenar_modelo.py'.")
        return None

# --- 2. FUNCIÓN DE PREDICCIÓN ---

def realizar_prediccion(modelo, datos_entrada):
    """
    Realiza una predicción usando el modelo cargado.
    
    Args:
        modelo: El modelo de scikit-learn entrenado.
        datos_entrada (dict): Un diccionario con los datos para la predicción.
                               Ej: {'temp_promedio': 25, 'humedad_promedio': 70, 'horas_luz': 13}
                               
    Returns:
        float: El valor de la predicción (rendimiento en kg/m²).
    """
    if modelo is None:
        return None
        
    try:
        print(f"\nINFO: Realizando predicción con los datos: {datos_entrada}")
        
        # Convertir el diccionario de entrada a un DataFrame de pandas,
        # porque el modelo de scikit-learn espera este formato.
        # El [0] es para crear una única fila.
        df_entrada = pd.DataFrame(datos_entrada, index=[0])
        
        # Asegurarse de que el orden de las columnas sea el mismo que en el entrenamiento
        columnas_modelo = ['temp_promedio', 'humedad_promedio', 'horas_luz']
        df_entrada = df_entrada[columnas_modelo]
        
        # Realizar la predicción
        prediccion = modelo.predict(df_entrada)
        
        # El resultado es un array, extraemos el primer (y único) valor
        resultado_final = prediccion[0]
        
        print(f"      Resultado de la predicción: {resultado_final:.2f} kg/m²")
        return resultado_final
        
    except Exception as e:
        print(f"ERROR: Ocurrió un error durante la predicción: {e}")
        return None

# --- BLOQUE PRINCIPAL DE EJEMPLO ---

if __name__ == "__main__":
    print("=====================================================")
    print("= EJECUTANDO PRUEBA DEL SCRIPT DE PREDICCIÓN        =")
    print("=====================================================")
    
    # 1. Cargar el modelo
    modelo_cargado = cargar_modelo(RUTA_MODELO)
    
    # 2. Simular nuevos datos de entrada (esto es lo que llegaría desde el API)
    nuevos_datos_invernadero = {
        'temp_promedio': 26.5,
        'humedad_promedio': 68,
        'horas_luz': 14.5
    }
    
    # 3. Realizar la predicción
    rendimiento_predicho = realizar_prediccion(modelo_cargado, nuevos_datos_invernadero)
    
    # 4. Mostrar el resultado final de la prueba
    if rendimiento_predicho is not None:
        print(f"\n✅ Veredicto de la Prueba: El sistema predice un rendimiento de {rendimiento_predicho:.2f} kg/m².")
    else:
        print("\n❌ Veredicto de la Prueba: La predicción falló.")
        
    print("\n=====================================================")
    print("= PRUEBA DE PREDICCIÓN FINALIZADA                 =")
    print("=====================================================")
