from flask import Flask
from config import Config
from models import db, User  
from flask_login import LoginManager

app = Flask(__name__)
app.config.from_object(Config)
# print("CONNECTING TO:", app.config["SQLALCHEMY_DATABASE_URI"])  # Use this to see what DB the app is trying to connect to

# Initialize SQLAlchemy, aka connect the app to the DB
db.init_app(app)

# Set up session management with Flask-Login
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.init_app(app)

@login_manager.user_loader
def load_user(username):
    return User.query.get(username)

# Register blueprints
from routes.auth import auth_bp
app.register_blueprint(auth_bp, url_prefix='/api/auth')

from routes.users import users_bp
app.register_blueprint(users_bp, url_prefix='/api/users')

# Placeholder for other blueprints

if __name__ == '__main__':
    app.run(debug=True)