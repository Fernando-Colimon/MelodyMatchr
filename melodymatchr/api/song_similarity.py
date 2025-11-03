

import math
from data_structures import *
import heapq


class Song:

    def __init__(self, song_id, name, artist, features):
        self.id = song_id
        self.name = name
        self.artist = artist
        self.features = features

    def __repr__(self):
        return f"Song('{self.name}' by {self.artist})"


class cosine_similarity:
    def __init__(self, song1, song2):
        self.song1 = song1
        self.song2 = song2

    def compute(self):
        dot_product = sum(a * b for a, b in zip(self.song1.features, self.song2.features))
        magnitude1 = math.sqrt(sum(a ** 2 for a in self.song1.features))
        magnitude2 = math.sqrt(sum(b ** 2 for b in self.song2.features))

        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0

        return dot_product / (magnitude1 * magnitude2)

class SongMatcher:
    