from flask import Flask, jsonify
from config import Config
from models import db, User  
from flask_login import LoginManager
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file we make sure .env is loaded before config class is used

app = Flask(__name__)
app.config.from_object(Config)
#print("CONNECTING TO:", app.config["SQLALCHEMY_DATABASE_URI"])  # Use this to see what DB the app is trying to connect to

# Initialize SQLAlchemy, aka connect the app to the DB
db.init_app(app)

with app.app_context():
    db.create_all()
# Set up session management with Flask-Login
login_manager = LoginManager()
# login_manager.login_view = 'auth.login'
login_manager.init_app(app)

@login_manager.user_loader
def load_user(username):
    return User.query.get(username)

# Return JSON 401 message instead of redirecting to login page (this lets the frontend handle redirect behavior)
# If someone tries to use a @login_required API call without a user session, a 401 error will be passed to and 
# handled by the frontend instead of having the backend try to redirect the API call (would look like "/api/auth/login?next=..." in the logs)
@login_manager.unauthorized_handler
def unauthorized_callback():
    return jsonify({'message': 'Authentication reguired'}), 401 

# Register blueprints
from routes.auth import auth_bp
app.register_blueprint(auth_bp, url_prefix='/api/auth')

from routes.users import users_bp
app.register_blueprint(users_bp, url_prefix='/api/users')

# Placeholder for Post Item (item creation) Blueprint

from routes.reviews import reviews_bp
app.register_blueprint(reviews_bp, url_prefix='/api/reviews')

if __name__ == '__main__':
    app.run(host='::', port=5000, debug=True)