from flask import Blueprint, request, jsonify
from models import db, Item, Category, Review, item_category
from flask_login import login_required, current_user
from datetime import datetime, date
from sqlalchemy import func
from utils.imgur import upload_to_imgur

items_bp = Blueprint('items', __name__)

"""
INSERT INTO item (
  title, description, price, posted_by, date_posted, image_url
) VALUES (
  :title, :description, :price, :current_username, :today, :image_url_or_null
);
"""
@items_bp.route('/newitem', methods=['POST'])  
@login_required
def create_item():
  data = request.get_json() # data is requested for the input fields for item creation
  
  title = data.get('title', '').strip()
  description = data.get('description', '').strip()
  price = data.get('price')
  categories = data.get('categories')
  image_url = data.get('image_url', '').strip()  # Optional image URL
  
  # we need this to check that the input isn't empty and is valid
  if not title:
    return jsonify({'error': 'Enter a title'}), 400
  if not description:
    return jsonify({'error': 'Enter a description'}), 400
  if price is None or not isinstance(price, (int, float)) or price <= 0: # need to make sure price field is not empty and not negative
    return jsonify({'error': 'Price must be a positive number'}), 400
  if not categories or not isinstance(categories, list) or len(categories) == 0:
    return jsonify({'error': 'At least one category is required'}), 400
  
  today = date.today()
  count = Item.query.filter( # queries the Item table to count how many items have been posted today
    Item.posted_by == current_user.username,
    func.date(Item.date_posted) == today
  ).count()
  
  if count >=2:
    return jsonify({'error': 'Daily limit reached: only 2 items can be posted in a day'}), 400
  
  # creates a new instance of the Item class, with all of these required input fields
  new_item = Item(
    title = title,
    description = description,
    price = price,
    posted_by = current_user.username,
    date_posted = date.today(),
    image_url = image_url if image_url else None  # Store image URL if provided
  )

  # Add item to the current session before doing any category <-> item relationship stuff
  db.session.add(new_item)

  # attach categories to items
  for cat_name in categories:
    cat_name = cat_name.strip().lower()
    if not cat_name:
      continue
    category = Category.query.get(cat_name) # checks if the category exists in DB so that if it doesn't exist it can be created
    if not category:
      category = Category(name=cat_name)
      db.session.add(category)
    new_item.categories.append(category) # links the category to the item

  # add new items to database
#   db.session.add(new_item)
  db.session.commit()
  
  # Return the created item with its computed image URL
  item_data = {
    'id': new_item.id,
    'title': new_item.title,
    'description': new_item.description,
    'price': str(new_item.price),
    'posted_by': new_item.posted_by,
    'date_posted': new_item.date_posted.isoformat(),
    'categories': [{'name': c.name, 'icon_key': c.icon_key} for c in new_item.categories],
    'star_rating': new_item.star_rating,
    'review_count': new_item.reviews.count(),
    'image_url': new_item.get_image_url()
  }
  
  return jsonify({'message': 'Item created successfully', 'item': item_data}), 201

"""
SELECT
  id, title, description, price, posted_by, date_posted,
  star_rating, image_url
FROM item
ORDER BY date_posted DESC;
"""
@items_bp.route('/list_items', methods=['GET'])
# No @login_required for items shown on the front page
def list_items():
  # Fetch items (ordered)
  items = Item.query.order_by(Item.date_posted.desc()).all()
  if not items:
    return jsonify([]), 200
  
  item_ids = [item.id for item in items]

  # Batch fetch categories for all items
  cat_rows = (
    db.session.query(
      item_category.c.item_id,
      Category.name,
      Category.icon_key
    )
    .join(Category, Category.name == item_category.c.category_name)
    .filter(item_category.c.item_id.in_(item_ids))
    .all()
  )
  categories_map = {}
  for item_id, name, icon_key in cat_rows:
    categories_map.setdefault(item_id, []).append({'name': name, 'icon_key': icon_key})
  
  # Batch fetch review counts per item
  review_rows = (
    db.session.query(Review.item_id, func.count(Review.id))
    .filter(Review.item_id.in_(item_ids))
    .group_by(Review.item_id)
    .all()
  )
  review_count_map = {item_id: cnt for item_id, cnt in review_rows}

  # Build results without per-item queries
  result = []
  for item in items:
    cats = categories_map.get(item.id, [])
    # Compute reviewed image URL without triggering a categories query
    if item.image_url:
      resolved_image_url = item.image_url
    else:
      icon_key = cats[0]['icon_key'] if cats else None
      resolved_image_url = (
        f"https://api.iconify.design/{icon_key}.svg"
        if icon_key else "https://api.iconify.design/mdi:package-variant.svg"
      )
    
    result.append({
      'id': item.id,
      'title': item.title,
      'description': item.description,
      'price': str(item.price),
      'posted_by': item.posted_by,
      'date_posted': item.date_posted.isoformat(),
      'categories': cats,
      'star_rating': item.star_rating,
      'review_count': review_count_map.get(item.id, 0),
      'image_url': resolved_image_url
    })

  return jsonify(result), 200

