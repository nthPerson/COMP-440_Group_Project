import sys, os
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

import bcrypt
from backend.models import User

REG_URL = '/api/auth/register'
LOGIN_URL = '/api/auth/login'
LOGOUT_URL = '/api/auth/logout'
USERS_URL = '/api/users/'

valid_user = {
    "username": "alice",
    "password": "Password123!",
    "firstName": "Alice",
    "lastName": "Tester",
    "email": "alice@example.com"
}


def register(client, data):
    return client.post(REG_URL, json=data)


def login(client, username, password):
    return client.post(LOGIN_URL, json={"username": username, "password": password})


def test_register_success(client, app):
    response = register(client, valid_user)
    assert response.status_code == 201
    with app.app_context():
        user = User.query.get(valid_user["username"])
        assert user is not None
        assert user.password != valid_user["password"]
        assert bcrypt.checkpw(valid_user["password"].encode("utf-8"), user.password.encode("utf-8"))


def test_register_existing_username(client):
    register(client, valid_user)
    response = register(client, {**valid_user, "email": "new@example.com"})
    assert response.status_code == 400


def test_register_mismatched_passwords(client):
    data = {**valid_user, "confirmPassword": "Mismatch"}
    response = register(client, data)
    assert response.status_code == 400


def test_register_sql_injection_username(client):
    data = {**valid_user, "username": "admin' OR '1'='1"}
    response = register(client, data)
    assert response.status_code == 400


def test_login_success_and_access(client, app):
    register(client, valid_user)
    resp = login(client, valid_user["username"], valid_user["password"])
    assert resp.status_code == 200
    # Should now access protected route
    users_resp = client.get(USERS_URL)
    assert users_resp.status_code == 200


def test_login_wrong_credentials(client):
    register(client, valid_user)
    resp = login(client, valid_user["username"], "wrongpass")
    assert resp.status_code == 401


def test_session_persistence(client, app):
    register(client, valid_user)
    login(client, valid_user["username"], valid_user["password"])
    # second request after login
    resp = client.get(USERS_URL)
    assert resp.status_code == 200


def test_protected_route_requires_login(client):
    resp = client.get(USERS_URL)
    assert resp.status_code in (401, 302)


def test_logout_revokes_access(client):
    register(client, valid_user)
    login(client, valid_user["username"], valid_user["password"])
    # logout
    out = client.post(LOGOUT_URL)
    assert out.status_code == 200
    resp = client.get(USERS_URL)
    assert resp.status_code in (401, 302)