# app.py
from app import create_app

app = create_app()

if __name__ == '__main__':
    # Ejecuta la aplicación en modo desarrollo 
    app.run(debug=True)
