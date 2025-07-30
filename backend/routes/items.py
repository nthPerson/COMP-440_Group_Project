from flask import Blueprint, request, jsonify
from models import db, Item, Category
from flask_login import login_required, current_user
from datetime import datetime, date
from sqlalchemy import func

items_bp = Blueprint('item', __name__)

@items_bp.route('/newitem', methods=['POST'])  
@login_required
def create_item():
  data = request.get_json() # data is requested for the input fields for item creation
  
  title = data.get('title', '').strip()
  description = data.get('description', '').strip()
  price = data.get('price')
  categories = data.get('categories')
  
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
    date_posted = date.today()
  )

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
  db.session.add(new_item)
  db.session.commit()
  
  return jsonify({'message': 'Item created successfully'}), 201


@items_bp.route('/list_items', methods=['GET'])
@login_required
def list_items():
  items = Item.query.order_by(Item.date_posted.desc()).all()
  result = []

  for item in items:
    result.append({
      'id': item.id,
      'title': item.title,
      'description': item.description,
      'price': str(item.price),
      'posted_by': item.posted_by,
      'date_posted': item.date_posted.isoformat(),
      'categories': [{'name': c.name} for c in item.categories],
      'star_rating': item.star_rating,
      'review_count': item.reviews.count()
    })
  
  return jsonify(result), 200

 