import pytest
from app.data_loader import DatabaseLoader
from app.models import User
from app.utils.security import get_password_hash, verify_password
from app.database import SessionLocal, Base, engine

@pytest.fixture(scope="module")
def setup_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop tables after tests
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    db = SessionLocal()
    yield db
    db.close()


def test_user_password_hashing(setup_database, db_session):
    # Sample user data
    user_data = [
        {
            "name": "Test User",
            "email": "test@example.com",
            "password": "plainpassword",
            "role": "user"
        }
    ]
    # Load user
    loader = DatabaseLoader(db_session)
    loader.load_entity_data("users", user_data)
    # Query user
    user = db_session.query(User).filter_by(email="test@example.com").first()
    assert user is not None
    # Password should be hashed
    assert user.password_hash != "plainpassword"
    # Hash should verify with the original password
    assert verify_password("plainpassword", user.password_hash)


def test_multiple_users_passwords(setup_database, db_session):
    users = [
        {"name": "Alice", "email": "alice@example.com", "password": "alicepass", "role": "user"},
        {"name": "Bob", "email": "bob@example.com", "password": "bobpass", "role": "admin"}
    ]
    loader = DatabaseLoader(db_session)
    loader.load_entity_data("users", users)
    for u in users:
        user = db_session.query(User).filter_by(email=u["email"]).first()
    assert user is not None
    assert user.password_hash != u["password"]
    assert verify_password(u["password"], user.password_hash)