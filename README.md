# 🖼️ Otsu Image Thresholding App

Una aplicación web modular construida con **Flask** que implementa el **Algoritmo de Umbralización de Otsu** para el procesamiento de imágenes en escala de grises.

> Desarrollado como parte de un proyecto de **Sistemas Distribuidos**.

---

## 📋 Descripción

El **Algoritmo de Otsu** es una técnica clásica de visión por computadora que determina automáticamente el umbral óptimo para binarizar una imagen (convertirla a blanco y negro), maximizando la separación entre el fondo y los objetos de primer plano.

Esta aplicación web permite:
- Subir imágenes desde tu dispositivo (drag & drop o selector de archivos)
- Seleccionar imágenes ya almacenadas en el servidor
- Aplicar el algoritmo de Otsu con un solo clic
- Visualizar el resultado lado a lado con la imagen original
- Ver el **valor de umbral calculado** y el **tiempo de procesamiento**
- Guardar y gestionar un historial de imágenes procesadas

---

## 🚀 Tecnologías Utilizadas

| Tecnología | Uso |
|---|---|
| **Python 3** | Lenguaje principal |
| **Flask 2.3** | Framework web (servidor y rutas) |
| **Pillow 10** | Manipulación de imágenes |
| **OpenCV 4.8** | Procesamiento de imagen con algoritmo de Otsu |
| **NumPy 1.26** | Operaciones matriciales sobre píxeles |
| **Jinja2** | Plantillas HTML del servidor |
| **HTML / CSS / JS** | Interfaz de usuario (frontend) |

---

## 📁 Estructura del Proyecto

```
otzu_app_modulado/
├── app/
│   ├── __init__.py        # Application factory (create_app)
│   ├── routes.py          # Rutas y lógica de la API (Blueprint)
│   └── utils.py           # Funciones auxiliares (validación de archivos)
├── static/
│   ├── css/               # Estilos de la interfaz
│   ├── js/                # Lógica del frontend (script.js)
│   ├── images/            # Carpeta para imágenes subidas
│   └── processed/         # Carpeta para imágenes procesadas
├── templates/
│   └── index.html         # Plantilla principal de la UI
├── app.py                 # Punto de entrada en desarrollo
├── wsgi.py                # Punto de entrada para producción (WSGI)
├── config.py              # Configuración centralizada de la app
└── requirements.txt       # Dependencias del proyecto
```

---

## ⚙️ Instalación y Ejecución Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/otzu_app_modulado.git
cd otzu_app_modulado
```

### 2. Crear y activar entorno virtual

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Ejecutar la aplicación

```bash
python app.py
```

La aplicación estará disponible en `http://127.0.0.1:5000`

---

## 🌐 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Página principal |
| `POST` | `/upload_image` | Subir imagen (multipart o base64) |
| `GET` | `/get_image/<filename>` | Servir imagen original |
| `GET` | `/get_processed_image/<filename>` | Servir imagen procesada |
| `POST` | `/save_processed_image` | Guardar imagen procesada en el servidor |
| `GET` | `/get_images_list` | Listar todas las imágenes (JSON) |

---

## 🖼️ Formatos de Imagen Soportados

`PNG` · `JPG` · `JPEG` · `GIF` · `BMP` · `WEBP`

> Tamaño máximo permitido: **16 MB**

---

## 📦 Dependencias (`requirements.txt`)

```
Flask==2.3.3
Pillow==10.0.0
numpy==1.26.4
opencv-python==4.8.0.76
```

---

## 🧠 ¿Cómo funciona el Algoritmo de Otsu?

El algoritmo analiza el histograma de intensidad de la imagen en escala de grises y calcula el umbral `T` que **minimiza la varianza intra-clase** (o equivalentemente, maximiza la varianza inter-clase) entre los píxeles del fondo y los del objeto.

Una vez determinado `T`:
- Píxeles con intensidad ≤ T → **Negro (0)**
- Píxeles con intensidad > T → **Blanco (255)**

El resultado es una imagen binaria que facilita la segmentación y detección de objetos.

---

## 📄 Licencia

Este proyecto fue desarrollado con fines educativos para la asignatura de **Sistemas Distribuidos** © 2025.

---

