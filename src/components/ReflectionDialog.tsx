import { useState, useEffect } from 'react';
import { X, Upload, Camera, Check } from 'lucide-react';
import { Memory } from '../App';
import { askLlm } from '../api/llm';

interface ReflectionDialogProps {
  taskId: string;
  taskTitle: string;
  friendName: string;
  taskDate?: Date;
  theme: 'city' | 'garden' | 'desert';
  onSave: (memory: Omit<Memory, 'id'>, friendIds: string[], enjoymentRating: number) => void;
  onCancel: () => void;
  friendIds: string[];
}

const ENJOYMENT_EMOJIS = [
  { emoji: '\uD83D\uDE10', label: 'Meh' },
  { emoji: '\uD83D\uDE42', label: 'Okay' },
  { emoji: '\uD83D\uDE0A', label: 'Nice' },
  { emoji: '\uD83D\uDE04', label: 'Great' },
  { emoji: '\uD83E\uDD29', label: 'Amazing' },
];

const getDefaultImageForTask = (taskTitle: string): string => {
  const title = taskTitle.toLowerCase();
  if (title.includes('coffee') || title.includes('cafe') || title.includes('drink')) {
    return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80';
  } else if (title.includes('hik') || title.includes('walk') || title.includes('trail') || title.includes('outdoor')) {
    return 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80';
  } else if (title.includes('game') || title.includes('play') || title.includes('sport')) {
    return 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&q=80';
  } else if (title.includes('dinner') || title.includes('lunch') || title.includes('eat') || title.includes('food') || title.includes('restaurant') || title.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80';
  } else if (title.includes('movie') || title.includes('show') || title.includes('watch')) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80';
  } else if (title.includes('art') || title.includes('exhibit') || title.includes('museum')) {
    return 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80';
  } else if (title.includes('birthday') || title.includes('celebrat') || title.includes('party')) {
    return 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80';
  } else if (title.includes('call') || title.includes('chat') || title.includes('text') || title.includes('check in')) {
    return 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80';
  } else {
    return 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80';
  }
};

