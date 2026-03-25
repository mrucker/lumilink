import { useState } from 'react';
import { CityView } from './components/CityView';
import { GardenView } from './components/GardenView';
import { DesertView } from './components/DesertView';
import { ConnectionDetailView } from './components/ConnectionDetailView';
import { FriendDetailView } from './components/FriendDetailView';
import { BottomNav } from './components/BottomNav';
import { AddFriendModal } from './components/AddFriendModal';
import { SettingsMenu } from './components/SettingsMenu';
import { TasksView } from './components/TasksView';
import { MemoriesView } from './components/MemoriesView';
import ProfileView from './components/ProfileView';

export interface RelationshipNature {
  type: 'school-friend' | 'childhood-friend' | 'work-colleague' | 'immediate-family' | 'extended-family' | 'neighbor' | 'online-friend' | 'hobby-friend' | 'other';
  howMet: string;
  sharedInterests: string[];
  communicationStyle: 'in-person' | 'texting' | 'calls' | 'social-media' | 'mixed';
  friendshipSince?: string; // e.g. "2018"
}

export interface BucketListItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Friend {
  id: string;
  name: string;
  relationshipStrength: number; // 0-100
  color: string;
  height: number; // relative height
  category: 'friends' | 'family' | 'work';
  tasks: Task[];
  relationshipNature?: RelationshipNature;
  bucketList?: BucketListItem[];
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  groupId?: string; // If set, this task is meant to be done as a group activity
  groupName?: string; // Custom group name for this activity
  date?: Date; // Optional date for the task
}

export interface Memory {
  id: string;
  date: Date;
  friendIds: string[];
  photoUrl: string;
  caption: string;
  location?: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'garden' | 'tasks' | 'memories' | 'profile'>('garden');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [theme, setTheme] = useState<'city' | 'garden' | 'desert'>('city');
  const [taskPrefill, setTaskPrefill] = useState<{ title: string; friendId: string } | null>(null);
  
  // Icon customization colors - separate for each theme
  const [gardenColors, setGardenColors] = useState({
    primary: '#E87EA1',
    secondary: '#FCD34D'
  });
  
  const [cityColors, setCityColors] = useState({
    primary: '#4A90E2',
    secondary: '#FCD34D'
  });
  
  const [desertColors, setDesertColors] = useState({
    primary: '#6B8E4E',
    secondary: '#8B6F47'
  });

  const [userName, setUserName] = useState('Alex');

