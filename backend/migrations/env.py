import asyncio
from logging.config import fileConfig
from typing import Iterable

import alembic_postgresql_enum  # noqa: F401
from alembic import context
from alembic.operations.ops import MigrationScript
from alembic.runtime.migration import MigrationContext
from alembic.script import ScriptDirectory
from sqlalchemy import Connection, pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from api.db.tables import TableBase
from api.db.utils import get_db_url
from api.settings import settings

config = context.config


config.set_main_option(
    "sqlalchemy.url",
    get_db_url(settings.DATABASE_URL).render_as_string(False),
)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


target_metadata = TableBase.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def process_revision_directives(
    ctx: MigrationContext,
    revision: str | Iterable[str | None] | Iterable[str],
    directives: list[MigrationScript],
):
    script = ScriptDirectory.from_config(config)
    revs = list(script.walk_revisions())
    migration_script = directives[0]
    migration_script.rev_id = f"{len(revs) + 1:04}"


def _run_migrations(connection: Connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        process_revision_directives=process_revision_directives,
        include_schemas=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(_run_migrations)


if context.is_offline_mode():
    run_migrations_offline()
else:
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop is None:
        asyncio.run(run_migrations_online())
    else:
        connection: Connection | None = config.attributes.get("connection")
        if connection is None:
            msg = "Event loop is already running and conn is not configured"
            raise RuntimeError(msg)

        _run_migrations(connection)