"""
SELECT
  id, title, description, price, posted_by, date_posted,
  star_rating, image_url
FROM item
WHERE id = :item_id
LIMIT 1;
"""
@items_bp.route('/<int:item_id>', methods=['GET'])
def get_item(item_id):
  """ Return detailed information for a single item """
  item = Item.query.get_or_404(item_id)
  data = {
      'id': item.id,
      'title': item.title,
      'description': item.description,
      'price': str(item.price),
      'posted_by': item.posted_by,
      'date_posted': item.date_posted.isoformat(),
      'categories': [{'name': c.name, 'icon_key': c.icon_key} for c in item.categories],
      'star_rating': item.star_rating,
      'review_count': item.reviews.count(),
      'image_url': item.get_image_url()
  }
  return jsonify(data), 200

"""
SELECT
  i.id, i.title, i.description, i.price, i.posted_by, i.date_posted,
  i.star_rating, i.image_url
FROM item AS i
JOIN item_category AS ic
  ON ic.item_id = i.id
JOIN category AS c
  ON c.name = ic.category_name
WHERE c.name = :category_name      -- you already lower() the param; utf8mb4_unicode_ci is case-insensitive
ORDER BY i.date_posted DESC;
"""
@items_bp.route('/search', methods=['GET'])
#@login_required remove it so unlogged users can search
def search_items():
    """
    PHASE 2 REQUIREMENT: Search Interface Implementation
    
    Purpose: Search for items by category name
    Method: GET /api/items/search?category=<category_name>
    
    Returns: JSON array of items that match the category
    Security: Requires user authentication (@login_required)
    
    Example Usage: GET /api/items/search?category=electronics
    """
    # Get the category parameter from query string
    category_name = request.args.get('category', '').strip().lower()
    
    # Validate input - category is required
    if not category_name:
        return jsonify({
            'error': 'Category parameter is required',
            'usage': 'GET /api/items/search?category=<category_name>'
        }), 400
    
    # Query database for items that have the specified category
    # Uses SQLAlchemy join to find items connected to categories
    items = Item.query.join(Item.categories).filter(
        Category.name == category_name
    ).order_by(Item.date_posted.desc()).all()
    
    # Format results for frontend consumption
    result = []
    for item in items:
        result.append({
            'id': item.id,
            'title': item.title,
            'description': item.description,
            'price': str(item.price),
            'posted_by': item.posted_by,
            'date_posted': item.date_posted.isoformat(),
            'categories': [{'name': c.name, 'icon_key': c.icon_key} for c in item.categories],
            'star_rating': item.star_rating,
            'review_count': item.reviews.count(),
            'image_url': item.get_image_url()
        })
    
    # Return results with metadata
    return jsonify({
        'category': category_name,
        'item_count': len(result),
        'items': result
    }), 200

"""
SELECT
  name,
  icon_key
FROM category
ORDER BY name ASC;
"""
@items_bp.route('/categories', methods=['GET'])
# Removed @login_required to allow public access
def get_categories():
    """
    PHASE 2 HELPER: Get all available categories
    
    Purpose: Provide list of all categories for search autocomplete/dropdown
    Method: GET /api/items/categories
    
    Returns: JSON array of category names
    Security: Requires user authentication (@login_required)
    """
    # Get all categories from database, ordered alphabetically
    categories = Category.query.order_by(Category.name).all()
    
    # Format as simple array of category names
    result = [{'name': category.name, 'icon_key': category.icon_key} for category in categories]
    
    return jsonify({
        'category_count': len(result),
        'categories': result
    }), 200

