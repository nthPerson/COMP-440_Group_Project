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

    # User profile image URL
    profile_image_url = db.Column(db.String(512), nullable=True)

    def get_profile_image_url(self):
        return self.profile_image_url or "https://api.iconify.design/mdi:account-circle.svg"

    def __repr__(self):
        return f'<User {self.username}>'
    
    def get_id(self):  # Flask-Login will call this to store the user's ID for the current session
        return self.username
    

# Association table for many-to-many relationship between Item and Category
item_category = db.Table('item_category', 
                         db.Column('item_id', db.Integer, db.ForeignKey('item.id'), primary_key=True),
                         db.Column('category_name', db.String(64), db.ForeignKey('category.name'), primary_key=True)
                         )

# Score-to-star mapping
REVIEW_SCORE_MAP = {
    'Excellent': 5.0,
    'Good': 3.75,
    'Fair': 2.5,
    'Poor': 1.25
}
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
    
    star_rating = db.Column(db.Float, default=0.0) # new column is added in the db
    
    # Item image - can be either user-uploaded URL or default icon from first category
    image_url = db.Column(db.String(512), nullable=True)

    def __repr__(self):
        return f'<Item {self.id} "{self.title}">'
    
    def calculate_star_rating(self):
        reviews = self.reviews.all()
        if not reviews:
            return 0.0
        total = sum(REVIEW_SCORE_MAP.get(r.score, 0) for r in reviews) # uses our REVIEW_SCORE_MAP to map each score to a number
        return round(total / len(reviews), 2)  # rounded to 2 decimal places

    def get_image_url(self):
        """Get the item's image URL, falling back to default category icon if none set"""
        if self.image_url:
            return self.image_url
        
        # Get first category's icon as default
        first_category = self.categories.first()
        if first_category and first_category.icon_key:
            return f"https://api.iconify.design/{first_category.icon_key}.svg"
        
        # Ultimate fallback to a generic item icon
        return "https://api.iconify.design/mdi:package-variant.svg"

class Category(db.Model):
    __tablename__ = 'category'
    name = db.Column(db.String(64), primary_key=True)

    # Generic category icons
    icon_key = db.Column(db.String(100), nullable=False, default='mdi:help-circle')  # Iconify keys, e.g. 'mdi:headphones', 'mdi:robot', etc.

    def __repr__(self):
        return f'<Category {self.name} icon={self.icon_key}>'

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


# Social "follow" table
class Follow(db.Model):
    __tablename__ = 'follow'

    #  The user being followed (followee)
    user_username = db.Column(db.String(64), db.ForeignKey('user.username'), primary_key=True)

    # The user doing the following (follower)
    follower_username = db.Column(db.String(64), db.ForeignKey('user.username'), primary_key=True)

    # Relationships back to user
    user = db.relationship('User', foreign_keys=[user_username], backref=db.backref('followers', lazy='dynamic'))
    follower = db.relationship('User', foreign_keys=[follower_username], backref=db.backref('following', lazy='dynamic'))





