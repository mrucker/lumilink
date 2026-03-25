import { useState } from 'react';
import { Heart, Edit3, Check, X } from 'lucide-react';
import { Friend, RelationshipNature } from '../App';

interface RelationshipInfoTabProps {
  friend: Friend;
  theme: 'city' | 'garden' | 'desert';
  onUpdateRelationshipNature: (friendId: string, nature: RelationshipNature) => void;
}

const TYPE_LABELS: Record<RelationshipNature['type'], string> = {
  'school-friend': 'School Friend',
  'childhood-friend': 'Childhood Friend',
  'work-colleague': 'Work Colleague',
  'immediate-family': 'Immediate Family',
  'extended-family': 'Extended Family',
  'neighbor': 'Neighbor',
  'online-friend': 'Online Friend',
  'hobby-friend': 'Hobby/Activity Friend',
  'other': 'Other',
};

const COMM_LABELS: Record<RelationshipNature['communicationStyle'], string> = {
  'in-person': 'In Person',
  'texting': 'Texting',
  'calls': 'Phone/Video Calls',
  'social-media': 'Social Media',
  'mixed': 'Mixed',
};

const DEFAULT_NATURE: RelationshipNature = {
  type: 'other',
  howMet: '',
  sharedInterests: [],
  communicationStyle: 'mixed',
};