"""
SELECT
  id, title, description, price, posted_by, date_posted,
  star_rating, image_url
FROM item
WHERE posted_by = :current_username
ORDER BY date_posted DESC;
"""
@items_bp.route('/my_items', methods=['GET'])
@login_required
def get_my_items():
    # Fetch all items for current user in one query
    items = (
        Item.query
        .filter_by(posted_by=current_user.username)
        .order_by(Item.date_posted.desc())
        .all()
    )
    if not items:
        return jsonify([]), 200

    item_ids = [it.id for it in items]

    # Batch fetch categories for all items
    cat_rows = (
        db.session.query(
            item_category.c.item_id,
            Category.name,
            Category.icon_key
        )
        .join(Category, Category.name == item_category.c.category_name)
        .filter(item_category.c.item_id.in_(item_ids))
        .all()
    )
    categories_map = {}
    for item_id, name, icon_key in cat_rows:
        categories_map.setdefault(item_id, []).append({'name': name, 'icon_key': icon_key})

    # Batch fetch review counts for all items
    review_rows = (
        db.session.query(Review.item_id, func.count(Review.id))
        .filter(Review.item_id.in_(item_ids))
        .group_by(Review.item_id)
        .all()
    )
    review_count_map = {item_id: cnt for item_id, cnt in review_rows}

    # Build response without per-item queries
    result = []
    for it in items:
        cats = categories_map.get(it.id, [])
        if it.image_url:
            resolved_image_url = it.image_url
        else:
            icon_key = cats[0]['icon_key'] if cats else None
            resolved_image_url = (
                f"https://api.iconify.design/{icon_key}.svg"
                if icon_key else "https://api.iconify.design/mdi:package-variant.svg"
            )

        result.append({
            'id': it.id,
            'title': it.title,
            'description': it.description,
            'price': str(it.price),
            'date_posted': it.date_posted.isoformat(),
            'posted_by': it.posted_by,
            'categories': cats,
            'image_url': resolved_image_url,
            'star_rating': it.star_rating,
            'review_count': review_count_map.get(it.id, 0),
        })

    return jsonify(result), 200

"""
SELECT
  id, title, description, price, posted_by, date_posted,
  star_rating, image_url
FROM item
WHERE posted_by = :username
ORDER BY date_posted DESC;
"""
@items_bp.route('/user/<username>', methods=['GET'])
def get_items_by_user(username):
    items = (
        Item.query
        .filter_by(posted_by=username)
        .order_by(Item.date_posted.desc())
        .all()
    )
    if not items:
        return jsonify([]), 200

    item_ids = [it.id for it in items]

    cat_rows = (
        db.session.query(
            item_category.c.item_id,
            Category.name,
            Category.icon_key
        )
        .join(Category, Category.name == item_category.c.category_name)
        .filter(item_category.c.item_id.in_(item_ids))
        .all()
    )
    categories_map = {}
    for item_id, name, icon_key in cat_rows:
        categories_map.setdefault(item_id, []).append({'name': name, 'icon_key': icon_key})

    review_rows = (
        db.session.query(Review.item_id, func.count(Review.id))
        .filter(Review.item_id.in_(item_ids))
        .group_by(Review.item_id)
        .all()
    )
    review_count_map = {item_id: cnt for item_id, cnt in review_rows}

    result = []
    for it in items:
        cats = categories_map.get(it.id, [])
        if it.image_url:
            resolved_image_url = it.image_url
        else:
            icon_key = cats[0]['icon_key'] if cats else None
            resolved_image_url = (
                f"https://api.iconify.design/{icon_key}.svg"
                if icon_key else "https://api.iconify.design/mdi:package-variant.svg"
            )

        result.append({
            'id': it.id,
            'title': it.title,
            'description': it.description,
            'price': str(it.price),
            'posted_by': it.posted_by,
            'date_posted': it.date_posted.isoformat(),
            'categories': cats,
            'image_url': resolved_image_url,
            'star_rating': it.star_rating,
            'review_count': review_count_map.get(it.id, 0),
        })

    return jsonify(result), 200


# Proxy file uploads to Imgur (used by NewItemForm when user selects a file)
@items_bp.route('/upload_image', methods=['POST'])
@login_required
def upload_item_image_file():
   if 'image' not in request.files:
      return jsonify({'error': 'No image provided'}), 400
   file = request.files['image']
   if not file or not file.filename:
      return jsonify({'error': 'Empty filename'}), 400
   try:
      link = upload_to_imgur(file)
      return jsonify({'link': link}), 200
   except Exception as e:
      return jsonify({'error': str(e)}), 502
   

@items_bp.route('/<int:item_id>/image', methods=['PUT'])
@login_required
def update_item_image(item_id):
    """Update the image URL for an item. Only the item owner can do this."""
    item = Item.query.get_or_404(item_id)
    
    # Check ownership
    if item.posted_by != current_user.username:
        return jsonify({'error': 'You can only update images for your own items'}), 403

    try:
        # Support both multipart (file upload) and JSON payloads
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            if 'image' in request.files and request.files['image'].filename:
                link = upload_to_imgur(request.files['image'])
                item.image_url = link
            else:
                # optional: allow image_url in multipart form
                image_url = (request.form.get('image_url') or '').strip()
                item.image_url = image_url if image_url else None
        else:
            data = request.get_json(silent=True) or {}
            image_url = (data.get('image_url') or '').strip()
            item.image_url = image_url if image_url else None

        db.session.commit()
        return jsonify({'message': 'Image updated successfully', 'image_url': item.get_image_url()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
