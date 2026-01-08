import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sun, Moon, Trash2, StopCircle, User, Lock, 
  Loader2, Upload, Menu, X, MessageSquare, 
  Plus, MessageCircle, AlertTriangle, LogOut, 
  Check, Sparkles, Terminal, Key, LayoutDashboard,
  Home, Heart, Instagram, Shield, Search, Edit2, Save, Play
} from 'lucide-react';

// --- CONFIGURATION ---
const BACKEND_URL = ""; 
const CEREBRAS_API_KEY = "csk-mwxrfk94v8txn2nw2ym538hk38j6cm9vketfxrd9xcf6jc4t";
const CEREBRAS_MODEL_ID = "qwen-3-235b-a22b-instruct-2507";

const EMAIL_CONFIG = {
    SERVICE_ID: "service_rlpso0c",
    TEMPLATE_ID: "template_ozkoz93",
    PUBLIC_KEY: "0eVdYs-0usPaFRNPf"
};

const APP_INFO = {
    name: "Shanove AI",
    version: "v26.0 Stable",
    logo_url: "https://raw.githubusercontent.com/Shanove7/Shanove-Ai/refs/heads/main/1764308690923.jpg",
    wa_url: "https://wa.me/6285185032092",
    ig_url: "https://instagram.com/shanv.konv",
    admin_email: "kasannudin29@gmail.com"
};

const LIMITS = { GUEST: 3, USER: 50, ADMIN: 999999 };
const SYSTEM_PROMPT = "Nama: Shanove AI. Sifat: Asisten Cerdas. Bahasa: Indonesia. Format: Gunakan **bold** untuk poin penting.";

// --- UTILS ---
const safeParse = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch { return fallback; }
};

// --- COMPONENTS ---

