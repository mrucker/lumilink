import { useState, useEffect } from 'react';
import { RefreshCw, ArrowRight, Users } from 'lucide-react';
import { Friend } from '../App';
import { askLlm, extractJsonArray } from '../api/llm';

interface AiRecommendationsProps {
  friend: Friend;
  allFriends: Friend[];
  theme: 'city' | 'garden' | 'desert';
  onSuggestionClick?: (suggestion: string, isGroup?: boolean, groupFriendIds?: string[]) => void;
}

interface Suggestion {
  suggestion: string;
  taskTitle: string;
  isGroup?: boolean;
  groupFriendIds?: string[];
  groupFriendNames?: string[];
}

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(x => typeof x === 'string');

// Validates one item from the model's reply. Items missing the text fields are dropped rather
// than rendered. A group suggestion keeps only friend IDs that actually exist, and falls back to
// an individual suggestion if fewer than two remain.
function toSuggestion(item: unknown, knownIds: Set<string>): Suggestion | null {
  if (typeof item !== 'object' || item === null) return null;
  const { suggestion, taskTitle, isGroup, groupFriendIds, groupFriendNames } = item as Record<string, unknown>;
  if (typeof suggestion !== 'string' || typeof taskTitle !== 'string') return null;

  const ids = isGroup === true && isStringArray(groupFriendIds)
    ? groupFriendIds.filter(id => knownIds.has(id))
    : [];
  if (ids.length < 2) return { suggestion, taskTitle, isGroup: false };

  return {
    suggestion,
    taskTitle,
    isGroup: true,
    groupFriendIds: ids,
    groupFriendNames: isStringArray(groupFriendNames) ? groupFriendNames : undefined,
  };
}