  const [memories, setMemories] = useState<Memory[]>([
    {
      id: 'mem-1',
      date: new Date(2026, 2, 8), // March 8, 2026
      friendIds: ['1', '2'], // Sarah, Marcus
      photoUrl: 'https://images.unsplash.com/photo-1623120893483-0e9d83ebbfe1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllbmRzJTIwY29mZmVlJTIwbGF1Z2hpbmd8ZW58MXx8fHwxNzczMjQwMDI4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      caption: 'Coffee and laughs with Sarah and Marcus ☕️',
      location: 'Downtown Coffee House'
    },
    {
      id: 'mem-2',
      date: new Date(2026, 2, 5), // March 5, 2026
      friendIds: ['3', '5'], // Emma, Lily
      photoUrl: 'https://images.unsplash.com/photo-1650584997985-e713a869ee77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMHBhcnR5JTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzczMjMxMzY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      caption: 'Emma\'s birthday celebration! 🎉',
      location: 'Home'
    },
    {
      id: 'mem-3',
      date: new Date(2026, 2, 1), // March 1, 2026
      friendIds: ['7'], // Zoe
      photoUrl: 'https://images.unsplash.com/photo-1603475429038-44361bcde123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWtpbmclMjBtb3VudGFpbiUyMHRyYWlsfGVufDF8fHx8MTc3MzIxNDM3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      caption: 'Weekend hike with Zoe 🏔️',
      location: 'Mt. Wilson Trail'
    },
    {
      id: 'mem-4',
      date: new Date(2026, 1, 28), // February 28, 2026
      friendIds: ['8', '9'], // Alex, Mia
      photoUrl: 'https://images.unsplash.com/photo-1629624123501-7595e0193fe0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZGlubmVyJTIwZnJpZW5kc3xlbnwxfHx8fDE3NzMxMzkxNDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      caption: 'Dinner with Alex and Mia at new restaurant',
      location: 'Bella Vista'
    },
    {
      id: 'mem-5',
      date: new Date(2026, 1, 22), // February 22, 2026
      friendIds: ['1', '5', '7'], // Sarah, Lily, Zoe
      photoUrl: 'https://images.unsplash.com/photo-1697809311064-c7a3852206ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHN1bnNldCUyMG9jZWFufGVufDF8fHx8MTc3MzIwMTkyN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      caption: 'Beach sunset with the girls 🌅',
      location: 'Santa Monica Beach'
    },
    {
      id: 'mem-6',
      date: new Date(2026, 1, 15), // February 15, 2026
      friendIds: ['11', '12'], // Mom, Dad
      photoUrl: 'https://images.unsplash.com/photo-1755003842792-9d2b7ad08862?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBwaWNuaWMlMjBwYXJrfGVufDF8fHx8MTc3MzI0NDc3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      caption: 'Family picnic in the park ❤️',
      location: 'Central Park'
    },
    {
      id: 'mem-7',
      date: new Date(2026, 1, 10), // February 10, 2026
      friendIds: ['2', '10'], // Marcus, Tyler
      photoUrl: 'https://images.unsplash.com/photo-1630609682318-70047533e3c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1lJTIwbmlnaHQlMjBmcmllbmRzfGVufDF8fHx8MTc3MzI0NDc3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      caption: 'Epic game night! 🎮',
      location: 'Marcus\'s place'
    },
    {
      id: 'mem-8',
      date: new Date(2026, 1, 5), // February 5, 2026
      friendIds: ['8'], // Alex
      photoUrl: 'https://images.unsplash.com/photo-1662049024498-4fbc4468455e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBtdXNldW0lMjBnYWxsZXJ5fGVufDF8fHx8MTc3MzE5NDczOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      caption: 'Art museum with Alex 🎨',
      location: 'Modern Art Museum'
    },
    {
      id: 'mem-9',
      date: new Date(2026, 0, 28), // January 28, 2026
      friendIds: ['3', '17'], // Emma, Lisa
      photoUrl: 'https://images.unsplash.com/photo-1758520387687-38a92a7ee42f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMG1hbGwlMjBmcmllbmRzfGVufDF8fHx8MTc3MzI0NDc3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      caption: 'Shopping spree! 🛍️',
      location: 'The Grove'
    },
    {
      id: 'mem-10',
      date: new Date(2026, 0, 20), // January 20, 2026
      friendIds: ['5', '7', '17'], // Lily, Zoe, Lisa
      photoUrl: 'https://images.unsplash.com/photo-1621407808155-770a27217758?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwbXVzaWMlMjB2ZW51ZXxlbnwxfHx8fDE3NzMyNDQ3Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      caption: 'Concert night! 🎵',
      location: 'Hollywood Bowl'
    },
  ]);

