import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Friend } from '../App';

interface AiRecommendationsProps {
  friend: Friend;
  theme: 'city' | 'garden' | 'desert';
  onSuggestionClick?: (suggestion: string) => void;
}

interface Suggestion {
  suggestion: string;
  taskTitle: string;
}

export function AiRecommendations({ friend, theme, onSuggestionClick }: AiRecommendationsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedTasks = friend.tasks.filter(t => t.completed).map(t => t.title);
  const pendingTasks = friend.tasks.filter(t => !t.completed).map(t => t.title);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3001/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friendName: friend.name,
          relationshipStrength: friend.relationshipStrength,
          category: friend.category,
          completedTasks,
          pendingTasks,
          relationshipNature: friend.relationshipNature || null,
          bucketList: (friend.bucketList || []).map(b => b.title),
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      // Handle both old string[] format and new object[] format
      const parsed = data.suggestions.map((s: string | Suggestion) =>
        typeof s === 'string' ? { suggestion: s, taskTitle: s } : s
      );
      setSuggestions(parsed);
    } catch {
      setError('Could not load suggestions. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on mount
  useEffect(() => {
    fetchRecommendations();
  }, [friend.id]);

  // Theme colors
  const styles = theme === 'city' ? {
    text: 'text-[#2E5C8A]/70',
    textHover: 'hover:text-[#2E5C8A]',
    itemBg: 'bg-[#E0F2F7]/50',
    itemHover: 'hover:bg-[#E0F2F7]',
    itemBorder: 'border-[#B0D8E8]/50',
    itemText: 'text-[#2E5C8A]/80',
    accent: '#4A90E2',
    refreshText: 'text-[#87CEEB]',
  } : theme === 'desert' ? {
    text: 'text-[#8B7355]',
    textHover: 'hover:text-[#5D4E37]',
    itemBg: 'bg-[#FFF8E7]/50',
    itemHover: 'hover:bg-[#FFF8E7]',
    itemBorder: 'border-[#DEB887]/50',
    itemText: 'text-[#5D4E37]/80',
    accent: '#4A7C59',
    refreshText: 'text-[#8B7355]',
  } : {
    text: 'text-[#7C6F5B]',
    textHover: 'hover:text-[#5D4E37]',
    itemBg: 'bg-[#F5F1E8]/50',
    itemHover: 'hover:bg-[#F5F1E8]',
    itemBorder: 'border-[#D4C5B0]/50',
    itemText: 'text-[#5D4E37]/80',
    accent: '#6B8E4E',
    refreshText: 'text-[#7C6F5B]',
  };

  return (
    <div className="py-1">
      <div className="flex items-center justify-between mb-2">
        <p className={`text-xs font-medium ${styles.text}`}>Lumilink Recommendations</p>
        {suggestions.length > 0 && !loading && (
          <button
            onClick={fetchRecommendations}
            className={`${styles.refreshText} hover:opacity-70 transition-opacity`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: styles.accent }} />
          <span className={`text-xs ${styles.text}`}>Getting ideas...</span>
        </div>
      )}

      {error && (
        <div className="py-2">
          <p className="text-xs text-red-400 mb-1">{error}</p>
          <button
            onClick={fetchRecommendations}
            className={`text-xs ${styles.refreshText} hover:opacity-70`}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="space-y-1.5">
          {suggestions.map((item, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick?.(item.taskTitle)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs ${styles.itemText} ${styles.itemBg} ${styles.itemHover} border ${styles.itemBorder} transition-all cursor-pointer`}
            >
              {item.suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}