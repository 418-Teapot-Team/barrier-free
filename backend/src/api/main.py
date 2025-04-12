import uvicorn
from fastapi import FastAPI

from .middlewares import JWTAuthenticationMiddleware
from .routes import router

app = FastAPI()
app.include_router(router, prefix="/api")
app.add_middleware(JWTAuthenticationMiddleware)


if __name__ == "__main__":
    uvicorn.run(app)
