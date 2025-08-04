# -*- coding: utf-8 -*-
"""
Script de Entrenamiento del Modelo Predictivo de Rendimiento para GDT-360.

Este script realiza el ciclo completo de Machine Learning:
1.  Carga y procesa los datos del invernadero.
2.  Entrena un modelo de regresión (Random Forest) para predecir el rendimiento.
3.  Evalúa el rendimiento del modelo.
4.  Guarda el modelo entrenado para su uso en producción por el API.

Autor: Bryan Vargas (Científico de Datos Jefe, InnovaABC 360)
"""

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

# --- 1. CONFIGURACIÓN Y CARGA DE DATOS ---

def cargar_y_preparar_datos():
    """
    Carga los datos y los prepara para el entrenamiento.
    
    NOTA: Actualmente, usa datos sintéticos. En el futuro, esta función
    se conectará a la base de datos o leerá los archivos CSV generados
    por el backend de Joel.
    """
    print("INFO: Cargando y preparando datos...")
    
    # Creación de un dataset sintético realista para el Tomate
    # Columnas: temp_promedio, humedad_promedio, horas_luz, rendimiento_kg_m2
    data = {
        'temp_promedio': [22, 24, 25, 20, 26, 23, 21, 27, 22.5, 24.5, 28, 19],
        'humedad_promedio': [65, 70, 68, 60, 72, 67, 63, 75, 66, 71, 78, 58],
        'horas_luz': [10, 12, 13, 9, 14, 11, 9.5, 15, 10.5, 12.5, 16, 8.5],
        'rendimiento_kg_m2': [5.5, 6.5, 6.8, 5.0, 7.2, 6.0, 5.2, 7.5, 5.8, 6.6, 7.0, 4.8]
    }
    df = pd.DataFrame(data)
    
    print("INFO: Datos cargados exitosamente.")
    print("      Número de registros:", len(df))
    return df

# --- 2. ENTRENAMIENTO DEL MODELO ---

def entrenar_modelo(df):
    """
    Entrena el modelo de Machine Learning y lo evalúa.
    
    Args:
        df (pd.DataFrame): El DataFrame con los datos preparados.
        
    Returns:
        El modelo entrenado.
    """
    print("\nINFO: Iniciando el proceso de entrenamiento...")
    
    # Separar las características (X) de la variable objetivo (y)
    X = df[['temp_promedio', 'humedad_promedio', 'horas_luz']]
    y = df['rendimiento_kg_m2']
    
    # Dividir los datos en conjuntos de entrenamiento y prueba (80% / 20%)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print("      Datos divididos en entrenamiento y prueba.")
    
    # Inicializar el modelo. RandomForest es potente y robusto.
    # n_estimators: número de "árboles" en el bosque.
    # random_state: para que el resultado sea reproducible.
    modelo = RandomForestRegressor(n_estimators=100, random_state=42)
    
    # Entrenar el modelo con los datos de entrenamiento
    print("      Entrenando el modelo RandomForestRegressor...")
    modelo.fit(X_train, y_train)
    print("      ¡Modelo entrenado exitosamente!")
    
    # --- 3. EVALUACIÓN DEL MODELO ---
    print("\nINFO: Evaluando el rendimiento del modelo...")
    
    # Realizar predicciones en el conjunto de prueba
    predicciones = modelo.predict(X_test)
    
    # Calcular métricas de error
    mse = mean_squared_error(y_test, predicciones)
    r2 = r2_score(y_test, predicciones)
    
    print(f"      - Error Cuadrático Medio (MSE): {mse:.2f}")
    print(f"      - Coeficiente de Determinación (R²): {r2:.2f}")
    
    if r2 > 0.7:
        print("      Veredicto: ¡El modelo tiene un buen poder predictivo!")
    else:
        print("      Veredicto: El modelo es básico. Se necesitarán más datos o características.")
        
    return modelo

# --- 4. GUARDADO DEL MODELO ---

def guardar_modelo(modelo):
    """
    Guarda el modelo entrenado en un archivo .joblib para su uso futuro.
    """
    print("\nINFO: Guardando el modelo entrenado...")
    
    # Definir la ruta de guardado. Sube dos niveles para llegar a la raíz de 4_data_science
    # y luego entra a la carpeta de modelos entrenados.
    ruta_guardado = os.path.join(os.path.dirname(__file__), '..', '..', '01_prediction', 'modelo_entrenado', 'prediccion_rendimiento_v1.joblib')
    
    # Crear el directorio si no existe
    os.makedirs(os.path.dirname(ruta_guardado), exist_ok=True)
    
    # Guardar el modelo
    joblib.dump(modelo, ruta_guardado)
    
    print(f"      ¡Modelo guardado exitosamente en: {ruta_guardado}")

# --- BLOQUE PRINCIPAL DE EJECUCIÓN ---

if __name__ == "__main__":
    print("=====================================================")
    print("= INICIANDO PIPELINE DE ENTRENAMIENTO GDT-360       =")
    print("=====================================================")
    
    # Ejecutar el pipeline completo
    datos = cargar_y_preparar_datos()
    modelo_entrenado = entrenar_modelo(datos)
    guardar_modelo(modelo_entrenado)
    
    print("\n=====================================================")
    print("= PIPELINE DE ENTRENAMIENTO FINALIZADO            =")
    print("=====================================================")
