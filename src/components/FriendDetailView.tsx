import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Camera, ListChecks, Compass, Heart, Plus } from 'lucide-react';
import { Friend, RelationshipNature, Task, BucketListItem } from '../App';
import { Flower } from './Flower';
import { DesertPlant } from './DesertPlant';
import { AiRecommendations } from './AiRecommendations';
import { RelationshipInfoTab } from './RelationshipInfoTab';

interface FriendDetailViewProps {
  friend: Friend;
  onBack: () => void;
  theme?: 'garden' | 'desert';
  onToggleTask: (friendId: string, taskId: string) => void;
  onUpdateRelationshipNature: (friendId: string, nature: RelationshipNature) => void;
  onToggleBucketItem: (friendId: string, itemId: string) => void;
  onAddTaskToFriend: (friendId: string, task: Task) => void;
  onCreateTaskFromRecommendation: (title: string, friendId: string) => void;
}

export function FriendDetailView({ friend, onBack, theme = 'garden', onToggleTask, onUpdateRelationshipNature, onToggleBucketItem, onAddTaskToFriend, onCreateTaskFromRecommendation }: FriendDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'photos' | 'bucket' | 'about'>('tasks');
  const tasks = friend.tasks;
  const bucketList = friend.bucketList || [];

  const toggleTask = (taskId: string) => {
    onToggleTask(friend.id, taskId);
  };

  const handleRecommendationClick = (suggestion: string) => {
    onCreateTaskFromRecommendation(suggestion, friend.id);
  };

  // Theme-specific colors
  const isDesert = theme === 'desert';
  const headerGradient = isDesert
    ? 'from-[#DEB887] to-[#D2B48C]'
    : 'from-[#8B7355] to-[#6B5744]';
  const buttonBg = isDesert
    ? 'from-[#4A7C59] to-[#5A9B6F]'
    : 'from-[#6B8E4E] to-[#5A7B3E]';
  const backText = isDesert ? 'Back to Oasis' : 'Back to Garden';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with back button */}
      <div className={`bg-gradient-to-br ${headerGradient} px-6 pt-8 pb-4 shadow-lg`}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#F5F1E8] hover:text-white transition-colors mb-3 bg-black/20 pl-3 pr-4 py-1.5 rounded-full -ml-3"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{backText}</span>
        </button>
        <h1 className="text-2xl text-[#F5F1E8]">{friend.name}</h1>

        {/* Plant/Flower and progress bar container */}
        <div className="mt-3 flex items-center gap-3">
          {/* Small plant/flower display */}
          <div className="flex-shrink-0">
            {isDesert ? (
              <DesertPlant
                color={friend.color}
                height={friend.height * 0.35}
                relationshipStrength={friend.relationshipStrength}
                showShadow={false}
              />
            ) : (
              <Flower
                color={friend.color}
                height={friend.height * 0.35}
                relationshipStrength={friend.relationshipStrength}
              />
            )}
          </div>

          {/* Progress bar */}
          <div className="flex-1 flex items-center gap-3">
            <div className={`flex-1 h-3 ${isDesert ? 'bg-[#C9AE8F]' : 'bg-[#5A4735]'} rounded-full overflow-hidden shadow-inner`}>
              <div
                className="h-full rounded-full transition-all shadow-lg"
                style={{
                  width: `${friend.relationshipStrength}%`,
                  background: `linear-gradient(90deg, ${friend.color} 0%, ${friend.color}dd 100%)`,
                }}
              />
            </div>
            <span className={`text-sm text-[#F5F1E8] font-medium px-2 py-1 ${isDesert ? 'bg-[#C9AE8F]/50' : 'bg-[#5A4735]/50'} rounded-full`}>
              {friend.relationshipStrength}%
            </span>
          </div>
        </div>

        {/* Relationship status indicator */}
        <div className="mt-2 text-xs text-[#F5F1E8]/80">
          {isDesert ? (
            <>
              {friend.relationshipStrength >= 80 && 'Thriving relationship'}
              {friend.relationshipStrength >= 60 && friend.relationshipStrength < 80 && 'Needs attention to stay strong'}
              {friend.relationshipStrength >= 40 && friend.relationshipStrength < 60 && 'Growing but needs care'}
              {friend.relationshipStrength < 40 && 'Continue growing relationship'}
            </>
          ) : (
            <>
              {friend.relationshipStrength >= 80 && 'Thriving relationship'}
              {friend.relationshipStrength >= 60 && friend.relationshipStrength < 80 && 'Needs attention to stay strong'}
              {friend.relationshipStrength >= 40 && friend.relationshipStrength < 60 && 'Growing but needs care'}
              {friend.relationshipStrength < 40 && 'Continue growing relationship'}
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl transition-all ${
              activeTab === 'tasks'
                ? `bg-gradient-to-br ${buttonBg} text-white shadow-lg`
                : 'bg-white text-[#5D4E37] border-2 border-[#D4C5B0]'
            }`}
          >
            <ListChecks className="w-5 h-5" />
            <span className="text-sm font-medium">Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl transition-all ${
              activeTab === 'photos'
                ? `bg-gradient-to-br ${buttonBg} text-white shadow-lg`
                : 'bg-white text-[#5D4E37] border-2 border-[#D4C5B0]'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span className="text-sm font-medium">Photos</span>
          </button>

          <button
            onClick={() => setActiveTab('bucket')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl transition-all ${
              activeTab === 'bucket'
                ? `bg-gradient-to-br ${buttonBg} text-white shadow-lg`
                : 'bg-white text-[#5D4E37] border-2 border-[#D4C5B0]'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-sm font-medium">Bucket List</span>
          </button>
        </div>

        {/* About Button - Full Width Below */}
        <button
          onClick={() => setActiveTab('about')}
          className={`w-full flex items-center justify-center gap-1.5 py-3 rounded-xl transition-all mt-2 ${
            activeTab === 'about'
              ? `bg-gradient-to-br ${buttonBg} text-white shadow-lg`
              : 'bg-white text-[#5D4E37] border-2 border-[#D4C5B0]'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-sm font-medium">About</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6 space-y-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Tasks Section */}
        {activeTab === 'tasks' && (
          <>
            <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-[#D4C5B0]">
              <h2 className="text-xl text-[#5D4E37] mb-4">Tasks & To-Dos</h2>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F1E8] hover:bg-[#EDE7DB] transition-colors cursor-pointer"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-[#6B8E4E] flex-shrink-0" />
                    ) : (
                      <Circle className="w-6 h-6 text-[#A0937D] flex-shrink-0" />
                    )}
                    <span
                      className={`flex-1 ${
                        task.completed
                          ? 'text-[#7C6F5B] line-through'
                          : 'text-[#5D4E37]'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>

              {tasks.length === 0 && (
                <p className="text-[#7C6F5B] text-center py-4">
                  No tasks yet. Add some to strengthen your friendship!
                </p>
              )}
            </div>

            {/* Lumilink Recommendations */}
            <AiRecommendations friend={friend} theme={isDesert ? 'desert' : 'garden'} onSuggestionClick={handleRecommendationClick} />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 text-center shadow-lg border-2 border-[#D4C5B0]">
                <div className="text-3xl mb-1" style={{ color: friend.color }}>
                  {tasks.filter(t => t.completed).length}
                </div>
                <div className="text-sm text-[#7C6F5B]">Completed</div>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-lg border-2 border-[#D4C5B0]">
                <div className="text-3xl text-[#5D4E37] mb-1">
                  {tasks.filter(t => !t.completed).length}
                </div>
                <div className="text-sm text-[#7C6F5B]">Pending</div>
              </div>
            </div>
          </>
        )}

        {/* Photo Wall Section */}
        {activeTab === 'photos' && (
          <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-[#D4C5B0]">
            <h2 className="text-xl text-[#5D4E37] mb-4 text-center">Photo Wall</h2>
            <div className="text-center py-8">
              <Camera className="w-16 h-16 text-[#A0937D] mx-auto mb-4" />
              <p className="text-[#7C6F5B] mb-4">
                No photos yet. Start building your memory wall together!
              </p>
              <button className="bg-gradient-to-br from-[#6B8E4E] to-[#5A7B3E] text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
                Add Photo
              </button>
            </div>
          </div>
        )}

        {/* Bucket List Section */}
        {activeTab === 'bucket' && (
          <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-[#D4C5B0]">
            <h2 className="text-xl text-[#5D4E37] mb-4">Bucket List</h2>
            {bucketList.length > 0 ? (
              <div className="space-y-3">
                {bucketList.map((item: BucketListItem) => (
                  <div
                    key={item.id}
                    onClick={() => onToggleBucketItem(friend.id, item.id)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F1E8] hover:bg-[#EDE7DB] transition-colors cursor-pointer"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-[#6B8E4E] flex-shrink-0" />
                    ) : (
                      <Circle className="w-6 h-6 text-[#A0937D] flex-shrink-0" />
                    )}
                    <span className={`flex-1 ${item.completed ? 'text-[#7C6F5B] line-through' : 'text-[#5D4E37]'}`}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Compass className="w-16 h-16 text-[#A0937D] mx-auto mb-4" />
                <p className="text-[#7C6F5B] mb-4">
                  No bucket list items yet. Start dreaming up adventures!
                </p>
              </div>
            )}
            <button className={`mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-br ${buttonBg} text-white py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95`}>
              <Plus className="w-4 h-4" />
              Add to Bucket List
            </button>
          </div>
        )}

        {/* About / Relationship Info Section */}
        {activeTab === 'about' && (
          <RelationshipInfoTab
            friend={friend}
            theme={isDesert ? 'desert' : 'garden'}
            onUpdateRelationshipNature={onUpdateRelationshipNature}
          />
        )}
      </div>
    </div>
  );
}