from fastapi import FastAPI
from app.routes import users
from app.database import Base, engine


app = FastAPI(title="Festékbolt API")

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    print("Database tables created!")

# routerek regisztrálása
app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "Hello, FastAPI működik!"}