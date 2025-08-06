#!/usr/bin/env python3
"""
Database migration script to add image_url column to Item table.
Run this script to update existing database schema.
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app import app
from models import db, Item

def migrate_database():
    with app.app_context():
        try:
            # Check if the image_url column already exists
            inspector = db.inspect(db.engine)
            columns = [column['name'] for column in inspector.get_columns('item')]
            
            if 'image_url' in columns:
                print("Migration already applied: image_url column exists.")
                return
            
            # Add the image_url column
            print("Adding image_url column to Item table...")
            db.engine.execute("ALTER TABLE item ADD COLUMN image_url VARCHAR(512)")
            
            print("Migration completed successfully!")
            print("- Added image_url column to Item table")
            
        except Exception as e:
            print(f"Migration failed: {e}")
            return False
    
    return True

if __name__ == "__main__":
    print("Starting database migration...")
    success = migrate_database()
    
    if success:
        print("\nDatabase migration completed successfully!")
        print("You can now:")
        print("1. Restart your Flask application")
        print("2. Use the new image upload features")
    else:
        print("\nMigration failed. Please check the error messages above.")
        sys.exit(1)