export function AiRecommendations({ friend, allFriends, theme, onSuggestionClick }: AiRecommendationsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completedTasks = friend.tasks.filter(t => t.completed).map(t => t.title);
  const pendingTasks = friend.tasks.filter(t => !t.completed).map(t => t.title);

  // Find friends with shared interests for group task suggestions
  const otherFriends = allFriends.filter(f => f.id !== friend.id);
  const friendsWithSharedInterests = otherFriends
    .map(f => {
      const shared = (f.relationshipNature?.sharedInterests || [])
        .filter(i => (friend.relationshipNature?.sharedInterests || []).includes(i));
      return { id: f.id, name: f.name, sharedInterests: shared, bucketList: f.bucketList || [] };
    })
    .filter(f => f.sharedInterests.length > 0)
    .slice(0, 5); // limit context size

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const groupContext = friendsWithSharedInterests.length > 0
        ? `\n\nOther friends who share interests with ${friend.name}:\n${friendsWithSharedInterests.map(f =>
            `- ${f.name} (ID: ${f.id}): shared interests: ${f.sharedInterests.join(', ')}${f.bucketList.length > 0 ? `, bucket list: ${f.bucketList.map(b => b.title).join(', ')}` : ''}`
          ).join('\n')}`
        : '';

      const prompt = `You are a friendship coach in a social app. Given the following information about a relationship, suggest 3 specific, actionable ways to strengthen it.

Friend: ${friend.name} (ID: ${friend.id})
Relationship Strength: ${friend.relationshipStrength}/100
Category: ${friend.category}
${friend.relationshipNature ? `Relationship Nature: ${JSON.stringify(friend.relationshipNature)}` : ''}
${completedTasks.length > 0 ? `Completed Tasks: ${completedTasks.join(', ')}` : ''}
${pendingTasks.length > 0 ? `Pending Tasks: ${pendingTasks.join(', ')}` : ''}
${(friend.bucketList || []).length > 0 ? `Bucket List: ${friend.bucketList!.map(b => b.title).join(', ')}` : ''}${groupContext}

IMPORTANT: Generate exactly 3 suggestions. ${friendsWithSharedInterests.length > 0 ? 'Make exactly 1 of the 3 a GROUP activity that includes ' + friend.name + ' plus 1-2 of the other friends listed above, based on their shared interests or bucket lists. For the group suggestion, include "isGroup": true and "groupFriendIds" as an array of friend IDs (include ' + friend.id + ' for ' + friend.name + ' plus the other friends). Also include "groupFriendNames" as an array of their names.' : 'All 3 should be individual tasks with ' + friend.name + '.'}

For individual (non-group) suggestions, set "isGroup": false and omit groupFriendIds/groupFriendNames.

Respond with ONLY a JSON array of 3 objects, each with: "suggestion" (a friendly description), "taskTitle" (a short task name), "isGroup" (boolean), and optionally "groupFriendIds" (string array) and "groupFriendNames" (string array). No other text.`;

      const raw = await askLlm(prompt);
      const knownIds = new Set(allFriends.map(f => f.id));
      const parsed = extractJsonArray(raw)
        .map(item => toSuggestion(item, knownIds))
        .filter((s): s is Suggestion => s !== null);
      if (parsed.length === 0) throw new Error('No usable suggestions');
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
    refreshText: 'text-[#2E7D9B]',
    groupBg: 'bg-purple-50/80',
    groupBorder: 'border-purple-200/60',
    groupText: 'text-purple-800/80',
    hintText: 'text-[#2E5C8A]/40',
    arrowColor: 'text-[#2E5C8A]/30',
  } : theme === 'desert' ? {
    text: 'text-[#6B5A42]',
    textHover: 'hover:text-[#5D4E37]',
    itemBg: 'bg-[#FFF8E7]/50',
    itemHover: 'hover:bg-[#FFF8E7]',
    itemBorder: 'border-[#DEB887]/50',
    itemText: 'text-[#5D4E37]/80',
    accent: '#4A7C59',
    refreshText: 'text-[#6B5A42]',
    groupBg: 'bg-purple-50/80',
    groupBorder: 'border-purple-200/60',
    groupText: 'text-purple-800/80',
    hintText: 'text-[#5D4E37]/40',
    arrowColor: 'text-[#5D4E37]/30',
  } : {
    text: 'text-[#7C6F5B]',
    textHover: 'hover:text-[#5D4E37]',
    itemBg: 'bg-[#F5F1E8]/50',
    itemHover: 'hover:bg-[#F5F1E8]',
    itemBorder: 'border-[#D4C5B0]/50',
    itemText: 'text-[#5D4E37]/80',
    accent: '#6B8E4E',
    refreshText: 'text-[#7C6F5B]',
    groupBg: 'bg-purple-50/80',
    groupBorder: 'border-purple-200/60',
    groupText: 'text-purple-800/80',
    hintText: 'text-[#5D4E37]/40',
    arrowColor: 'text-[#5D4E37]/30',
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
          <p className="text-xs text-red-600 mb-1">{error}</p>
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
              onClick={() => onSuggestionClick?.(item.taskTitle, item.isGroup, item.groupFriendIds)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs shadow-sm transition-all cursor-pointer flex items-start gap-2 group ${
                item.isGroup
                  ? `${styles.groupBg} ${styles.groupText} border ${styles.groupBorder} hover:shadow-md`
                  : `${styles.itemText} ${styles.itemBg} ${styles.itemHover} border ${styles.itemBorder}`
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {item.isGroup && <Users className="w-3 h-3 text-purple-500 flex-shrink-0" />}
                  <span className="font-medium">{item.suggestion}</span>
                </div>
                {item.isGroup && item.groupFriendNames && (
                  <p className="text-[10px] mt-0.5 opacity-70">
                    With {item.groupFriendNames.join(', ')}
                  </p>
                )}
              </div>
              <ArrowRight className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${styles.arrowColor} group-hover:translate-x-0.5 transition-transform`} />
            </button>
          ))}
          <p className={`text-[10px] text-center mt-1 ${styles.hintText}`}>
            Tap a recommendation to create a task request
          </p>
        </div>
      )}
    </div>
  );
}
