import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sun, Moon, Trash2, StopCircle, User, Lock, 
  Loader2, Upload, Menu, X, MessageSquare, 
  Plus, MessageCircle, AlertTriangle, LogOut, 
  Check, Sparkles, Terminal, Key, LayoutDashboard,
  Home, Heart, Instagram, Shield, Search, Edit2, Save, Play
} from 'lucide-react';

// --- CONFIGURATION ---
const API_URL = ""; // Relative path to backend (Vercel)

const EMAIL_CONFIG = {
    SERVICE_ID: "service_rlpso0c",
    TEMPLATE_ID: "template_ozkoz93",
    PUBLIC_KEY: "0eVdYs-0usPaFRNPf"
};

const APP_INFO = {
    name: "Shanove AI",
    version: "v25.0 API Core",
    logo_url: "https://raw.githubusercontent.com/Shanove7/Shanove-Ai/refs/heads/main/1764308690923.jpg",
    wa_url: "https://wa.me/6285185032092",
    ig_url: "https://instagram.com/shanv.konv",
    admin_email: "kasannudin29@gmail.com"
};

const LIMITS = { GUEST: 3, USER: 50, ADMIN: 999999 };
const SYSTEM_PROMPT = "Nama: Shanove AI. Sifat: Asisten Cerdas.";

// --- UTILS ---
const safeParse = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } 
    catch { return fallback; }
};

// --- COMPONENTS ---

// Toast
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

// Code Block
const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="w-full my-3 rounded-lg overflow-hidden font-mono text-sm border border-white/10 shadow-md bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] text-gray-300 border-b border-white/5 select-none">
        <div className="flex items-center gap-2"><Terminal size={14} className="text-blue-400"/><span className="text-xs font-bold uppercase">{language || 'code'}</span></div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs hover:text-white">{copied ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>} {copied ? 'Disalin' : 'Salin'}</button>
      </div>
      <div className="p-4 overflow-x-auto custom-scrollbar"><pre className="text-[13px] leading-6 text-[#d4d4d4] whitespace-pre">{code}</pre></div>
    </div>
  );
};

// Message Bubble
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

// --- PAGES & MODALS ---