  const [friends, setFriends] = useState<Friend[]>([
    // Friends group
    {
      id: '1',
      name: 'Sarah',
      relationshipStrength: 85,
      color: '#E87EA1',
      height: 140,
      category: 'friends',
      tasks: [
        { id: '1-2', title: 'Grab coffee together', completed: false, date: new Date(2026, 2, 18) },
        { id: '1-3', title: 'Dinner at the new Italian restaurant', completed: true },
        { id: 'group-1', title: 'Weekend camping trip at Yosemite', completed: false, groupId: 'group-weekend-squad', groupName: 'Weekend Squad', date: new Date(2026, 2, 22) },
      ],
      relationshipNature: { type: 'school-friend', howMet: 'College roommate freshman year', sharedInterests: ['hiking', 'cooking', 'travel'], communicationStyle: 'mixed', friendshipSince: '2020' },
      bucketList: [
        { id: 'bl-1-1', title: 'Road trip down the Pacific Coast Highway', completed: false },
        { id: 'bl-1-2', title: 'Take a cooking class in Italy', completed: false },
        { id: 'bl-1-3', title: 'Run a half marathon together', completed: false },
      ],
    },
    {
      id: '2',
      name: 'Marcus',
      relationshipStrength: 65,
      color: '#FFB347',
      height: 110,
      category: 'friends',
      tasks: [
        { id: '2-1', title: 'Game night at his place', completed: false, date: new Date(2026, 2, 21) },
        { id: '2-2', title: 'Grab coffee together', completed: false },
        { id: 'group-1', title: 'Weekend camping trip at Yosemite', completed: false, groupId: 'group-weekend-squad', groupName: 'Weekend Squad', date: new Date(2026, 2, 22) },
      ],
      relationshipNature: { type: 'school-friend', howMet: 'Study group in college', sharedInterests: ['gaming', 'basketball', 'movies'], communicationStyle: 'texting', friendshipSince: '2021' },
      bucketList: [
        { id: 'bl-2-1', title: 'Attend an NBA Finals game', completed: false },
        { id: 'bl-2-2', title: 'Build a gaming PC together', completed: false },
      ],
    },
    {
      id: '3',
      name: 'Emma',
      relationshipStrength: 92,
      color: '#A78BFA',
      height: 155,
      category: 'friends',
      tasks: [
        { id: '3-2', title: 'Lunch at the food market', completed: false, date: new Date(2026, 2, 17) },
        { id: '3-3', title: 'Sunday brunch together', completed: false, date: new Date(2026, 2, 23) },
        { id: 'group-1', title: 'Weekend camping trip at Yosemite', completed: false, groupId: 'group-weekend-squad', groupName: 'Weekend Squad', date: new Date(2026, 2, 22) },
      ],
      relationshipNature: { type: 'childhood-friend', howMet: 'Neighbors growing up', sharedInterests: ['brunch', 'yoga', 'reading'], communicationStyle: 'mixed', friendshipSince: '2010' },
      bucketList: [
        { id: 'bl-3-1', title: 'Backpack through Southeast Asia', completed: false },
        { id: 'bl-3-2', title: 'Start a book club together', completed: true },
        { id: 'bl-3-3', title: 'Learn pottery together', completed: false },
      ],
    },
    {
      id: '4',
      name: 'Jake',
      relationshipStrength: 35,
      color: '#FCD34D',
      height: 85,
      category: 'friends',
      tasks: [
        { id: '4-2', title: 'Grab coffee together', completed: false },
        { id: 'group-1', title: 'Weekend camping trip at Yosemite', completed: false, groupId: 'group-weekend-squad', groupName: 'Weekend Squad', date: new Date(2026, 2, 22) },
      ],
      relationshipNature: { type: 'hobby-friend', howMet: 'Met at a pickup basketball game', sharedInterests: ['basketball', 'fitness'], communicationStyle: 'texting', friendshipSince: '2024' },
      bucketList: [
        { id: 'bl-4-1', title: 'Join a recreational basketball league', completed: false },
      ],
    },
    {
      id: '5',
      name: 'Lily',
      relationshipStrength: 78,
      color: '#F472B6',
      height: 125,
      category: 'friends',
      tasks: [
        { id: '5-1', title: 'Lunch at the new cafe', completed: false, date: new Date(2026, 2, 17) },
        { id: '5-2', title: 'Hiking at Griffith Park', completed: false, date: new Date(2026, 2, 20) },
      ],
      relationshipNature: { type: 'school-friend', howMet: 'Same major in college', sharedInterests: ['hiking', 'photography', 'coffee'], communicationStyle: 'in-person', friendshipSince: '2021' },
      bucketList: [
        { id: 'bl-5-1', title: 'Hike the Inca Trail to Machu Picchu', completed: false },
        { id: 'bl-5-2', title: 'Take a photography workshop', completed: false },
      ],
    },
    {
      id: '6',
      name: 'David',
      relationshipStrength: 48,
      color: '#FB923C',
      height: 100,
      category: 'friends',
      tasks: [
        { id: '6-1', title: 'Grab coffee together', completed: false, date: new Date(2026, 2, 19) },
      ],
      relationshipNature: { type: 'neighbor', howMet: 'Lives in the same apartment building', sharedInterests: ['cooking', 'dogs'], communicationStyle: 'in-person', friendshipSince: '2023' },
      bucketList: [
        { id: 'bl-6-1', title: 'Host a neighborhood BBQ', completed: false },
        { id: 'bl-6-2', title: 'Volunteer at the local animal shelter', completed: false },
      ],
    },
    {
      id: '7',
      name: 'Zoe',
      relationshipStrength: 88,
      color: '#EC4899',
      height: 145,
      category: 'friends',
      tasks: [
        { id: '7-1', title: 'Rock climbing at the gym', completed: false, date: new Date(2026, 2, 19) },
        { id: '7-3', title: 'Watch movie or show together', completed: true },
      ],
      relationshipNature: { type: 'hobby-friend', howMet: 'Met at a rock climbing gym', sharedInterests: ['rock climbing', 'hiking', 'camping'], communicationStyle: 'mixed', friendshipSince: '2022' },
      bucketList: [
        { id: 'bl-7-1', title: 'Climb El Capitan in Yosemite', completed: false },
        { id: 'bl-7-2', title: 'Go skydiving together', completed: false },
        { id: 'bl-7-3', title: 'Complete a tough mudder race', completed: false },
      ],
    },
    {
      id: '8',
      name: 'Alex',
      relationshipStrength: 70,
      color: '#FBBF24',
      height: 115,
      category: 'friends',
      tasks: [
        { id: '8-1', title: 'Dinner at the steakhouse', completed: false, date: new Date(2026, 2, 25) },
        { id: '8-2', title: 'Wine tasting this weekend', completed: false, date: new Date(2026, 2, 22) },
      ],
      relationshipNature: { type: 'school-friend', howMet: 'Lab partner in chemistry', sharedInterests: ['wine', 'food', 'art museums'], communicationStyle: 'texting', friendshipSince: '2020' },
      bucketList: [
        { id: 'bl-8-1', title: 'Wine tour through Napa Valley', completed: false },
        { id: 'bl-8-2', title: 'Visit every major art museum in the US', completed: false },
      ],
    },
    {
      id: '9',
      name: 'Mia',
      relationshipStrength: 62,
      color: '#F97316',
      height: 105,
      category: 'friends',
      tasks: [
        { id: '9-1', title: 'Shopping at the mall', completed: false },
      ],
      relationshipNature: { type: 'online-friend', howMet: 'Connected through mutual friends on Instagram', sharedInterests: ['fashion', 'shopping', 'brunch'], communicationStyle: 'social-media', friendshipSince: '2023' },
      bucketList: [
        { id: 'bl-9-1', title: 'Attend New York Fashion Week', completed: false },
        { id: 'bl-9-2', title: 'Start a style blog together', completed: false },
      ],
    },
    {
      id: '10',
      name: 'Tyler',
      relationshipStrength: 75,
      color: '#C084FC',
      height: 120,
      category: 'friends',
      tasks: [
        { id: '10-1', title: 'Watch movie or show together', completed: false },
        { id: '10-2', title: 'Game night this Friday', completed: false, date: new Date(2026, 2, 21) },
      ],
      relationshipNature: { type: 'childhood-friend', howMet: 'Grew up on the same street', sharedInterests: ['gaming', 'movies', 'music'], communicationStyle: 'calls', friendshipSince: '2008' },
      bucketList: [
        { id: 'bl-10-1', title: 'Go to E3 or PAX together', completed: false },
        { id: 'bl-10-2', title: 'See our favorite band live', completed: false },
      ],
    },
    {
      id: '11',
      name: 'Mom',
      relationshipStrength: 95,
      color: '#E879F9',
      height: 160,
      category: 'friends',
      tasks: [
        { id: '11-2', title: 'Visit for the weekend', completed: false, date: new Date(2026, 2, 29) },
      ],
      relationshipNature: { type: 'immediate-family', howMet: 'Family', sharedInterests: ['cooking', 'gardening', 'family dinners'], communicationStyle: 'calls', friendshipSince: 'Always' },
      bucketList: [
        { id: 'bl-11-1', title: 'Take a family vacation to Hawaii', completed: false },
        { id: 'bl-11-2', title: 'Learn grandma\'s secret recipes together', completed: false },
      ],
    },
    {
      id: '12',
      name: 'Dad',
      relationshipStrength: 90,
      color: '#FB7185',
      height: 150,
      category: 'friends',
      tasks: [
        { id: '12-2', title: 'Fishing at the lake', completed: false },
      ],
      relationshipNature: { type: 'immediate-family', howMet: 'Family', sharedInterests: ['fishing', 'sports', 'grilling'], communicationStyle: 'calls', friendshipSince: 'Always' },
      bucketList: [
        { id: 'bl-12-1', title: 'Deep sea fishing trip in Florida', completed: false },
        { id: 'bl-12-2', title: 'Watch a Super Bowl game in person', completed: false },
      ],
    },
    {
      id: '13',
      name: 'Sister',
      relationshipStrength: 88,
      color: '#F472B6',
      height: 145,
      category: 'friends',
      tasks: [
        { id: '13-2', title: 'Brunch this Sunday', completed: false },
      ],
      relationshipNature: { type: 'immediate-family', howMet: 'Family', sharedInterests: ['brunch', 'shopping', 'travel'], communicationStyle: 'mixed', friendshipSince: 'Always' },
      bucketList: [
        { id: 'bl-13-1', title: 'Sister trip to Paris', completed: false },
        { id: 'bl-13-2', title: 'Do a spa weekend getaway', completed: false },
      ],
    },
    {
      id: '14',
      name: 'Brother',
      relationshipStrength: 82,
      color: '#FBBF24',
      height: 135,
      category: 'friends',
      tasks: [
        { id: '14-1', title: 'Play online game together', completed: true },
      ],
      relationshipNature: { type: 'immediate-family', howMet: 'Family', sharedInterests: ['gaming', 'sports', 'movies'], communicationStyle: 'texting', friendshipSince: 'Always' },
      bucketList: [
        { id: 'bl-14-1', title: 'Go to a World Cup match', completed: false },
        { id: 'bl-14-2', title: 'Complete a co-op video game marathon', completed: false },
      ],
    },
    {
      id: '15',
      name: 'Grandma',
      relationshipStrength: 52,
      color: '#D8B4FE',
      height: 155,
      category: 'friends',
      tasks: [
        { id: '15-2', title: 'Visit this weekend', completed: false },
      ],
      relationshipNature: { type: 'extended-family', howMet: 'Family', sharedInterests: ['baking', 'stories', 'gardening'], communicationStyle: 'calls', friendshipSince: 'Always' },
      bucketList: [
        { id: 'bl-15-1', title: 'Record her life stories on video', completed: false },
        { id: 'bl-15-2', title: 'Plant a family garden together', completed: false },
      ],
    },
    {
      id: '16',
      name: 'Maya',
      relationshipStrength: 25,
      color: '#FCD34D',
      height: 115,
      category: 'friends',
      tasks: [
        { id: '16-1', title: 'Catch up over drinks', completed: false },
      ],
      relationshipNature: { type: 'school-friend', howMet: 'Had a few classes together', sharedInterests: ['music', 'coffee'], communicationStyle: 'social-media', friendshipSince: '2022' },
      bucketList: [
        { id: 'bl-16-1', title: 'Go to a music festival together', completed: false },
      ],
    },
    {
      id: '17',
      name: 'Lisa',
      relationshipStrength: 76,
      color: '#FDA4AF',
      height: 125,
      category: 'friends',
      tasks: [
        { id: '17-1', title: 'Lunch at the Thai place', completed: false },
        { id: '17-2', title: 'Shopping downtown', completed: false },
      ],
      relationshipNature: { type: 'childhood-friend', howMet: 'Best friends since middle school', sharedInterests: ['shopping', 'Thai food', 'reality TV'], communicationStyle: 'mixed', friendshipSince: '2013' },
      bucketList: [
        { id: 'bl-17-1', title: 'Take a Thai cooking class in Bangkok', completed: false },
        { id: 'bl-17-2', title: 'Girls trip to a tropical island', completed: false },
      ],
    },
    {
      id: '18',
      name: 'Amy',
      relationshipStrength: 68,
      color: '#F0ABFC',
      height: 110,
      category: 'friends',
      tasks: [
        { id: '18-2', title: 'Yoga class together', completed: false },
      ],
      relationshipNature: { type: 'hobby-friend', howMet: 'Met at a yoga studio', sharedInterests: ['yoga', 'meditation', 'healthy eating'], communicationStyle: 'in-person', friendshipSince: '2023' },
      bucketList: [
        { id: 'bl-18-1', title: 'Yoga retreat in Bali', completed: false },
        { id: 'bl-18-2', title: 'Complete a 30-day meditation challenge', completed: false },
      ],
    },
    // Work group
    {
      id: '19',
      name: 'Jennifer',
      relationshipStrength: 72,
      color: '#A78BFA',
      height: 118,
      category: 'work',
      tasks: [
        { id: '19-1', title: 'Grab coffee together', completed: false },
        { id: '19-2', title: 'Lunch at the new cafe', completed: false },
      ],
      relationshipNature: { type: 'work-colleague', howMet: 'Same team at work', sharedInterests: ['coffee', 'podcasts', 'career growth'], communicationStyle: 'in-person', friendshipSince: '2022' },
      bucketList: [
        { id: 'bl-19-1', title: 'Attend a tech conference together', completed: false },
        { id: 'bl-19-2', title: 'Start a side project together', completed: false },
      ],
    },
    {
      id: '20',
      name: 'Michael',
      relationshipStrength: 55,
      color: '#FB923C',
      height: 108,
      category: 'work',
      tasks: [
        { id: '20-1', title: 'Happy hour after work', completed: false },
      ],
      relationshipNature: { type: 'work-colleague', howMet: 'Started at the company the same week', sharedInterests: ['happy hours', 'sports', 'tech'], communicationStyle: 'in-person', friendshipSince: '2023' },
      bucketList: [
        { id: 'bl-20-1', title: 'Go to a tech startup meetup', completed: false },
      ],
    },
    {
      id: '21',
      name: 'Rachel',
      relationshipStrength: 80,
      color: '#F472B6',
      height: 130,
      category: 'work',
      tasks: [
        { id: '21-1', title: 'Lunch at the sushi place', completed: false },
        { id: '21-2', title: 'Grab coffee together', completed: false },
      ],
      relationshipNature: { type: 'work-colleague', howMet: 'Partnered on a big project', sharedInterests: ['sushi', 'running', 'reading'], communicationStyle: 'mixed', friendshipSince: '2021' },
      bucketList: [
        { id: 'bl-21-1', title: 'Run a 10K together', completed: false },
        { id: 'bl-21-2', title: 'Visit Japan and eat authentic sushi', completed: false },
      ],
    },
    {
      id: '22',
      name: 'Tom',
      relationshipStrength: 42,
      color: '#FBBF24',
      height: 100,
      category: 'work',
      tasks: [
        { id: '22-1', title: 'Team lunch this Friday', completed: false },
      ],
      relationshipNature: { type: 'work-colleague', howMet: 'Works in a different department', sharedInterests: ['lunch outings', 'football'], communicationStyle: 'in-person', friendshipSince: '2024' },
      bucketList: [
        { id: 'bl-22-1', title: 'Tailgate at a football game', completed: false },
      ],
    },
    {
      id: '23',
      name: 'Nina',
      relationshipStrength: 75,
      color: '#E87EA1',
      height: 122,
      category: 'work',
      tasks: [
        { id: '23-1', title: 'Dinner at the steakhouse', completed: false },
        { id: '23-2', title: 'Grab coffee together', completed: false },
      ],
      relationshipNature: { type: 'work-colleague', howMet: 'Met at a work retreat', sharedInterests: ['food', 'wine', 'travel'], communicationStyle: 'texting', friendshipSince: '2022' },
      bucketList: [
        { id: 'bl-23-1', title: 'Plan a group trip with work friends', completed: false },
        { id: 'bl-23-2', title: 'Try every top-rated restaurant in the city', completed: false },
      ],
    },
    {
      id: '24',
      name: 'Chris',
      relationshipStrength: 30,
      color: '#FFB347',
      height: 105,
      category: 'work',
      tasks: [
        { id: '24-1', title: 'Coffee chat next week', completed: false },
      ],
      relationshipNature: { type: 'work-colleague', howMet: 'New hire on the team', sharedInterests: ['coffee', 'tech'], communicationStyle: 'in-person', friendshipSince: '2025' },
      bucketList: [
        { id: 'bl-24-1', title: 'Attend a hackathon together', completed: false },
      ],
    },
    {
      id: '25',
      name: 'Sophia',
      relationshipStrength: 85,
      color: '#C084FC',
      height: 115,
      category: 'work',
      tasks: [
        { id: '25-2', title: 'Lunch at the food trucks', completed: false },
      ],
      relationshipNature: { type: 'work-colleague', howMet: 'Mentor-mentee relationship', sharedInterests: ['food trucks', 'career advice', 'hiking'], communicationStyle: 'mixed', friendshipSince: '2021' },
      bucketList: [
        { id: 'bl-25-1', title: 'Co-author a blog post or talk', completed: false },
        { id: 'bl-25-2', title: 'Hike the Appalachian Trail section', completed: false },
      ],
    },
  ]);

