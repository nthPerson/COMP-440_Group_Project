from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()  # This is our database

# User table schema: user(username*, password, firstName, lastName, email)  -- note that the * indicates the primary key
class User(db.Model):
    __tablename__ = 'user'
    username = db.Column(db.String(64), primary_key=True)          # username primary key
    password = db.Column(db.String(128), nullable=False)
    firstName = db.Column(db.String(64), nullable=False)
    lastName = db.Column(db.String(64), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'