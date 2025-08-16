from flask import Blueprint, request, jsonify
from models import db, User
from flask_login import login_required, current_user  # Ensures that only logged-in users can access protected backend API functions
from utils.imgur import upload_to_imgur

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])  # /api/users/   -- Calling 'GET' returns the user db in a list
@login_required
def list_users():
    users = User.query.all()
    payload = [
        {
            'username': u.username,
            'first_name': u.firstName,
            'last_name': u.lastName,
            'email': u.email
        }
        for u in users  # This syntax looks crazy, but it's just a dictionary comprehension inside a list (this makes a list of dictionaries, aka a list of user info)
    ]
    return jsonify(payload), 200

@users_bp.route('/', methods=['POST'])  # /api/users/   -- Calling 'POST' creates a new user
@login_required
def create_user():
    data = request.get_json()
    user = User(
        username=data['username'],
        firstName=data['first_name'],
        lastName=data['last_name'],
        email=data['email'],
        password=data.get('password', '')
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created'}), 201

@users_bp.route('/<username>', methods=['GET'])  # /api/users/<username>  -- Calling 'GET' returns the user's data
@login_required
def get_user(username):
    user = User.query.get_or_404(username)
    return jsonify({
        'username': user.username,
        'first_name': user.firstName,
        'last_name': user.lastName,
        'email': user.email
    })

@users_bp.route('/<username>', methods=['PUT'])  # /api/users/<username>  -- Calling 'PUT' updates the user's data
@login_required
def update_user(username):
    user = User.query.get_or_404(username)
    data = request.get_json()
    user.firstName = data.get('first_name', user.firstName)
    user.lastName = data.get('last_name', user.lastName)
    user.email = data.get('email', user.email)
    db.session.commit()
    return jsonify({'message': 'User updated'})

@users_bp.route('/<username>', methods=['DELETE'])  # /api/users/<username>  -- Calling 'DELETE' deletes the user's data
@login_required
def delete_user(username):
    user = User.query.get_or_404(username)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'})

@users_bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    return jsonify({
        'username': current_user.username,
        'first_name': current_user.firstName,
        'last_name': current_user.lastName,
        'email': current_user.email
    })

@users_bp.route('/profile', methods=['POST'])
@login_required
def update_profile():
    form = request.form

    current_user.firstName = form.get('first_name', current_user.firstName)
    current_user.lastName = form.get('last_name', current_user.lastName)
    current_user.username = form.get('username', current_user.username)
    current_user.email = form.get('email', current_user.email)

    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully'}), 200



DEFAULT_AVATAR = "https://api.iconify.design/mdi:account-circle.svg"

@users_bp.route('/me/avatar', methods=['PUT'])
@login_required
def update_my_avatar():
    # Accepts multipart file upload (field name: image) or JSON { image_url }
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        file = request.files.get('image')
        if file and file.filename:
            link = upload_to_imgur(file)
            current_user.profile_image_url = link
        else:
            image_url = (request.form.get('image_url') or '').strip()
            current_user.profile_image_url = image_url or None
    else:
        data = request.get_json(silent=True) or {}
        image_url = (data.get('image_url') or '').strip()
        current_user.profile_image_url = image_url or None

    db.session.commit()
    return jsonify({
        'message': 'Profile image updated',
        'profile_image_url': current_user.profile_image_url or DEFAULT_AVATAR
    }), 200


@users_bp.route('/me', methods=['GET'])
@login_required
def me():
    return jsonify({
        'username': current_user.username,
        'profile_image_url': (current_user.profile_image_url or DEFAULT_AVATAR)
    })