  const handleToggleTask = (friendId: string, taskId: string) => {
    setFriends(prev => prev.map(friend => {
      if (friend.id !== friendId) return friend;
      return {
        ...friend,
        tasks: friend.tasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      };
    }));
  };

  const handleToggleGroupTasks = (friendTaskPairs: { friendId: string; taskId: string }[], completed: boolean) => {
    setFriends(prev => prev.map(friend => {
      const pairsForFriend = friendTaskPairs.filter(p => p.friendId === friend.id);
      if (pairsForFriend.length === 0) return friend;
      return {
        ...friend,
        tasks: friend.tasks.map(task => {
          const match = pairsForFriend.find(p => p.taskId === task.id);
          return match ? { ...task, completed } : task;
        })
      };
    }));
  };

  const handleAddTaskToFriend = (friendId: string, task: Task) => {
    setFriends(prev => prev.map(friend => {
      if (friend.id !== friendId) return friend;
      return { ...friend, tasks: [...friend.tasks, task] };
    }));
  };

  const handleUpdateRelationshipNature = (friendId: string, nature: RelationshipNature) => {
    setFriends(prev => prev.map(friend => {
      if (friend.id !== friendId) return friend;
      return { ...friend, relationshipNature: nature };
    }));
  };

  const handleCreateTaskFromRecommendation = (title: string, friendId: string) => {
    setTaskPrefill({ title, friendId });
    setSelectedFriend(null);
    setCurrentView('tasks');
  };