const AdminPage = ({ usersDb, setUsersDb, isDark, showToast }) => {
    const [tab, setTab] = useState('dashboard');
    const [testModel, setTestModel] = useState('shanove');
    const [testQuery, setTestQuery] = useState('');
    const [testImg, setTestImg] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // User Edit
    const [search, setSearch] = useState('');
    const [editLimit, setEditLimit] = useState('');

    const handleTestApi = async () => {
        setLoading(true); setTestResult('Sending request...');
        try {
            const formData = new FormData();
            formData.append('model', testModel);
            formData.append('query', testQuery);
            if(testImg) formData.append('image', testImg);

            // Use JSON if not file upload
            let options = { method: 'POST' };
            if (testModel !== 'nano') {
                options.headers = { 'Content-Type': 'application/json' };
                options.body = JSON.stringify({ model: testModel, query: testQuery });
            } else {
                options.body = formData;
            }

            const res = await fetch(`${API_URL}/api/v1/chat`, options);
            const data = await res.json();
            setTestResult(JSON.stringify(data, null, 2));
        } catch (e) { setTestResult(`Error: ${e.message}`); }
        setLoading(false);
    };

    const handleAddLimit = () => {
        const targetEmail = Object.keys(usersDb).find(e => e === search || usersDb[e].username === search);
        if(!targetEmail) { showToast("User not found", "error"); return; }
        setUsersDb(prev => ({...prev, [targetEmail]: {...prev[targetEmail], limit: parseInt(editLimit)}}));
        showToast(`Limit updated for ${usersDb[targetEmail].username}`, "success");
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {[
                    {id:'dashboard', icon:LayoutDashboard, label:'Stats'},
                    {id:'users', icon:Users, label:'Users'},
                    {id:'api', icon:Terminal, label:'Docs'},
                    {id:'test', icon:Play, label:'Playground'}
                ].map(t => (
                    <button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold whitespace-nowrap ${tab===t.id ? 'bg-indigo-600 text-white' : (isDark?'bg-white/5':'bg-gray-100')}`}>
                        <t.icon size={16}/> {t.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {tab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-6 rounded-xl border ${isDark?'bg-white/5 border-white/10':'bg-white border-gray-200'}`}>
                            <div className="text-3xl font-bold">{Object.keys(usersDb).length}</div>
                            <div className="opacity-60">Total Users</div>
                        </div>
                        <div className={`p-6 rounded-xl border ${isDark?'bg-white/5 border-white/10':'bg-white border-gray-200'}`}>
                            <div className="text-3xl font-bold text-green-500">{Object.values(usersDb).reduce((a,b)=>a+b.usage,0)}</div>
                            <div className="opacity-60">Total API Hits</div>
                        </div>
                    </div>
                )}

                {tab === 'users' && (
                    <div className="space-y-4">
                        <div className={`p-4 rounded-xl border ${isDark?'bg-white/5 border-white/10':'bg-gray-50'}`}>
                            <h3 className="font-bold mb-2 text-sm uppercase opacity-70">Add Limit</h3>
                            <div className="flex gap-2">
                                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Username / Email" className={`flex-1 p-2 rounded-lg outline-none border ${isDark?'bg-black/30 border-gray-600':'bg-white'}`}/>
                                <input type="number" value={editLimit} onChange={e=>setEditLimit(e.target.value)} placeholder="Limit" className={`w-20 p-2 rounded-lg outline-none border text-center ${isDark?'bg-black/30 border-gray-600':'bg-white'}`}/>
                                <button onClick={handleAddLimit} className="px-4 bg-indigo-600 text-white rounded-lg font-bold">Save</button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {Object.entries(usersDb).map(([email, data]) => (
                                <div key={email} className={`p-3 rounded-lg flex justify-between items-center text-sm ${isDark?'bg-white/5':'bg-gray-100'}`}>
                                    <div><div className="font-bold">{data.username}</div><div className="text-xs opacity-50">{email}</div></div>
                                    <div className="font-mono">{data.usage} / <span className="text-indigo-500 font-bold">{data.limit}</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'api' && (
                    <div className={`p-4 rounded-xl border font-mono text-xs ${isDark?'bg-black/30 border-white/10':'bg-gray-50'}`}>
                        <div className="text-green-500 font-bold mb-2">ENDPOINT: POST /api/v1/chat</div>
                        <div className="opacity-70 mb-1">// JSON Request (Shanove/Worm)</div>
                        <pre className="p-3 rounded bg-black/50 text-gray-300 mb-4">{`{\n  "model": "shanove", // or "worm"\n  "query": "Hello AI"\n}`}</pre>
                        <div className="opacity-70 mb-1">// Multipart Request (Nano Banana)</div>
                        <pre className="p-3 rounded bg-black/50 text-gray-300">FormData:\n  model: "nano"\n  prompt: "Make it anime"\n  image: (File Object)</pre>
                    </div>
                )}

                {tab === 'test' && (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            {['shanove','worm','nano'].map(m => (
                                <button key={m} onClick={()=>setTestModel(m)} className={`px-3 py-1 rounded text-xs uppercase font-bold ${testModel===m ? 'bg-indigo-600 text-white':'bg-gray-500/20'}`}>{m}</button>
                            ))}
                        </div>
                        <input value={testQuery} onChange={e=>setTestQuery(e.target.value)} placeholder="Query / Prompt" className={`w-full p-3 rounded-lg border outline-none ${isDark?'bg-black/30 border-gray-700':'bg-white'}`}/>
                        {testModel==='nano' && <input type="file" onChange={e=>setTestImg(e.target.files[0])} className="text-xs"/>}
                        <button onClick={handleTestApi} disabled={loading} className="w-full py-2 bg-green-600 text-white rounded-lg font-bold flex justify-center">{loading?<Loader2 className="animate-spin"/>:'TEST EXECUTE'}</button>
                        {testResult && <pre className="p-4 rounded-lg bg-black/50 text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">{testResult}</pre>}
                    </div>
                )}
            </div>
        </div>
    );
};

// Sidebar
const Sidebar = ({ isOpen, onClose, page, setPage, user, onLogout, onOpenAuth, isDark }) => (
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
                {user.isAdmin && <button onClick={()=>{setPage('admin'); onClose()}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-4 ${page==='admin' ? 'bg-red-600 text-white' : 'text-red-500 hover:bg-red-500/10'}`}><Shield size={18}/> Admin Panel</button>}
            </div>
            <div className="p-4 border-t border-white/10 bg-black/20">
                {user.email ? (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-lg text-white">{user.username ? user.username[0].toUpperCase() : 'U'}</div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold truncate text-sm">{user.username}</div>
                            <div className="text-xs opacity-60 font-bold">{user.isAdmin?'ADMIN':'PRO MEMBER'}</div>
                        </div>
                        <button onClick={onLogout} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><LogOut size={18}/></button>
                    </div>
                ) : (
                    <button onClick={onOpenAuth} className="w-full py-3 bg-white text-black font-bold rounded-xl text-sm hover:bg-gray-200">Login / Daftar</button>
                )}
            </div>
        </div>
    </>
);

// Auth Modal
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

// Profile Page
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
          const formData = new FormData();
          formData.append('model', model);
          formData.append('query', input); // Updated Backend uses 'query' or 'prompt'
          formData.append('prompt', input); // For safety
          if(img) formData.append('image', img);

          // Panggil Unified API Backend
          const res = await fetch(`${API_URL}/api/v1/chat`, { method: 'POST', body: formData });
          const data = await res.json();
          
          if(!data.status && data.error) throw new Error(data.error);
          
          let reply = data.result;
          let resImg = null;
          
          if(model === 'nano') {
              reply = "🍌 Selesai!";
              resImg = data.result; // URL or Base64 from backend
          } else if(model === 'worm') {
              reply = "🐛 " + data.result;
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


