from fastapi import FastAPI
from app.routes import users, products, carts, orders, inventory
from app.database import Base, engine

app = FastAPI(title="Festékbolt API")

# routerek regisztrálása
app.include_router(users.router)
app.include_router(products.router)
app.include_router(carts.router)
app.include_router(orders.router)
app.include_router(inventory.router)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    print("Database tables created!")

@app.get("/")
def root():
    return {"message": "Hello, FastAPI működik!"}