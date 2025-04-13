from sqlalchemy import sql
from sqlalchemy.ext.asyncio import AsyncConnection

from api.db.tables.core import NodeComment


async def create_comment(
    db_conn: AsyncConnection,
    osm_id: str,
    user_id: int,
    text: str,
) -> int:
    query = (
        sql.insert(NodeComment)
        .values(
            osm_id=osm_id,
            user_id=user_id,
            text=text,
        )
        .returning(NodeComment.id)
    )
    cursor_result = await db_conn.execute(query)
    await db_conn.commit()
    return cursor_result.scalar_one()


async def delete_comment(
    db_conn: AsyncConnection,
    user_id: int,
    comment_id: int,
) -> None:
    query = sql.delete(NodeComment).where(
        NodeComment.id == comment_id,
        NodeComment.user_id == user_id,
    )
    await db_conn.execute(query)
    await db_conn.commit()
