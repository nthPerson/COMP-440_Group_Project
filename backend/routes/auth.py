from flask import Blueprint, request, jsonify
from models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    # TODO: validate input, check duplicates, hash password
    return jsonify({'message': 'Register endpoint'})

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # TODO: verify credentials, create session or JWT
    return jsonify({'message': 'Login endpoint'})