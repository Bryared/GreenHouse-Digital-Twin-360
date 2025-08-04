# -*- coding: utf-8 -*-
"""
Script de Entrenamiento del Modelo de Visión por Computadora para GDT-360.

Este script utiliza Transfer Learning con un modelo ResNet50 pre-entrenado en
ImageNet para construir un clasificador de la salud de las plantas.

El pipeline completo incluye:
1.  Carga y transformación de datos (con aumentación).
2.  Modificación del modelo ResNet50 para nuestro problema específico.
3.  Bucle de entrenamiento y validación.
4.  Guardado del mejor modelo para su uso en producción.

NOTA: Este script está diseñado para ser ejecutado en un entorno con GPU
(como Google Colab) para un entrenamiento eficiente.

Autor: Bryan Vargas (Científico de Datos Jefe, InnovaABC 360)
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms
import os
import time
import copy

# --- 1. CONFIGURACIÓN Y PARÁMETROS ---

def configurar_entrenamiento():
    """Define todos los hiperparámetros y configuraciones en un solo lugar."""
    print("INFO: Configurando el entorno de entrenamiento...")
    
    config = {
        # Determinar si se usará GPU (CUDA) o CPU
        "device": torch.device("cuda:0" if torch.cuda.is_available() else "cpu"),
        
        # Parámetros del modelo
        "num_classes": 2, # Ej: 0 = 'sana', 1 = 'enferma'
        
        # Parámetros de entrenamiento
        "batch_size": 32,
        "num_epochs": 15, # Un número bajo para un entrenamiento rápido de ejemplo
        "learning_rate": 0.001,
        
        # Rutas de datos (relativas a la raíz del proyecto)
        # NOTA: Se asume que el dataset está en la carpeta 'datasets'
        "data_dir": os.path.join(os.path.dirname(__file__), '..', '..', '04_computer_vision', 'datasets', 'plant_health_dataset'),
        
        # Ruta de guardado del modelo final
        "save_path": os.path.join(os.path.dirname(__file__), '..', '..', '04_computer_vision', 'trained_models', 'detector_salud_planta_v1.pth')
    }
    
    print(f"      - Dispositivo de entrenamiento: {config['device']}")
    return config

# --- 2. PREPARACIÓN DE DATOS ---

def preparar_datos(data_dir, batch_size):
    """Carga los datos y aplica transformaciones (incluyendo data augmentation)."""
    print("\nINFO: Preparando los datos...")

    # Data augmentation y normalización para el conjunto de entrenamiento
    # La aumentación ayuda al modelo a generalizar mejor (evita overfitting)
    data_transforms = {
        'train': transforms.Compose([
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    # Crear directorios de datos de ejemplo si no existen
    if not os.path.exists(data_dir):
        print(f"      - ADVERTENCIA: Directorio de datos no encontrado en '{data_dir}'.")
        print("      - Creando un dataset de ejemplo. Reemplácelo con sus datos reales.")
        os.makedirs(os.path.join(data_dir, 'train', 'sana'), exist_ok=True)
        os.makedirs(os.path.join(data_dir, 'train', 'enferma'), exist_ok=True)
        os.makedirs(os.path.join(data_dir, 'val', 'sana'), exist_ok=True)
        os.makedirs(os.path.join(data_dir, 'val', 'enferma'), exist_ok=True)
        # NOTA: Aquí se deberían añadir imágenes de ejemplo.
    
    image_datasets = {x: datasets.ImageFolder(os.path.join(data_dir, x), data_transforms[x])
                      for x in ['train', 'val']}
    
    dataloaders = {x: DataLoader(image_datasets[x], batch_size=batch_size, shuffle=True, num_workers=4)
                   for x in ['train', 'val']}
    
    dataset_sizes = {x: len(image_datasets[x]) for x in ['train', 'val']}
    class_names = image_datasets['train'].classes

    print(f"      - Clases encontradas: {class_names}")
    print(f"      - Tamaño del dataset: Train={dataset_sizes['train']}, Val={dataset_sizes['val']}")
    return dataloaders, dataset_sizes, class_names

# --- 3. BUCLE DE ENTRENAMIENTO Y VALIDACIÓN ---

def entrenar_y_validar_modelo(modelo, dataloaders, dataset_sizes, criterion, optimizer, device, num_epochs):
    """Ejecuta el bucle principal de entrenamiento y validación."""
    print("\nINFO: Iniciando el entrenamiento del modelo de visión...")
    since = time.time()

    best_model_wts = copy.deepcopy(modelo.state_dict())
    best_acc = 0.0

    for epoch in range(num_epochs):
        print(f'\nEpoch {epoch + 1}/{num_epochs}')
        print('-' * 10)

        for phase in ['train', 'val']:
            if phase == 'train':
                modelo.train()  # Poner el modelo en modo de entrenamiento
            else:
                modelo.eval()   # Poner el modelo en modo de evaluación

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
                inputs = inputs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == 'train'):
                    outputs = modelo(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]

            print(f'      - {phase.capitalize()} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

            if phase == 'val' and epoch_acc > best_acc:
                best_acc = epoch_acc
                best_model_wts = copy.deepcopy(modelo.state_dict())

    time_elapsed = time.time() - since
    print(f'\nEntrenamiento completado en {time_elapsed // 60:.0f}m {time_elapsed % 60:.0f}s')
    print(f'Mejor Accuracy en Validación: {best_acc:.4f}')

    modelo.load_state_dict(best_model_wts)
    return modelo

# --- 4. FUNCIÓN PRINCIPAL ---

def main():
    """Orquesta todo el pipeline de entrenamiento."""
    print("=====================================================")
    print("= INICIANDO PIPELINE DE ENTRENAMIENTO DE VISIÓN     =")
    print("=====================================================")
    
    config = configurar_entrenamiento()
    dataloaders, dataset_sizes, _ = preparar_datos(config["data_dir"], config["batch_size"])

    # Cargar el modelo ResNet50 pre-entrenado
    modelo = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
    
    # Congelar los pesos de las capas convolucionales (esto es Transfer Learning)
    for param in modelo.parameters():
        param.requires_grad = False

    # Reemplazar la última capa (el clasificador) para adaptarla a nuestro problema
    num_ftrs = modelo.fc.in_features
    modelo.fc = nn.Linear(num_ftrs, config["num_classes"])
    
    modelo = modelo.to(config["device"])

    # Definir la función de pérdida y el optimizador
    criterion = nn.CrossEntropyLoss()
    # Solo optimizaremos los parámetros de la nueva capa que hemos añadido
    optimizer = optim.Adam(modelo.fc.parameters(), lr=config["learning_rate"])

    # Entrenar y validar
    modelo_final = entrenar_y_validar_modelo(modelo, dataloaders, dataset_sizes, criterion, optimizer, config["device"], config["num_epochs"])

    # Guardar el modelo final
    print(f"\nINFO: Guardando el mejor modelo en: {config['save_path']}")
    os.makedirs(os.path.dirname(config['save_path']), exist_ok=True)
    torch.save(modelo_final.state_dict(), config['save_path'])
    
    print("\n=====================================================")
    print("= PIPELINE DE VISIÓN FINALIZADO                   =")
    print("=====================================================")

if __name__ == "__main__":
    main()
