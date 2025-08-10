from flask import Blueprint, request, jsonify
from datetime import date
from flask_login import login_required, current_user
from models import db, Review, Item

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/<int:item_id>', methods=['POST'])
@login_required
def create_review(item_id):
    data = request.get_json() or {}
    score = data.get('score')
    remark = data.get('remark', '')

    # Validate score
    if score not in ('Excellent', 'Good', 'Fair', 'Poor'):
        return jsonify({'message': 'Invalid review score'}), 400
    
    # Load item
    item = Item.query.get_or_404(item_id)

    # Enforce prevent self-review
    if item.posted_by == current_user.username:
        return jsonify({'message': 'You are not allowed to review your own item'}), 403
    
    # Enforce one review per item
    if Review.query.filter_by(user_id=current_user.username, item_id=item_id).first():
        return jsonify({'message': 'You have already reviewed this item'}), 409
    
    # Enforce maximum of 2 reviews per day
    today = date.today()
    review_count = Review.query.filter_by(user_id=current_user.username, review_date=today).count()
    if review_count >= 2:  # TODO: Verify review limit
        return jsonify({'message': 'Daily review limit has been reached'}), 403
    
    # Assemble review components and persist to Review table
    review = Review(
        user_id=current_user.username,
        item_id=item_id,
        score=score,
        remark=remark
    )
    db.session.add(review)
    item.star_rating = item.calculate_star_rating() # update item's star rating and store the value back into the star review column
    db.session.commit()
    return jsonify({'message': 'Review submitted'}), 201

@reviews_bp.route('/item/<int:item_id>', methods=['GET'])
def list_reviews_for_item(item_id):
    reviews = Review.query.filter_by(item_id=item_id).all()
    return jsonify([{
        'id': r.id,
        'user': r.user_id,
        'date': r.review_date.isoformat(),
        'score': r.score,
        'remark': r.remark
    } for r in reviews]), 200

@reviews_bp.route('/item/<int:item_id>/rating', methods=['GET'])
def get_star_rating(item_id):
    item = Item.query.get_or_404(item_id)
    rating = item.calculate_star_rating()
    review_count = item.reviews.count()
    return jsonify({'item_id': item.id, 'star_rating': rating, 'review_count': review_count}), 200

@reviews_bp.route('/user/<username>', methods=['GET'])
def list_reviews_for_user(username):
    # 1) find that user’s items
    seller_items = Item.query.filter_by(posted_by=username).all()
    item_ids = [item.id for item in seller_items]
    
    # 2) fetch all reviews whose item_id is in that list
    reviews = Review.query.filter(Review.item_id.in_(item_ids)).all()
    
    # 3) serialize
    result = []
    for r in reviews:
        result.append({
            'id': r.id,
            'item_id': r.item_id,
            'user': r.user_id,
            'date': r.review_date.isoformat(),
            'score': r.score,
            'remark': r.remark
        })
    return jsonify(result), 200

@reviews_bp.route('/user/<username>', methods=['GET']) #this will allow a user to click on a review to that item
@login_required
def get_reviews_by_user(username):
    reviews = Review.query.filter_by(user_username=username).all()
    payload = []
    for r in reviews:
        payload.append({
            'id': r.id,
            'user': r.user_username,
            'item_id': r.item_id,         # <— include this
            'score': r.score,
            'remark': r.remark,
            'date': r.created_at.isoformat()
        })
    return jsonify(payload), 200