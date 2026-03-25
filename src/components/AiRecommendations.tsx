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
      const prompt = `You are a friendship coach. Given the following information about a relationship, suggest 3 specific, actionable ways to strengthen it.

Friend: ${friend.name}
Relationship Strength: ${friend.relationshipStrength}/100
Category: ${friend.category}
${friend.relationshipNature ? `Relationship Nature: ${friend.relationshipNature}` : ''}
${completedTasks.length > 0 ? `Completed Tasks: ${completedTasks.join(', ')}` : ''}
${pendingTasks.length > 0 ? `Pending Tasks: ${pendingTasks.join(', ')}` : ''}
${(friend.bucketList || []).length > 0 ? `Bucket List: ${friend.bucketList!.map(b => b.title).join(', ')}` : ''}

Respond with ONLY a JSON array of 3 objects, each with "suggestion" (a friendly description) and "taskTitle" (a short task name). No other text.`;

      const res = await fetch('https://api.digital-trails.org/api/v1/lumilink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [
            { role: 'user', content: prompt },
          ],
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      const raw = data.content[0].text;
      const text = raw.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed: Suggestion[] = JSON.parse(text);
      setSuggestions(parsed);
    } catch {
      setError('Could not load suggestions.');
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