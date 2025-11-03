from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .song_similarity import Song as SongClass, cosine_similarity

app = FastAPI(title="MelodyMatchr API",
              description="Simple endpoints for computing song similarity and matching",
              version="0.1")


class SongModel(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    artist: Optional[str] = None
    features: List[float]


class SimilarityRequest(BaseModel):
    song1: SongModel
    song2: SongModel


class MatchRequest(BaseModel):
    target: SongModel
    candidates: List[SongModel]
    top_k: Optional[int] = 5


def to_internal_song(m: SongModel) -> SongClass:
    return SongClass(song_id=m.id, name=m.name or "", artist=m.artist or "", features=m.features)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/similarity")
async def similarity(req: SimilarityRequest):
    s1 = to_internal_song(req.song1)
    s2 = to_internal_song(req.song2)
    sim = cosine_similarity(s1, s2).compute()
    return {"similarity": sim}


@app.post("/match")
async def match(req: MatchRequest):
    target = to_internal_song(req.target)
    candidates = [to_internal_song(c) for c in req.candidates]

    scored = []
    for cand in candidates:
        score = cosine_similarity(target, cand).compute()
        scored.append({"id": cand.id, "name": cand.name, "artist": cand.artist, "similarity": score})

    # sort descending by similarity
    scored.sort(key=lambda x: x["similarity"], reverse=True)

    top_k = max(1, int(req.top_k or 5))
    return {"matches": scored[:top_k]}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("melodymatchr.api.app:app", host="127.0.0.1", port=8000, log_level="info")
