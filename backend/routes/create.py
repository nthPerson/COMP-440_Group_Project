from flask import Blueprint, request, jsonify
from models import db, Item
from flask_login import login_required, current_user
from datetime import datetime, date

create_bp = Blueprint('create', __name__)

@create_bp.route('/new', methods=['POST'])  
@login_required
def create_item():
  data = request.get_json() #data is requested for the input fields fopr item creation
  
  title = data.get('title', '').strip()
  description = data.get('description', '').strip()
  price = data.get('price')
  categories = data.get('categories')
  
  # we need this to check that the input isn't empty and is valid
  if not title:
    return jsonify({'error': 'Enter a title'}), 400
  if not description:
    return jsonify({'error': 'Enter a description'}), 400
  if not price is None or not isinstance(price, (int, float)) or price <= 0: #need to make sure price field is not empty and not negative
    return jsonify({'error': 'Price must be a positive number'}), 400
  if not categories or not isinstance(categories, list) or len(categories) == 0:
    return jsonify({'error': 'At least one category is required'}), 400
 