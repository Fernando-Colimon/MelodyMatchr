"use client";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Song {
  id?: string;
  name?: string;
  artist?: string;
  features: number[];
}

export interface SearchResult {
  id: string;
  name: string;
  artist: string;
}

export interface SimilarityResult {
  similarity: number;
}

export interface MatchResult {
  id: string;
  name: string;
  artist: string;
  similarity: number;
}

export interface PredictionResult {
  id: string;
  name: string;
  artist: string;
  similarity: number;
}

export const api = {
  // Health check
  async checkHealth(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  },

  // Search songs by name
  async searchSongs(query: string, maxResults: number = 5): Promise<{ query: string; results: SearchResult[] }> {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, max_results: maxResults })
    });
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  },

  // Calculate similarity between two songs
  async calculateSimilarity(song1: Song, song2: Song): Promise<SimilarityResult> {
    const response = await fetch(`${API_BASE_URL}/similarity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ song1, song2 })
    });
    if (!response.ok) throw new Error('Similarity calculation failed');
    return response.json();
  },

  // Match songs against candidates
  async matchSongs(target: Song, candidates: Song[], topK: number = 5): Promise<{ matches: MatchResult[] }> {
    const response = await fetch(`${API_BASE_URL}/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, candidates, top_k: topK })
    });
    if (!response.ok) throw new Error('Match failed');
    return response.json();
  },

  // Predict similar songs based on features
  async predictSimilar(song: Song, tolerance: number = 0.1, topK: number = 5): Promise<{ predictions: PredictionResult[] }> {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ song, tolerance, top_k: topK })
    });
    if (!response.ok) throw new Error('Prediction failed');
    return response.json();
  }
};