from flask import Blueprint, jsonify, request
from flask_login import login_required
from sqlalchemy import func, case
from models import db, Item, Category, Review, User, Follow

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/most_expensive_by_category', methods=['GET'])
@login_required
def most_expensive_by_category():
    """
    PHASE 3 REQUIREMENT: For each category, return the single item with the highest price

    Returns: JSON array containing the item with the highest price in a particular category

    Method: GET /api/reports/most_expensive_by_category
    Security: Requires user authentication (@login_required)
    """
    results = []
    categories = Category.query.order_by(Category.name).all()
    
    for cat in categories:
        # Get top-priced item in this category
        top_item = (cat.items.order_by(Item.price.desc()).limit(1).first())

        if top_item:
            # Format the price with 2 decimal places
            formatted_price = "${:,.2f}".format(float(top_item.price))
            
            results.append({
                'category': cat.name.title(),  # Capitalize each word
                'item_id': top_item.id,
                'title': top_item.title,
                'price': formatted_price,
                'posted_by': top_item.posted_by,
                'date_posted': top_item.date_posted.strftime("%B %d, %Y"),  # Format date nicely
                'description': top_item.description[:100] + "..." if top_item.description and len(top_item.description) > 100 else top_item.description or ""
            })

    return jsonify(results), 200
    
@reports_bp.route('/users_two_categories', methods=['GET'])
@login_required
def users_two_categories():
    # TODO: complete return values, etc.
    """
    PHASE 3 REQUIREMENT: Find users who posted at least two items on the same day, one in category X and one in category Y.
    Requires two text fields in the UI that each take an item category: search will return the user (or users) who (the 
    same user) posted two different items on the same day, such that one item has a category in the first text field and 
    the other has a category in the second text field.
    Query params: ?cat1=<X>&cat2=<Y>

    Method: GET /api/reports/users_two_categories

    Returns: JSON array containing a list of users who posted two items on the same day. 
    Security: Requires user authentication (@login_required)
    """
    cat1 = request.args.get('cat1', '').strip().lower()
    cat2 = request.args.get('cat2', '').strip().lower()
    if not cat1 or not cat2:
        return jsonify({'error': 'Please supply cat1:"first_category" and cat2:"second_category" query parameters'}), 400
    
    # Self-join Item via alias
    ItemA = db.aliased(Item)
    ItemB = db.aliased(Item)
    # Alias Category for each side of the join
    CatA = db.aliased(Category)
    CatB = db.aliased(Category)

    query = (
        db.session.query(ItemA.posted_by)
        # Same user, same calendar day, different items
        .join(
            ItemB,
            (ItemA.posted_by == ItemB.posted_by)
            & (func.date(ItemA.date_posted) == func.date(ItemB.date_posted))
            & (ItemA.id != ItemB.id)
        )
        # Join categories for each item alias
        .join(ItemA.categories.of_type(CatA))
        .join(ItemB.categories.of_type(CatB))
        # Case-insensitive category name match
        .filter(func.lower(CatA.name) == cat1)
        .filter(func.lower(CatB.name) == cat2)
        .distinct()
    )
    users = [row[0] for row in query.all()]
    return jsonify({'users': users}), 200


@reports_bp.route('/items_only_good_excellent', methods=['GET'])
@login_required
def items_only_good_excellent():
    # TODO: complete return values, etc.
    """
    PHASE 3 REQUIREMENT: List all items by user where all reviews are Excellent or Good (and at least one review).
    Query param: ?user=<username>

    Method: GET /api/reports/items_only_good_excellent

    Returns: JSON array containing a list of items with only 'Excellent' reviews.
    Security: Requires user authentication (@login_required)
    """

    username = request.args.get('user', "").strip()
    if not username:
         return jsonify({'error': 'Please supply user query parameter'}), 400
    
    items = Item.query.filter_by(posted_by=username).all()
    valid_scores = {'Excellent', 'Good'}
    out = []
    for item in items:
         revs = item.reviews.all()
         if revs and all(r.score in valid_scores for r in revs):
              out.append({
                   'item_id': item.id,
                   'title': item.title,
                   'review_count': len(revs)
              })
    
    return jsonify({'items': out}), 200


