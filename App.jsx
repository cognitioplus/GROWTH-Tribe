import React, { useState, useEffect, useCallback } from 'react';
import { 
  Heart, MessageCircle, User, Home, PlusCircle, 
  Wallet, Award, Send, Sparkles, Bot, X, Leaf, TrendingUp, Sun, LogOut
} from 'lucide-react';

// Standard React imports (assumed to be available via environment)
// Note: We avoid direct CDN imports like 'https://esm.sh' in the component file
// to prevent "Dynamic require" errors.

// Standard Firebase module imports (assumed to be available via environment)
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  doc, updateDoc, setDoc, deleteDoc, serverTimestamp, 
  increment 
} from 'firebase/firestore';

// --- Configuration & Constants ---
const THEME = {
  primary: '#b425aa',
  accent: '#d4af37', // Gold
};

const LOGO_URL = "https://appimize.app/assets/apps/user_1097/images/2d5cb5dadead_225_1097.png";

const BADGES = [
  { name: 'Seedling', threshold: 0, icon: <Leaf size={16} /> },
  { name: 'Sprout', threshold: 500, icon: <TrendingUp size={16} /> },
  { name: 'Bloom', threshold: 1000, icon: <Sun size={16} /> },
];

// --- Firebase Initialization (Simulated Backend Setup) ---
// These global variables are provided by the canvas environment
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'growth-tribe';

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// --- Gemini API Helper (Simulated API Gateway) ---
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
        retries++;
        const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error("Gemini API Error (non-retryable):", response.status, await response.text());
        return "Failed to get a response from the AI coach.";
      }
    } catch (error) {
      retries++;
      const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return "Connection interrupted or service is busy. Please try again later.";
};

// --- Sub-Components ---

const NavBtn = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 transition-colors duration-200 ${active ? 'text-[#b425aa]' : 'text-gray-400'}`}
  >
    {icon}
    <span className="text-[10px] font-medium mt-1">{label}</span>
  </button>
);

const Header = ({ userProfile }) => (
  <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 px-4 py-3 shadow-sm border-b border-gray-100 flex justify-between items-center max-w-md mx-auto">
    <div className="flex items-center gap-3">
      <img src={LOGO_URL} alt="Growth Tribe" className="w-8 h-8 rounded-full object-cover border-2 border-[#d4af37]" />
      <h1 className="text-lg font-bold text-[#b425aa]">GROWTH Tribe</h1>
    </div>
    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      <span className="text-xs font-bold text-gray-700">{userProfile?.points || 0} GP</span>
    </div>
  </header>
);

const PostCard = ({ post, user, onLike }) => {
  const isLiked = post.likes && user && post.likes[user.uid];
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white mb-4 rounded-xl shadow-md border border-gray-100 p-4">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <img 
            src={post.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`} 
            className="w-10 h-10 rounded-full object-cover border-2 border-[#b425aa]" 
            alt="avatar" 
          />
          <div>
            <h3 className="font-bold text-sm text-gray-900">{post.authorName}</h3>
            <span className="text-xs text-gray-500">{formatDate(post.timestamp)}</span>
          </div>
        </div>
      </div>
      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed my-3 font-light text-[15px]">{post.content}</p>
      
      <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-2">
        <button 
          onClick={() => onLike(post)}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isLiked ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'}`}
        >
          <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          <span>{post.likeCount || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#b425aa]">
            <MessageCircle size={20} />
            <span>{post.commentCount || 0}</span>
        </button>
      </div>
    </div>
  );
};

