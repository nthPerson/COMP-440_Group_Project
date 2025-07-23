from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()  # This is the tool our app uses to interact with the database (automates queries, etc.)

# User table schema: user(username*, password, firstName, lastName, email)  -- note that the * indicates the primary key
class User(db.Model):
    __tablename__ = 'user'
    username = db.Column(db.String(64), primary_key=True)  # PRIMARY KEY
    password = db.Column(db.String(128), nullable=False)   # stored as a hash in the database. Hashing/decoding takes place in auth.py
    firstName = db.Column(db.String(64), nullable=False)
    lastName = db.Column(db.String(64), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)  # email MUST BE UNIQUE to prevent multiple accounts being registered to the same email

    def __repr__(self):
        return f'<User {self.username}>'