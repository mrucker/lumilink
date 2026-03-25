import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, User, Heart, Send, Inbox, Sparkles, X, Check, Bell, Camera, MapPin, Upload, Image, Users, Calendar, Search } from 'lucide-react';
import { Friend, Memory } from '../App';

// Helper functions for date formatting
const formatDate = (date: Date): string => {
  const today = new Date(2026, 2, 16); // March 16, 2026
  const tomorrow = new Date(2026, 2, 17);
  const dateObj = new Date(date);
  
  // Reset time to midnight for accurate date comparison
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  
  if (dateObj.getTime() === today.getTime()) {
    return 'Today';
  } else if (dateObj.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }
  
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
};

const getDateUrgency = (date: Date): 'urgent' | 'soon' | 'upcoming' => {
  const today = new Date(2026, 2, 16);
  today.setHours(0, 0, 0, 0);
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  
  const diffTime = dateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) return 'urgent';  // Today or tomorrow
  if (diffDays <= 3) return 'soon';     // Within 3 days
  return 'upcoming';
};

interface TasksViewProps {
  friends: Friend[];
  onAddMemory: (memory: Omit<Memory, 'id'>) => void;
  theme: 'city' | 'garden' | 'desert';
  onToggleTask: (friendId: string, taskId: string) => void;
  onToggleGroupTasks: (friendTaskPairs: { friendId: string; taskId: string }[], completed: boolean) => void;
  onAddTaskToFriend: (friendId: string, task: { id: string; title: string; completed: boolean; groupId?: string; groupName?: string; date?: Date }) => void;
  taskPrefill?: { title: string; friendId: string } | null;
  onClearPrefill?: () => void;
}

interface TaskRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  toFriendIds?: string[]; // For group requests
  tasks: { id: string; title: string; date?: Date }[];
  status: 'pending' | 'accepted' | 'declined';
  direction: 'incoming' | 'outgoing';
  isGroup?: boolean;
  groupId?: string;
  groupName?: string;
}

interface GroupedTask {
  title: string;
  friends: { friend: Friend; taskId: string; completed: boolean; groupId?: string }[];
  groupId?: string;
  groupName?: string;
  date?: Date;
}