@reports_bp.route('/top_posters', methods=['GET'])
@login_required
def top_posters():
    # TODO: complete return values, etc.
    """
    PHASE 3 REQUIREMENT: List user(s) who posted the most items on a given date.
    Query param: ?date=YYYY-MM-DD

    Method: GET /api/reports/top_posters

    Returns: JSON array containing a list of the user or users (if there is a tie) who posted the most items on a given date. 
    Security: Requires user authentication (@login_required)
    """
    date_s = request.args.get('date')
    if not date_s:
        return jsonify({'error': 'Please supply a date in this format: date=YYYY-MM-DD'}), 400
    try:
        target = func.DATE(Item.date_posted)==date_s
    except:
        return jsonify({'error': 'Invalid date format'}), 400
    
    # Group and count posts (aka reviews)
    counts = (db.session.query(Item.posted_by, func.count().label('cnt'))
              .filter(func.date(Item.date_posted)==date_s)
              .group_by(Item.posted_by)
              .order_by(func.count().desc())
              .all())
    if not counts:  # If there are no top posters (aka no one has posted a review on the given date)
        return jsonify({'top_posters': []}), 200
    
    max_cnt = counts[0].cnt
    top_users = [row.posted_by for row in counts if row.cnt == max_cnt]
    return jsonify({'date': date_s, 'max_posts': max_cnt, 'users': top_users}), 200


@reports_bp.route('/users_all_poor', methods=['GET'])
@login_required
def users_all_poor():
    # TODO: complete return values, etc.
    """
    PHASE 3 REQUIREMENT: List users who have posted reviews, and all of their reviews are 'Poor'.

    Method: GET /api/reports/users_all_poor

    Returns: JSON array containing a list of users who have only posted 'Poor' reviews.
    Security: Requires user authentication (@login_required)
    """
    query = (db.session.query(
            Review.user_id,
            func.sum(case((Review.score != 'Poor', 1), else_=0)).label('nonpoor_count'),
            # func.sum(case([(Review.score != 'Poor', 1)], else_=0)).label('nonpoor_count'),
            func.count().label('total_count')
        )
        .group_by(Review.user_id)
        .all())

    users = [row.user_id for row in query if row.total_count > 0 and row.nonpoor_count == 0]
    return jsonify({'users': users}), 200


@reports_bp.route('/users_no_poor_reviews_on_items', methods=['GET'])
@login_required
def users_no_poor_reviews_on_items():
    """
    PHASE 3 REQUIREMENT: List users who have posted items, none of which have ever received a 'Poor' review.
    Items with no reviews count as 'OK'.

    Method: GET /api/reports/users_no_poor_reviews_on_items

    Returns: JSON array containing a list of users whose posted items have never received a 'Poor' review.
    Security: Requires user authentication (@login_required)
    """
    # Build an EXISTS subquery for "there is a poor review on this item"
    poor_exists = (
        db.session.query(Review.id)
        .filter(
            Review.item_id == Item.id,
            Review.score   == 'Poor'
        )
        .exists()
    )

    # Select distinct posters where NOT EXISTS(poor review)
    rows = (
        db.session.query(Item.posted_by)
        .distinct()
        .filter(~poor_exists)
        .all()
    )

    users = [r[0] for r in rows]
    return jsonify({'users': users}), 200


@reports_bp.route('/users_followed_by_both', methods=['GET'])
@login_required
def users_followed_by_both():
    """
    ADDITIONAL REQUIREMENT: List all users who are followed by both user1 and user2
    Query params: ?user1=<username>&user2=<username>

    Method: GET /api/reports/users_followed_by_both

    Returns: JSON array containing a list of users who are followed by both user1 and user2.
    Security: Requires user authentication (@login_required)
    """
    user1 = request.args.get('user1', '').strip()
    user2 = request.args.get('user2', '').strip()
    if not user1 or not user2:
        return jsonify({'error': 'Please supply user1 and user2 query parameters'}), 400
    
    # All users followed by user1
    f1 = { f.user_username for f in Follow.query.filter_by(follower_username=user1).all() }

    # All users followed by user2
    f2 = { f.user_username for f in Follow.query.filter_by(follower_username=user2).all() }

    # All users followed by both user1 and user2
    mutual_followers = sorted(f1 & f2) # This uses the logical and operator (&), which works like an intersection here

    return jsonify({'users': mutual_followers}), 200


@reports_bp.route('/users_never_posted', methods=['GET'])
@login_required
def users_never_posted():
    """
    ADDITIONAL REQUIREMENT: List all registered users who have never posted an item

    Method: GET /api/reports/users_never_posted

    Returns: JSON array containing a list of users who have never posted an item.
    Security: Requires user authentication (@login_required)
    """
    # Set of all users who have posted an item
    have_posted = { r[0] for r in db.session.query(Item.posted_by).distinct().all() }

    # Set of all users
    all_users = {user.username for user in User.query.all() }

    # Set of users that have never posted an item
    never_posted = sorted(all_users - have_posted)

    return jsonify({'users': never_posted}), 200





