# -*- coding: utf-8 -*-
"""
================================================================================
MOTOR DE SIMULACIÓN MULTI-DOMINIO GDT-360 v1.0
================================================================================
Misión:
    Ser el corazón del Núcleo Cognitivo, permitiendo la creación de "realidades
    virtuales" de alta fidelidad para la experimentación, predicción y
    optimización de estrategias agrícolas. Este motor es modular, data-driven
    e impulsado por IA.

Capacidades:
    - Carga dinámica de parámetros de cultivo desde archivos JSON.
    - Simulación biológica multi-etapa del crecimiento de cultivos.
    - Generación de escenarios climáticos dinámicos usando la API de Gemini.
    - Modelado de estrés hídrico y térmico.
"""

import json
import os
import random
from typing import Dict, Any, List, Tuple

import numpy as np
import pandas as pd
import requests


# --- MÓDULO 1: GENERADOR DE ESCENARIOS CON IA (GEMINI) ---

class GeneradorEscenariosGemini:
    """
    Utiliza la IA de Gemini para generar datasets climáticos realistas a partir
    de descripciones en lenguaje natural.
    """

    def __init__(self, api_key: str = ""):
        self.api_key = api_key
        self.api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={self.api_key}"

    def generar_dataset_climatico(self, descripcion_escenario: str, dias: int, online: bool = False) -> pd.DataFrame:
        """
        Genera un DataFrame con una serie de tiempo climática.

        Args:
            descripcion_escenario (str): Ej. "Un verano muy caluroso y seco en Arequipa, Perú".
            dias (int): La duración en días de la simulación.
            online (bool): Si es True, intentará llamar a la API de Gemini.

        Returns:
            pd.DataFrame: Un DataFrame con columnas ['dia', 'temp_max', 'temp_min', 'radiacion_solar'].
        """
        if not online:
            print("INFO: [Gemini] Modo offline. Usando datos de respaldo.")
            return self._generar_dataset_respaldo(dias)

        print(f"INFO: [Gemini] Generando escenario para: '{descripcion_escenario}'...")
        prompt = f"""
        Actúa como un meteorólogo y científico de datos experto. Genera una serie de tiempo climática de {dias} días para el siguiente escenario: '{descripcion_escenario}'.
        El resultado debe ser un string en formato CSV, sin cabecera, con 4 columnas: dia, temp_max_celsius, temp_min_celsius, radiacion_solar_par.
        Los datos deben ser numéricos y realistas para el escenario descrito. No incluyas texto adicional, solo el CSV.
        Ejemplo de una línea: 1,28.5,15.2,2100
        """
        try:
            response = requests.post(self.api_url, json={'contents': [{'parts': [{'text': prompt}]}]})
            response.raise_for_status()
            csv_data = response.json()['candidates'][0]['content']['parts'][0]['text']
            
            from io import StringIO
            df = pd.read_csv(StringIO(csv_data), header=None, names=['dia', 'temp_max', 'temp_min', 'radiacion_solar'])
            print("INFO: [Gemini] Dataset climático generado exitosamente.")
            return df
        except Exception as e:
            print(f"ERROR: [Gemini] Falló la generación de escenario. Usando datos de respaldo. Error: {e}")
            return self._generar_dataset_respaldo(dias)

    def _generar_dataset_respaldo(self, dias: int) -> pd.DataFrame:
        """Genera datos simples si la API de Gemini falla o para pruebas offline."""
        dias_range = np.arange(1, dias + 1)
        temp_min = 15 + 5 * np.sin(2 * np.pi * dias_range / 365) + np.random.randn(dias)
        temp_max = temp_min + 10 + 2 * np.sin(2 * np.pi * dias_range / 365) + np.random.randn(dias)
        radiacion = 1800 + 400 * np.sin(2 * np.pi * dias_range / 365) + np.random.randn(dias) * 100
        return pd.DataFrame({'dia': dias_range, 'temp_max': temp_max, 'temp_min': temp_min, 'radiacion_solar': radiacion})

# --- MÓDULO 2: MODELO BIOLÓGICO DE LA PLANTA ---

class ModeloBiologicoPlanta:
    """Simula el crecimiento y la respuesta de la planta a las condiciones."""

    def __init__(self, config_cultivo: Dict[str, Any]):
        self.nombre = config_cultivo['nombre_cultivo']
        self.etapa = 'germinacion'
        self.gdd_acumulados = 0.0
        self.dias_en_etapa = 0
        self.estres_hidrico_acumulado = 0.0
        self.estres_termico_acumulado = 0.0
        self.biomasa = 0.1 # kg/m^2 inicial
        self.config = config_cultivo

    def crecer(self, condiciones_diarias: Dict[str, float]):
        """Simula el crecimiento y estrés de un día."""
        self.dias_en_etapa += 1
        
        temp_media = (condiciones_diarias['temp_max'] + condiciones_diarias['temp_min']) / 2
        gdd_diario = max(0, temp_media - self.config['parametros_gdd']['temp_base_celsius'])
        self.gdd_acumulados += gdd_diario

        for etapa, gdd_req in self.config['etapas_gdd'].items():
            if self.gdd_acumulados >= gdd_req:
                self.etapa = etapa
        
        factor_luz = min(1, condiciones_diarias['radiacion_solar'] / self.config['parametros_optimos']['luz_par_umol_m2_s'][1])
        factor_temp = 1 - abs(temp_media - np.mean(self.config['parametros_optimos']['temperatura_dia_celsius'])) / 15
        crecimiento_diario = 0.05 * factor_luz * max(0, factor_temp)
        self.biomasa += crecimiento_diario

        if temp_media > self.config['parametros_criticos']['temperatura_max_estres']:
            self.estres_termico_acumulado += 1
        if condiciones_diarias.get('humedad_suelo', 100) < self.config['parametros_criticos']['humedad_suelo_min_estres']:
            self.estres_hidrico_acumulado += 1
            
    def obtener_estado(self) -> Dict[str, Any]:
        """Devuelve el estado actual de la planta."""
        return {
            'etapa': self.etapa,
            'gdd_acumulados': self.gdd_acumulados,
            'biomasa_kg_m2': self.biomasa,
            'estres_hidrico_dias': self.estres_hidrico_acumulado,
            'estres_termico_dias': self.estres_termico_acumulado,
            'porcentaje_cosecha': min(100, (self.gdd_acumulados / self.config['parametros_gdd']['gdd_para_cosecha']) * 100)
        }

