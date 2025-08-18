import datetime
from flask_sqlalchemy import SQLAlchemy  # Database management
from flask_login import UserMixin  # Session management (avoids the need to write is_authenticated, is_active, etc. to handle user sessions)

db = SQLAlchemy()  # This is the tool our app uses to interact with the database (automates queries, etc.)

# User table schema: user(username*, password, firstName, lastName, email)  -- note that the * indicates the primary key
"""
CREATE TABLE `user` (
  `username`           VARCHAR(64)  NOT NULL,
  `password`           VARCHAR(128) NOT NULL,
  `firstName`          VARCHAR(64)  NOT NULL,
  `lastName`           VARCHAR(64)  NOT NULL,
  `email`              VARCHAR(120) NOT NULL,
  `profile_image_url`  VARCHAR(512) DEFAULT NULL,
  CONSTRAINT `pk_user` PRIMARY KEY (`username`),
  CONSTRAINT `uq_user_email` UNIQUE (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""
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
"""
CREATE TABLE `item_category` (
  `item_id`        INT NOT NULL,
  `category_name`  VARCHAR(64) NOT NULL,
  CONSTRAINT `pk_item_category` PRIMARY KEY (`item_id`, `category_name`),
  CONSTRAINT `fk_item_category_item` FOREIGN KEY (`item_id`)
    REFERENCES `item` (`id`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_item_category_category` FOREIGN KEY (`category_name`)
    REFERENCES `category` (`name`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `ix_item_category_category_name` ON `item_category` (`category_name`);
CREATE INDEX `ix_item_category_item_id` ON `item_category` (`item_id`);
"""
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

"""
CREATE TABLE `item` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `title`        VARCHAR(255) NOT NULL,
  `description`  TEXT NOT NULL,
  -- SQLAlchemy supplies the default date in Python; omit DB default for DATE for portability
  `date_posted`  DATE NOT NULL,
  `price`        DECIMAL(10,2) NOT NULL,
  `posted_by`    VARCHAR(64) NOT NULL,
  `star_rating`  FLOAT NOT NULL DEFAULT 0.0,
  `image_url`    VARCHAR(512) DEFAULT NULL,
  CONSTRAINT `pk_item` PRIMARY KEY (`id`),
  CONSTRAINT `fk_item_user` FOREIGN KEY (`posted_by`)
    REFERENCES `user` (`username`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `ix_item_posted_by` ON `item` (`posted_by`);
"""
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
    

"""
CREATE TABLE `category` (
  `name`     VARCHAR(64)  NOT NULL,
  `icon_key` VARCHAR(100) NOT NULL DEFAULT 'mdi:help-circle',
  CONSTRAINT `pk_category` PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""
class Category(db.Model):
    __tablename__ = 'category'
    name = db.Column(db.String(64), primary_key=True)

    # Generic category icons
    icon_key = db.Column(db.String(100), nullable=False, default='mdi:help-circle')  # Iconify keys, e.g. 'mdi:headphones', 'mdi:robot', etc.

    def __repr__(self):
        return f'<Category {self.name} icon={self.icon_key}>'

"""
CREATE TABLE `review` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `review_date` DATE NOT NULL,
  `score`       ENUM('Excellent','Good','Fair','Poor') NOT NULL,
  `remark`      TEXT DEFAULT NULL,
  `user_id`     VARCHAR(64) NOT NULL,
  `item_id`     INT NOT NULL,
  CONSTRAINT `pk_review` PRIMARY KEY (`id`),
  CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`)
    REFERENCES `user` (`username`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_review_item` FOREIGN KEY (`item_id`)
    REFERENCES `item` (`id`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `uq_user_item_review` UNIQUE (`user_id`, `item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `ix_review_user_id` ON `review` (`user_id`);
CREATE INDEX `ix_review_item_id` ON `review` (`item_id`);
"""
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
"""
CREATE TABLE `follow` (
  `user_username`     VARCHAR(64) NOT NULL,
  `follower_username` VARCHAR(64) NOT NULL,
  CONSTRAINT `pk_follow` PRIMARY KEY (`user_username`, `follower_username`),
  CONSTRAINT `fk_follow_user_followee` FOREIGN KEY (`user_username`)
    REFERENCES `user` (`username`)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT `fk_follow_user_follower` FOREIGN KEY (`follower_username`)
    REFERENCES `user` (`username`)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `ix_follow_user_username` ON `follow` (`user_username`);
CREATE INDEX `ix_follow_follower_username` ON `follow` (`follower_username`);
"""
class Follow(db.Model):
    __tablename__ = 'follow'

    #  The user being followed (followee)
    user_username = db.Column(db.String(64), db.ForeignKey('user.username'), primary_key=True)

    # The user doing the following (follower)
    follower_username = db.Column(db.String(64), db.ForeignKey('user.username'), primary_key=True)

    # Relationships back to user
    user = db.relationship('User', foreign_keys=[user_username], backref=db.backref('followers', lazy='dynamic'))
    follower = db.relationship('User', foreign_keys=[follower_username], backref=db.backref('following', lazy='dynamic'))





