from flask import Blueprint, request, jsonify
from models import db, User
import bcrypt
from sqlalchemy.exc import IntegrityError

auth_bp = Blueprint('auth', __name__)

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
    
    return jsonify({'message': 'User registered successfully!'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()  # Data sent with request (login fields: username, password)
    username, password = data.get('username'), data.get('password')
    if not username or not password:
        return jsonify({'message': 'Missing credentials (username or password)'}), 400
    
    user = User.query.get(username)
    if not user:
        return jsonify({'message': 'Invalid username or password'}), 401
    
    # Verify the password hash
    if bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        # TODO Issue a JWT or set up a session. For now we will just acknowledge that the password was correct:
        return jsonify({'message': 'Login successful! (under construction: no session started)'}), 200


    return jsonify({'message': 'Invalid username or password'}), 401