from flask import Flask
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Register blueprints
from routes.auth import auth_bp
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Placeholder for other blueprints

if __name__ == '__main__':
    app.run(debug=True)