const CreatePostModal = ({ onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    await onSubmit({ content });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <button onClick={onClose} className="text-gray-500">Cancel</button>
          <h2 className="font-bold text-lg text-gray-800">New Post</h2>
          <button 
            onClick={handleSubmit} 
            disabled={!content.trim() || isSubmitting}
            className={`font-bold px-4 py-1.5 rounded-full transition-colors ${content.trim() ? 'bg-[#b425aa] text-white' : 'bg-gray-200 text-gray-400'}`}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
        
        <div className="p-4">
          <textarea
            className="w-full h-32 text-lg resize-none outline-none placeholder-gray-400 p-2 border border-gray-100 rounded-lg focus:border-[#b425aa]"
            placeholder="Share your growth journey..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

const AiCoachModal = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskCoach = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse('');
    
    const prompt = `Act as a wise and empathetic personal growth coach for the 'GROWTH Tribe'. The user says: "${input}". 
    Provide a warm, supportive response (max 3 sentences) validating their feelings, followed by ONE small, actionable 'Growth Step' they can take right now. 
    Format: "Response... \n\n🌱 **Growth Step:** ..."`;
    
    const result = await callGemini(prompt);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-[#b425aa] p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot size={24} className="text-[#d4af37]" />
            <h2 className="font-bold text-lg">Growth Coach</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X size={24}/></button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {!response ? (
            <>
              <p className="text-gray-600 mb-4 text-center">
                What's on your mind today?
              </p>
              <textarea 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 resize-none h-32 focus:border-[#b425aa]"
                placeholder="I'm feeling a bit overwhelmed..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button 
                onClick={handleAskCoach}
                disabled={!input.trim() || loading}
                className="w-full mt-4 bg-[#d4af37] text-white font-bold py-3 rounded-xl shadow-md hover:bg-[#b8962e] disabled:opacity-50"
              >
                {loading ? 'Thinking...' : '✨ Get Guidance'}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#b425aa] flex items-center justify-center flex-shrink-0 text-white">
                  <Bot size={16} />
                </div>
                <div className="bg-gray-100 p-4 rounded-xl text-gray-800 text-sm whitespace-pre-wrap">
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

// --- Main App Component ---

const App = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showAiCoach, setShowAiCoach] = useState(false);
  
  // 1. Auth & Initial Load
  useEffect(() => {
    if (!auth || !db) return;

    const initAuth = async () => {
      try {
        const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
        if (token) {
          await signInWithCustomToken(auth, token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth failed:", err);
      }
    };
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false); 
      
      if (currentUser) {
        // Public profile listener for points/badges
        const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', currentUser.uid);
        
        // Listener for the user profile data
        onSnapshot(profileRef, (snap) => {
          if (snap.exists()) {
            setUserProfile({ uid: currentUser.uid, ...snap.data() });
          } else {
            // Create initial profile if it doesn't exist
            const initialData = {
              displayName: `GrowthUser_${currentUser.uid.slice(0, 4)}`,
              points: 100, // Welcome bonus
              avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`,
              joinedAt: serverTimestamp(),
              userId: currentUser.uid // Include for debugging/sharing
            };
            setDoc(profileRef, initialData);
            setUserProfile({ uid: currentUser.uid, ...initialData });
          }
        });
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Fetch Posts (Data Backend)
  useEffect(() => {
    // Only fetch data if the user object is available
    if (!user || !db) return;

    const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'posts');
    
    // Real-time listener for posts
    const unsubscribePosts = onSnapshot(postsRef, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort manually by timestamp for latest first
      fetchedPosts.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setPosts(fetchedPosts);
    }, (error) => {
      console.error("Error fetching posts:", error);
    });

    return () => unsubscribePosts();
  }, [user]);

  // 3. Actions (Data Manipulation Backend)
  const handleCreatePost = useCallback(async (postData) => {
    if (!user || !userProfile || !db) return;

    const currentBadge = BADGES.slice().reverse().find(b => userProfile.points >= b.threshold)?.name || 'Seedling';

    const newPost = {
      authorId: user.uid,
      authorName: userProfile.displayName,
      authorAvatar: userProfile.avatarUrl,
      content: postData.content,
      timestamp: serverTimestamp(),
      likeCount: 0,
      commentCount: 0,
      likes: {},
      badge: currentBadge
    };

    try {
      // Add Post
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'posts'), newPost);
      
      // Award Points (+10 for posting)
      const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', user.uid);
      await updateDoc(profileRef, { points: increment(10) });
      
    } catch (error) {
      console.error("Error creating post or updating points:", error);
    }
  }, [user, userProfile]);

  const handleLike = useCallback(async (post) => {
    if (!user || !db) return;
    const postRef = doc(db, 'artifacts', appId, 'public', 'data', 'posts', post.id);
    const profileRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', post.authorId);

    const isLiked = post.likes && post.likes[user.uid];
    const userIsAuthor = post.authorId === user.uid;

    try {
      if (isLiked) {
        // Unlike
        const newLikes = { ...post.likes };
        delete newLikes[user.uid];
        await updateDoc(postRef, {
          likes: newLikes,
          likeCount: increment(-1)
        });
        
        // Deduct points from post author if not self-liking (optional logic)
        if (!userIsAuthor) {
           await updateDoc(profileRef, { points: increment(-1) });
        }

      } else {
        // Like
        const newLikes = { ...post.likes, [user.uid]: true };
        await updateDoc(postRef, {
          likes: newLikes,
          likeCount: increment(1)
        });
        
        // Award Points to post author (+1 for engagement)
        if (!userIsAuthor) {
           await updateDoc(profileRef, { points: increment(1) });
        }
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  }, [user]);

  // 4. View Rendering
  if (loading || !userProfile) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-[#b425aa] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-medium text-[#b425aa]">Establishing Connection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
        body { font-family: 'Poppins', sans-serif; }
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
      
      {/* Header is max-width aligned to main content */}
      <Header userProfile={userProfile} />

      <main className="max-w-md mx-auto min-h-screen relative shadow-2xl shadow-gray-200 overflow-hidden pt-16">
        
        {/* Hub View (Data Feed) */}
        {activeTab === 'home' && (
          <div className="p-4 pt-4">
             {/* AI Coach Trigger */}
             <div className="bg-gradient-to-r from-[#b425aa]/90 to-[#d4af37]/90 rounded-xl p-4 text-white mb-6 shadow-lg flex justify-between items-center">
                <h2 className="font-semibold text-sm">Need guidance?</h2>
                <button 
                  onClick={() => setShowAiCoach(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/40 rounded-full px-3 py-1 text-xs font-bold flex items-center gap-2 transition-all"
                >
                  <Sparkles size={14} className="text-[#ffd700]" />
                  <span>Talk to Coach</span>
                </button>
             </div>

             <h3 className="font-bold text-gray-700 mb-4 px-1">Community Feed</h3>
             
             {posts.length === 0 ? (
               <div className="text-center py-10 opacity-50">
                 <Leaf size={48} className="mx-auto mb-2 text-gray-400" />
                 <p>Be the first to plant a seed!</p>
               </div>
             ) : (
               posts.map(post => (
                 <PostCard 
                    key={post.id} 
                    post={post} 
                    user={user} 
                    onLike={handleLike} 
                 />
               ))
             )}
          </div>
        )}

        {/* Profile View (User Data) */}
        {activeTab === 'profile' && (
          <div className="p-4 pt-8">
            <div className="text-center mb-8">
              <img 
                src={userProfile.avatarUrl} 
                className="w-24 h-24 mx-auto rounded-full mb-3 border-4 border-[#d4af37] object-cover" 
                alt="avatar" 
              />
              <h2 className="text-2xl font-bold text-gray-900">{userProfile.displayName}</h2>
              <p className="text-xs text-gray-500 mt-1">User ID: {userProfile.userId}</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-[#b425aa] font-medium bg-gray-100 py-1 px-3 rounded-full mx-auto w-fit">
                {BADGES.slice().reverse().find(b => userProfile.points >= b.threshold)?.icon}
                <span>{BADGES.slice().reverse().find(b => userProfile.points >= b.threshold)?.name}</span>
              </div>
            </div>
            
            <button 
              onClick={() => auth.signOut()} 
              className="w-full mt-6 bg-red-500 text-white font-bold py-3 rounded-xl shadow-md hover:bg-red-600 flex justify-center items-center gap-2"
            >
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        )}

        {/* Placeholder for Wallet/Badges */}
        {(activeTab === 'wallet' || activeTab === 'badges') && (
            <div className="pt-20 text-center p-4">
                <h2 className="text-2xl font-bold text-gray-500">Feature Coming Soon!</h2>
                <p className="text-gray-400 mt-2">Current Points: {userProfile.points} GP</p>
            </div>
        )}
      </main>

      {/* Modals & Overlays */}
      {showCreatePost && (
        <CreatePostModal 
          onClose={() => setShowCreatePost(false)} 
          onSubmit={handleCreatePost}
        />
      )}

      {showAiCoach && (
        <AiCoachModal onClose={() => setShowAiCoach(false)} />
      )}
      
      {/* Create Tab Trigger */}
      {activeTab === 'create' && (() => {
        // Immediately reset tab and open modal
        setTimeout(() => {
          setActiveTab('home');
          setShowCreatePost(true);
        }, 0);
        return null;
      })()}


      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center z-50 safe-area-bottom shadow-lg">
        <NavBtn icon={<Home size={24} />} label="Hub" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavBtn icon={<Wallet size={24} />} label="Wallet" active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} />
        
        <button 
          onClick={() => setActiveTab('create')}
          className="relative -top-5 bg-[#b425aa] text-white p-4 rounded-full shadow-xl border-4 border-gray-50 transition-transform active:scale-95"
        >
          <PlusCircle size={32} />
        </button>
        
        <NavBtn icon={<Award size={24} />} label="Badges" active={activeTab === 'badges'} onClick={() => setActiveTab('badges')} />
        <NavBtn icon={<User size={24} />} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </div>
    </div>
  );
};

export default App;
