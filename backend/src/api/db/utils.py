from sqlalchemy import URL, make_url


def get_db_url(url: str) -> URL:
    sqlalchemy_url = make_url(url)
    return sqlalchemy_url.set(drivername="postgresql+psycopg_async")
