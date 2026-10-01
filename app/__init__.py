# app/__init__.py
from flask import Flask

def create_app(config_object='config.Config'):
    app = Flask(__name__, template_folder='../templates', static_folder='../static')
    app.config.from_object(config_object)

    # Registrar rutas o blueprints
    with app.app_context():
        from .routes import otsu_bp
        app.register_blueprint(otsu_bp)
        
    return app
