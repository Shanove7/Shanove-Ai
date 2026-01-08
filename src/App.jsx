import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Zap, Copy, Check, Sun, Moon, Trash2, StopCircle, User, Lock, 
  Mail, Loader2, Image as ImageIcon, Upload, Menu, X, MessageSquare, 
  Edit3, Plus, MessageCircle, AlertTriangle, LogOut, LayoutDashboard, 
  Users, Activity, Key, Play, Code, Sparkles, Terminal
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
    version: "v20.0 Fixed",
    logo_url: "https://raw.githubusercontent.com/Shanove7/Shanove-Ai/refs/heads/main/1764308690923.jpg",
    wa_url: "https://wa.me/6285185032092",
    admin_email: "kasannudin29@gmail.com"
};

const LIMITS = { GUEST: 3, USER: 50, ADMIN: 999999 };
const SYSTEM_PROMPT = "Nama: Shanove AI. Sifat: Asisten Cerdas. Bahasa: Indonesia. Format: Gunakan **bold** untuk poin penting.";

// --- SAFE STORAGE UTILS ---
const safeParse = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        localStorage.removeItem(key);
        return fallback;
    }
};

// --- COMPONENTS ---

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
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

// --- SIDEBAR (RESTORED PROFILE & LIMIT INFO) ---
const Sidebar = ({ isOpen, onClose, chats, currentChatId, onSelectChat, onNewChat, onDeleteChat, user, limits, onLogout, onOpenAdmin, onOpenAuth, isDark }) => {
    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={onClose}></div>}
            
            <div className={`fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static border-r flex flex-col ${isDark ? 'bg-[#171717] border-[#2f2f2f]' : 'bg-gray-50 border-gray-200'}`}>
                {/* Header Sidebar */}
                <div className="p-4">
                    <div className="flex items-center gap-3 mb-6">
                        <img src={APP_INFO.logo_url} className="w-8 h-8 rounded-lg shadow-sm" alt="Logo"/>
                        <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Shanove AI</span>
                        <button onClick={onClose} className="md:hidden ml-auto p-1 hover:bg-white/10 rounded"><X size={20}/></button>
                    </div>
                    <button onClick={() => { onNewChat(); if(window.innerWidth < 768) onClose(); }} className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold mb-2 transition-all ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                        <Plus size={18} /> Chat Baru
                    </button>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
                    {chats.map(chat => (
                        <div key={chat.id} className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${currentChatId === chat.id ? (isDark ? 'bg-[#2f2f2f] text-white' : 'bg-gray-200 text-gray-900') : (isDark ? 'text-gray-400 hover:bg-[#2f2f2f]/50' : 'text-gray-600 hover:bg-gray-100')}`}
                            onClick={() => { onSelectChat(chat.id); if(window.innerWidth < 768) onClose(); }}
                        >
                            <MessageSquare size={16} className="shrink-0 opacity-70" />
                            <span className="text-sm truncate w-full">{chat.title}</span>
                            <button onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }} className="absolute right-2 p-1 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                        </div>
                    ))}
                </div>

                {/* Footer Profile & Limit (RESTORED) */}
                <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    {user.email ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-lg">{user.email[0].toUpperCase()}</div>
                                <div className="flex-1 min-w-0">
                                    <div className={`font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.email.split('@')[0]}</div>
                                    <div className="text-xs opacity-60 flex justify-between">
                                        <span>{user.usage}/{user.limit}</span> 
                                        <span className="uppercase font-bold text-[10px]">{user.isAdmin ? 'ADMIN' : 'PRO'}</span>
                                    </div>
                                    {/* Limit Progress Bar */}
                                    <div className="h-1.5 bg-gray-700 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-indigo-500 transition-all duration-500" style={{width: `${Math.min(100, (user.usage / user.limit) * 100)}%`}}></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                {user.isAdmin && (
                                    <button onClick={onOpenAdmin} className={`col-span-2 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}>
                                        <Key size={14}/> Admin Panel
                                    </button>
                                )}
                                <button onClick={onLogout} className="col-span-2 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                                    <LogOut size={14}/> Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-3">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs opacity-60"><span>Guest Limit</span><span>{user.usage} / {limits.GUEST}</span></div>
                                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-500 transition-all duration-500" style={{width: `${Math.min(100, (user.usage / limits.GUEST) * 100)}%`}}></div>
                                </div>
                            </div>
                            <button onClick={onOpenAuth} className={`w-full py-2.5 font-bold rounded-lg text-sm transition-colors ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>Login / Daftar</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

const AdminPanel = ({ isOpen, onClose, users, setUsers, stats, isDark }) => {
    const [tab, setTab] = useState('dashboard');
    const [testResult, setTestResult] = useState(null);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className={`w-64 border-r p-4 flex flex-col gap-2 ${isDark ? 'border-gray-800 bg-[#121212] text-white' : 'bg-white text-black'}`}>
                <div className="font-bold text-lg mb-6 px-2 flex items-center gap-2"><Lock size={18} className="text-red-500"/> Admin Panel</div>
                <button onClick={() => setTab('dashboard')} className={`p-3 rounded-xl flex gap-3 ${tab==='dashboard'?'bg-indigo-600 text-white':'hover:bg-gray-800'}`}><LayoutDashboard size={18}/> Dashboard</button>
                <button onClick={() => setTab('users')} className={`p-3 rounded-xl flex gap-3 ${tab==='users'?'bg-indigo-600 text-white':'hover:bg-gray-800'}`}><Users size={18}/> Users</button>
                <button onClick={() => setTab('api')} className={`p-3 rounded-xl flex gap-3 ${tab==='api'?'bg-indigo-600 text-white':'hover:bg-gray-800'}`}><Code size={18}/> API Docs</button>
                <button onClick={onClose} className="mt-auto p-3 rounded-xl flex gap-3 text-red-400 hover:bg-red-500/10"><LogOut size={18}/> Exit</button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto text-white custom-scrollbar">
                {tab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl">
                            <div className="text-3xl font-bold">{Object.keys(users).length}</div>
                            <div className="opacity-80">Total Users</div>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl">
                            <div className="text-3xl font-bold text-green-400">{stats}</div>
                            <div className="opacity-60">Total Hits</div>
                        </div>
                    </div>
                )}
                {tab === 'users' && (
                    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-900 text-gray-400"><tr><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Limit</th><th className="p-4">Used</th></tr></thead>
                            <tbody className="divide-y divide-gray-700">
                                {Object.entries(users).map(([email, u]) => (
                                    <tr key={email}>
                                        <td className="p-4 font-medium">{email}</td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${u.isAdmin ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{u.isAdmin ? 'ADMIN' : 'USER'}</span></td>
                                        <td className="p-4"><input type="number" className="bg-black/20 w-20 text-center border border-gray-600 rounded p-1" value={u.limit} onChange={(e)=>setUsers(p=>({...p, [email]: {...u, limit: parseInt(e.target.value)}}))} /></td>
                                        <td className="p-4">{u.usage}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {tab === 'api' && (
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 font-mono text-sm">
                        <div className="text-green-400 mb-2 font-bold">POST /api/v1/chat</div>
                        <pre className="bg-black p-4 rounded text-gray-300 border border-gray-800">{`{\n  "model": "worm",\n  "query": "Hello"\n}`}</pre>
                        <button onClick={async ()=>{ try { const r=await fetch(`${BACKEND_URL}/api/worm`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'Test'})}); const d=await r.json(); setTestResult(d); } catch(e){setTestResult(e.message)} }} className="mt-4 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 transition-colors">Test API</button>
                        {testResult && <pre className="mt-4 text-xs text-green-300 bg-black/50 p-4 rounded">{JSON.stringify(testResult,null,2)}</pre>}
                    </div>
                )}
            </div>
        </div>
    );
};

const AuthModal = ({ isOpen, onClose, onLogin, isDark }) => {
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
        setStep('otp');
    } catch { alert("Gagal kirim email. Cek koneksi."); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl relative ${isDark ? 'bg-[#1e1e1e] border border-gray-700 text-white' : 'bg-white text-black'}`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X size={20}/></button>
        <h2 className="text-2xl font-bold mb-2 text-center">{step === 'email' ? 'Login Akun' : 'Verifikasi'}</h2>
        <p className="text-center text-sm opacity-60 mb-6">{step === 'email' ? 'Dapatkan 50 limit/hari dengan login.' : `Kode OTP dikirim ke ${email}`}</p>
        
        {step === 'email' ? (
          <form onSubmit={sendEmail} className="space-y-4">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className={`w-full p-3 rounded-xl border outline-none ${isDark ? 'bg-[#2a2a2a] border-gray-700' : 'bg-gray-50'}`} />
            <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20"><AlertTriangle size={14}/> Cek folder <b>SPAM</b> jika tidak masuk!</div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 rounded-xl font-bold flex justify-center text-white hover:bg-indigo-700 transition-colors">{loading ? <Loader2 className="animate-spin"/> : 'Kirim Kode'}</button>
          </form>
        ) : (
          <div className="space-y-4">
            <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" className={`w-full p-3 rounded-xl border text-center tracking-widest text-xl font-mono outline-none ${isDark ? 'bg-[#2a2a2a] border-gray-700' : 'bg-gray-50'}`} />
            <button onClick={() => { if(otp===serverOtp) onLogin(email); else alert("OTP Salah"); }} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">Verifikasi</button>
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
  const [showAdmin, setShowAdmin] = useState(false);
  
  // DB & AUTH (SAFE LOAD)
  const [usersDb, setUsersDb] = useState(() => safeParse('shanove_db_users', {}));
  const [currEmail, setCurrEmail] = useState(localStorage.getItem('shanove_curr_email'));
  
  // CHAT DATA
  const [chats, setChats] = useState(() => safeParse('shanove_chats_v4', [{id:1, title:'New Chat', messages:[{role:'assistant', content:'Halo! Saya Shanove AI.'}]}]));
  const [chatId, setChatId] = useState(() => chats[0]?.id || 1);
  
  // STATE
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('shanove');
  const [status, setStatus] = useState('');
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const bottomRef = useRef(null);

  // COMPUTED USER
  const user = currEmail ? (usersDb[currEmail] || { role:'user', limit: LIMITS.USER, usage: 0 }) : { role:'guest', limit: LIMITS.GUEST, usage: parseInt(localStorage.getItem('shanove_guest_usage')||0) };
  const isAdmin = currEmail === APP_INFO.admin_email;
  const currentChat = chats.find(c => c.id === chatId) || chats[0];

  // EFFECTS
  useEffect(() => localStorage.setItem('shanove_db_users', JSON.stringify(usersDb)), [usersDb]);
  useEffect(() => localStorage.setItem('shanove_chats_v4', JSON.stringify(chats)), [chats]);
  useEffect(() => { if(currEmail) localStorage.setItem('shanove_curr_email', currEmail); else localStorage.removeItem('shanove_curr_email'); }, [currEmail]);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [chats, loading, status]);

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

  const handleLogin = (email) => {
      if (!usersDb[email]) {
          const isAdm = email === APP_INFO.admin_email;
          setUsersDb(prev => ({...prev, [email]: { role: isAdm?'admin':'user', limit: isAdm?LIMITS.ADMIN:LIMITS.USER, usage: 0, isAdmin: isAdm }}));
      }
      setCurrEmail(email);
      setShowAuth(false);
      alert("Login Berhasil!");
  };

  const handleSend = async (e) => {
      e.preventDefault();
      if (!input.trim() || loading) return;

      if (user.usage >= user.limit) {
          alert(currEmail ? "Limit Harian Habis!" : "Limit Tamu Habis. Login yuk!");
          if (!currEmail) setShowAuth(true);
          return;
      }

      if (model === 'nano' && !img) { alert("Upload gambar dulu!"); return; }

      const userMsg = { role: 'user', content: input, image: model==='nano' ? preview : null };
      const newMsgs = [...currentChat.messages, userMsg];
      
      const newChats = chats.map(c => c.id === chatId ? { ...c, messages: newMsgs, title: c.messages.length===1 ? input.slice(0,15)+'...' : c.title } : c);
      setChats(newChats);
      setInput(''); setLoading(true); setStatus(model==='nano' ? "Bentar bg lagi proses nano Banana..." : "Sedang mengetik...");

      // Update Usage
      if (currEmail) setUsersDb(prev => ({...prev, [currEmail]: {...prev[currEmail], usage: prev[currEmail].usage + 1}}));
      else localStorage.setItem('shanove_guest_usage', (user.usage + 1).toString());

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
      
      <AdminPanel isOpen={showAdmin} onClose={()=>setShowAdmin(false)} users={usersDb} setUsers={setUsersDb} stats={Object.values(usersDb).reduce((a,b)=>a+b.usage,0)} isDark={isDark} />

      {/* SIDEBAR OVERLAY MOBILE */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>}

      {/* SIDEBAR (Profile is HERE) */}
      <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          chats={chats}
          currentChatId={chatId}
          onSelectChat={setChatId}
          onNewChat={() => { const nid=Date.now(); setChats([{id:nid,title:'New Chat',messages:[]} , ...chats]); setChatId(nid); }}
          onDeleteChat={(id) => { const f=chats.filter(c=>c.id!==id); if(f.length===0) setChats([{id:1,title:'New Chat',messages:[]}]); else { setChats(f); if(chatId===id) setChatId(f[0].id); } }}
          user={user}
          limits={LIMITS}
          onLogout={() => { setCurrEmail(null); alert("Logged Out"); }}
          onOpenAdmin={() => setShowAdmin(true)}
          onOpenAuth={() => setShowAuth(true)}
          isDark={isDark}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col relative w-full h-full">
          {/* HEADER */}
          <header className={`p-3 border-b flex justify-between items-center z-20 ${isDark ? 'bg-[#212121] border-[#2f2f2f]' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3">
                  <button onClick={()=>setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-white/5"><Menu/></button>
                  <div className="flex bg-black/10 rounded-lg p-1 gap-1">
                      {['shanove','worm','nano'].map(m => <button key={m} onClick={()=>setModel(m)} className={`px-3 py-1 text-xs font-bold rounded uppercase transition-all ${model===m ? (isDark?'bg-[#2f2f2f] text-white shadow':'bg-white text-black shadow') : 'opacity-50'}`}>{m}</button>)}
                  </div>
              </div>
              <button onClick={()=>setIsDark(!isDark)} className="p-2 rounded-lg hover:bg-white/10">{isDark?<Sun size={20}/>:<Moon size={20}/>}</button>
          </header>

          {/* CHAT AREA */}
          <main className="flex-1 overflow-y-auto custom-scrollbar px-2 relative">
              <div className="flex flex-col items-center pb-32 pt-4">
                  {currentChat.messages.map((m, i) => <MessageItem key={i} role={m.role} content={m.content} image={m.image} isDark={isDark} />)}
                  {(loading || status) && <div className="animate-pulse text-xs opacity-50 mt-2 font-mono bg-white/5 px-3 py-1 rounded-full">{status}</div>}
                  <div ref={bottomRef} />
              </div>
              
              {/* FLOATING WA FIXED */}
              <a href={APP_INFO.wa_url} target="_blank" rel="noreferrer" className="fixed bottom-24 right-4 z-[90] flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 hover:scale-105 transition-all">
                  <MessageCircle size={18}/> <span className="text-sm font-bold">Hubungi Owner</span>
              </a>
          </main>

          {/* INPUT */}
          <footer className={`p-3 md:p-4 z-20 ${isDark ? 'bg-[#212121]' : 'bg-white'}`}>
              <div className="max-w-3xl mx-auto">
                  <form onSubmit={handleSend} className={`flex items-center gap-2 p-2 rounded-2xl border transition-all shadow-lg ${isDark ? 'bg-[#2f2f2f] border-gray-700 focus-within:border-gray-500' : 'bg-gray-50 border-gray-200 focus-within:border-blue-400'}`}>
                      <input id="imgUp" type="file" className="hidden" onChange={e => {if(e.target.files[0]){setImg(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); setModel('nano')}}} />
                      <button type="button" onClick={()=>document.getElementById('imgUp').click()} className={`p-2 rounded-lg transition-colors ${model==='nano'&&preview ? 'text-green-500 bg-green-500/10' : 'text-gray-400 hover:bg-white/5'}`}>{model==='nano'&&preview?<img src={preview} className="w-6 h-6 rounded object-cover"/>:<Upload size={20}/>}</button>
                      <input value={input} onChange={e=>setInput(e.target.value)} placeholder={model==='nano'?"Deskripsi gambar...":model==='worm'?"Tanya WormGPT...":"Ketik pesan..."} className="flex-1 bg-transparent outline-none text-sm min-w-0" disabled={loading} />
                      <button type="submit" disabled={loading} className="p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"><Send size={18}/></button>
                  </form>
                  <div className="text-center mt-2 text-[10px] opacity-40">Shanove AI v20 • {currEmail ? "Pro Mode" : "Guest Mode"}</div>
              </div>
          </footer>
      </div>

      <AuthModal isOpen={showAuth} onClose={()=>setShowAuth(false)} onLogin={handleLogin} isDark={isDark} />
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }`}</style>
    </div>
  );
}