export function ReflectionDialog({ taskTitle, friendName, taskDate, theme, onSave, onCancel, friendIds }: ReflectionDialogProps) {
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionQuestion, setReflectionQuestion] = useState('');
  const [questionLoading, setQuestionLoading] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [memoryPhoto, setMemoryPhoto] = useState('');
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [enjoymentRating, setEnjoymentRating] = useState(3); // 1-5, default middle

  const generateQuestionAI = async () => {
    setQuestionLoading(true);
    try {
      const avoidList = Array.from(usedQuestions);
      const avoidClause = avoidList.length > 0
        ? `\n\nDo NOT use any of these previously asked questions:\n${avoidList.map(q => `- "${q}"`).join('\n')}`
        : '';

      const prompt = `You are a thoughtful reflection coach in a friendship app. A user just completed a task with their friend(s).

Task: "${taskTitle}"
Friend(s): ${friendName}

Generate exactly 1 short, warm, open-ended reflection question that helps the user think about this experience and what it meant for their relationship. Keep it casual and conversational — one sentence, no quotes around it.${avoidClause}

Respond with ONLY the question, nothing else.`;

      const question = (await askLlm(prompt)).trim();
      setReflectionQuestion(question);
      setUsedQuestions(prev => new Set([...prev, question]));
    } catch {
      const fallbacks = [
        'What made this moment meaningful to you?',
        'How did spending this time together make you feel?',
        'What would you want to remember most about this?',
      ];
      const available = fallbacks.filter(q => !usedQuestions.has(q));
      const pool = available.length > 0 ? available : fallbacks;
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      setReflectionQuestion(chosen);
      setUsedQuestions(prev => new Set([...prev, chosen]));
    } finally {
      setQuestionLoading(false);
    }
  };

  useEffect(() => {
    generateQuestionAI();
  }, []);

  const handleSave = () => {
    if (!reflectionText.trim()) return;
    const photoUrl = memoryPhoto || getDefaultImageForTask(taskTitle);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let memoryDate = taskDate || today;
    const taskDateNorm = new Date(memoryDate);
    taskDateNorm.setHours(0, 0, 0, 0);
    if (taskDateNorm.getTime() > today.getTime()) {
      memoryDate = today;
    }
    const caption = `${taskTitle}\n\nQ: ${reflectionQuestion}\nA: ${reflectionText.trim()}`;
    onSave({
      photoUrl,
      caption,
      date: memoryDate,
      friendIds: friendIds.filter(id => id !== '')
    }, friendIds, enjoymentRating);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMemoryPhoto(reader.result as string);
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

  const themeStyles = theme === 'city' ? {
    textPrimary: 'text-[#1B3A5F]',
    textSecondary: 'text-[#1B3A5F]/70',
    accentText: 'text-[#1B3A5F]',
    border: 'border-[#1B3A5F]',
    focusBorder: 'focus:border-[#1B3A5F]',
    cardBgHover: 'hover:bg-[#E0F2F7]',
    buttonGradient: 'from-[#1B3A5F] to-[#2E5C8A]',
    buttonGradientHover: 'hover:from-[#2E5C8A] hover:to-[#1B3A5F]',
    questionBg: 'bg-[#E0F2F7]',
  } : theme === 'desert' ? {
    textPrimary: 'text-[#5D4E37]',
    textSecondary: 'text-[#6B5A42]',
    accentText: 'text-[#4A7C59]',
    border: 'border-[#DEB887]',
    focusBorder: 'focus:border-[#4A7C59]',
    cardBgHover: 'hover:bg-[#FFF8E7]',
    buttonGradient: 'from-[#4A7C59] to-[#5A9B6F]',
    buttonGradientHover: 'hover:from-[#5A9B6F] hover:to-[#4A7C59]',
    questionBg: 'bg-[#FFF8E7]',
  } : {
    textPrimary: 'text-[#5D4E37]',
    textSecondary: 'text-[#7C6F5B]',
    accentText: 'text-[#6B8E4E]',
    border: 'border-[#D4C5B0]',
    focusBorder: 'focus:border-[#6B8E4E]',
    cardBgHover: 'hover:bg-[#F5F1E8]',
    buttonGradient: 'from-[#6B8E4E] to-[#5A7B3E]',
    buttonGradientHover: 'hover:from-[#5A7B3E] hover:to-[#6B8E4E]',
    questionBg: 'bg-[#F5F1E8]',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${themeStyles.textPrimary}`}>Task Complete!</h3>
          <button onClick={onCancel} className={themeStyles.textSecondary}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className={`text-sm mb-3 ${themeStyles.textSecondary}`}>
          You completed "{taskTitle}" with {friendName}
        </p>

        {/* 1. Enjoyment Rating */}
        <div className="mb-4">
          <p className={`text-sm font-medium ${themeStyles.textPrimary} mb-2`}>How was it?</p>
          <div className="flex justify-between gap-1">
            {ENJOYMENT_EMOJIS.map((item, i) => (
              <button
                key={i}
                onClick={() => setEnjoymentRating(i + 1)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                  enjoymentRating === i + 1
                    ? `${themeStyles.questionBg} ring-2 ring-offset-1 ${theme === 'city' ? 'ring-[#1B3A5F]' : theme === 'desert' ? 'ring-[#4A7C59]' : 'ring-[#6B8E4E]'} scale-110`
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.emoji}</span>
                <span className={`text-[10px] ${enjoymentRating === i + 1 ? themeStyles.textPrimary + ' font-semibold' : themeStyles.textSecondary}`}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Reflection Question */}
        <div className={`p-3 rounded-xl mb-4 ${themeStyles.questionBg}`}>
          {questionLoading ? (
            <p className={`text-sm ${themeStyles.textSecondary} italic`}>Thinking of a question...</p>
          ) : (
            <p className={`text-sm font-medium ${themeStyles.textPrimary}`}>{reflectionQuestion}</p>
          )}
          <button
            onClick={generateQuestionAI}
            disabled={questionLoading}
            className={`text-xs mt-2 ${themeStyles.accentText} font-medium underline disabled:opacity-40`}
          >
            {questionLoading ? 'Generating...' : 'Ask a different question'}
          </button>
        </div>

        {/* 3. Reflection Text */}
        <textarea
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder="Write your reflection here..."
          className={`w-full p-3 border-2 ${themeStyles.border} rounded-xl focus:outline-none ${themeStyles.focusBorder} text-sm mb-4`}
          rows={3}
        />

        {/* 4. Photo (optional, at bottom) */}
        {showCameraCapture && (
          <div className="mb-4 relative">
            <video
              autoPlay
              playsInline
              ref={(video) => { if (video && cameraStream) video.srcObject = cameraStream; }}
              className="w-full rounded-xl"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={capturePhoto}
                className={`flex-1 px-4 py-2 bg-gradient-to-r ${themeStyles.buttonGradient} text-white rounded-lg text-sm font-medium shadow-md`}
              >
                Capture
              </button>
              <button
                onClick={stopCamera}
                className={`px-4 py-2 border-2 ${themeStyles.border} ${themeStyles.textPrimary} rounded-lg text-sm font-medium shadow-sm`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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

        {!memoryPhoto && !showCameraCapture && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <label className={`px-4 py-3 border-2 ${themeStyles.border} rounded-xl cursor-pointer ${themeStyles.cardBgHover} transition-all flex items-center justify-center gap-2 shadow-sm`}>
              <Upload className={`w-4 h-4 ${themeStyles.textPrimary}`} />
              <span className={`text-sm font-medium ${themeStyles.textPrimary}`}>Upload</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            <button
              onClick={startCamera}
              className={`px-4 py-3 border-2 ${themeStyles.border} rounded-xl ${themeStyles.cardBgHover} transition-all flex items-center justify-center gap-2 shadow-sm`}
            >
              <Camera className={`w-4 h-4 ${themeStyles.textPrimary}`} />
              <span className={`text-sm font-medium ${themeStyles.textPrimary}`}>Camera</span>
            </button>
          </div>
        )}

        {/* Save Button */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!reflectionText.trim()}
            className={`flex-1 px-4 py-3 bg-gradient-to-r ${themeStyles.buttonGradient} text-white rounded-xl text-sm font-medium ${themeStyles.buttonGradientHover} transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Save Reflection
          </button>
        </div>
      </div>
    </div>
  );
}
