from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, User, Follow

follow_bp = Blueprint('follow', __name__, url_prefix='/api/follow')

@follow_bp.route('/<username>', methods=['POST'])
@login_required
def follow_user(username):
    if username == current_user.username:
        return jsonify({'error': 'You cannot follow yourself.'}), 400

    user_to_follow = User.query.filter_by(username=username).first()
    if not user_to_follow:
        return jsonify({'error': 'User not found.'}), 404

    existing_follow = Follow.query.filter_by(user_username=username, follower_username=current_user.username).first()
    if existing_follow:
        return jsonify({'error': 'You are already following this user.'}), 400

    new_follow = Follow(user_username=username, follower_username=current_user.username)
    db.session.add(new_follow)
    db.session.commit()

    return jsonify({'message': f'You are now following {username}.'}), 200
  
@follow_bp.route('/<username>', methods=['DELETE'])
@login_required
def unfollow_user(username):
    if username == current_user.username:
        return jsonify({'error': 'You cannot unfollow yourself.'}), 400

    user_to_unfollow = User.query.filter_by(username=username).first()
    if not user_to_unfollow:
        return jsonify({'error': 'User not found.'}), 404

    follow = Follow.query.filter_by(user_username=username, follower_username=current_user.username).first()
    if not follow:
        return jsonify({'error': 'You are not following this user.'}), 400

    db.session.delete(follow)
    db.session.commit()

    return jsonify({'message': f'You have unfollowed {username}.'}), 200