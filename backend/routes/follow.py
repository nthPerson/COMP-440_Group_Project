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

@follow_bp.route('/followers', methods=['GET'])
@login_required
def get_followers():
    followers = Follow.query.filter_by(user_username=current_user.username).all()
    follower_usernames = [f.follower_username for f in followers]
    return jsonify([{'username': u} for u in follower_usernames]), 200


@follow_bp.route('/following', methods=['GET'])
@login_required
def get_following():
    following = Follow.query.filter_by(follower_username=current_user.username).all()
    following_usernames = [f.user_username for f in following]
    return jsonify([{'username': u} for u in following_usernames]), 200

@follow_bp.route('/remove_follower/<username>', methods=['DELETE'])
@login_required
def remove_follower(username):
    if username == current_user.username:
        return jsonify({'error': 'You cannot remove yourself.'}), 400
    
    user_to_remove = User.query.filter_by(username=username).first()
    if not user_to_remove:
        return jsonify({'error': 'User not found.'}), 404
    
    follow = Follow.query.filter_by(user_username=current_user.username, follower_username=username).first()
    
    if not follow:
        return jsonify({'error': 'This user is not following you.'}), 400
    
    db.session.delete(follow)
    db.session.commit()
    
    return jsonify({'message': f'You have removed {username} from your followers.'}), 200