# --- MÓDULO 3: EL ORQUESTADOR PRINCIPAL ---

class MotorSimulacion:
    """
    Orquesta la simulación completa, integrando los diferentes modelos.
    """
    def __init__(self, config_cultivo_path: str):
        """
        Inicializa el motor cargando la ficha técnica del cultivo.
        
        Args:
            config_cultivo_path (str): Ruta al archivo .json del cultivo.
        """
        try:
            with open(config_cultivo_path, 'r', encoding='utf-8') as f:
                self.config_cultivo = json.load(f)
        except FileNotFoundError:
            print(f"ERROR: No se encontró el archivo de configuración del cultivo en '{config_cultivo_path}'")
            raise
        
        self.planta = ModeloBiologicoPlanta(self.config_cultivo)
        self.historial = []

    def ejecutar_simulacion(self, escenario_climatico: pd.DataFrame):
        """
        Ejecuta la simulación completa día por día.
        """
        print(f"\nINFO: [MotorSimulacion] Iniciando simulación para '{self.planta.nombre}'...")
        
        for _, dia_clima in escenario_climatico.iterrows():
            condiciones = dia_clima.to_dict()
            self.planta.crecer(condiciones)
            
            estado_planta = self.planta.obtener_estado()
            self.historial.append({**condiciones, **estado_planta})
            
            if estado_planta['porcentaje_cosecha'] >= 100:
                print(f"INFO: [MotorSimulacion] Cosecha alcanzada en el día {int(dia_clima['dia'])}.")
                break
        
        return pd.DataFrame(self.historial)

# --- BLOQUE PRINCIPAL DE EJECUCIÓN ---

if __name__ == "__main__":
    
    # --- CONFIGURACIÓN DE LA EJECUCIÓN ---
    MODO_ONLINE = True # Cambia a True para intentar usar la API de Gemini

    # --- PASO 1: Definir la ruta a la biblioteca de cultivos ---
    # Esta ruta asume que el script se ejecuta desde la raíz del proyecto (la carpeta Greenhouse-Digital-Twin-360).
    RUTA_BIBLIOTECA_CULTIVOS = os.path.join("4_data_science", "configuracion", "cultivos")

    # --- PASO 2: Seleccionar el cultivo a simular ---
    # El usuario seleccionaría esto en el frontend de Andrew.
    cultivo_seleccionado = "cultivo_tomate_rio_grande.json"
    ruta_config_seleccionada = os.path.join(RUTA_BIBLIOTECA_CULTIVOS, cultivo_seleccionado)

    # --- PASO 3: Generar un escenario climático (con Gemini o de respaldo) ---
    # El usuario describiría esto en el frontend.
    descripcion_escenario = "Un verano estándar en la costa de Lima, Perú, con alta humedad y noches templadas."
    generador_ia = GeneradorEscenariosGemini()
    escenario = generador_ia.generar_dataset_climatico(descripcion_escenario, dias=120, online=MODO_ONLINE)

    # --- PASO 4: Ejecutar la simulación completa ---
    try:
        motor = MotorSimulacion(ruta_config_seleccionada)
        resultados_df = motor.ejecutar_simulacion(escenario)

        # --- PASO 5: Analizar y visualizar los resultados ---
        print("\n=====================================================")
        print("=         RESULTADOS DE LA SIMULACIÓN             =")
        print("=====================================================")
        if not resultados_df.empty:
            print(f"Días totales para la cosecha: {len(resultados_df)}")
            print(f"Biomasa final estimada: {resultados_df['biomasa_kg_m2'].iloc[-1]:.2f} kg/m²")
            print(f"Total días con estrés térmico: {int(resultados_df['estres_termico_dias'].iloc[-1])}")
            
            print("\n--- Vista previa de la evolución del cultivo ---")
            print(resultados_df[['dia', 'temp_max', 'etapa', 'porcentaje_cosecha']].round(1).tail(10))
        else:
            print("La simulación no produjo resultados.")
            
        print("\n=====================================================")
        print("=        SIMULACIÓN FINALIZADA CON ÉXITO          =")
        print("=====================================================")
    
    except FileNotFoundError:
        print("\nERROR CRÍTICO: Asegúrese de que las fichas técnicas de los cultivos estén en la carpeta correcta.")
        print(f"             Ruta buscada: {os.path.abspath(ruta_config_seleccionada)}")
    except Exception as e:
        print(f"\nERROR INESPERADO: {e}")
