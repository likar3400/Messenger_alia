const SK = 'delulu_v4';

let S = {
  
  contacts: [],
  messages:  {},
  activeId:  null,
  apiKey:    '',
  
  myName:    'Ти',
  myStatus:  '',
  myColor:   0,
  myAvatar:  '',
  
  pinned:    {},
  
  theme:     'dark',    
  
  sortMode:  'newest',  
  
  chatThemes: {},
  
  bookmarks: [],
  
  unread: {},
  
  drafts: {},
  
  notificationsEnabled: false,
  soundEnabled: true,
};

let ctxMid = null;
let ctxCid = null;

let micOn = true;
let callTmr = null;
let callSec = 0;

const AVC = [
  ['#ff4d8d', '#fff0f6'], ['#c94dff', '#f5e6ff'], ['#4d9fff', '#e6f3ff'],
  ['#3ddc97', '#e0fff4'], ['#ffb84d', '#fff8e6'], ['#ff7a4d', '#fff0eb'],
  ['#4dffe0', '#e0fffc'], ['#b84dff', '#f0e0ff'],
];

const SW_COLS = [
  '#ff4d8d', '#c94dff', '#4d9fff', '#3ddc97',
  '#ffb84d', '#ff7a4d', '#4dffe0', '#b84dff',
];

const REACT_E = ['❤️', '😂', '😮', '😢', '👍', '🔥'];
const PICK_E  = ['😀','😍','🥰','😂','😎','🤩','💕','✨','🔥','👏','💯','🎉','😭','🫶','💀','🫠','👀','💅','🌸','⭐'];