export function RelationshipInfoTab({ friend, theme, onUpdateRelationshipNature }: RelationshipInfoTabProps) {
  const nature = friend.relationshipNature || DEFAULT_NATURE;
  const [editing, setEditing] = useState(!friend.relationshipNature);
  const [draft, setDraft] = useState<RelationshipNature>({ ...nature });
  const [newInterest, setNewInterest] = useState('');

  const styles = theme === 'city' ? {
    card: 'bg-white border-2 border-[#B0D8E8]',
    label: 'text-[#2E5C8A]',
    text: 'text-[#2E5C8A]',
    textLight: 'text-[#87CEEB]',
    tagBg: 'bg-[#E0F2F7]',
    tagText: 'text-[#2E5C8A]',
    inputBorder: 'border-[#B0D8E8]',
    button: 'bg-gradient-to-br from-[#4A90E2] to-[#2E5C8A]',
    selectedBg: 'bg-[#4A90E2] text-white',
    unselectedBg: 'bg-[#E0F2F7] text-[#2E5C8A]',
    accent: '#4A90E2',
  } : theme === 'desert' ? {
    card: 'bg-white border-2 border-[#DEB887]',
    label: 'text-[#5D4E37]',
    text: 'text-[#5D4E37]',
    textLight: 'text-[#8B7355]',
    tagBg: 'bg-[#FFF8E7]',
    tagText: 'text-[#5D4E37]',
    inputBorder: 'border-[#DEB887]',
    button: 'bg-gradient-to-br from-[#4A7C59] to-[#5A9B6F]',
    selectedBg: 'bg-[#4A7C59] text-white',
    unselectedBg: 'bg-[#FFF8E7] text-[#5D4E37]',
    accent: '#4A7C59',
  } : {
    card: 'bg-white border-2 border-[#D4C5B0]',
    label: 'text-[#5D4E37]',
    text: 'text-[#5D4E37]',
    textLight: 'text-[#7C6F5B]',
    tagBg: 'bg-[#F5F1E8]',
    tagText: 'text-[#5D4E37]',
    inputBorder: 'border-[#D4C5B0]',
    button: 'bg-gradient-to-br from-[#6B8E4E] to-[#5A7B3E]',
    selectedBg: 'bg-[#6B8E4E] text-white',
    unselectedBg: 'bg-[#F5F1E8] text-[#5D4E37]',
    accent: '#6B8E4E',
  };

  const handleSave = () => {
    onUpdateRelationshipNature(friend.id, draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft({ ...nature });
    setEditing(false);
  };

  const addInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed && !draft.sharedInterests.includes(trimmed)) {
      setDraft({ ...draft, sharedInterests: [...draft.sharedInterests, trimmed] });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setDraft({ ...draft, sharedInterests: draft.sharedInterests.filter(i => i !== interest) });
  };

  if (!editing) {
    return (
      <div className={`rounded-2xl p-5 shadow-lg ${styles.card}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5" style={{ color: styles.accent }} />
            <h2 className={`text-xl ${styles.label}`}>About This Relationship</h2>
          </div>
          <button
            onClick={() => { setDraft({ ...nature }); setEditing(true); }}
            className={`p-2 rounded-lg ${styles.tagBg} hover:opacity-80 transition-opacity`}
          >
            <Edit3 className="w-4 h-4" style={{ color: styles.accent }} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${styles.textLight}`}>Relationship Type</p>
            <p className={`text-sm ${styles.text}`}>{TYPE_LABELS[nature.type]}</p>
          </div>

          <div>
            <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${styles.textLight}`}>How You Met</p>
            <p className={`text-sm ${styles.text}`}>{nature.howMet || 'Not specified'}</p>
          </div>

          {nature.friendshipSince && (
            <div>
              <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${styles.textLight}`}>Friends Since</p>
              <p className={`text-sm ${styles.text}`}>{nature.friendshipSince}</p>
            </div>
          )}

          <div>
            <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${styles.textLight}`}>Communication Style</p>
            <p className={`text-sm ${styles.text}`}>{COMM_LABELS[nature.communicationStyle]}</p>
          </div>

          <div>
            <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${styles.textLight}`}>Shared Interests</p>
            {nature.sharedInterests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {nature.sharedInterests.map((interest) => (
                  <span key={interest} className={`px-3 py-1 rounded-full text-xs font-medium ${styles.tagBg} ${styles.tagText}`}>
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${styles.textLight}`}>None specified</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Editing mode
  return (
    <div className={`rounded-2xl p-5 shadow-lg ${styles.card}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg ${styles.label}`}>Edit Relationship Info</h2>
        <div className="flex gap-2">
          <button onClick={handleSave} className={`p-2 rounded-lg ${styles.button} text-white`}>
            <Check className="w-4 h-4" />
          </button>
          <button onClick={handleCancel} className={`p-2 rounded-lg ${styles.tagBg}`}>
            <X className="w-4 h-4" style={{ color: styles.accent }} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Relationship Type */}
        <div>
          <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${styles.textLight}`}>Relationship Type</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TYPE_LABELS) as RelationshipNature['type'][]).map((type) => (
              <button
                key={type}
                onClick={() => setDraft({ ...draft, type })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  draft.type === type ? styles.selectedBg : styles.unselectedBg
                }`}
              >
                {TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* How Met */}
        <div>
          <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${styles.textLight}`}>How You Met</p>
          <input
            type="text"
            value={draft.howMet}
            onChange={(e) => setDraft({ ...draft, howMet: e.target.value })}
            placeholder="e.g. College roommate, met at a party..."
            className={`w-full p-2.5 rounded-lg border ${styles.inputBorder} ${styles.text} text-sm`}
          />
        </div>

        {/* Friends Since */}
        <div>
          <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${styles.textLight}`}>Friends Since</p>
          <input
            type="text"
            value={draft.friendshipSince || ''}
            onChange={(e) => setDraft({ ...draft, friendshipSince: e.target.value })}
            placeholder="e.g. 2020, Always, High school..."
            className={`w-full p-2.5 rounded-lg border ${styles.inputBorder} ${styles.text} text-sm`}
          />
        </div>

        {/* Communication Style */}
        <div>
          <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${styles.textLight}`}>Communication Style</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(COMM_LABELS) as RelationshipNature['communicationStyle'][]).map((style) => (
              <button
                key={style}
                onClick={() => setDraft({ ...draft, communicationStyle: style })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  draft.communicationStyle === style ? styles.selectedBg : styles.unselectedBg
                }`}
              >
                {COMM_LABELS[style]}
              </button>
            ))}
          </div>
        </div>

        {/* Shared Interests */}
        <div>
          <p className={`text-xs font-medium uppercase tracking-wide mb-2 ${styles.textLight}`}>Shared Interests</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {draft.sharedInterests.map((interest) => (
              <span
                key={interest}
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${styles.tagBg} ${styles.tagText}`}
              >
                {interest}
                <button onClick={() => removeInterest(interest)} className="hover:opacity-60">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addInterest()}
              placeholder="Add an interest..."
              className={`flex-1 p-2 rounded-lg border ${styles.inputBorder} ${styles.text} text-sm`}
            />
            <button
              onClick={addInterest}
              className={`px-3 py-2 rounded-lg ${styles.button} text-white text-sm`}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}