const ToastContainer = ({ toasts, removeToast }) => (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
            <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md animate-in slide-in-from-right duration-300 ${t.type==='error'?'bg-red-500/90 text-white border-red-400':'bg-green-500/90 text-white border-green-400'}`}>
                {t.type==='error' ? <AlertTriangle size={18}/> : <Check size={18}/>}
                <span className="text-sm font-medium">{t.msg}</span>
                <button onClick={() => removeToast(t.id)} className="ml-2 hover:opacity-70"><X size={14}/></button>
            </div>
        ))}
    </div>
);

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="w-full my-3 rounded-lg overflow-hidden font-mono text-sm border border-white/10 shadow-md bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] text-gray-300 border-b border-white/5 select-none">
        <div className="flex items-center gap-2"><Terminal size={14} className="text-blue-400"/><span className="text-xs font-bold uppercase">{language || 'code'}</span></div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs hover:text-white transition-colors">{copied ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>} {copied ? 'Disalin' : 'Salin'}</button>
      </div>
      <div className="p-4 overflow-x-auto custom-scrollbar"><pre className="text-[13px] leading-6 text-[#d4d4d4] whitespace-pre">{code}</pre></div>
    </div>
  );
};

const MessageItem = ({ role, content, image, isDark }) => {
  const isUser = role === 'user';
  const parts = (content || "").split(/```(\w*)\n([\s\S]*?)```/g);

  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 px-4 md:px-0 animate-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex w-full max-w-3xl gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm ${isUser ? 'bg-blue-600 text-white' : 'bg-transparent'}`}>
          {isUser ? <User size={18} /> : <img src={APP_INFO.logo_url} className="w-full h-full object-cover" alt="Bot" />}
        </div>
        <div className={`flex flex-col min-w-0 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`text-[15px] leading-relaxed shadow-sm transition-all ${isUser ? (isDark ? 'bg-[#2f2f2f] text-white' : 'bg-[#f4f4f4] text-gray-800') + ' py-3 px-5 rounded-2xl rounded-tr-sm' : (isDark ? 'text-gray-200' : 'text-gray-800') + ' w-full px-1'}`}>
             {!isUser && <div className="font-bold text-xs mb-2 opacity-50 text-indigo-400 select-none">Shanove AI</div>}
             {image && <img src={image} alt="Result" className="mb-4 rounded-xl border border-white/10 shadow-lg w-full max-h-[350px] object-cover" />}
             {parts.map((part, index) => {
               if (index % 3 === 0 && part.trim()) return <div key={index} className="whitespace-pre-wrap">{part.split('**').map((chk, i) => i % 2 === 1 ? <strong key={i} className="text-indigo-400">{chk}</strong> : chk)}</div>;
               if (index % 3 === 2) return <CodeBlock key={index} language={parts[index - 1]} code={part} />;
               return null;
             })}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SIDEBAR ---
const Sidebar = ({ isOpen, onClose, page, setPage, user, onLogout, onOpenAuth, isDark }) => {
    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
            <div className={`fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col ${isDark ? 'bg-[#171717] border-r border-[#2f2f2f]' : 'bg-white border-r border-gray-200'}`}>
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3 font-bold text-xl"><img src={APP_INFO.logo_url} className="w-9 h-9 rounded-lg shadow-lg"/> Shanove</div>
                    <button onClick={onClose} className="p-1 rounded hover:bg-white/10"><X size={20}/></button>
                </div>
                <div className="flex-1 p-4 space-y-2">
                    <div className="text-xs font-bold opacity-40 uppercase tracking-widest px-2 mb-2">Menu</div>
                    {['chat', 'profile', 'thanks'].map(p => (
                        <button key={p} onClick={()=>{setPage(p); onClose()}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all capitalize ${page===p ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white/5'}`}>
                            {p==='chat' ? <Home size={18}/> : p==='profile' ? <User size={18}/> : <Heart size={18}/>} {p}
                        </button>
                    ))}
                    <a href={APP_INFO.ig_url} target="_blank" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-pink-500"><Instagram size={18}/> Instagram</a>
                    
                    {/* ADMIN MENU - Only visible if user is logged in AND is admin */}
                    {user && user.email && user.isAdmin && (
                        <button onClick={()=>{setPage('admin'); onClose()}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-4 ${page==='admin' ? 'bg-red-600 text-white' : 'text-red-500 hover:bg-red-500/10'}`}>
                            <Shield size={18}/> Admin Panel
                        </button>
                    )}
                </div>
                
                <div className="p-4 border-t border-white/10 bg-black/20">
                    {/* CHECK LOGIN STATUS HERE - FIXED */}
                    {user && user.email ? (
                        <div className="flex items-center gap-3 animate-in fade-in">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-lg text-white">
                                {user.username ? user.username[0].toUpperCase() : user.email[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold truncate text-sm">{user.username || user.email.split('@')[0]}</div>
                                <div className="text-xs opacity-60 font-bold">{user.isAdmin?'ADMIN':'PRO MEMBER'}</div>
                            </div>
                            <button onClick={onLogout} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><LogOut size={18}/></button>
                        </div>
                    ) : (
                        <button onClick={onOpenAuth} className="w-full py-3 bg-white text-black font-bold rounded-xl text-sm hover:bg-gray-200 shadow-md">Login / Daftar</button>
                    )}
                </div>
            </div>
        </>
    );
};

// --- PAGES ---

// 1. Profile Page
const ProfilePage = ({ user, currEmail, onUpdateUsername, isDark }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user.username || '');
    return (
        <div className="p-6 flex flex-col items-center justify-center h-full text-center animate-in fade-in">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-xl">
                {user.username ? user.username[0].toUpperCase() : <User size={40}/>}
            </div>
            <div className="flex items-center gap-2 mb-1">
                {isEditing ? (
                    <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} className={`bg-transparent border-b border-blue-500 outline-none text-xl font-bold text-center w-40 ${isDark?'text-white':'text-black'}`} />
                ) : ( <h2 className="text-2xl font-bold">{user.username || 'Guest'}</h2> )}
                {currEmail && (
                    <button onClick={() => { if(isEditing) onUpdateUsername(newName); setIsEditing(!isEditing); }} className="p-1 hover:text-blue-500">
                        {isEditing ? <Save size={18}/> : <Edit2 size={18}/>}
                    </button>
                )}
            </div>
            <div className="text-sm opacity-50 mb-4">{currEmail || 'Not Logged In'}</div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest ${user.isAdmin?'bg-red-500/20 text-red-500':currEmail?'bg-blue-500/20 text-blue-500':'bg-gray-500/20 text-gray-500'}`}>{user.isAdmin?'ADMINISTRATOR':currEmail?'PRO MEMBER':'FREE TIER'}</span>
            <div className={`mt-8 w-full max-w-xs p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex justify-between text-sm mb-2 opacity-70"><span>Daily Usage</span><span>{user.usage} / {user.limit}</span></div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{width:`${Math.min(100,(user.usage/user.limit)*100)}%`}}></div></div>
            </div>
        </div>
    );
};

// 2. Admin Page (FIXED)
const AdminPage = ({ usersDb, setUsersDb, isDark, showToast }) => {
    const [search, setSearch] = useState('');
    const [editLimit, setEditLimit] = useState('');
    
    // Safety check if usersDb is null/undefined
    if (!usersDb) return <div className="p-8 text-center">Loading Database...</div>;

    const handleAddLimit = () => {
        const targetEmail = Object.keys(usersDb).find(e => e === search || usersDb[e]?.username === search);
        if(!targetEmail) { showToast("User tidak ditemukan!", "error"); return; }
        
        setUsersDb(prev => ({
            ...prev, 
            [targetEmail]: {...prev[targetEmail], limit: parseInt(editLimit)}
        }));
        showToast(`Limit updated for ${usersDb[targetEmail].username}`, "success");
    };

    return (
        <div className="p-6 h-full overflow-y-auto custom-scrollbar animate-in fade-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Shield className="text-red-500"/> Admin Panel</h2>
            <div className={`p-6 rounded-xl border mb-8 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className="font-bold mb-4">Add Limit via Username/Email</h3>
                <div className="flex gap-2 flex-col md:flex-row">
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Username atau Email..." className={`flex-1 p-3 rounded-lg outline-none border ${isDark?'bg-black/30 border-gray-700':'bg-white border-gray-300'}`}/>
                    <input type="number" value={editLimit} onChange={e=>setEditLimit(e.target.value)} placeholder="Limit" className={`w-24 p-3 rounded-lg outline-none border text-center ${isDark?'bg-black/30 border-gray-700':'bg-white border-gray-300'}`}/>
                    <button onClick={handleAddLimit} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Update</button>
                </div>
            </div>
            <div className="space-y-2">
                <h3 className="font-bold opacity-70 mb-2">Registered Users ({Object.keys(usersDb).length})</h3>
                {Object.entries(usersDb).map(([email, data]) => (
                    <div key={email} className={`p-3 rounded-lg flex justify-between items-center text-sm ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                        <div className="flex flex-col"><span className="font-bold">{data.username}</span><span className="text-xs opacity-50">{email}</span></div>
                        <span className="font-bold text-indigo-400">Limit: {data.limit}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 3. Thanks Page
const ThanksPage = ({ isDark }) => (
    <div className="p-8 h-full overflow-y-auto animate-in fade-in">
        <h2 className="text-3xl font-bold mb-6 text-center">✨ Credits</h2>
        <div className="space-y-4 max-w-md mx-auto">
            {['Kasan (Creator)', 'Leo (Owner)', 'Cerebras AI', 'Nano Banana Team', 'Vercel'].map((n, i) => (
                <div key={i} className={`p-4 rounded-xl flex items-center gap-4 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <Heart className="text-pink-500 fill-current" size={20}/> <span className="font-bold">{n}</span>
                </div>
            ))}
        </div>
        <div className="text-center mt-8 opacity-50 text-sm">Made with ❤️ by Shanove Team</div>
    </div>
);

// 4. Auth Modal
const AuthModal = ({ isOpen, onClose, onLogin, showToast, isDark }) => {
  const [step, setStep] = useState('email'); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState(null); 
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const sendEmail = async (e) => {
    e.preventDefault(); setLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setServerOtp(code);
    try {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ service_id: EMAIL_CONFIG.SERVICE_ID, template_id: EMAIL_CONFIG.TEMPLATE_ID, user_id: EMAIL_CONFIG.PUBLIC_KEY, template_params: { to_email: email, otp_code: code, time: "15 Menit", reply_to: 'no-reply@shanove.ai', from_name: APP_INFO.name } })
        });
        setStep('otp'); showToast('OTP terkirim ke email', 'success');
    } catch { showToast('Gagal kirim email', 'error'); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl relative ${isDark ? 'bg-[#1e1e1e] border border-gray-700 text-white' : 'bg-white text-black'}`}>
        <button onClick={onClose} className="absolute top-4 right-4"><X/></button>
        <h2 className="text-2xl font-bold mb-2 text-center">{step === 'email' ? 'Login Akun' : 'Verifikasi'}</h2>
        <p className="text-center text-sm opacity-60 mb-6">{step === 'email' ? 'Dapatkan 50 limit/hari.' : `OTP dikirim ke ${email}`}</p>
        {step === 'email' ? (
          <form onSubmit={sendEmail} className="space-y-4">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className={`w-full p-3 rounded-xl border outline-none ${isDark ? 'bg-[#2a2a2a] border-gray-700' : 'bg-gray-50'}`} />
            <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 p-3 rounded-lg"><AlertTriangle size={14}/> Cek folder <b>SPAM</b> jika tidak masuk!</div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 rounded-xl font-bold flex justify-center text-white">{loading ? <Loader2 className="animate-spin"/> : 'Kirim Kode'}</button>
          </form>
        ) : (
          <div className="space-y-4">
            <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" className={`w-full p-3 rounded-xl border text-center tracking-widest text-xl font-mono outline-none ${isDark ? 'bg-[#2a2a2a] border-gray-700' : 'bg-gray-50'}`} />
            <button onClick={() => { if(otp===serverOtp) onLogin(email); else showToast("OTP Salah", "error"); }} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold">Verifikasi</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [page, setPage] = useState('chat');

  // DB & STATE
  const [usersDb, setUsersDb] = useState(() => safeParse('shanove_db_users', {}));
  const [currEmail, setCurrEmail] = useState(localStorage.getItem('shanove_curr_email'));
  const [chats, setChats] = useState(() => safeParse('shanove_chats_v6', [{id:1, title:'New Chat', messages:[{role:'assistant', content:'Halo! Saya Shanove AI.'}]}]));
  const [chatId, setChatId] = useState(() => chats[0]?.id || 1);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('shanove');
  const [status, setStatus] = useState('');
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const bottomRef = useRef(null);

  // COMPUTED
  const user = currEmail ? (usersDb[currEmail] || { role:'user', limit: LIMITS.USER, usage: 0, username: 'User' }) : { role:'guest', limit: LIMITS.GUEST, usage: parseInt(localStorage.getItem('shanove_guest_usage')||0) };
  const isAdmin = currEmail === APP_INFO.admin_email;
  const currentChat = chats.find(c => c.id === chatId) || chats[0];
  const remaining = Math.max(0, user.limit - user.usage);

  // EFFECTS
  useEffect(() => localStorage.setItem('shanove_db_users', JSON.stringify(usersDb)), [usersDb]);
  useEffect(() => localStorage.setItem('shanove_chats_v6', JSON.stringify(chats)), [chats]);
  useEffect(() => { if(currEmail) localStorage.setItem('shanove_curr_email', currEmail); else localStorage.removeItem('shanove_curr_email'); }, [currEmail]);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [chats, loading, status, page]);

  // DAILY RESET
  useEffect(() => {
      const today = new Date().toDateString();
      if (localStorage.getItem('shanove_last_reset') !== today) {
          const newDb = {...usersDb};
          Object.keys(newDb).forEach(k => newDb[k].usage = 0);
          setUsersDb(newDb);
          localStorage.setItem('shanove_guest_usage', '0');
          localStorage.setItem('shanove_last_reset', today);
      }
  }, []);

  const addToast = (msg, type='info') => { const id=Date.now(); setToasts(p=>[...p,{id,msg,type}]); setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3000); };

  const handleLogin = (email) => {
      // Create new user entry if doesn't exist
      const newDb = { ...usersDb };
      if (!newDb[email]) {
          const isAdm = email === APP_INFO.admin_email;
          const randName = `User_${Math.floor(Math.random()*10000)}`;
          newDb[email] = { role: isAdm?'admin':'user', limit: isAdm?LIMITS.ADMIN:LIMITS.USER, usage: 0, isAdmin: isAdm, username: randName };
          setUsersDb(newDb);
      }
      setCurrEmail(email);
      setShowAuth(false);
      addToast("Login Berhasil!", "success");
  };

  const handleUpdateUsername = (newName) => {
      if(currEmail && newName.trim()) {
          setUsersDb(prev => ({...prev, [currEmail]: {...prev[currEmail], username: newName}}));
          addToast("Username diganti!", "success");
      }
  };

  const handleSend = async (e) => {
      e.preventDefault();
      if (!input.trim() || loading) return;

      if (user.usage >= user.limit) {
          addToast(currEmail ? "Limit Harian Habis!" : "Limit Tamu Habis!", "error");
          if (!currEmail) setShowAuth(true);
          return;
      }

      if (model === 'nano' && !img) { addToast("Upload gambar dulu!", "error"); return; }

      const userMsg = { role: 'user', content: input, image: model==='nano' ? preview : null };
      const newMsgs = [...currentChat.messages, userMsg];
      const newChats = chats.map(c => c.id === chatId ? { ...c, messages: newMsgs, title: c.messages.length===1 ? input.slice(0,15)+'...' : c.title } : c);
      setChats(newChats);
      setInput(''); setLoading(true); setStatus(model==='nano' ? "Bentar bg lagi proses nano Banana..." : "Sedang mengetik...");

      if (currEmail) {
          const u = usersDb[currEmail];
          setUsersDb({...usersDb, [currEmail]: {...u, usage: u.usage + 1}});
      } else {
          localStorage.setItem('shanove_guest_usage', (user.usage + 1).toString());
      }

      try {
          let reply = "", resImg = null;
          if (model === 'shanove') {
              const res = await fetch('https://api.cerebras.ai/v1/chat/completions', { method: 'POST', headers: { 'Authorization': `Bearer ${CEREBRAS_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: CEREBRAS_MODEL_ID, messages: [{role:"system",content:SYSTEM_PROMPT}, ...newMsgs.slice(-5)], max_completion_tokens: 800 }) });
              const d = await res.json(); reply = d.choices[0].message.content;
          } else if (model === 'worm') {
              const res = await fetch(`${BACKEND_URL}/api/worm`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ query: userMsg.content }) });
              const d = await res.json(); reply = "🐛 " + (d.result || "Error");
          } else if (model === 'nano') {
              const fd = new FormData(); fd.append('prompt', userMsg.content); fd.append('image', img);
              const res = await fetch(`${BACKEND_URL}/api/nano`, { method: 'POST', body: fd });
              const d = await res.json();
              if (d.error) throw new Error(d.error);
              reply = "🍌 Selesai!"; resImg = d.result;
          }
          setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, userMsg, { role: 'assistant', content: reply, image: resImg }] } : c));
      } catch (err) {
          setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, userMsg, { role: 'assistant', content: `Error: ${err.message}` }] } : c));
      } finally { setLoading(false); setStatus(''); if(model==='nano'){setImg(null);setPreview(null);} }
  };

  return (
    <div className={`flex h-[100dvh] overflow-hidden font-sans ${isDark ? 'bg-[#212121] text-white' : 'bg-white text-gray-900'}`}>
      
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(p => p.filter(t => t.id !== id))} />

      <Sidebar 
          isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}
          page={page} setPage={setPage} user={user}
          onLogout={() => { setCurrEmail(null); addToast("Logout Berhasil"); }}
          onOpenAuth={() => setShowAuth(true)}
          isDark={isDark}
      />

      <div className="flex-1 flex flex-col relative w-full h-full">
          <header className={`p-3 border-b flex justify-between items-center z-20 ${isDark ? 'bg-[#212121] border-[#2f2f2f]' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3">
                  <button onClick={()=>setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/10"><Menu/></button>
                  {page === 'chat' && (
                      <div className="flex flex-col items-start">
                          <div className="flex bg-black/10 rounded-lg p-1 gap-1">
                              {['shanove','worm','nano'].map(m => <button key={m} onClick={()=>setModel(m)} className={`px-3 py-1 text-xs font-bold rounded uppercase transition-all ${model===m ? (isDark?'bg-[#2f2f2f] text-white shadow':'bg-white text-black shadow') : 'opacity-50'}`}>{m}</button>)}
                          </div>
                          <div className={`text-[10px] font-bold mt-1 ml-1 ${remaining<=3?'text-red-500 animate-pulse':'opacity-50'}`}>Sisa Limit: {remaining}</div>
                      </div>
                  )}
                  {page !== 'chat' && <h1 className="font-bold text-lg capitalize">{page === 'admin' ? 'Admin Panel' : page}</h1>}
              </div>
              <button onClick={()=>setIsDark(!isDark)} className="p-2 rounded-lg hover:bg-white/10">{isDark?<Sun size={20}/>:<Moon size={20}/>}</button>
          </header>

          <main className="flex-1 overflow-y-auto custom-scrollbar px-2 relative">
              {page === 'chat' && (
                  <div className="flex flex-col items-center pb-32 pt-4">
                      {currentChat.messages.map((m, i) => <MessageItem key={i} role={m.role} content={m.content} image={m.image} isDark={isDark} />)}
                      {(loading || status) && <div className="animate-pulse text-xs opacity-50 mt-2 font-mono bg-white/5 px-3 py-1 rounded-full">{status}</div>}
                      <div ref={bottomRef} />
                  </div>
              )}
              {page === 'profile' && <ProfilePage user={user} currEmail={currEmail} onUpdateUsername={handleUpdateUsername} isDark={isDark} />}
              {page === 'thanks' && <ThanksPage isDark={isDark} />}
              {page === 'admin' && isAdmin && <AdminPage usersDb={usersDb} setUsersDb={setUsersDb} isDark={isDark} showToast={addToast} />}
          </main>

          {page === 'chat' && (
              <footer className={`p-3 md:p-4 z-20 ${isDark ? 'bg-[#212121]' : 'bg-white'}`}>
                  <div className="max-w-3xl mx-auto">
                      <form onSubmit={handleSend} className={`flex items-center gap-2 p-2 rounded-2xl border transition-all shadow-lg ${isDark ? 'bg-[#2f2f2f] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                          <input id="imgUp" type="file" className="hidden" onChange={e => {if(e.target.files[0]){setImg(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); setModel('nano')}}} />
                          {model === 'nano' && (
                              <button type="button" onClick={()=>document.getElementById('imgUp').click()} className={`p-2 rounded-lg transition-colors ${preview ? 'text-green-500 bg-green-500/10' : 'text-gray-400 hover:bg-white/5'}`}>{preview?<img src={preview} className="w-6 h-6 rounded object-cover"/>:<Upload size={20}/>}</button>
                          )}
                          <input value={input} onChange={e=>setInput(e.target.value)} placeholder={model==='nano'?"Deskripsi gambar...":model==='worm'?"Tanya WormGPT...":"Ketik pesan..."} className="flex-1 bg-transparent outline-none text-sm min-w-0" disabled={loading} enterKeyHint="send" type="text" />
                          <button type="submit" disabled={loading} className="p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"><Send size={18}/></button>
                      </form>
                  </div>
              </footer>
          )}
      </div>

      <AuthModal isOpen={showAuth} onClose={()=>setShowAuth(false)} onLogin={handleLogin} showToast={addToast} isDark={isDark} />
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }`}</style>
    </div>
  );
}


