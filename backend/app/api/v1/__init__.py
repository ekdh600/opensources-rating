from fastapi import APIRouter

from app.api.v1 import projects, leaderboards, categories, compare, search, scoring
from app.api.v1 import auth, predictions, seasons, trading

router = APIRouter(prefix="/api/v1")

router.include_router(projects.router)
router.include_router(leaderboards.router)
router.include_router(categories.router)
router.include_router(compare.router)
router.include_router(search.router)
router.include_router(scoring.router)
router.include_router(auth.router)
router.include_router(predictions.router)
router.include_router(seasons.router)
router.include_router(trading.router)
