from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .song_similarity import Song as SongClass, cosine_similarity, SongPredictor, load_songs_from_dataset
import kagglehub

dataset_path = kagglehub.dataset_download("maharshipandya/-spotify-tracks-dataset")

import math
from .data_structures import *
import heapq



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

# Search feature optional DELETE OR FIX if broken
class SearchRequest(BaseModel):
    query: str
    max_results: Optional[int] = 5

class PredictRequest(BaseModel):
    song: SongModel
    tolerance: Optional[float] = 0.1
    top_k: Optional[int] = 5



all_songs = load_songs_from_dataset(dataset_path)
search_trie = SongSearchTrie()

for song in all_songs:
    search_trie.insert(song)

song_predictor = SongPredictor(all_songs)

@app.post("/search")
async def search(req: SearchRequest):
    results = search_trie.search(req.query, max_results=req.max_results or 5)
    return {
        "query": req.query,
        "results": [
            {"id": song.id, "name": song.name, "artist": song.artist} 
            for song in results
        ]
    }

@app.post("/predict")
async def predict_similar_songs(req: PredictRequest):
    """Predict similar songs based on features"""
    target = to_internal_song(req.song)
    
    results = song_predictor.predict_similar(
        target, 
        tolerance=req.tolerance,
        top_k=req.top_k
    )
    
    return {
        "predictions": [
            {
                "id": song.id,
                "name": song.name,
                "artist": song.artist,
                "similarity": score
            }
            for score, song in results
        ]
    }


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
