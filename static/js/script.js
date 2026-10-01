document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM principales
    const imageSelector = document.getElementById('imageSelector');
    const originalImage = document.getElementById('originalImage');
    const processedImage = document.getElementById('processedImage');
    const processButton = document.getElementById('processButton');
    const thresholdValue = document.getElementById('thresholdValue');
    const processingTime = document.getElementById('processingTime');
    const originalPlaceholder = document.getElementById('originalPlaceholder');
    const processedPlaceholder = document.getElementById('processedPlaceholder');
    const originalLoader = document.getElementById('originalLoader');
    const processedLoader = document.getElementById('processedLoader');

    // Elementos de la interfaz de carga
    const uploadArea = document.getElementById('uploadArea');
    const uploadInput = document.getElementById('uploadInput');
    const browseBtn = document.getElementById('browseBtn');

    // Elementos de alerta
    const errorAlert = document.getElementById('errorAlert');
    const successAlert = document.getElementById('successAlert');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Elementos de pestañas
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Elementos de galería de imágenes procesadas
    const processedGallery = document.getElementById('processedGallery');
    const refreshBtn = document.getElementById('refreshBtn');

    // Variables de estado
    let currentImageSource = null; // 'upload', 'server', o 'processed'
    let uploadedImageName = null;

    // ==========================================
    // Inicialización
    // ==========================================

    // Ocultar alertas al inicio
    errorAlert.style.opacity = 0;
    successAlert.style.opacity = 0;

    // ==========================================
    // Gestión de pestañas
    // ==========================================

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');

            // Cambiar pestaña activa
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Mostrar contenido correspondiente
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}-content`).classList.add('active');

            // Resetear la vista de imagen original
            resetOriginalImage();

            // Establecer fuente de imagen actual
            currentImageSource = tabId;
        });
    });

    // ==========================================
    // Manejo de alertas
    // ==========================================

    function showError(message) {
        errorMessage.textContent = message;
        errorAlert.style.opacity = 1;

        setTimeout(() => {
            errorAlert.style.opacity = 0;
        }, 5000);
    }

    function showSuccess(message) {
        successMessage.textContent = message;
        successAlert.style.opacity = 1;

        setTimeout(() => {
            successAlert.style.opacity = 0;
        }, 5000);
    }

    // ==========================================
    // Funcionalidad de Drag & Drop
    // ==========================================

    // Evento para abrir el selector de archivos
    browseBtn.addEventListener('click', () => {
        uploadInput.click();
    });

    // Eventos de drag & drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        uploadArea.classList.add('dragover');
    }

    function unhighlight() {
        uploadArea.classList.remove('dragover');
    }

    // Manejar el evento de soltar archivos
    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFiles(files[0]);
        }
    }

    // Manejar la selección de archivos mediante el input
    uploadInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleFiles(this.files[0]);
        }
    });

    // Procesar el archivo subido
    function handleFiles(file) {
        // Validar tipo de archivo
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];

        if (!validImageTypes.includes(file.type)) {
            showError('El archivo seleccionado no es una imagen válida. Formatos permitidos: PNG, JPG, JPEG, GIF, BMP, WEBP');
            return;
        }

        // Mostrar loader
        originalLoader.style.display = 'block';
        originalImage.style.display = 'none';
        originalPlaceholder.style.display = 'none';

        // Leer archivo como URL de datos
        const reader = new FileReader();
        reader.onload = function(e) {
            // Mostrar imagen en la vista previa
            originalImage.onload = function() {
                originalLoader.style.display = 'none';
                originalImage.style.display = 'block';
                originalImage.classList.add('fade-in');
                processButton.disabled = false;
            };

            originalImage.src = e.target.result;

            // Subir imagen al servidor
            uploadImageToServer(e.target.result, file.name);
        };

        reader.onerror = function() {
            originalLoader.style.display = 'none';
            originalPlaceholder.style.display = 'block';
            showError('Error al leer el archivo. Inténtelo de nuevo.');
        };

        reader.readAsDataURL(file);
    }

    // Subir imagen al servidor
    function uploadImageToServer(imageData, fileName) {
        const formData = new FormData();
        formData.append('imageData', imageData);

        fetch('/upload_image', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                uploadedImageName = data.filename;
                currentImageSource = 'upload';
                showSuccess('Imagen subida correctamente');
            } else {
                showError(data.message || 'Error al subir la imagen');
            }
        })
        .catch(error => {
            console.error('Error al subir la imagen:', error);
            showError('Error al comunicarse con el servidor');
        });
    }

    // ==========================================
    // Selección de imágenes del servidor
    // ==========================================

    imageSelector.addEventListener('change', function() {
        if (this.value) {
            // Mostrar loader
            originalLoader.style.display = 'block';
            originalImage.style.display = 'none';
            originalPlaceholder.style.display = 'none';

            // Cargar imagen
            originalImage.onload = function() {
                originalLoader.style.display = 'none';
                originalImage.style.display = 'block';
                originalImage.classList.add('fade-in');

                // Habilitar botón de procesamiento
                processButton.disabled = false;
            };

            originalImage.onerror = function() {
                originalLoader.style.display = 'none';
                originalPlaceholder.style.display = 'block';
                originalPlaceholder.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>Error al cargar la imagen</p>';
                processButton.disabled = true;
            };

            // Establecer src para cargar la imagen
            originalImage.src = `/get_image/${this.value}`;
            currentImageSource = 'server';
            uploadedImageName = this.value;

            // Resetear imagen procesada
            resetProcessedImage();
        } else {
            resetOriginalImage();
        }
    });

    // ==========================================
    // Gestión de imágenes procesadas
    // ==========================================

    refreshBtn.addEventListener('click', refreshProcessedImages);

    function refreshProcessedImages() {
        fetch('/get_images_list')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateProcessedGallery(data.processed_images);
                updateServerImagesList(data.images);
            }
        })
        .catch(error => {
            console.error('Error al actualizar listas:', error);
            showError('Error al comunicarse con el servidor');
        });
    }

    function updateProcessedGallery(images) {
        if (images.length === 0) {
            processedGallery.innerHTML = `
                <div class="gallery-empty">
                    <i class="fas fa-image"></i>
                    <p>No hay imágenes procesadas</p>
                </div>
            `;
            return;
        }

        let galleryHTML = '';

        images.forEach(image => {
            galleryHTML += `
                <div class="gallery-item" data-image="${image}">
                    <img src="/get_processed_image/${image}" alt="${image}">
                    <div class="gallery-item-overlay">
                        ${image}
                        <div class="gallery-actions">
                            <button class="load-processed-btn" data-image="${image}">
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        processedGallery.innerHTML = galleryHTML;

        // Añadir eventos a los botones de acción
        document.querySelectorAll('.load-processed-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const imageName = this.getAttribute('data-image');
                loadProcessedImage(imageName);
            });
        });

        // Añadir eventos a los items de la galería
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', function() {
                const imageName = this.getAttribute('data-image');
                loadProcessedImage(imageName);
            });
        });
    }

    function loadProcessedImage(imageName) {
        // Mostrar loader
        originalLoader.style.display = 'block';
        originalImage.style.display = 'none';
        originalPlaceholder.style.display = 'none';

        // Cargar imagen
        originalImage.onload = function() {
            originalLoader.style.display = 'none';
            originalImage.style.display = 'block';
            originalImage.classList.add('fade-in');

            // Habilitar botón de procesamiento
            processButton.disabled = false;
        };

        // Establecer src para cargar la imagen
        originalImage.src = `/get_processed_image/${imageName}`;
        currentImageSource = 'processed';
        uploadedImageName = imageName;

        // Resetear imagen procesada
        resetProcessedImage();
    }

    function updateServerImagesList(images) {
        // Guardar la selección actual
        const currentSelection = imageSelector.value;

        // Limpiar selector
        imageSelector.innerHTML = '<option value="">Seleccione una imagen...</option>';

        // Añadir nuevas opciones
        images.forEach(image => {
            const option = document.createElement('option');
            option.value = image;
            option.textContent = image;
            imageSelector.appendChild(option);
        });

        // Restaurar selección si existe
        if (currentSelection && images.includes(currentSelection)) {
            imageSelector.value = currentSelection;
        }
    }

    // ==========================================
    // Procesamiento de imágenes con Otsu
    // ==========================================

    processButton.addEventListener('click', function() {
        if (!originalImage.src) return;

        // Mostrar estado de carga
        processButton.classList.add('loading');
        processedLoader.style.display = 'block';
        processedPlaceholder.style.display = 'none';
        processedImage.style.display = 'none';

        const startTime = performance.now();

        // Crear un canvas para procesar la imagen
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Esperar a que la imagen se cargue completamente
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function() {
            // Establecer dimensiones del canvas
            canvas.width = img.width;
            canvas.height = img.height;

            // Dibujar la imagen en el canvas
            ctx.drawImage(img, 0, 0);

            // Obtener datos de la imagen
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Convertir a escala de grises
            const grayData = new Uint8Array(canvas.width * canvas.height);
            for (let i = 0, j = 0; i < data.length; i += 4, j++) {
                // Fórmula para convertir RGB a escala de grises
                grayData[j] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            }

            // Aplicar algoritmo de Otsu
            const threshold = otsuThreshold(grayData);

            // Aplicar umbralización
            for (let i = 0, j = 0; i < data.length; i += 4, j++) {
                const value = grayData[j] > threshold ? 255 : 0;
                data[i] = data[i + 1] = data[i + 2] = value;
            }

            // Actualizar canvas con la imagen procesada
            ctx.putImageData(imageData, 0, 0);

            // Calcular tiempo de procesamiento
            const endTime = performance.now();
            const processingTimeValue = Math.round(endTime - startTime);

            // Actualizar la interfaz
            processedLoader.style.display = 'none';
            processButton.classList.remove('loading');
            processedImage.src = canvas.toDataURL('image/png');
            processedImage.style.display = 'block';
            processedImage.classList.add('fade-in');
            processedPlaceholder.style.display = 'none';

            // Actualizar métricas
            thresholdValue.textContent = threshold;
            processingTime.textContent = processingTimeValue;

            // Enviar la imagen procesada al servidor
            sendProcessedImageToServer(canvas.toDataURL('image/png'), uploadedImageName);
        };

        img.onerror = function() {
            processButton.classList.remove('loading');
            processedLoader.style.display = 'none';
            processedPlaceholder.style.display = 'block';
            processedPlaceholder.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>Error al procesar la imagen</p>';
            showError('Error al cargar la imagen para procesamiento');
        };

        img.src = originalImage.src;
    });

    // Función para implementar el algoritmo de Otsu
    function otsuThreshold(grayData) {
        // Calcular histograma
        const histogram = new Array(256).fill(0);
        for (let i = 0; i < grayData.length; i++) {
            histogram[grayData[i]]++;
        }

        // Número total de píxeles
        const total = grayData.length;

        let sumTotal = 0;
        for (let i = 0; i < 256; i++) {
            sumTotal += i * histogram[i];
        }

        let wB = 0; // Peso del fondo
        let wF = 0; // Peso del primer plano
        let sumB = 0; // Suma del fondo
        let varMax = 0;
        let threshold = 0;

        // Para cada posible umbral
        for (let t = 0; t < 256; t++) {
            wB += histogram[t]; // Peso del fondo
            if (wB === 0) continue;

            wF = total - wB; // Peso del primer plano
            if (wF === 0) break;

            sumB += t * histogram[t];

            const mB = sumB / wB; // Media del fondo
            const mF = (sumTotal - sumB) / wF; // Media del primer plano

            // Calcular varianza entre clases
            const varBetween = wB * wF * (mB - mF) * (mB - mF);

            // Actualizar threshold si encontramos una varianza mayor
            if (varBetween > varMax) {
                varMax = varBetween;
                threshold = t;
            }
        }

        return threshold;
    }

    // Función para enviar la imagen procesada al servidor
    function sendProcessedImageToServer(imageDataUrl, originalFilename) {
        fetch('/save_processed_image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: imageDataUrl,
                filename: originalFilename || 'unknown'
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess('Imagen procesada guardada correctamente');

                // Actualizar galería si hay nuevas imágenes
                if (data.processed_images) {
                    updateProcessedGallery(data.processed_images);
                }
            } else {
                showError('Error al guardar la imagen procesada');
            }
        })
        .catch(error => {
            console.error('Error al guardar la imagen:', error);
            showError('Error al comunicarse con el servidor');
        });
    }

    // ==========================================
    // Funciones auxiliares
    // ==========================================

    function resetOriginalImage() {
        originalImage.style.display = 'none';
        originalPlaceholder.style.display = 'block';
        processButton.disabled = true;
        uploadedImageName = null;
        resetProcessedImage();
    }

    function resetProcessedImage() {
        processedImage.style.display = 'none';
        processedPlaceholder.style.display = 'block';
        thresholdValue.textContent = '-';
        processingTime.textContent = '-';
    }
});