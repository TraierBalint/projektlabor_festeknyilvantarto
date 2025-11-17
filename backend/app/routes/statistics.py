from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models
from app.schemas.order import OrderStatsResponse
from datetime import date, datetime, timedelta
from typing import Optional

router = APIRouter(prefix="/stats", tags=["Statistics"])


@router.get("/", response_model=OrderStatsResponse)
def get_stats(
    interval: str = Query("daily", regex="^(daily|weekly|monthly|yearly)$"),
    start: Optional[date] = None,
    end: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Return order counts and revenue aggregated by the requested interval.

    interval: one of 'daily', 'weekly', 'monthly', 'yearly'
    start/end: optional date range (defaults to last 30 days)
    """

    # Default range: last 30 days
    today = date.today()
    if not end:
        end = today
    if not start:
        start = end - timedelta(days=30)

    # Convert dates to datetimes covering the full days
    start_dt = datetime.combine(start, datetime.min.time())
    end_dt = datetime.combine(end, datetime.max.time())

    # Choose SQL expression for grouping label
    if interval == "daily":
        label_expr = func.strftime('%Y-%m-%d', models.Order.created_at)
    elif interval == "weekly":
        label_expr = func.strftime('%Y-%W', models.Order.created_at)
    elif interval == "monthly":
        label_expr = func.strftime('%Y-%m', models.Order.created_at)
    else:  # yearly
        label_expr = func.strftime('%Y', models.Order.created_at)

    # Build query: period label, order count, revenue sum
    query = (
        db.query(
            label_expr.label('period'),
            func.count(models.Order.order_id).label('order_count'),
            func.coalesce(func.sum(models.Order.total_price), 0).label('revenue'),
        )
        .filter(models.Order.created_at.between(start_dt, end_dt))
        .group_by('period')
        .order_by('period')
    )

    results = query.all()

    data = [
        {"period": r.period, "orders": int(r.order_count), "revenue": float(r.revenue or 0)}
        for r in results
    ]

    return {"interval": interval, "start": start_dt, "end": end_dt, "data": data}
