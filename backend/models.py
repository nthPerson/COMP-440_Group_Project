import datetime
from flask_sqlalchemy import SQLAlchemy  # Database management
from flask_login import UserMixin  # Session management (avoids the need to write is_authenticated, is_active, etc. to handle user sessions)

db = SQLAlchemy()  # This is the tool our app uses to interact with the database (automates queries, etc.)

# User table schema: user(username*, password, firstName, lastName, email)  -- note that the * indicates the primary key
class User(UserMixin, db.Model):
    __tablename__ = 'user'
    username = db.Column(db.String(64), primary_key=True)  # PRIMARY KEY
    password = db.Column(db.String(128), nullable=False)   # stored as a hash in the database. Hashing/decoding takes place in auth.py
    firstName = db.Column(db.String(64), nullable=False)
    lastName = db.Column(db.String(64), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)  # email MUST BE UNIQUE to prevent multiple accounts being registered to the same email

    def __repr__(self):
        return f'<User {self.username}>'
    
    def get_id(self):  # Flask-Login will call this to store the user's ID for the current session
        return self.username
    

# Association table for many-to-many relationship between Item and Category
item_category = db.Table('item_category', 
                         db.Column('item_id', db.Integer, db.ForeignKey('item.id'), primary_key=True),
                         db.Column('category_name', db.String(64), db.ForeignKey('category.name'), primary_key=True)
                         )

class Item(db.Model):
    __tablename__ = 'item'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Auto-incrementing ID
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    date_posted = db.Column(db.Date, nullable=False, default=lambda: datetime.date.today())
    price = db.Column(db.Numeric(10, 2), nullable=False)

    # Who posted the item?
    posted_by = db.Column(db.String(64), db.ForeignKey('user.username'), nullable=False)
    user = db.relationship('User', backref=db.backref('items', lazy=True))

    # Categories (many-to-many)
    categories = db.relationship('Category', secondary=item_category, backref=db.backref('items', lazy='dynamic'), lazy='dynamic')

    def __repr__(self):
        return f'<Item {self.id} "{self.title}">'

class Category(db.Model):
    __tablename__ = 'category'
    name = db.Column(db.String(64), primary_key=True)

    def __repr__(self):
        return f'<Category {self.name}>'

class Review(db.Model):
    __tablename__ = 'review'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    review_date = db.Column(db.Date, nullable=False, default=lambda: datetime.date.today())
    score = db.Column(db.Enum('Excellent', 'Good', 'Fair', 'Poor', name='review_score'), nullable=False)  # Score must be one of the four allowed values (hence the Enum)
    remark = db.Column(db.Text, nullable=True)

    # Who made the review?
    user_id = db.Column(db.String(64), db.ForeignKey('user.username'), nullable=False)
    user = db.relationship('User', backref=db.backref('reviews', lazy='dynamic'))

    # Which item is being reviewed?
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)
    item = db.relationship('Item', backref=db.backref('reviews', lazy='dynamic'))

    # Enforce the "one review per user per item" external constraint
    __table_args__ = (
        db.UniqueConstraint('user_id', 'item_id', name='uq_user_item_review'),
    )

    def __repr__(self):
        return f'<Review {self.id} by {self.user_id} on item {self.item_id}>'

