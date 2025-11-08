'use client';

import { useState } from 'react';
import { api, SearchResult, PredictionResult } from '@/api/api_client';

console.log('API object:', api);

export default function Home() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedSong, setSelectedSong] = useState<SearchResult | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.searchSongs(query, 10);
      setSearchResults(data.results);
    } catch (err) {
      setError('Failed to search songs. Make sure the API is running.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectSong = async (song: SearchResult) => {
    setSelectedSong(song);
    setLoading(true);
    setError(null);
    
    try {
      // Create a song object with dummy features for prediction
      // In a real app, you'd fetch the actual features from your backend
      const songWithFeatures = {
        id: song.id,
        name: song.name,
        artist: song.artist,
        features: Array(9).fill(0.5) // Dummy features
      };
      
      const data = await api.predictSimilar(songWithFeatures, 0.2, 10);
      setPredictions(data.predictions);
    } catch (err) {
      setError('Failed to get predictions.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

 return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
      <main className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            MelodyMatchr
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover songs similar to your favorites
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-12">
          <div className="flex gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a song..."
              className="flex-1 px-6 py-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors"
            />
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Search Results */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Search Results
            </h2>
            <div className="space-y-3">
              {searchResults.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                  Search for a song to get started
                </p>
              ) : (
                searchResults.map((song, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSong(song)}
                    className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                      selectedSong?.id === song.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {song.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {song.artist}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Predictions */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
              Similar Songs
            </h2>
            <div className="space-y-3">
              {predictions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                  Select a song to see similar tracks
                </p>
              ) : (
                predictions.map((pred, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {pred.name}
                      </h3>
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {(pred.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {pred.artist}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}