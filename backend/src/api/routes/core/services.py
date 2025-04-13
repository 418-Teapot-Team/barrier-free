from pydantic import TypeAdapter
from sqlalchemy import JSON, func, sql
from sqlalchemy.dialects.postgresql import aggregate_order_by, insert
from sqlalchemy.ext.asyncio import AsyncConnection

from api.db.tables.core import (
    Node,
    NodeAccessibility,
    NodeAccessibilityProposition,
    NodeComment,
)
from api.db.tables.users import User

from ...db.utils import empty_array, json_build_object
from .schemas import NodeSchema


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


async def update_node(
    db_conn: AsyncConnection,
    osm_id: str,
    accessibility: NodeAccessibility,
) -> None:
    stmt = insert(Node).values(osm_id=osm_id, accessibility=accessibility)
    query = stmt.on_conflict_do_update(
        index_elements=["osm_id"],
        set_={"accessibility": stmt.excluded.accessibility},
    )
    await db_conn.execute(query)
    await db_conn.commit()


async def list_nodes(
    db_conn: AsyncConnection,
) -> list[NodeSchema]:
    node_comments = (
        sql.select(
            NodeComment.osm_id,
            func.array_agg(
                aggregate_order_by(
                    json_build_object(
                        {
                            "id": NodeComment.id,
                            "user": json_build_object(
                                {
                                    "id": User.id,
                                    "email": User.email,
                                    "disabilities": User.disabilities,
                                }
                            ),
                            "text": NodeComment.text,
                            "created_at": NodeComment.created_at,
                        }
                    ),
                    NodeComment.created_at.desc(),
                )
            ).label("comments"),
        )
        .join(User, User.id == NodeComment.user_id)
        .group_by(NodeComment.osm_id)
        .subquery()
    )

    node_accessibility_propositions = (
        sql.select(
            NodeAccessibilityProposition.osm_id,
            func.array_agg(
                aggregate_order_by(
                    json_build_object(
                        {
                            "id": NodeAccessibilityProposition.id,
                            "user": json_build_object(
                                {
                                    "id": User.id,
                                    "email": User.email,
                                    "disabilities": User.disabilities,
                                }
                            ),
                            "accessibility": NodeAccessibilityProposition.accessibility,
                            "text": NodeAccessibilityProposition.text,
                            "created_at": NodeAccessibilityProposition.created_at,
                        }
                    ),
                    NodeComment.created_at.desc(),
                )
            ).label("accessibility_propositions"),
        )
        .join(User, User.id == NodeAccessibilityProposition.user_id)
        .group_by(NodeAccessibilityProposition.osm_id)
        .subquery()
    )

    query = (
        sql.select(
            func.coalesce(
                Node.osm_id,
                node_comments.c.osm_id,
                node_accessibility_propositions.c.osm_id,
            ).label("osm_id"),
            Node.accessibility,
            func.coalesce(node_comments.c.comments, empty_array(JSON)).label(
                "comments"
            ),
            func.coalesce(
                node_accessibility_propositions.c.accessibility_propositions,
                empty_array(JSON),
            ).label("accessibility_propositions"),
        )
        .join(
            node_comments,
            Node.osm_id == node_comments.c.osm_id,
            full=True,
        )
        .join(
            node_accessibility_propositions,
            Node.osm_id == node_accessibility_propositions.c.osm_id,
            full=True,
        )
    )

    cursor_result = await db_conn.execute(query)
    results = cursor_result.mappings().all()
    return TypeAdapter(list[NodeSchema]).validate_python(results)


async def create_accessibility_proposition(
    db_conn: AsyncConnection,
    osm_id: str,
    user_id: int,
    text: str,
    accessibility: NodeAccessibility,
) -> int:
    query = (
        sql.insert(NodeAccessibilityProposition)
        .values(
            osm_id=osm_id,
            user_id=user_id,
            text=text,
            accessibility=accessibility,
        )
        .returning(NodeAccessibilityProposition.id)
    )
    cursor_result = await db_conn.execute(query)
    await db_conn.commit()
    return cursor_result.scalar_one()


async def delete_accessibility_proposition(
    db_conn: AsyncConnection,
    user_id: int,
    proposition_id: int,
) -> None:
    query = sql.delete(NodeAccessibilityProposition).where(
        NodeAccessibilityProposition.id == proposition_id,
        NodeAccessibilityProposition.user_id == user_id,
    )
    await db_conn.execute(query)
    await db_conn.commit()