export function TasksView({ friends, onAddMemory, theme, onToggleTask, onToggleGroupTasks, onAddTaskToFriend, taskPrefill, onClearPrefill }: TasksViewProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [currentTab, setCurrentTab] = useState<'tasks' | 'requests'>('tasks');
  const [showReflectionDialog, setShowReflectionDialog] = useState<{taskId: string, taskTitle: string, friendName: string, friendIds?: string[], isGroup?: boolean} | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [nudgedRequests, setNudgedRequests] = useState<Set<string>>(new Set());
  
  // Create Task Modal state
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedFriendsForTask, setSelectedFriendsForTask] = useState<Set<string>>(new Set());
  const [isGroupActivity, setIsGroupActivity] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [showGroupNameInput, setShowGroupNameInput] = useState(false);
  const [taskDate, setTaskDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  
  // Memory creation state for reflection
  const [memoryPhoto, setMemoryPhoto] = useState('');
  const [memoryCaption, setMemoryCaption] = useState('');
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // Handle prefill from Lumilink Recommendations
  useEffect(() => {
    if (taskPrefill) {
      setNewTaskTitle(taskPrefill.title);
      setSelectedFriendsForTask(new Set([taskPrefill.friendId]));
      setShowCreateTaskModal(true);
      onClearPrefill?.();
    }
  }, [taskPrefill]);

  // Mock task requests - in real app this would come from backend
  const [taskRequests, setTaskRequests] = useState<TaskRequest[]>([
    {
      id: 'req-1',
      fromUserId: 'sarah-id',
      fromUserName: 'Sarah',
      toUserId: 'me',
      toUserName: 'You',
      tasks: [
        { id: 'req-1-1', title: 'Grab coffee at our favorite spot this Saturday', date: new Date(2026, 2, 20) },
        { id: 'req-1-2', title: 'Check out the new art exhibit downtown', date: new Date(2026, 2, 22) },
      ],
      status: 'pending',
      direction: 'incoming'
    },
    {
      id: 'req-2',
      fromUserId: 'me',
      fromUserName: 'You',
      toUserId: 'marcus-id',
      toUserName: 'Marcus',
      tasks: [
        { id: 'req-2-1', title: 'Host game night at your place', date: new Date(2026, 2, 21) },
        { id: 'req-2-2', title: 'Try that new pizza restaurant' },
      ],
      status: 'pending',
      direction: 'outgoing'
    },
    {
      id: 'req-3',
      fromUserId: 'zoe-id',
      fromUserName: 'Zoe',
      toUserId: 'me',
      toUserName: 'You',
      tasks: [
        { id: 'req-3-1', title: 'Hiking trip to Mt. Wilson this weekend', date: new Date(2026, 2, 22) },
      ],
      status: 'pending',
      direction: 'incoming'
    },
  ]);

  // Group tasks by title
  const getGroupedTasks = (): GroupedTask[] => {
    const taskMap = new Map<string, GroupedTask>();
    
    friends.forEach(friend => {
      friend.tasks.forEach(task => {
        const key = task.groupId || task.title;
        if (!taskMap.has(key)) {
          taskMap.set(key, {
            title: task.title,
            friends: [],
            groupId: task.groupId,
            groupName: task.groupName,
            date: task.date
          });
        }
        taskMap.get(key)!.friends.push({
          friend,
          taskId: task.id,
          completed: task.completed,
          groupId: task.groupId
        });
      });
    });
    
    return Array.from(taskMap.values()).sort((a, b) => {
      // First separate by completion status - incomplete tasks first
      const aIncomplete = a.friends.filter(f => !f.completed).length;
      const bIncomplete = b.friends.filter(f => !f.completed).length;
      const aCompleted = aIncomplete === 0;
      const bCompleted = bIncomplete === 0;
      
      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1; // Incomplete tasks first
      }
      
      // For incomplete tasks, sort by date (earliest first), then alphabetically
      if (!aCompleted && !bCompleted) {
        // Tasks with dates come before tasks without dates
        if (a.date && !b.date) return -1;
        if (!a.date && b.date) return 1;
        
        // Both have dates - sort by date (earliest first)
        if (a.date && b.date) {
          const dateComparison = a.date.getTime() - b.date.getTime();
          if (dateComparison !== 0) return dateComparison;
        }
        
        // If no dates or same date, sort alphabetically
        return a.title.localeCompare(b.title);
      }
      
      // For completed tasks, sort alphabetically
      return a.title.localeCompare(b.title);
    });
  };

  const groupedTasks = getGroupedTasks();

  // Calculate stats
  const allRelationshipTasks = friends.flatMap(friend => friend.tasks);
  const completedTasks = allRelationshipTasks.filter(t => t.completed).length;
  const totalTasks = allRelationshipTasks.length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100) || 0;

  const incomingRequests = taskRequests.filter(r => r.direction === 'incoming' && r.status === 'pending');
  const outgoingRequests = taskRequests.filter(r => r.direction === 'outgoing' && r.status === 'pending');

  const toggleTaskExpansion = (taskTitle: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskTitle)) {
      newExpanded.delete(taskTitle);
    } else {
      newExpanded.add(taskTitle);
    }
    setExpandedTasks(newExpanded);
  };

  const handleCompleteTask = (taskTitle: string, friendName: string, taskId: string, isGroupTask?: boolean, groupedTask?: GroupedTask) => {
    if (isGroupTask && groupedTask) {
      const allCompleted = groupedTask.friends.every(f => f.completed);
      const pairs = groupedTask.friends.map(ft => ({ friendId: ft.friend.id, taskId: ft.taskId }));

      if (!allCompleted) {
        onToggleGroupTasks(pairs, true);

        const friendIds = groupedTask.friends.map(f => f.friend.id);
        const friendNames = groupedTask.friends.map(f => f.friend.name).join(', ');
        setShowReflectionDialog({
          taskId: taskId,
          taskTitle: taskTitle,
          friendName: friendNames,
          friendIds: friendIds,
          isGroup: true
        });
      } else {
        onToggleGroupTasks(pairs, false);
      }
    } else {
      const friend = friends.find(f => f.name === friendName);
      if (!friend) return;

      const task = friend.tasks.find(t => t.id === taskId);
      if (task && !task.completed) {
        onToggleTask(friend.id, taskId);
        setShowReflectionDialog({ taskId, taskTitle, friendName });
      } else if (task) {
        onToggleTask(friend.id, taskId);
      }
    }
  };

  const handleSkipReflection = () => {
    setShowReflectionDialog(null);
    setReflectionText('');
    setMemoryPhoto('');
    setMemoryCaption('');
  };

  const handleCancelReflection = () => {
    if (showReflectionDialog) {
      if (showReflectionDialog.isGroup && showReflectionDialog.friendIds) {
        const pairs = showReflectionDialog.friendIds.map(friendId => {
          const friend = friends.find(f => f.id === friendId);
          const task = friend?.tasks.find(t => t.title === showReflectionDialog.taskTitle);
          return { friendId, taskId: task?.id || '' };
        }).filter(p => p.taskId);
        onToggleGroupTasks(pairs, false);
      } else {
        const friend = friends.find(f => f.name === showReflectionDialog.friendName);
        if (friend) {
          onToggleTask(friend.id, showReflectionDialog.taskId);
        }
      }
    }
    setShowReflectionDialog(null);
    setReflectionText('');
    setMemoryPhoto('');
    setMemoryCaption('');
  };

  const handleSaveReflection = () => {
    if (showReflectionDialog && (reflectionText || memoryPhoto)) {
      // Create memory if there's a photo or caption
      if (memoryPhoto || memoryCaption) {
        onAddMemory({
          photoUrl: memoryPhoto,
          caption: memoryCaption || reflectionText,
          date: new Date(),
          friendIds: showReflectionDialog.friendIds || [friends.find(f => f.name === showReflectionDialog.friendName)?.id || '']
        });
      }
    }
    handleSkipReflection();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMemoryPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      setShowCameraCapture(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (!cameraStream) return;

    const video = document.querySelector('video');
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    
    const photoData = canvas.toDataURL('image/jpeg');
    setMemoryPhoto(photoData);
    
    stopCamera();
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraCapture(false);
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = taskRequests.find(r => r.id === requestId);
    if (!request) return;

    const friend = friends.find(f => f.name === request.fromUserName);
    if (friend) {
      request.tasks.forEach(task => {
        onAddTaskToFriend(friend.id, {
          id: task.id,
          title: task.title,
          completed: false,
          date: task.date
        });
      });
    }

    setTaskRequests(requests =>
      requests.map(req =>
        req.id === requestId ? { ...req, status: 'accepted' as const } : req
      )
    );
  };

  const handleDeclineRequest = (requestId: string) => {
    setTaskRequests(requests =>
      requests.map(req =>
        req.id === requestId ? { ...req, status: 'declined' as const } : req
      )
    );
  };

  const handleNudge = (requestId: string) => {
    setNudgedRequests(prev => new Set([...prev, requestId]));
    // In a real app, this would send a notification
  };

  // Create Task handlers
  const toggleFriendSelectionForTask = (friendId: string) => {
    const newSelected = new Set(selectedFriendsForTask);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriendsForTask(newSelected);
  };

  const selectAllFriendsForTask = () => {
    setSelectedFriendsForTask(new Set(friends.map(f => f.id)));
  };

  const deselectAllFriendsForTask = () => {
    setSelectedFriendsForTask(new Set());
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim() || selectedFriendsForTask.size === 0) return;

    // If group activity and no group name set, prompt for it
    if (isGroupActivity && !showGroupNameInput) {
      setShowGroupNameInput(true);
      return;
    }

    const groupId = isGroupActivity ? `group-${Date.now()}` : undefined;
    const selectedFriendIds = Array.from(selectedFriendsForTask);
    const newTask = { id: `${Date.now()}`, title: newTaskTitle.trim(), date: taskDate ? new Date(taskDate) : undefined };
    
    if (isGroupActivity && selectedFriendIds.length > 1) {
      // Create one group request to all friends
      const friendNames = selectedFriendIds.map(id => friends.find(f => f.id === id)?.name || '');
      const friendNamesStr = friendNames.join(', ');
      
      // Check if there's already an outgoing group request with the same friends
      const sortedFriendIds = [...selectedFriendIds].sort().join(',');
      const existingRequest = taskRequests.find(req => 
        req.direction === 'outgoing' && 
        req.status === 'pending' &&
        req.isGroup &&
        req.toFriendIds &&
        [...req.toFriendIds].sort().join(',') === sortedFriendIds
      );

      if (existingRequest) {
        // Add task to existing request
        setTaskRequests(requests =>
          requests.map(req =>
            req.id === existingRequest.id
              ? { ...req, tasks: [...req.tasks, newTask] }
              : req
          )
        );
      } else {
        // Create new group request
        const newRequest: TaskRequest = {
          id: `req-${Date.now()}`,
          fromUserId: 'me',
          fromUserName: 'You',
          toUserId: '', // Group request doesn't have single toUserId
          toUserName: friendNamesStr,
          toFriendIds: selectedFriendIds,
          tasks: [newTask],
          status: 'pending',
          direction: 'outgoing',
          isGroup: true,
          groupId: groupId,
          groupName: groupName.trim() || undefined
        };

        setTaskRequests(prev => [...prev, newRequest]);
      }
    } else {
      // Create individual requests to each friend
      selectedFriendIds.forEach(friendId => {
        const friend = friends.find(f => f.id === friendId);
        if (!friend) return;

        // Check if there's already an outgoing pending request to this friend
        const existingRequest = taskRequests.find(req => 
          req.direction === 'outgoing' && 
          req.status === 'pending' &&
          req.toUserId === friendId &&
          !req.isGroup
        );

        if (existingRequest) {
          // Add task to existing request
          setTaskRequests(requests =>
            requests.map(req =>
              req.id === existingRequest.id
                ? { ...req, tasks: [...req.tasks, newTask] }
                : req
            )
          );
        } else {
          // Create new individual request
          const newRequest: TaskRequest = {
            id: `req-${Date.now()}-${friendId}`,
            fromUserId: 'me',
            fromUserName: 'You',
            toUserId: friendId,
            toUserName: friend.name,
            tasks: [newTask],
            status: 'pending',
            direction: 'outgoing',
            isGroup: false
          };

          setTaskRequests(prev => [...prev, newRequest]);
        }
      });
    }

    // Reset modal state
    setShowCreateTaskModal(false);
    setNewTaskTitle('');
    setSelectedFriendsForTask(new Set());
    setIsGroupActivity(false);
    setGroupName('');
    setShowGroupNameInput(false);
    setTaskDate('');
    setShowDatePicker(false);
    setFriendSearchQuery('');
    
    // Switch to requests tab to see the new request
    setCurrentTab('requests');
  };

  // Theme-based colors
  const themeStyles = theme === 'city' ? {
    bgMain: 'bg-[#F5F1E8]',
    headerGradient: 'from-gray-900 to-gray-800',
    tabActive: 'bg-white text-[#1B3A5F]',
    tabInactive: 'bg-white/10 text-white/80 hover:bg-white/20',
    accentBg: 'bg-[#1B3A5F]',
    accentText: 'text-[#1B3A5F]',
    textPrimary: 'text-[#1B3A5F]',
    textSecondary: 'text-[#1B3A5F]/70',
    textTertiary: 'text-[#1B3A5F]/50',
    progressBar: 'bg-[#1B3A5F]',
    progressBarBg: 'bg-[#E0F2F7]',
    border: 'border-[#1B3A5F]',
    focusBorder: 'focus:border-[#1B3A5F]',
    cardBg: 'bg-white',
    cardBgLight: 'bg-[#E0F2F7]',
    cardBgHover: 'hover:bg-[#E0F2F7]',
    buttonGradient: 'from-[#1B3A5F] to-[#2E5C8A]',
    buttonGradientHover: 'hover:from-[#2E5C8A] hover:to-[#1B3A5F]',
    checkmarkColor: 'text-[#1B3A5F]',
    circleColor: 'text-[#1B3A5F]/40',
  } : theme === 'desert' ? {
    bgMain: 'bg-[#FFF8E7]',
    headerGradient: 'from-[#DEB887] to-[#D2B48C]',
    tabActive: 'bg-white text-[#5D4E37]',
    tabInactive: 'bg-white/20 text-white/90 hover:bg-white/30',
    accentBg: 'bg-[#4A7C59]',
    accentText: 'text-[#4A7C59]',
    textPrimary: 'text-[#5D4E37]',
    textSecondary: 'text-[#8B7355]',
    textTertiary: 'text-[#A0937D]',
    progressBar: 'bg-[#4A7C59]',
    progressBarBg: 'bg-[#DEB887]/30',
    border: 'border-[#DEB887]',
    focusBorder: 'focus:border-[#4A7C59]',
    cardBg: 'bg-white',
    cardBgLight: 'bg-[#FFF8E7]',
    cardBgHover: 'hover:bg-[#FFF8E7]',
    buttonGradient: 'from-[#4A7C59] to-[#5A9B6F]',
    buttonGradientHover: 'hover:from-[#5A9B6F] hover:to-[#4A7C59]',
    checkmarkColor: 'text-[#4A7C59]',
    circleColor: 'text-[#A0937D]',
  } : {
    bgMain: 'bg-[#F5F1E8]',
    headerGradient: 'from-[#6B8E4E] to-[#5A7B3E]',
    tabActive: 'bg-white text-[#6B8E4E]',
    tabInactive: 'bg-white/10 text-white/80 hover:bg-white/20',
    accentBg: 'bg-[#6B8E4E]',
    accentText: 'text-[#6B8E4E]',
    textPrimary: 'text-[#5D4E37]',
    textSecondary: 'text-[#7C6F5B]',
    textTertiary: 'text-[#A0937D]',
    progressBar: 'bg-[#6B8E4E]',
    progressBarBg: 'bg-[#D4C5B0]',
    border: 'border-[#D4C5B0]',
    focusBorder: 'focus:border-[#6B8E4E]',
    cardBg: 'bg-white',
    cardBgLight: 'bg-[#FAFAF8]',
    cardBgHover: 'hover:bg-[#F5F1E8]',
    buttonGradient: 'from-[#6B8E4E] to-[#5A7B3E]',
    buttonGradientHover: 'hover:from-[#5A7B3E] hover:to-[#6B8E4E]',
    checkmarkColor: 'text-[#6B8E4E]',
    circleColor: 'text-[#A0937D]',
  };

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${themeStyles.bgMain}`}>
      {/* Header */}
      <div className={`bg-gradient-to-br ${themeStyles.headerGradient} px-6 pt-8 pb-4 shadow-lg`}>
        <h1 className="text-2xl text-white mb-2">Connection Tasks</h1>
        <p className="text-sm text-white/80 mb-4">Nurture your relationships</p>
        
        {/* Tab Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentTab('tasks')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'tasks'
                ? themeStyles.tabActive + ' shadow-md'
                : themeStyles.tabInactive
            }`}
          >
            My Tasks
          </button>
          <button
            onClick={() => setCurrentTab('requests')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
              currentTab === 'requests'
                ? themeStyles.tabActive + ' shadow-md'
                : themeStyles.tabInactive
            }`}
          >
            Requests
            {(incomingRequests.length + outgoingRequests.length) > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center">
                {incomingRequests.length + outgoingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* My Tasks View */}
      {currentTab === 'tasks' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Progress Overview */}
          <div className={`bg-white rounded-xl shadow-md border-2 ${themeStyles.border} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${themeStyles.textPrimary}`}>Overall Progress</span>
              <span className={`text-sm font-medium ${themeStyles.accentText}`}>{completedTasks}/{totalTasks}</span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${themeStyles.progressBarBg}`}>
              <div
                className={`h-full rounded-full transition-all ${themeStyles.progressBar}`}
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* Create Task Button */}
          <button
            onClick={() => setShowCreateTaskModal(true)}
            className={`w-full px-4 py-4 bg-gradient-to-r ${themeStyles.buttonGradient} text-white rounded-xl text-sm font-medium ${themeStyles.buttonGradientHover} transition-all flex items-center justify-center gap-2 shadow-md`}
          >
            <Plus className="w-5 h-5" />
            Create New Task
          </button>

          {/* Tasks grouped by task title */}
          {groupedTasks.map(task => {
            const taskKey = task.groupId || task.title;
            const isExpanded = expandedTasks.has(taskKey);
            const completedCount = task.friends.filter(f => f.completed).length;
            const totalCount = task.friends.length;
            const allCompleted = completedCount === totalCount;
            const isGroupTask = !!task.groupId;

            return (
              <div key={taskKey} className={`bg-white rounded-xl shadow-md border-2 ${themeStyles.border} overflow-hidden`}>
                {/* Task Header */}
                <div className="px-4 py-3 flex items-start gap-3">
                  <button
                    onClick={() => {
                      if (isGroupTask) {
                        // For group tasks, handle completion together
                        handleCompleteTask(task.title, '', task.friends[0].taskId, true, task);
                      } else if (!allCompleted && task.friends.length === 1) {
                        // Single friend - complete directly
                        const friendTask = task.friends[0];
                        handleCompleteTask(task.title, friendTask.friend.name, friendTask.taskId);
                      }
                    }}
                    className="mt-1 flex-shrink-0"
                  >
                    {allCompleted ? (
                      <CheckCircle2 className={`w-5 h-5 ${themeStyles.checkmarkColor}`} />
                    ) : (
                      <Circle className={`w-5 h-5 ${themeStyles.circleColor}`} />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className={`text-sm font-medium ${themeStyles.textPrimary} ${allCompleted ? 'line-through opacity-60' : ''}`}>
                        {task.title}
                      </p>
                      {isGroupTask && task.groupName && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-300 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {task.groupName}
                        </span>
                      )}
                    </div>
                    
                    {task.date && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className={`text-xs font-medium ${
                          getDateUrgency(task.date) === 'urgent' 
                            ? 'text-red-600' 
                            : getDateUrgency(task.date) === 'soon' 
                            ? 'text-orange-600' 
                            : themeStyles.accentText
                        }`}>
                          {formatDate(task.date)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <button
                        onClick={() => toggleTaskExpansion(task.groupId || task.title)}
                        className={`text-xs ${themeStyles.textSecondary} flex items-center gap-1`}
                      >
                        {isGroupTask ? (
                          <Users className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {totalCount} friend{totalCount !== 1 ? 's' : ''}
                        <svg
                          className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        allCompleted 
                          ? theme === 'city' ? 'bg-[#E0F2F7] text-[#1B3A5F]' : theme === 'desert' ? 'bg-[#FFF8E7] text-[#4A7C59]' : 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {completedCount}/{totalCount}
                      </span>

                      {isGroupTask && (
                        <span className="text-xs text-purple-600">
                          📍 Group activity
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Friends List */}
                {isExpanded && (
                  <div className={`border-t ${themeStyles.border} px-4 py-3 space-y-2 ${themeStyles.cardBgLight}`}>
                    {task.friends.map(friendTask => (
                      <div key={`${friendTask.friend.id}-${friendTask.taskId}`} className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            if (isGroupTask) {
                              // For group tasks, complete all at once even when clicking individual checkbox
                              handleCompleteTask(task.title, '', friendTask.taskId, true, task);
                            } else {
                              // For individual tasks, complete only this friend's task
                              handleCompleteTask(task.title, friendTask.friend.name, friendTask.taskId);
                            }
                          }}
                          className="flex-shrink-0"
                        >
                          {friendTask.completed ? (
                            <CheckCircle2 className={`w-4 h-4 ${themeStyles.checkmarkColor}`} />
                          ) : (
                            <Circle className={`w-4 h-4 ${themeStyles.circleColor}`} />
                          )}
                        </button>
                        
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: friendTask.friend.color }}
                        />
                        
                        <span className={`text-sm ${themeStyles.textPrimary} ${friendTask.completed ? 'line-through opacity-60' : ''}`}>
                          {friendTask.friend.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {groupedTasks.length === 0 && (
            <div className="text-center py-12">
              <p className={`${themeStyles.textSecondary}`}>No tasks yet</p>
              <p className={`text-sm ${themeStyles.textTertiary} mt-1`}>Check the Requests tab to accept new tasks</p>
            </div>
          )}
        </div>
      )}

      {/* Requests View */}
      {currentTab === 'requests' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Incoming Requests */}
          {incomingRequests.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Inbox className={`w-5 h-5 ${themeStyles.textPrimary}`} />
                <h2 className={`text-lg font-medium ${themeStyles.textPrimary}`}>Incoming Requests</h2>
                <span className={`text-sm ${themeStyles.textSecondary}`}>({incomingRequests.length})</span>
              </div>

              {incomingRequests.map(request => (
                <div key={request.id} className="bg-gradient-to-r from-blue-50 to-white rounded-xl shadow-md border-2 border-blue-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className={`text-sm font-medium ${themeStyles.textPrimary}`}>
                          {request.fromUserName} suggests:
                        </p>
                        {request.isGroup && request.groupName && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-300 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {request.groupName}
                          </span>
                        )}
                      </div>
                      <ul className={`mt-2 space-y-1 text-sm ${themeStyles.textSecondary}`}>
                        {request.tasks.map(task => (
                          <li key={task.id} className="flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <div className="flex-1">
                              <span>{task.title}</span>
                              {task.date && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Calendar className="w-3 h-3" />
                                  <span className={`text-xs font-medium ${
                                    getDateUrgency(task.date) === 'urgent' 
                                      ? 'text-red-600' 
                                      : getDateUrgency(task.date) === 'soon' 
                                      ? 'text-orange-600' 
                                      : themeStyles.accentText
                                  }`}>
                                    {formatDate(task.date)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                      {request.isGroup && (
                        <p className="text-xs text-purple-600 mt-2">
                          📍 Group activity with {request.toUserName}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className={`flex-1 px-4 py-2 bg-gradient-to-r ${themeStyles.buttonGradient} text-white rounded-lg text-sm font-medium ${themeStyles.buttonGradientHover} transition-all flex items-center justify-center gap-2`}
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(request.id)}
                      className={`flex-1 px-4 py-2 border-2 ${themeStyles.border} ${themeStyles.textPrimary} rounded-lg text-sm font-medium ${themeStyles.cardBgHover} transition-all flex items-center justify-center gap-2`}
                    >
                      <X className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Outgoing Requests */}
          {outgoingRequests.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Send className={`w-5 h-5 ${themeStyles.textPrimary}`} />
                <h2 className={`text-lg font-medium ${themeStyles.textPrimary}`}>Sent Requests</h2>
                <span className={`text-sm ${themeStyles.textSecondary}`}>({outgoingRequests.length})</span>
              </div>

              {outgoingRequests.map(request => (
                <div key={request.id} className={`bg-white rounded-xl shadow-md border-2 ${themeStyles.border} p-4`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {request.isGroup && request.groupName ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-300 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {request.groupName}
                          </span>
                        ) : (
                          <p className={`text-sm font-medium ${themeStyles.textPrimary}`}>
                            To {request.toUserName}:
                          </p>
                        )}
                      </div>
                      <ul className={`mt-2 space-y-1 text-sm ${themeStyles.textSecondary}`}>
                        {request.tasks.map(task => (
                          <li key={task.id} className="flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <div className="flex-1">
                              <span>{task.title}</span>
                              {task.date && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Calendar className="w-3 h-3" />
                                  <span className={`text-xs font-medium ${
                                    getDateUrgency(task.date) === 'urgent' 
                                      ? 'text-red-600' 
                                      : getDateUrgency(task.date) === 'soon' 
                                      ? 'text-orange-600' 
                                      : themeStyles.accentText
                                  }`}>
                                    {formatDate(task.date)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                      {request.isGroup && (
                        <p className="text-xs text-purple-600 mt-2">
                          📍 Group activity with {request.toUserName}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleNudge(request.id)}
                      disabled={nudgedRequests.has(request.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                        nudgedRequests.has(request.id)
                          ? `${themeStyles.textTertiary} cursor-not-allowed`
                          : `${themeStyles.accentText} ${themeStyles.cardBgHover}`
                      }`}
                    >
                      <Bell className="w-3 h-3" />
                      {nudgedRequests.has(request.id) ? 'Nudged' : 'Nudge'}
                    </button>
                  </div>
                  
                  <p className={`text-xs ${themeStyles.textTertiary}`}>Waiting for response...</p>
                </div>
              ))}
            </div>
          )}

          {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
            <div className="text-center py-12">
              <p className={`${themeStyles.textSecondary}`}>No pending requests</p>
            </div>
          )}
        </div>
      )}

      {/* Reflection Dialog */}
      {showReflectionDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${themeStyles.textPrimary}`}>Task Complete! 🎉</h3>
              <button
                onClick={handleCancelReflection}
                className={themeStyles.textSecondary}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className={`text-sm mb-4 ${themeStyles.textSecondary}`}>
              You completed "{showReflectionDialog.taskTitle}" with {showReflectionDialog.friendName}
            </p>

            {/* Camera Capture View */}
            {showCameraCapture && (
              <div className="mb-4 relative">
                <video
                  autoPlay
                  playsInline
                  ref={(video) => {
                    if (video && cameraStream) {
                      video.srcObject = cameraStream;
                    }
                  }}
                  className="w-full rounded-xl"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={capturePhoto}
                    className={`flex-1 px-4 py-2 bg-gradient-to-r ${themeStyles.buttonGradient} text-white rounded-lg text-sm font-medium`}
                  >
                    Capture
                  </button>
                  <button
                    onClick={stopCamera}
                    className={`px-4 py-2 border-2 ${themeStyles.border} ${themeStyles.textPrimary} rounded-lg text-sm font-medium`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Photo Preview */}
            {memoryPhoto && !showCameraCapture && (
              <div className="mb-4 relative">
                <img src={memoryPhoto} alt="Memory" className="w-full rounded-xl" />
                <button
                  onClick={() => setMemoryPhoto('')}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Photo Upload Buttons */}
            {!memoryPhoto && !showCameraCapture && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                <label className={`px-4 py-3 border-2 ${themeStyles.border} rounded-xl cursor-pointer ${themeStyles.cardBgHover} transition-all flex items-center justify-center gap-2`}>
                  <Upload className={`w-4 h-4 ${themeStyles.textPrimary}`} />
                  <span className={`text-sm font-medium ${themeStyles.textPrimary}`}>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={startCamera}
                  className={`px-4 py-3 border-2 ${themeStyles.border} rounded-xl ${themeStyles.cardBgHover} transition-all flex items-center justify-center gap-2`}
                >
                  <Camera className={`w-4 h-4 ${themeStyles.textPrimary}`} />
                  <span className={`text-sm font-medium ${themeStyles.textPrimary}`}>Camera</span>
                </button>
              </div>
            )}

            {/* Reflection Text */}
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="Add a reflection or note about this activity..."
              className={`w-full p-3 border-2 ${themeStyles.border} rounded-xl focus:outline-none ${themeStyles.focusBorder} text-sm mb-4`}
              rows={3}
            />

            {/* Caption (if photo exists) */}
            {memoryPhoto && (
              <input
                type="text"
                value={memoryCaption}
                onChange={(e) => setMemoryCaption(e.target.value)}
                placeholder="Add a caption for this memory..."
                className={`w-full p-3 border-2 ${themeStyles.border} rounded-xl focus:outline-none ${themeStyles.focusBorder} text-sm mb-4`}
              />
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSkipReflection}
                className={`flex-1 px-4 py-3 border-2 ${themeStyles.border} ${themeStyles.textPrimary} rounded-xl text-sm font-medium ${themeStyles.cardBgHover} transition-all`}
              >
                Skip
              </button>
              <button
                onClick={handleSaveReflection}
                className={`flex-1 px-4 py-3 bg-gradient-to-r ${themeStyles.buttonGradient} text-white rounded-xl text-sm font-medium ${themeStyles.buttonGradientHover} transition-all`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl max-h-[80vh] flex flex-col overflow-hidden relative">
            {/* Header Section - Fixed */}
            <div className="p-6 pb-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${themeStyles.textPrimary}`}>Create New Task</h3>
                <button
                  onClick={() => {
                    setShowCreateTaskModal(false);
                    setNewTaskTitle('');
                    setSelectedFriendsForTask(new Set());
                    setIsGroupActivity(false);
                    setFriendSearchQuery('');
                  }}
                  className={themeStyles.textSecondary}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Task Title Input */}
              <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title..."
              className={`w-full p-3 border-2 ${themeStyles.border} rounded-xl focus:outline-none ${themeStyles.focusBorder} text-sm mb-4`}
            />

            {/* Group Activity Toggle */}
            <div className={`flex items-center justify-between p-3 border-2 ${themeStyles.border} rounded-xl mb-4`}>
              <div className="flex items-center gap-2">
                <Users className={`w-5 h-5 ${themeStyles.textPrimary}`} />
                <div>
                  <p className={`text-sm font-medium ${themeStyles.textPrimary}`}>Group Activity</p>
                  <p className={`text-xs ${themeStyles.textSecondary}`}>Do this with all selected friends together</p>
                </div>
              </div>
              <button
                onClick={() => setIsGroupActivity(!isGroupActivity)}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  isGroupActivity ? themeStyles.accentBg : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                  isGroupActivity ? 'right-0.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            {/* Group Name Input */}
            {isGroupActivity && (
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name (e.g., 'Weekend Squad', 'Book Club')..."
                className={`w-full p-3 border-2 ${themeStyles.border} rounded-xl focus:outline-none ${themeStyles.focusBorder} text-sm mb-4`}
              />
            )}

            <p className={`text-sm mb-4 ${themeStyles.textSecondary}`}>
              {isGroupActivity 
                ? '🎉 This will send ONE group request to all selected friends' 
                : 'Select friends to send individual requests to'}
            </p>

            {/* Date Picker Section (Optional) */}
            <div className={`border-2 ${themeStyles.border} rounded-xl p-4 mb-4`}>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`w-full flex items-center justify-between`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className={`w-5 h-5 ${themeStyles.textPrimary}`} />
                  <div className="text-left">
                    <p className={`text-sm font-medium ${themeStyles.textPrimary}`}>Add Date (Optional)</p>
                    {taskDate && (
                      <p className={`text-xs ${themeStyles.accentText} mt-0.5`}>
                        {formatDate(new Date(taskDate))}
                      </p>
                    )}
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 ${themeStyles.textSecondary} transition-transform ${showDatePicker ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDatePicker && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className={`text-xs font-medium ${themeStyles.textSecondary} block mb-1`}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={taskDate}
                      onChange={(e) => setTaskDate(e.target.value)}
                      min="2026-03-16"
                      className={`w-full p-2 border-2 ${themeStyles.border} rounded-lg focus:outline-none ${themeStyles.focusBorder} text-sm`}
                    />
                  </div>
                  {(taskDate) && (
                    <button
                      onClick={() => {
                        setTaskDate('');
                      }}
                      className={`text-xs ${themeStyles.accentText} underline`}
                    >
                      Clear date
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Select All / Deselect All */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={selectAllFriendsForTask}
                className={`flex-1 px-3 py-2 text-xs rounded-lg border-2 ${themeStyles.border} ${themeStyles.textPrimary} ${themeStyles.cardBgHover} transition-all`}
              >
                Select All
              </button>
              <button
                onClick={deselectAllFriendsForTask}
                className={`flex-1 px-3 py-2 text-xs rounded-lg border-2 ${themeStyles.border} ${themeStyles.textPrimary} ${themeStyles.cardBgHover} transition-all`}
              >
                Deselect All
              </button>
            </div>

            {/* Friend Search Bar */}
            <div className="relative">
              <Search className={`w-4 h-4 ${themeStyles.textSecondary} absolute left-3 top-1/2 transform -translate-y-1/2`} />
              <input
                type="text"
                value={friendSearchQuery}
                onChange={(e) => setFriendSearchQuery(e.target.value)}
                placeholder="Search friends..."
                className={`w-full pl-10 pr-3 py-2.5 border-2 ${themeStyles.border} rounded-xl focus:outline-none ${themeStyles.focusBorder} text-sm`}
              />
              {friendSearchQuery && (
                <button
                  onClick={() => setFriendSearchQuery('')}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeStyles.textSecondary} hover:${themeStyles.textPrimary}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Friends List - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 pb-24" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="space-y-2 hide-scrollbar">
              {friends
                .filter(friend => 
                    friend.name.toLowerCase().includes(friendSearchQuery.toLowerCase())
                  )
                .map(friend => {
                  const isSelected = selectedFriendsForTask.has(friend.id);
                  return (
                    <button
                      key={friend.id}
                      onClick={() => toggleFriendSelectionForTask(friend.id)}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        isSelected
                          ? `${themeStyles.border} ${themeStyles.cardBgLight}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: friend.color }}
                      />
                      <span className={`flex-1 text-left text-sm font-medium ${themeStyles.textPrimary}`}>
                        {friend.name}
                      </span>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? `${themeStyles.accentBg} border-transparent`
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Floating Button at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
              <button
                onClick={handleCreateTask}
                disabled={!newTaskTitle.trim() || selectedFriendsForTask.size === 0}
                className={`w-full px-4 py-3 bg-gradient-to-r ${themeStyles.buttonGradient} text-white rounded-xl text-sm font-medium ${themeStyles.buttonGradientHover} transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg pointer-events-auto`}
              >
                <Send className="w-4 h-4" />
                Request Task
                {selectedFriendsForTask.size > 0 && ` for ${selectedFriendsForTask.size} friend${selectedFriendsForTask.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}