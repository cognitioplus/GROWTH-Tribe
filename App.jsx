import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Heart, MessageCircle, Share2, User, Home, PlusCircle, 
  Wallet, Settings, Award, Image as ImageIcon, Video, 
  Send, MoreHorizontal, Shield, Lock, Eye, Bell, LogOut,
  TrendingUp, Leaf, Sun, Sparkles, Bot, X
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, 
  updateProfile, signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  doc, updateDoc, setDoc, deleteDoc, serverTimestamp, 
  increment 
} from 'firebase/firestore';

// --- Configuration & Constants ---
const THEME = {
  primary: '#b425aa',
  secondary: '#c80ec9',
  accent: '#d4af37', // Gold
  bg: '#f8f9fa',
  text: '#1f2937',
  textLight: '#6b7280',
  fontMain: 'Poppins, sans-serif',
  fontHeader: 'Montserrat, sans-serif',
  fontCondensed: 'Roboto Condensed, sans-serif'
};

const LOGO_URL = "https://appimize.app/assets/apps/user_1097/images/2d5cb5dadead_225_1097.png";

const BADGES = [
  { name: 'Seedling', threshold: 0, icon: <Leaf size={16} /> },
  { name: 'Sprout', threshold: 500, icon: <TrendingUp size={16} /> },
  { name: 'Bloom', threshold: 1000, icon: <Sun size={16} /> },
  { name: 'Harmony', threshold: 5000, icon: <Award size={16} /> }
];

// --- Firebase Initialization ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'growth-tribe';

// --- Gemini API Helper ---
const callGemini = async (prompt) => {
  const apiKey = ""; // Provided by environment
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  let retries = 0;
  const maxRetries = 5;

  while (retries < maxRetries) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "The cosmos is quiet. Please try again.";
      } else if (response.status === 429 || response.status >= 500) {
        // Handle rate limiting or server errors with backoff
        retries++;
        const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Non-recoverable error
        console.error("Gemini API Error (non-retryable):", response.status, await response.text());
        return "Failed to get a response from the AI coach due to an API error.";
      }
    } catch (error) {
      // Handle network errors
      retries++;
      const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return "Connection interrupted or service is busy. Please try again later.";
};

// --- Components ---

// 1. Navigation Bar
const BottomNav = ({ activeTab, setActiveTab }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center z-50 safe-area-bottom shadow-lg">
    <NavBtn icon={<Home size={24} />} label="Hub" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
    <NavBtn icon={<Wallet size={24} />} label="Wallet" active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} />
    
    <button 
      onClick={() => setActiveTab('create')}
      className="relative -top-5 bg-gradient-to-r from-[#b425aa] to-[#c80ec9] text-white p-4 rounded-full shadow-xl border-4 border-gray-50 transform transition-transform active:scale-95"
    >
      <PlusCircle size={32} />
    </button>
    
    <NavBtn icon={<Award size={24} />} label="Badges" active={activeTab === 'badges'} onClick={() => setActiveTab('badges')} />
    <NavBtn icon={<User size={24} />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
  </div>
);