  const handleToggleBucketItem = (friendId: string, itemId: string) => {
    setFriends(prev => prev.map(friend => {
      if (friend.id !== friendId) return friend;
      return {
        ...friend,
        bucketList: (friend.bucketList || []).map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        )
      };
    }));
  };

  // Keep selectedFriend in sync with friends state
  const activeFriend = selectedFriend
    ? friends.find(f => f.id === selectedFriend.id) || null
    : null;

  const handleFlowerClick = (friend: Friend) => {
    setSelectedFriend(friend);
  };

  const handleBackToGarden = () => {
    setSelectedFriend(null);
  };

  const handleNavClick = (view: 'garden' | 'tasks' | 'memories' | 'profile') => {
    setCurrentView(view);
    setSelectedFriend(null);
  };

  const handleAddFriend = (friendData: { name: string; relationship: string; lumilinkId: string }) => {
    const colors = ['#E87EA1', '#FFB347', '#A78BFA', '#FCD34D', '#F472B6', '#FB923C', '#EC4899', '#FBBF24', '#F97316', '#C084FC'];
    const newFriend: Friend = {
      id: `friend-${Date.now()}`,
      name: friendData.name,
      relationshipStrength: 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      height: 70,
      category: friendData.relationship === 'Work Connections' ? 'work' : 'friends',
      tasks: [],
      bucketList: [],
    };
    setFriends(prev => [...prev, newFriend]);
  };

  const handleAddMemory = (memory: Omit<Memory, 'id'>) => {
    const newMemory: Memory = {
      ...memory,
      id: `mem-${Date.now()}`
    };
    setMemories([...memories, newMemory]);
  };

  // Get unique relationship categories for the modal
  const existingRelationships = Array.from(new Set(friends.map(f => {
    if (f.category === 'friends') return 'Friends & Family';
    if (f.category === 'work') return 'Work Connections';
    return f.category;
  })));

  return (
    <div className="h-screen flex flex-col bg-[#F5F1E8]">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-[390px] h-[844px] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[14px] border-[#1e1e1e] relative">
          {/* iPhone notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#1e1e1e] rounded-b-3xl z-50" />
          
          {/* Settings Menu - Only show on garden/city view */}
          {currentView === 'garden' && !selectedFriend && (
            <SettingsMenu theme={theme} onThemeChange={setTheme} />
          )}
          
          <div className="h-full flex flex-col bg-[#F5F1E8]">
            {activeFriend ? (
              <>
                {theme === 'city' ? (
                  <ConnectionDetailView friend={activeFriend} onBack={handleBackToGarden} onToggleTask={handleToggleTask} onUpdateRelationshipNature={handleUpdateRelationshipNature} onToggleBucketItem={handleToggleBucketItem} onAddTaskToFriend={handleAddTaskToFriend} onCreateTaskFromRecommendation={handleCreateTaskFromRecommendation} />
                ) : (
                  <FriendDetailView friend={activeFriend} onBack={handleBackToGarden} theme={theme === 'desert' ? 'desert' : 'garden'} onToggleTask={handleToggleTask} onUpdateRelationshipNature={handleUpdateRelationshipNature} onToggleBucketItem={handleToggleBucketItem} onAddTaskToFriend={handleAddTaskToFriend} onCreateTaskFromRecommendation={handleCreateTaskFromRecommendation} />
                )}
                <BottomNav currentView={currentView} onNavigate={handleNavClick} theme={theme} />
              </>
            ) : (
              <>
                {currentView === 'garden' && (
                  <>
                    {theme === 'city' ? (
                      <CityView 
                        friends={friends} 
                        onBuildingClick={handleFlowerClick}
                        onAddFriendClick={() => setShowAddModal(true)}
                      />
                    ) : theme === 'desert' ? (
                      <DesertView 
                        friends={friends} 
                        onPlantClick={handleFlowerClick}
                        onAddFriendClick={() => setShowAddModal(true)}
                      />
                    ) : (
                      <GardenView 
                        friends={friends} 
                        onFlowerClick={handleFlowerClick}
                        onAddFriendClick={() => setShowAddModal(true)}
                      />
                    )}
                  </>
                )}
                {currentView === 'tasks' && (
                  <TasksView friends={friends} onAddMemory={handleAddMemory} theme={theme} onToggleTask={handleToggleTask} onToggleGroupTasks={handleToggleGroupTasks} onAddTaskToFriend={handleAddTaskToFriend} taskPrefill={taskPrefill} onClearPrefill={() => setTaskPrefill(null)} />
                )}
                {currentView === 'memories' && (
                  <MemoriesView friends={friends} memories={memories} theme={theme} />
                )}
                {currentView === 'profile' && (
                  <ProfileView 
                    theme={theme} 
                    onThemeChange={setTheme} 
                    iconColors={theme === 'garden' ? gardenColors : theme === 'city' ? cityColors : desertColors} 
                    onIconColorsChange={theme === 'garden' ? setGardenColors : theme === 'city' ? setCityColors : setDesertColors} 
                    gardenColors={gardenColors}
                    cityColors={cityColors}
                    desertColors={desertColors}
                    onGardenColorsChange={setGardenColors}
                    onCityColorsChange={setCityColors}
                    onDesertColorsChange={setDesertColors}
                    userName={userName}
                    onUserNameChange={setUserName}
                    friends={friends} 
                  />
                )}
                <BottomNav currentView={currentView} onNavigate={handleNavClick} theme={theme} />
              </>
            )}
          </div>
          
          {/* Add Friend Modal */}
          {showAddModal && (
            <AddFriendModal
              onClose={() => setShowAddModal(false)}
              onAdd={handleAddFriend}
              existingRelationships={existingRelationships}
              theme={theme}
            />
          )}
        </div>
      </div>
    </div>
  );
}