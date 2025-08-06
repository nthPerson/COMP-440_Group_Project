import os

class Config:
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'change-me')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql+pymysql://user:pass@localhost/dbname')  # Local DB
    # SQLALCHEMY_DATABASE_URI = os.getenv('SHARED_DATABASE_URL', 'mysql+pymysql://user:pass@localhost/dbname')  # Shared DB
    SQLALCHEMY_TRACK_MODIFICATIONS = False