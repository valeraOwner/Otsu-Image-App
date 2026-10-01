# app/routes.py
import os
import uuid
import base64
from io import BytesIO
from flask import Blueprint, render_template, request, jsonify, send_from_directory, url_for, current_app
from PIL import Image
from .utils import allowed_file
#from .image_utils import process_otsu  # Posible ruta para procesar algoritmo Otzu

otsu_bp = Blueprint('main', __name__)

@otsu_bp.route('/')
def index():
    upload_folder = current_app.config['UPLOAD_FOLDER']
    processed_folder = current_app.config['PROCESSED_FOLDER']
    
    images = [f for f in os.listdir(upload_folder)
              if f.lower().endswith(tuple(current_app.config['ALLOWED_EXTENSIONS']))]
    processed_images = [f for f in os.listdir(processed_folder)
                        if f.lower().endswith(tuple(current_app.config['ALLOWED_EXTENSIONS']))]
    return render_template('index.html', images=images, processed_images=processed_images)

@otsu_bp.route('/get_image/<filename>')
def get_image(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@otsu_bp.route('/get_processed_image/<filename>')
def get_processed_image(filename):
    return send_from_directory(current_app.config['PROCESSED_FOLDER'], filename)

@otsu_bp.route('/upload_image', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        # Manejo vía Base64
        if 'imageData' in request.form:
            image_data = request.form['imageData']
            if 'base64,' in image_data:
                image_data = image_data.split('base64,')[1]
            try:
                img_bytes = base64.b64decode(image_data)
                img = Image.open(BytesIO(img_bytes))
                img_format = img.format.lower() if img.format else 'png'
                if img_format not in current_app.config['ALLOWED_EXTENSIONS']:
                    return jsonify({'success': False, 'message': 'Formato de imagen no válido'}), 400
                filename = f"{uuid.uuid4()}.{img_format}"
                with open(os.path.join(current_app.config['UPLOAD_FOLDER'], filename), 'wb') as f:
                    f.write(img_bytes)
                return jsonify({
                    'success': True,
                    'filename': filename,
                    'path': url_for('main.get_image', filename=filename)
                })
            except Exception as e:
                return jsonify({'success': False, 'message': f'Error al procesar la imagen: {str(e)}'}), 400
        
        return jsonify({'success': False, 'message': 'No se encontró ninguna imagen'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No se seleccionó ningún archivo'}), 400

    if file and allowed_file(file.filename, current_app.config['ALLOWED_EXTENSIONS']):
        extension = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4()}.{extension}"
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        return jsonify({
            'success': True,
            'filename': filename,
            'path': url_for('main.get_image', filename=filename)
        })

    return jsonify({'success': False, 'message': 'Formato de archivo no permitido.'}), 400

@otsu_bp.route('/save_processed_image', methods=['POST'])
def save_processed_image():
    # Recibir la imagen procesada del cliente
    data = request.json
    img_data = data['image'].split(',')[1]  # Eliminar el encabezado de data URL
    original_filename = data.get('filename', '')

    # Generar un nombre para la imagen procesada
    if original_filename:
        # Si viene de una imagen existente, mantener alguna referencia
        name_part = original_filename.rsplit('.', 1)[0]
        processed_filename = f"otsu_{name_part}.png"
    else:
        # Si es una imagen subida por drag & drop
        processed_filename = f"otsu_{uuid.uuid4()}.png"

    try:
        # Decodificar la imagen desde base64
        img_bytes = base64.b64decode(img_data)
        img = Image.open(BytesIO(img_bytes))

        # Convertir a RGB si es RGBA para evitar errores al guardar
        if img.mode == 'RGBA':
            img = img.convert('RGB')

        # Guardar la imagen procesada en el servidor
        processed_path = os.path.join(current_app.config['PROCESSED_FOLDER'], processed_filename)
        img.save(processed_path)

        # Refrescar la lista de imágenes procesadas
        processed_images = [f for f in os.listdir(current_app.config['PROCESSED_FOLDER'])
                          if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'))]

        return jsonify({
            'success': True,
            'filename': processed_filename,
            'path': f"/static/processed/{processed_filename}",
            'processed_images': processed_images
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al guardar la imagen procesada: {str(e)}'
        }), 500

@otsu_bp.route('/get_images_list', methods=['GET'])
def get_images_list():
    upload_folder = current_app.config['UPLOAD_FOLDER']
    processed_folder = current_app.config['PROCESSED_FOLDER']
    
    images = [f for f in os.listdir(upload_folder)
              if f.lower().endswith(tuple(current_app.config['ALLOWED_EXTENSIONS']))]
    processed_images = [f for f in os.listdir(processed_folder)
                        if f.lower().endswith(tuple(current_app.config['ALLOWED_EXTENSIONS']))]
    return jsonify({'success': True, 'images': images, 'processed_images': processed_images})
