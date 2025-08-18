from flask import Blueprint, request, jsonify
from models import db, User
import bcrypt
from sqlalchemy.exc import IntegrityError
from flask_login import login_user, logout_user, login_required, current_user  # Session management functions

auth_bp = Blueprint('auth', __name__)

"""
START TRANSACTION;

INSERT INTO `user` (
  `username`, `password`, `firstName`, `lastName`, `email`, `profile_image_url`
) VALUES (
  :username, :password_hash, :firstName, :lastName, :email, NULL
);

COMMIT;
"""
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}  # Data sent with request (account registration fields: username, password, firstName, lastName, email)

    # 1) Check required fields
    for field in ('username', 'password', 'firstName', 'lastName', 'email'):
        if not data.get(field):
            return jsonify({'message', f'Missing field: {field}'}), 400
        
    # 1.1) Get field data
    username, password = data['username'], data['password']
    firstName, lastName = data['firstName'], data['lastName']
    email = data['email']

    # 2) Check username/email uniqueness
    if User.query.get(username):
        return jsonify({'message': 'An account with that username already exists'}), 400
    if User.query.get(email):
        return jsonify({'message': 'An account with that email already exists'}), 400
    
    # 3) Hash the password (good practice not to store passwords as raw text)
    pw_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # 4) Create user & commit to database
    user = User(
        username=username,
        password=pw_hash,
        firstName=firstName,
        lastName=lastName,
        email=email
    )
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Database error when adding user to database'}), 500
    
    # Automatically log user in after successful registration
    login_user(user)
    
    return jsonify({'message': 'User registered successfully and logged in!'}), 201

"""
SELECT
  `username`, `password`, `firstName`, `lastName`, `email`, `profile_image_url`
FROM `user`
WHERE `username` = :username
LIMIT 1;
"""
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()  # Data sent with request (login fields: username, password)
    print(f"Login attempt with data: {data}")  # Debug print
    
    username, password = data.get('username'), data.get('password')
    if not username or not password:
        print("Missing credentials")  # Debug print
        return jsonify({'message': 'Missing credentials (username or password)'}), 400
    
    user = User.query.get(username)
    print(f"User found: {user}")  # Debug print
    
    if not user:
        print(f"No user found with username: {username}")  # Debug print
        return jsonify({'message': 'Invalid username or password'}), 401
    
    # Verify the password hash (aka make sure the password is correct)
    password_check = bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8'))
    print(f"Password check result: {password_check}")  # Debug print
    
    if password_check:
        login_user(user)  # Initiate user session with Flask-Login package 
        print("Login successful!")  # Debug print
        return jsonify({'message': 'Login successful!'}), 200

    print("Password verification failed")  # Debug print
    return jsonify({'message': 'Invalid username or password'}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': "User has been logged out"}), 200

"""
SELECT
  `username`, `firstName`, `lastName`, `email`, `profile_image_url`
FROM `user`
WHERE `username` = :username
LIMIT 1;
"""
@auth_bp.route('/status', methods=['GET'])
# Removed @login_required to allow public access
def status():
    """Check if user is authenticated and return user info"""
    if current_user.is_authenticated:
        return jsonify({
            'username': current_user.username,
            'firstName': current_user.firstName,
            'lastName': current_user.lastName,
            'email': current_user.email,
            'profile_image_url ': current_user.profile_image_url
        }), 200
    else:
        return jsonify({'username': None}), 200  # Return success in both cases to allow for unauthenticated user check on app launch
