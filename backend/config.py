import os

class Config:
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'change-me')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql+pymysql://user:pass@localhost/dbname')
    SQLALCHEMY_TRACK_MODIFICATIONS = False