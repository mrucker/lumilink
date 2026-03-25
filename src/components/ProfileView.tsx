import { Bell, Shield, ChevronDown, Brain, Target, Heart, ExternalLink, Plus, X, Check, Edit2, User } from 'lucide-react';
import { useState } from 'react';
import { Friend } from '../App';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

interface ProfileViewProps {
  theme?: 'city' | 'garden' | 'desert';
  onThemeChange?: (theme: 'city' | 'garden' | 'desert') => void;
  iconColors?: { primary: string; secondary: string };
  onIconColorsChange?: (colors: { primary: string; secondary: string }) => void;
  gardenColors?: { primary: string; secondary: string };
  cityColors?: { primary: string; secondary: string };
  desertColors?: { primary: string; secondary: string };
  onGardenColorsChange?: (colors: { primary: string; secondary: string }) => void;
  onCityColorsChange?: (colors: { primary: string; secondary: string }) => void;
  onDesertColorsChange?: (colors: { primary: string; secondary: string }) => void;
  userName?: string;
  onUserNameChange?: (name: string) => void;
  friends?: Friend[];
}

export default function ProfileView({ 
  theme = 'garden', 
  onThemeChange, 
  iconColors = { primary: '#E87EA1', secondary: '#FCD34D' }, 
  onIconColorsChange,
  gardenColors = { primary: '#E87EA1', secondary: '#FCD34D' },
  cityColors = { primary: '#4A90E2', secondary: '#FCD34D' },
  desertColors = { primary: '#6B8E4E', secondary: '#8B6F47' },
  onGardenColorsChange,
  onCityColorsChange,
  onDesertColorsChange,
  userName = 'Alex',
  onUserNameChange,
  friends = []
}: ProfileViewProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [pastNotificationsOpen, setPastNotificationsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [blockReportOpen, setBlockReportOpen] = useState(false);
  const [locationPrivacy, setLocationPrivacy] = useState(true);
  const [connectionRange, setConnectionRange] = useState(25);
  const [recommendations, setRecommendations] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>(['John Doe', 'Jane Smith']);
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [newBlockName, setNewBlockName] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [editedName, setEditedName] = useState(userName);
  const [customizingTheme, setCustomizingTheme] = useState<'city' | 'garden' | 'desert' | null>(null);

  // Avatar customization state
  const [avatarGender, setAvatarGender] = useState<'boy' | 'girl'>('girl');
  const [avatarHairstyle, setAvatarHairstyle] = useState(0);
  const [avatarShirtColor, setAvatarShirtColor] = useState('#6B8E4E');
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);

  // Color palette options
  const primaryColors = [
    '#E87EA1', '#F472B6', '#EC4899', '#FB7185', '#FDA4AF',
    '#F0ABFC', '#E879F9', '#D8B4FE', '#C084FC', '#A78BFA',
    '#FB923C', '#F97316', '#FFB347', '#FBBF24', '#FCD34D'
  ];

  const secondaryColors = [
    '#FCD34D', '#FBBF24', '#F59E0B', '#F97316', '#FB923C',
    '#A78BFA', '#C084FC', '#E879F9', '#F0ABFC', '#FDA4AF',
    '#6EE7B7', '#34D399', '#10B981', '#14B8A6', '#06B6D4'
  ];

  const [notifications] = useState<Notification[]>([
    { id: '1', title: 'New connection request', message: 'Sarah wants to connect with you', read: false, timestamp: '2 hours ago' },
    { id: '2', title: 'Task reminder', message: 'You have 5 tasks due this week', read: false, timestamp: '5 hours ago' },
    { id: '3', title: 'Weekly summary', message: 'Your wellness stats for the week', read: true, timestamp: '1 day ago' },
    { id: '4', title: 'Connection accepted', message: 'Marcus accepted your connection request', read: true, timestamp: '2 days ago' },
    { id: '5', title: 'New message', message: 'Emma sent you a message', read: true, timestamp: '3 days ago' },
  ]);

  const recentNotifications = notifications.filter(n => !n.read);
  const pastNotifications = notifications.filter(n => n.read);
  const unreadCount = recentNotifications.length;

  // Calculate stats from friends data
  const totalConnections = friends.length;
  const newConnections = friends.filter(f => f.relationshipStrength < 40).length;
  const totalTasks = friends.reduce((sum, friend) => sum + friend.tasks.filter(t => !t.completed).length, 0);
  const completedTasksThisWeek = 7; // Mock data
  const completedTasksLastWeek = 4; // Mock data
  
  const stats = [
    { number: totalConnections, label: 'Total Connections', description: 'Your network size' },
    { number: newConnections, label: 'New This Month', description: 'Recent additions' },
    { number: totalTasks, label: 'Active Tasks', description: 'Pending activities' },
  ];

  const weeklyProgress = {
    tasksCompleted: completedTasksThisWeek,
    lastWeek: completedTasksLastWeek,
    improvement: completedTasksThisWeek - completedTasksLastWeek,
    message: completedTasksThisWeek > completedTasksLastWeek 
      ? `🎉 You completed ${completedTasksThisWeek - completedTasksLastWeek} more task${completedTasksThisWeek - completedTasksLastWeek !== 1 ? 's' : ''} than last week!`
      : completedTasksThisWeek === completedTasksLastWeek
      ? `✨ You're staying consistent! Same as last week.`
      : `Keep going! Every connection counts.`
  };

  const recentActivities = [
    { activity: 'Coffee chat with Sarah', enjoyment: 5, date: '2 days ago', reflection: 'Great conversation about new projects' },
    { activity: 'Game night with Marcus & Emma', enjoyment: 5, date: '4 days ago', reflection: 'So much fun! Want to do this monthly' },
    { activity: 'Lunch with Alex', enjoyment: 4, date: '1 week ago', reflection: 'Nice catching up, felt a bit rushed' },
  ];

  const wellnessTasks = [
    { icon: Brain, count: 5, lastWeek: 7, label: 'Mental' },
    { icon: Target, count: 3, lastWeek: 2, label: 'Physical' },
    { icon: Heart, count: 4, lastWeek: 3, label: 'Social' },
  ];

  // Theme-based colors
  const themeColors = {
    primary: theme === 'city' ? '#1B3A5F' : theme === 'desert' ? '#D2691E' : '#6B8E4E',
    secondary: theme === 'city' ? '#E0F2F7' : theme === 'desert' ? '#F4A460' : '#7C6F5B',
    text: theme === 'city' ? '#1B3A5F' : theme === 'desert' ? '#8B4513' : '#5D4E37',
    textLight: theme === 'city' ? '#5A7A9F' : theme === 'desert' ? '#A0522D' : '#7C6F5B',
    accent: theme === 'city' ? '#4A90E2' : theme === 'desert' ? '#FF8C42' : '#E87EA1',
    border: theme === 'city' ? '#C5E3F6' : theme === 'desert' ? '#E8C4A0' : '#D4C5B0',
  };

  // Profile avatar icon based on theme
  const ProfileIcon = ({ size = 'large', iconTheme }: { size?: 'large' | 'small', iconTheme?: 'city' | 'garden' | 'desert' }) => {
    const scale = size === 'large' ? 1 : 0.7;
    const containerSize = size === 'large' ? '128px' : '96px';
    
    // Get the appropriate colors for the icon's theme
    const getColorsForTheme = (themeType: 'city' | 'garden' | 'desert') => {
      if (themeType === 'city') return cityColors;
      if (themeType === 'garden') return gardenColors;
      return desertColors;
    };
    
    const colors = getColorsForTheme(iconTheme || theme);
    
    if (iconTheme || theme === 'city') {
      // Match Building.tsx structure - Skyscraper style
      const buildingHeight = 80 * scale;
      const buildingWidth = 32 * scale;
      
      // Darken the primary color for accent
      const darkenColor = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const darkness = 0.7;
        return `rgb(${Math.floor(r * darkness)}, ${Math.floor(g * darkness)}, ${Math.floor(b * darkness)})`;
      };
      
      const accentColor = darkenColor(colors.primary);
      
      return (
        <div className="bg-white/20 rounded-full flex items-center justify-center" style={{ width: containerSize, height: containerSize }}>
          <div className="relative" style={{ width: `${buildingWidth}px`, height: `${buildingHeight}px` }}>
            {/* Main building body */}
            <div
              className="absolute bottom-0 w-full rounded-t shadow-xl"
              style={{
                height: `${buildingHeight}px`,
                background: `linear-gradient(to right, ${accentColor}, ${colors.primary})`,
                border: `1px solid ${accentColor}`,
                borderBottom: 'none',
              }}
            >
              {/* Windows pattern - 3x rows */}
              <div className="absolute inset-0 p-1 flex flex-col gap-1">
                {Array.from({ length: Math.floor(buildingHeight / 12) }).map((_, i) => (
                  <div key={i} className="flex gap-1 justify-around">
                    <div 
                      className="rounded-[1px]"
                      style={{
                        width: `${6 * scale}px`,
                        height: `${6 * scale}px`,
                        backgroundColor: colors.secondary,
                        boxShadow: '0 0 4px rgba(251, 191, 36, 0.6)'
                      }}
                    />
                    <div 
                      className="rounded-[1px]"
                      style={{
                        width: `${6 * scale}px`,
                        height: `${6 * scale}px`,
                        backgroundColor: colors.secondary,
                        boxShadow: '0 0 4px rgba(251, 191, 36, 0.6)'
                      }}
                    />
                    <div 
                      className="rounded-[1px]"
                      style={{
                        width: `${6 * scale}px`,
                        height: `${6 * scale}px`,
                        backgroundColor: colors.secondary,
                        boxShadow: '0 0 4px rgba(251, 191, 36, 0.6)'
                      }}
                    />
                  </div>
                ))}
              </div>
              {/* Rooftop */}
              <div
                className="absolute -top-1 left-0 right-0 h-1 rounded-t"
                style={{
                  background: accentColor,
                }}
              />
            </div>
          </div>
        </div>
      );
    } else if (iconTheme || theme === 'desert') {
      // Match DesertPlant.tsx structure - Palm tree style
      const palmHeight = 70 * scale;
      
      return (
        <div className="bg-white/20 rounded-full flex items-center justify-center" style={{ width: containerSize, height: containerSize }}>
          <div className="relative" style={{ width: '50px', height: `${palmHeight}px` }}>
            {/* Palm trunk */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
              style={{
                width: `${10 * scale}px`,
                height: `${palmHeight}px`,
                background: 'linear-gradient(to right, #8B6F47 0%, #A0826D 50%, #8B6F47 100%)',
                borderRadius: '5px',
                boxShadow: 'inset -1px 0 3px rgba(0,0,0,0.3)',
              }}
            >
              {/* Trunk texture lines */}
              {Array.from({ length: Math.floor(palmHeight / 20) }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-px bg-black/20"
                  style={{ top: `${i * 20}px` }}
                />
              ))}
            </div>

            {/* Palm fronds */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              {[
                { angle: -70, length: 38 * scale },
                { angle: -50, length: 42 * scale },
                { angle: -30, length: 45 * scale },
                { angle: -10, length: 48 * scale },
                { angle: 10, length: 48 * scale },
                { angle: 30, length: 45 * scale },
                { angle: 50, length: 42 * scale },
                { angle: 70, length: 38 * scale },
              ].map((frond, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: '0',
                    top: '4px',
                    transformOrigin: '0 0',
                    transform: `rotate(${frond.angle}deg)`,
                    zIndex: i < 4 ? 1 : 3,
                  }}
                >
                  <div
                    style={{
                      width: `${2 * scale}px`,
                      height: `${frond.length}px`,
                      background: `linear-gradient(to bottom, ${colors.primary}, #4A7C59)`,
                      borderRadius: '1px',
                      position: 'relative',
                    }}
                  >
                    {/* Leaflets along the stem */}
                    {Array.from({ length: 10 }).map((_, leafIdx) => {
                      const leafY = (leafIdx + 1) * 4 * scale;
                      const leafWidth = (10 - leafIdx * 0.6) * scale;
                      return (
                        <div key={leafIdx}>
                          <div
                            className="absolute"
                            style={{
                              width: `${leafWidth}px`,
                              height: `${2 * scale}px`,
                              background: `linear-gradient(to left, ${colors.primary}, transparent)`,
                              top: `${leafY}px`,
                              left: '1px',
                              transformOrigin: 'right center',
                              transform: 'rotate(-40deg)',
                              borderRadius: '0 2px 2px 0',
                            }}
                          />
                          <div
                            className="absolute"
                            style={{
                              width: `${leafWidth}px`,
                              height: `${2 * scale}px`,
                              background: `linear-gradient(to right, ${colors.primary}, transparent)`,
                              top: `${leafY}px`,
                              right: '1px',
                              transformOrigin: 'left center',
                              transform: 'rotate(40deg)',
                              borderRadius: '2px 0 0 2px',
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Coconuts cluster at top */}
            <div className="absolute left-1/2 -translate-x-1/2 flex gap-0.5" style={{ top: '-2px', zIndex: 2 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: `${10 * scale}px`,
                    height: `${12 * scale}px`,
                    background: `linear-gradient(135deg, ${colors.secondary} 0%, #6B5435 100%)`,
                    boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.3)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      );
    } else {
      // Match Flower.tsx structure - Full bloom flower
      return (
        <div className="bg-white/20 rounded-full flex items-center justify-center" style={{ width: containerSize, height: containerSize }}>
          <div className="relative flex flex-col items-center">
            {/* Flower head */}
            <div className="relative" style={{ width: '60px', height: '60px' }}>
              {/* Petals - 6 petals in a circle */}
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i * 60 - 90) * (Math.PI / 180);
                const x = Math.cos(angle) * 18;
                const y = Math.sin(angle) * 18;
                
                return (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: colors.primary,
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                      boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  />
                );
              })}
              
              {/* Center of flower */}
              <div
                className="absolute rounded-full"
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: colors.secondary,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  border: `2px solid ${colors.secondary}`,
                  boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.2), 0 2px 3px rgba(0,0,0,0.15)',
                  filter: 'brightness(0.9)',
                }}
              />
            </div>

            {/* Stem */}
            <div className="relative" style={{ width: '6px', height: '40px' }}>
              <div
                className="absolute left-0 w-full rounded-full"
                style={{
                  height: '100%',
                  backgroundColor: '#6B8E4E',
                  boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.2)',
                }}
              />
              
              {/* Leaves along stem */}
              {Array.from({ length: 3 }).map((_, i) => {
                const isLeft = i % 2 === 0;
                const position = (i / 3) * 70 + 15;
                
                return (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      [isLeft ? 'right' : 'left']: '6px',
                      top: `${position}%`,
                    }}
                  >
                    <div
                      className="rounded-full"
                      style={{
                        width: '16px',
                        height: '10px',
                        backgroundColor: '#7BA05B',
                        transform: isLeft ? 'rotate(-30deg)' : 'rotate(30deg)',
                        boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.15)',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex-1 bg-[#F5F1E8] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Header - Matches Tasks page banner */}
      <div 
        className="px-6 pt-10 pb-6"
        style={{
          background: theme === 'city' 
            ? 'linear-gradient(to bottom right, #1f2937, #111827)'
            : theme === 'desert'
            ? 'linear-gradient(to bottom right, #DEB887, #D2B48C)'
            : 'linear-gradient(to bottom right, #6B8E4E, #5A7B3E)'
        }}
      >
        <div className="flex items-center gap-4">
          {/* Generic User Avatar */}
          <div
            className="flex-shrink-0 bg-white/30 rounded-full flex items-center justify-center"
            style={{ width: '128px', height: '128px' }}
          >
            <User className="w-16 h-16 text-white/80" strokeWidth={1.5} />
          </div>
          
          <div className="flex-1">
            {showNameEdit ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-3xl font-semibold text-white bg-white/20 px-3 py-1 rounded-lg border-2 border-white/40 focus:outline-none focus:border-white"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowNameEdit(false);
                    onUserNameChange?.(editedName);
                  }}
                  className="text-white hover:scale-110 transition-transform"
                >
                  <Check className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-semibold text-white">{editedName}</h1>
                <button
                  onClick={() => setShowNameEdit(true)}
                  className="text-white/80 hover:text-white hover:scale-110 transition-all"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
            )}
            <p className="text-lg text-white/90 mt-1">
              {theme === 'city' ? 'City Builder' : theme === 'desert' ? 'Oasis Cultivator' : 'Garden Keeper'}
            </p>
          </div>
        </div>
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && customizingTheme && (() => {
        const themeBeingCustomized = customizingTheme;
        const currentColors = themeBeingCustomized === 'garden' ? gardenColors : themeBeingCustomized === 'city' ? cityColors : desertColors;
        const updateColors = themeBeingCustomized === 'garden' ? onGardenColorsChange : themeBeingCustomized === 'city' ? onCityColorsChange : onDesertColorsChange;
        
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-[#5D4E37]">Customize Colors</h3>
                <button
                  onClick={() => {
                    setShowColorPicker(false);
                    setCustomizingTheme(null);
                  }}
                  className="text-[#7C6F5B] hover:text-[#5D4E37]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Preview */}
              <div className="bg-gradient-to-br from-[#6B8E4E] to-[#5A7B3E] rounded-2xl p-6 mb-6 flex justify-center">
                <ProfileIcon size="small" iconTheme={themeBeingCustomized} />
              </div>

              {/* Primary Color Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#5D4E37] mb-3">
                  {themeBeingCustomized === 'city' ? 'Building Color' : `Primary Color ${themeBeingCustomized === 'garden' ? '(Petals)' : '(Leaves)'}`}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {primaryColors.map(color => (
                    <button
                      key={color}
                      onClick={() => updateColors?.({ ...currentColors, primary: color })}
                      className={`w-12 h-12 rounded-lg transition-all ${
                        currentColors.primary === color 
                          ? 'ring-4 ring-[#6B8E4E] ring-offset-2 scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Secondary Color Selection */}
              <div>
                <label className="block text-sm font-medium text-[#5D4E37] mb-3">
                  {themeBeingCustomized === 'city' ? 'Window Color' : `Secondary Color ${themeBeingCustomized === 'garden' ? '(Center)' : '(Coconuts)'}`}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {secondaryColors.map(color => (
                    <button
                      key={color}
                      onClick={() => updateColors?.({ ...currentColors, secondary: color })}
                      className={`w-12 h-12 rounded-lg transition-all ${
                        currentColors.secondary === color 
                          ? 'ring-4 ring-[#6B8E4E] ring-offset-2 scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Avatar Customizer Modal */}
      {showAvatarCustomizer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#5D4E37]">Customize Avatar</h3>
              <button
                onClick={() => setShowAvatarCustomizer(false)}
                className="text-[#7C6F5B] hover:text-[#5D4E37]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-br from-[#6B8E4E] to-[#5A7B3E] rounded-2xl p-6 mb-6 flex justify-center">
              <BitmojiAvatar 
                size="large"
                gender={avatarGender}
                hairstyle={avatarHairstyle}
                shirtColor={avatarShirtColor}
              />
            </div>

            {/* Gender Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#5D4E37] mb-3">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setAvatarGender('girl');
                    setAvatarHairstyle(0); // Reset to first hairstyle
                  }}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    avatarGender === 'girl'
                      ? 'bg-[#6B8E4E] text-white'
                      : 'bg-gray-100 text-[#5D4E37] hover:bg-gray-200'
                  }`}
                >
                  Girl
                </button>
                <button
                  onClick={() => {
                    setAvatarGender('boy');
                    setAvatarHairstyle(0); // Reset to first hairstyle
                  }}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    avatarGender === 'boy'
                      ? 'bg-[#6B8E4E] text-white'
                      : 'bg-gray-100 text-[#5D4E37] hover:bg-gray-200'
                  }`}
                >
                  Boy
                </button>
              </div>
            </div>

            {/* Hairstyle Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#5D4E37] mb-3">
                Hairstyle
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((style) => (
                  <button
                    key={style}
                    onClick={() => setAvatarHairstyle(style)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      avatarHairstyle === style
                        ? 'border-[#6B8E4E] bg-[#6B8E4E]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <BitmojiAvatar 
                      size="small"
                      gender={avatarGender}
                      hairstyle={style}
                      shirtColor={avatarShirtColor}
                    />
                    <p className="text-xs text-center mt-2 text-[#5D4E37]">
                      {avatarGender === 'girl' 
                        ? ['Long', 'Ponytail', 'Bun'][style]
                        : ['Spiky', 'Swept', 'Curly'][style]
                      }
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Shirt Color Selection */}
            <div>
              <label className="block text-sm font-medium text-[#5D4E37] mb-3">
                Shirt Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {secondaryColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setAvatarShirtColor(color)}
                    className={`w-12 h-12 rounded-lg transition-all ${
                      avatarShirtColor === color 
                        ? 'ring-4 ring-[#6B8E4E] ring-offset-2 scale-110' 
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-6 space-y-4">
        {/* Your Stats */}
        <div className="bg-white rounded-xl p-6 shadow-md border-2" style={{ borderColor: themeColors.border }}>
          <h2 className="text-xl font-medium text-center mb-6" style={{ color: themeColors.text }}>Your Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-medium mb-1" style={{ color: themeColors.text }}>{stat.number}</div>
                <div className="text-sm mb-1" style={{ color: themeColors.textLight }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Personal Wellness Tasks */}
          <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${themeColors.border}` }}>
            <h3 className="text-lg font-medium text-center mb-4" style={{ color: themeColors.text }}>This Week's Progress</h3>
            <div className="grid grid-cols-3 gap-4">
              {wellnessTasks.map((task, index) => {
                const improvement = task.lastWeek - task.count;
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      <task.icon className="w-8 h-8" style={{ color: themeColors.primary }} />
                    </div>
                    <div className="text-3xl font-medium mb-1" style={{ color: themeColors.text }}>{task.count}</div>
                    <div className="text-sm mb-2" style={{ color: themeColors.textLight }}>{task.label}</div>
                    {improvement > 0 && (
                      <div className="text-xs font-medium" style={{ color: '#6B8E4E' }}>
                        ↓{improvement} from last week!
                      </div>
                    )}
                    {improvement === 0 && (
                      <div className="text-xs font-medium" style={{ color: themeColors.textLight }}>
                        Same as last week
                      </div>
                    )}
                    {improvement < 0 && (
                      <div className="text-xs font-medium" style={{ color: themeColors.textLight }}>
                        {Math.abs(improvement)} tasks added
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Notifications */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-full px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-5 h-5" style={{ color: themeColors.textLight }} />
            <span className="flex-1 text-left font-medium" style={{ color: themeColors.text }}>Notifications</span>
            <span className="text-white text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: themeColors.accent }}>{unreadCount}</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${notificationsOpen ? 'rotate-180' : ''}`} style={{ color: themeColors.textLight }} />
          </button>
          {notificationsOpen && (
            <div className="px-6 py-4 space-y-3" style={{ borderTop: `1px solid ${themeColors.border}` }}>
              {recentNotifications.map(notification => (
                <div key={notification.id} className="text-sm" style={{ color: themeColors.textLight }}>
                  <p className="font-medium mb-1" style={{ color: themeColors.text }}>{notification.title}</p>
                  <p>{notification.message}</p>
                </div>
              ))}
              <button
                onClick={() => setPastNotificationsOpen(!pastNotificationsOpen)}
                className="w-full text-left text-sm py-2 hover:opacity-80"
                style={{ color: themeColors.textLight }}
              >
                {pastNotificationsOpen ? 'Hide past notifications' : 'Show past notifications'}
              </button>
              {pastNotificationsOpen && (
                <div className="space-y-3">
                  {pastNotifications.map(notification => (
                    <div key={notification.id} className="text-sm" style={{ color: themeColors.textLight }}>
                      <p className="font-medium mb-1" style={{ color: themeColors.text }}>{notification.title}</p>
                      <p>{notification.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Privacy & Safety */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <button
            onClick={() => setPrivacyOpen(!privacyOpen)}
            className="w-full px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <Shield className="w-5 h-5" style={{ color: themeColors.textLight }} />
            <span className="flex-1 text-left font-medium" style={{ color: themeColors.text }}>Privacy & Safety</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${privacyOpen ? 'rotate-180' : ''}`} style={{ color: themeColors.textLight }} />
          </button>
          {privacyOpen && (
            <div className="px-6 py-4 space-y-4" style={{ borderTop: `1px solid ${themeColors.border}` }}>
              {/* Location Privacy Toggle */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm" style={{ color: themeColors.text }}>Location Privacy</span>
                <button
                  onClick={() => setLocationPrivacy(!locationPrivacy)}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{ backgroundColor: locationPrivacy ? themeColors.primary : '#D1D5DB' }}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${locationPrivacy ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Identity Verification */}
              <div className="py-2">
                {isVerified ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: themeColors.text }}>Identity Verified</span>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: themeColors.primary }}>
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      // Simulate external verification
                      alert('Redirecting to identity verification...');
                      setTimeout(() => setIsVerified(true), 1000);
                    }}
                    className="flex items-center justify-between w-full text-sm hover:opacity-80"
                    style={{ color: themeColors.text }}
                  >
                    <span>Verify Identity</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Block & Report */}
              <div className="py-2">
                <button
                  onClick={() => setBlockReportOpen(!blockReportOpen)}
                  className="flex items-center justify-between w-full text-sm hover:opacity-80"
                  style={{ color: themeColors.text }}
                >
                  <span>Block & Report</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${blockReportOpen ? 'rotate-180' : ''}`} />
                </button>
                {blockReportOpen && (
                  <div className="mt-3 space-y-2">
                    {blockedUsers.length === 0 ? (
                      <p className="text-sm italic" style={{ color: themeColors.textLight }}>No blocked users</p>
                    ) : (
                      blockedUsers.map(user => (
                        <div key={user} className="flex items-center justify-between py-1">
                          <span className="text-sm" style={{ color: themeColors.text }}>{user}</span>
                          <button
                            onClick={() => setBlockedUsers(blockedUsers.filter(u => u !== user))}
                            className="text-xs hover:opacity-80 px-3 py-1 rounded-full"
                            style={{ 
                              color: themeColors.accent, 
                              border: `1px solid ${themeColors.accent}` 
                            }}
                          >
                            Unblock
                          </button>
                        </div>
                      ))
                    )}
                    <button
                      onClick={() => setShowAddBlockModal(true)}
                      className="flex items-center gap-2 text-sm hover:opacity-80 mt-2"
                      style={{ color: themeColors.primary }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add user to block</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Recommendations Toggle */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm" style={{ color: themeColors.text }}>Recommendations</span>
                <button
                  onClick={() => setRecommendations(!recommendations)}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{ backgroundColor: recommendations ? themeColors.primary : '#D1D5DB' }}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${recommendations ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Block User Modal */}
        {showAddBlockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-6 w-80 mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium" style={{ color: themeColors.text }}>Block User</h3>
                <button
                  onClick={() => {
                    setShowAddBlockModal(false);
                    setNewBlockName('');
                  }}
                  className="hover:opacity-80"
                  style={{ color: themeColors.textLight }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={newBlockName}
                onChange={(e) => setNewBlockName(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2"
                style={{ 
                  border: `1px solid ${themeColors.border}`,
                  color: themeColors.text,
                  '--tw-ring-color': themeColors.primary
                } as React.CSSProperties}
              />
              <button
                onClick={() => {
                  if (newBlockName.trim()) {
                    setBlockedUsers([...blockedUsers, newBlockName.trim()]);
                    setShowAddBlockModal(false);
                    setNewBlockName('');
                  }
                }}
                disabled={!newBlockName.trim()}
                className="w-full mt-4 py-3 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{ backgroundColor: themeColors.primary }}
              >
                Block User
              </button>
            </div>
          </div>
        )}

        {/* Current Theme */}
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
          <div className="text-xs mb-0.5" style={{ color: themeColors.textLight }}>Current Theme</div>
          <div className="text-base font-medium" style={{ color: themeColors.text }}>
            {theme === 'city' ? 'Social Skyline' : theme === 'desert' ? 'Tropical Oasis' : 'Friendship Garden'}
          </div>
        </div>

        {/* Bottom padding for safe scrolling */}
        <div className="h-4"></div>
      </div>
    </div>
  );
}