const NavBtn = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 transition-colors duration-200 ${active ? 'text-[#b425aa]' : 'text-gray-400'}`}
  >
    {icon}
    <span className="text-[10px] font-medium mt-1" style={{ fontFamily: THEME.fontCondensed }}>{label}</span>
  </button>
);

// 2. Header
const Header = ({ userProfile }) => (
  <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 px-4 py-3 shadow-sm border-b border-gray-100 flex justify-between items-center">
    <div className="flex items-center gap-3">
      <img src={LOGO_URL} alt="Growth Tribe" className="w-10 h-10 rounded-full object-cover border-2 border-[#d4af37]" />
      <div>
        <h1 className="text-lg font-bold leading-none text-[#b425aa]" style={{ fontFamily: THEME.fontHeader }}>GROWTH Tribe</h1>
        <p className="text-xs text-[#d4af37] font-semibold tracking-wider">MIND • BODY • SOUL</p>
      </div>
    </div>
    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      <span className="text-xs font-bold text-gray-700">{userProfile?.points || 0} GP</span>
    </div>
  </header>
);

// 3. Post Card
const PostCard = ({ post, user, onLike, onCommentClick, onDelete }) => {
  const isLiked = post.likes && user && post.likes[user.uid];
  const isOwner = user && post.authorId === user.uid;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white mb-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#b425aa] to-[#d4af37] p-[2px]">
            <img 
              src={post.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`} 
              className="w-full h-full rounded-full bg-white object-cover" 
              alt="avatar" 
            />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900" style={{ fontFamily: THEME.fontMain }}>{post.authorName}</h3>
            <span className="text-xs text-gray-500">{formatDate(post.timestamp)}</span>
            {post.badge && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#fdf8e6] text-[#d4af37] border border-[#d4af37]/30">
                {post.badge}
              </span>
            )}
          </div>
        </div>
        {isOwner && (
          <button onClick={() => onDelete(post.id)} className="text-gray-400 hover:text-red-500">
            <MoreHorizontal size={20} />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="px-4 pb-2">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed mb-3 font-light text-[15px]">{post.content}</p>
      </div>

      {/* Media */}
      {post.mediaUrl && (
        <div className="w-full bg-black/5 flex justify-center max-h-96 overflow-hidden">
          {post.mediaType === 'video' ? (
            <video src={post.mediaUrl} controls className="w-full h-full object-contain" />
          ) : (
            <img src={post.mediaUrl} alt="Post content" className="w-full h-full object-cover" />
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-50 mt-2">
        <div className="flex gap-6">
          <button 
            onClick={() => onLike(post)}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isLiked ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'}`}
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            <span>{post.likeCount || 0}</span>
          </button>
          
          <button 
            onClick={() => onCommentClick(post)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#b425aa]"
          >
            <MessageCircle size={20} />
            <span>{post.commentCount || 0}</span>
          </button>

          <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#b425aa]">
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. Wallet View
const WalletView = ({ points }) => {
  const phpValue = (points / 100).toFixed(2);
  
  return (
    <div className="p-4 pt-20 pb-24 min-h-screen">
      <div className="bg-gradient-to-br from-[#b425aa] to-[#7c1a75] rounded-2xl p-6 text-white shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10"></div>
        <h2 className="text-sm font-medium opacity-80 mb-1">Total Balance</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{points}</span>
          <span className="text-lg opacity-80">GP</span>
        </div>
        <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center">
          <span className="text-sm opacity-90">Convertible Value</span>
          <span className="text-xl font-bold font-mono">₱ {phpValue}</span>
        </div>
      </div>

      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp size={18} className="text-[#b425aa]" />
        Transaction History
      </h3>
      
      <div className="space-y-3">
        {/* Mock Data for visual demonstration */}
        {[
          { label: 'Weekly Login Bonus', pts: '+50', date: 'Today' },
          { label: 'Post Engagement', pts: '+15', date: 'Yesterday' },
          { label: 'New Badge Unlocked', pts: '+100', date: '2 days ago' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-500">{item.date}</p>
            </div>
            <span className="text-green-600 font-bold">{item.pts} GP</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. Create Post Modal (With AI Drafter)
const CreatePost = ({ onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  const handleMagicDraft = async () => {
    setIsDrafting(true);
    const prompt = "Write a short, uplifting social media post about personal growth, resilience, or self-care. Use 1-2 emojis. Keep it under 40 words. Tone: Warm, authentic, encouraging.";
    const draft = await callGemini(prompt);
    setContent(draft.replace(/"/g, '')); // Remove quotes if any
    setIsDrafting(false);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    await onSubmit({ content, type: 'text' });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl h-[80vh] sm:h-auto flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <button onClick={onClose} className="text-gray-500">Cancel</button>
          <h2 className="font-bold text-lg text-gray-800">Create Post</h2>
          <button 
            onClick={handleSubmit} 
            disabled={!content.trim() || isSubmitting}
            className={`font-bold px-4 py-1.5 rounded-full ${content.trim() ? 'bg-[#b425aa] text-white' : 'bg-gray-200 text-gray-400'}`}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="relative">
            <textarea
              className="w-full h-40 text-lg resize-none outline-none placeholder-gray-400"
              placeholder="Share your growth journey..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
            {isDrafting && (
               <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                 <div className="flex items-center gap-2 text-[#b425aa] animate-pulse">
                   <Sparkles size={18} />
                   <span className="text-sm font-semibold">Consulting the Muse...</span>
                 </div>
               </div>
            )}
          </div>
          
          <div className="mt-4 flex flex-wrap gap-3">
             <button 
               onClick={handleMagicDraft}
               className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-[#b425aa] to-[#d4af37] text-white shadow-md hover:shadow-lg transition-all"
             >
               <Sparkles size={20} />
               <span className="text-sm font-bold">✨ Inspire Me</span>
             </button>
             
             {/* Mock buttons for visuals */}
            <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 border border-dashed border-gray-300">
              <ImageIcon size={20} />
              <span className="text-sm font-medium">Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. AI Coach Modal (New Feature)
const AiCoachModal = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskCoach = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse('');
    
    const prompt = `Act as a wise, empathetic, and resilient personal growth coach for the 'GROWTH Tribe'. 
    The user says: "${input}". 
    Provide a warm, supportive response (max 3 sentences) validating their feelings, followed by ONE small, actionable 'Growth Step' they can take right now. 
    Format: "Response... \n\n🌱 **Growth Step:** ..."`;
    
    const result = await callGemini(prompt);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#b425aa] to-[#c80ec9] p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot size={24} className="text-[#d4af37]" />
            <div>
              <h2 className="font-bold text-lg leading-none">Growth Coach</h2>
              <p className="text-[10px] opacity-90">Powered by Gemini AI</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X size={24}/></button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {!response ? (
            <>
              <p className="text-gray-600 mb-4 text-center">
                I'm here to listen. How are you feeling today? Are you facing a challenge or celebrating a win?
              </p>
              <textarea 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#b425aa] transition-colors resize-none h-32"
                placeholder="I'm feeling a bit overwhelmed..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button 
                onClick={handleAskCoach}
                disabled={!input.trim() || loading}
                className="w-full mt-4 bg-[#d4af37] text-white font-bold py-3 rounded-xl shadow-md hover:bg-[#b8962e] transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Sparkles size={18} className="animate-spin" />
                    <span>Thinking...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>✨ Get Guidance</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none inline-block text-sm text-gray-600 max-w-[85%]">
                {input}
              </div>
              
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#b425aa] flex items-center justify-center flex-shrink-0 text-white">
                  <Bot size={16} />
                </div>
                <div className="bg-gradient-to-br from-[#fdf8e6] to-[#fff] border border-[#d4af37]/20 p-4 rounded-xl rounded-tl-none shadow-sm text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {response}
                </div>
              </div>

              <button 
                onClick={() => { setInput(''); setResponse(''); }}
                className="w-full mt-6 text-[#b425aa] font-semibold text-sm hover:underline"
              >
                Ask something else
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 7. Settings & Profile View
const SettingsView = ({ userProfile, onUpdateProfile, onSignOut }) => {
  const currentBadge = BADGES.slice().reverse().find(b => userProfile.points >= b.threshold) || BADGES[0];
  const nextBadge = BADGES.find(b => b.threshold > userProfile.points);
  const progress = nextBadge ? ((userProfile.points - (BADGES[BADGES.indexOf(nextBadge)-1]?.threshold || 0)) / (nextBadge.threshold - (BADGES[BADGES.indexOf(nextBadge)-1]?.threshold || 0))) * 100 : 100;

  return (
    <div className="p-4 pt-20 pb-24 min-h-screen">
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full mb-3 border-4 border-[#d4af37] overflow-hidden">
           <img 
              src={userProfile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.uid}`} 
              className="w-full h-full object-cover" 
              alt="avatar" 
            />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{userProfile?.displayName || 'Growth Warrior'}</h2>
        <div className="flex items-center justify-center gap-2 mt-1 text-[#b425aa] font-medium">
          {currentBadge.icon}
          <span>{currentBadge.name}</span>
        </div>
      </div>

      {/* Progress to next badge */}
      {nextBadge && (
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
          <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
            <span>Current: {userProfile.points} GP</span>
            <span>Next: {nextBadge.name} ({nextBadge.threshold} GP)</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#b425aa] to-[#d4af37]" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        {[
          { icon: <User size={20} />, label: "Account Settings", desc: "Manage your personal info" },
          { icon: <Shield size={20} />, label: "Privacy & Security", desc: "Password, 2FA, Devices" },
          { icon: <Bell size={20} />, label: "Notifications", desc: "Alerts, Emails, Push" },
          { icon: <Eye size={20} />, label: "Accessibility", desc: "Text size, Contrast, Motions" },
        ].map((item, idx) => (
          <button key={idx} className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 text-left">
            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">{item.icon}</div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">{item.label}</h4>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          </button>
        ))}
        <button onClick={() => auth.signOut()} className="w-full p-4 flex items-center gap-4 hover:bg-red-50 text-left group">
          <div className="p-2 bg-red-100 rounded-lg text-red-600 group-hover:bg-red-200"><LogOut size={20} /></div>
          <div>
             <h4 className="text-sm font-semibold text-red-600">Log Out</h4>
          </div>
        </button>
      </div>
    </div>
  );
};


// --- Main App Logic ---

export default function GrowthTribeApp() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showAiCoach, setShowAiCoach] = useState(false); // State for AI Coach

  // 1. Auth & Initial Load
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth failed", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Listen to public profile for points/badges
        const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', currentUser.uid);
        onSnapshot(profileRef, (snap) => {
          if (snap.exists()) {
            setUserProfile({ uid: currentUser.uid, ...snap.data() });
          } else {
            // Create initial profile
            const initialData = {
              displayName: `GrowthUser_${currentUser.uid.slice(0, 4)}`,
              points: 50, // Welcome bonus
              avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`,
              joinedAt: serverTimestamp()
            };
            setDoc(profileRef, initialData);
            setUserProfile({ uid: currentUser.uid, ...initialData });
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Posts
  useEffect(() => {
    // IMPORTANT: Ensure user is authenticated before attempting Firestore queries
    if (!user) return; 

    const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
    const unsubscribe = onSnapshot(postsRef, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort manually since complex queries are restricted
      fetchedPosts.sort((a, b) => {
        const tA = a.timestamp?.seconds || 0;
        const tB = b.timestamp?.seconds || 0;
        return tB - tA;
      });
      setPosts(fetchedPosts);
      setLoading(false);
    });
    return () => unsubscribe;
  }, [user]); // Re-run effect when user object changes (i.e., on sign-in/out)

  // 3. Actions
  const handleCreatePost = async (postData) => {
    if (!user || !userProfile) return;

    // Determine current badge for flair
    const currentBadge = BADGES.slice().reverse().find(b => userProfile.points >= b.threshold)?.name || 'Seedling';

    const newPost = {
      authorId: user.uid,
      authorName: userProfile.displayName,
      authorAvatar: userProfile.avatarUrl,
      content: postData.content,
      mediaType: postData.type,
      mediaUrl: postData.mediaUrl || null,
      timestamp: serverTimestamp(),
      likeCount: 0,
      commentCount: 0,
      likes: {},
      badge: currentBadge
    };

    // Add Post
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'posts'), newPost);
    
    // Award Points (+10 for posting)
    const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', user.uid);
    await updateDoc(profileRef, { points: increment(10) });
    
    setShowCreatePost(false);
  };

  const handleLike = async (post) => {
    if (!user) return;
    const postRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', post.id);
    const isLiked = post.likes && post.likes[user.uid];

    if (isLiked) {
      // Unlike
      const newLikes = { ...post.likes };
      delete newLikes[user.uid];
      await updateDoc(postRef, {
        likes: newLikes,
        likeCount: increment(-1)
      });
    } else {
      // Like
      const newLikes = { ...post.likes, [user.uid]: true };
      await updateDoc(postRef, {
        likes: newLikes,
        likeCount: increment(1)
      });
      
      // Award Points (+1 for engaging)
      const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', user.uid);
      await updateDoc(profileRef, { points: increment(1) });
    }
  };

  const handleDeletePost = async (postId) => {
    // Custom modal instead of window.confirm
    const confirmed = prompt("Type 'CONFIRM' to delete this post:");
    if (confirmed !== 'CONFIRM') return;
    
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'posts', postId));
  };

  // 4. View Rendering
  // Only stop loading once user and profile are ready, and posts have been attempted to fetch.
  if (loading && !userProfile) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-16 h-16 border-4 border-[#b425aa] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-medium text-[#b425aa]" style={{ fontFamily: THEME.fontHeader }}>Loading GROWTH...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-16 font-sans text-gray-900" style={{ fontFamily: THEME.fontMain }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Poppins:wght@300;400;600&family=Roboto+Condensed:wght@400;700&display=swap');
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* Conditional Header - Hide on some screens if needed, but keeping for consistency */}
      <Header userProfile={userProfile} />

      {/* Main Content Area */}
      <main className="max-w-md mx-auto min-h-screen relative bg-gray-50/50 shadow-2xl shadow-gray-200 overflow-hidden">
        
        {/* VIEW: HUB (Feed) */}
        {activeTab === 'home' && (
          <div className="pt-20 pb-20 px-4">
             {/* Welcome Banner */}
             <div className="bg-gradient-to-r from-[#b425aa] to-[#d4af37] rounded-xl p-4 text-white mb-6 shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="font-bold text-lg mb-1" style={{fontFamily: THEME.fontHeader}}>Welcome, {userProfile?.displayName?.split(' ')[0] || 'Friend'}!</h2>
                  <p className="text-xs opacity-90 leading-relaxed mb-3">Share your journey, earn Growth Points, and thrive with the community.</p>
                  
                  {/* AI Coach Trigger */}
                  <button 
                    onClick={() => setShowAiCoach(true)}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/40 rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-2 transition-all"
                  >
                    <Sparkles size={14} className="text-[#ffd700]" />
                    <span>Talk to Growth Coach</span>
                  </button>
                </div>
                {/* Decorative circle */}
                <div className="absolute -right-6 -bottom-10 w-32 h-32 bg-white/10 rounded-full"></div>
             </div>

             <h3 className="font-bold text-gray-700 mb-4 px-1" style={{fontFamily: THEME.fontHeader}}>Latest in Community</h3>
             
             {posts.length === 0 ? (
               <div className="text-center py-10 opacity-50">
                 <Leaf size={48} className="mx-auto mb-2 text-gray-400" />
                 <p>No posts yet. Be the first to plant a seed!</p>
               </div>
             ) : (
               posts.map(post => (
                 <PostCard 
                    key={post.id} 
                    post={post} 
                    user={user} 
                    onLike={handleLike} 
                    onCommentClick={() => alert("Comments feature coming in v2!")}
                    onDelete={handleDeletePost}
                 />
               ))
             )}
          </div>
        )}

        {/* VIEW: WALLET */}
        {activeTab === 'wallet' && <WalletView points={userProfile?.points || 0} />}

        {/* VIEW: BADGES (Simplified for demo) */}
        {activeTab === 'badges' && (
          <div className="pt-20 pb-24 px-4 min-h-screen">
            <h2 className="text-2xl font-bold mb-6 text-center text-[#b425aa]" style={{fontFamily: THEME.fontHeader}}>Your Badges</h2>
            <div className="grid grid-cols-2 gap-4">
              {BADGES.map((badge, idx) => {
                const isUnlocked = (userProfile?.points || 0) >= badge.threshold;
                return (
                  <div key={idx} className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-4 border-2 transition-all ${isUnlocked ? 'bg-white border-[#d4af37] shadow-md' : 'bg-gray-100 border-transparent opacity-50 grayscale'}`}>
                    <div className={`p-4 rounded-full mb-3 ${isUnlocked ? 'bg-[#fdf8e6] text-[#d4af37]' : 'bg-gray-200 text-gray-400'}`}>
                      {React.cloneElement(badge.icon, { size: 32 })}
                    </div>
                    <span className="font-bold text-gray-800">{badge.name}</span>
                    <span className="text-xs text-gray-500 mt-1">{badge.threshold} GP</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* VIEW: PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <SettingsView 
            userProfile={userProfile} 
            onSignOut={() => auth.signOut()}
          />
        )}

      </main>

      {/* Modals & Overlays */}
      {showCreatePost && (
        <CreatePost 
          onClose={() => setShowCreatePost(false)} 
          onSubmit={handleCreatePost}
        />
      )}

      {showAiCoach && (
        <AiCoachModal onClose={() => setShowAiCoach(false)} />
      )}
      
      {/* Create Tab Trigger (Virtual Tab Logic) */}
      {activeTab === 'create' && (() => {
        // Immediately reset tab and open modal
        setTimeout(() => {
          setActiveTab('home');
          setShowCreatePost(true);
        }, 0);
        return null;
      })()}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
