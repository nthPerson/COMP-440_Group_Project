import os
import sys
import pytest

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

from backend.app import app as flask_app, db
from backend.models import User

@pytest.fixture
def app():
    flask_app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "LOGIN_DISABLED": False,
        "WTF_CSRF_ENABLED": False,
    })
    with flask_app.app_context():
        db.drop_all()
        db.create_all()
        yield flask_app

@pytest.fixture
def client(app):
    return app.test_client()