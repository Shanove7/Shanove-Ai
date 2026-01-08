import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Zap, Copy, Check, Sun, Moon, Trash2, StopCircle, User, Lock, 
  Mail, Loader2, Image as ImageIcon, Upload, Menu, X, MessageSquare, 
  Edit3, Plus, MessageCircle, AlertTriangle, LogOut, Sparkles, Terminal,
  LayoutDashboard, Users, Activity, Key, Play, Code, Info
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
    version: "v17.0 Enterprise",
    logo_url: "https://raw.githubusercontent.com/Shanove7/Shanove-Ai/refs/heads/main/1764308690923.jpg",
    wa_url: "https://wa.me/6285185032092?text=Halo%20Admin%20Shanove,%20saya%20butuh%20bantuan...",
    admin_email: "kasannudin29@gmail.com"
};

// --- LIMIT CONFIG ---
const LIMITS = {
    GUEST: 3,
    USER: 50,
    ADMIN: 999999
};

const SYSTEM_PROMPT = `
Nama kamu Shanove AI. Kamu adalah asisten AI yang cerdas, ramah, dan membantu dalam berbagai topik (bukan cuma coding).
Gaya: Santai tapi sopan, gunakan Bahasa Indonesia.
Format: Gunakan **bold** untuk poin penting.
`;

// --- TOAST COMPONENT (NOTIFICATION SYSTEM) ---
const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
            {toasts.map(toast => (
                <div key={toast.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md animate-in slide-in-from-right duration-300 ${
                    toast.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 
                    toast.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 
                    'bg-gray-800/80 border-gray-700 text-white'
                }`}>
                    {toast.type === 'error' ? <AlertTriangle size={18}/> : <Check size={18}/>}
                    <span className="text-sm font-medium">{toast.message}</span>
                    <button onClick={() => removeToast(toast.id)} className="ml-2 hover:opacity-70"><X size={14}/></button>
                </div>
            ))}
        </div>
    );
};

// --- UTILS ---
const formatMessageText = (text) => {
    return text.split('\n').map((line, i) => {
        if (!line) return <div key={i} className="h-2"></div>;
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return <p key={i} className="mb-1 leading-relaxed">{parts.map((p, j) => p.startsWith('**') ? <strong key={j} className="text-indigo-400 font-bold">{p.slice(2, -2)}</strong> : p)}</p>;
    });
};

// --- ADMIN COMPONENTS ---
const AdminPanel = ({ isOpen, onClose, users, setUsers, stats, isDark }) => {
    const [tab, setTab] = useState('dashboard');
    const [testQuery, setTestQuery] = useState('');
    const [testResult, setTestResult] = useState(null);

    if (!isOpen) return null;

    const runApiTest = async () => {
        setTestResult('Loading...');
        try {
            const res = await fetch(`${BACKEND_URL}/api/worm`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ query: testQuery || 'Halo' })
            });
            const data = await res.json();
            setTestResult(JSON.stringify(data, null, 2));
        } catch (e) { setTestResult(`Error: ${e.message}`); }
    };

    const updateUserLimit = (email, newLimit) => {
        setUsers(prev => ({ ...prev, [email]: { ...prev[email], limit: parseInt(newLimit) } }));
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex overflow-hidden">
            {/* Sidebar Admin */}
            <div className={`w-64 border-r p-4 flex flex-col gap-2 ${isDark ? 'border-gray-800 bg-[#121212]' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-6 px-2">
                    <div className="bg-red-500 p-1.5 rounded-lg"><Lock size={16} className="text-white"/></div>
                    <span className="font-bold text-lg">Admin Panel</span>
                </div>
                {[
                    {id:'dashboard', icon:LayoutDashboard, label:'Monitoring'},
                    {id:'users', icon:Users, label:'User Manager'},
                    {id:'api', icon:Code, label:'API Docs'},
                    {id:'test', icon:Play, label:'API Playground'},
                ].map(item => (
                    <button key={item.id} onClick={() => setTab(item.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tab === item.id ? 'bg-indigo-600 text-white' : 'hover:bg-gray-800 text-gray-400'}`}>
                        <item.icon size={18}/> {item.label}
                    </button>
                ))}
                <button onClick={onClose} className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10"><LogOut size={18}/> Exit Panel</button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                {tab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl text-white">
                            <div className="flex justify-between items-start mb-4"><Users size={24} opacity={0.8}/><span className="text-xs bg-white/20 px-2 py-1 rounded">Realtime</span></div>
                            <div className="text-3xl font-bold">{Object.keys(users).length}</div>
                            <div className="text-sm opacity-80">Total Registered Users</div>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl text-white">
                            <div className="flex justify-between items-start mb-4"><Activity size={24} className="text-green-400"/><span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded">Today</span></div>
                            <div className="text-3xl font-bold">{stats.totalHits}</div>
                            <div className="text-sm opacity-60">Total API Hits</div>
                        </div>
                    </div>
                )}

                {tab === 'users' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold mb-4">User Management</h2>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-900 text-gray-400 uppercase">
                                    <tr><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Limit (Daily)</th><th className="p-4">Used</th><th className="p-4">Actions</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {Object.entries(users).map(([email, data]) => (
                                        <tr key={email} className="hover:bg-gray-700/50">
                                            <td className="p-4 font-medium">{email}</td>
                                            <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${data.isAdmin ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{data.isAdmin ? 'ADMIN' : 'USER'}</span></td>
                                            <td className="p-4"><input type="number" className="bg-black/20 border border-gray-600 rounded px-2 py-1 w-20 text-center" value={data.limit} onChange={(e) => updateUserLimit(email, e.target.value)} /></td>
                                            <td className="p-4">{data.usage}</td>
                                            <td className="p-4"><button className="text-red-400 hover:underline">Ban</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'api' && (
                    <div className="space-y-6 max-w-3xl">
                        <h2 className="text-2xl font-bold">API Documentation</h2>
                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 font-mono text-sm">
                            <div className="flex items-center gap-2 mb-4 text-green-400"><span className="px-2 py-1 bg-green-500/10 rounded">POST</span> <span>/api/v1/chat</span></div>
                            <p className="text-gray-400 mb-4">Endpoint ini memungkinkan integrasi Shanove AI ke aplikasi pihak ketiga.</p>
                            <div className="mb-2 text-gray-500">Headers</div>
                            <pre className="bg-black p-3 rounded mb-4 text-indigo-300">Authorization: Bearer sk-shanove-YOUR-KEY</pre>
                            <div className="mb-2 text-gray-500">Body (JSON)</div>
                            <pre className="bg-black p-3 rounded text-yellow-300">
{`{
  "model": "worm", // or 'shanove'
  "query": "Apa kabar?"
}`}
                            </pre>
                        </div>
                    </div>
                )}

                {tab === 'test' && (
                    <div className="space-y-4 max-w-2xl">
                        <h2 className="text-2xl font-bold">API Playground</h2>
                        <input value={testQuery} onChange={e=>setTestQuery(e.target.value)} placeholder="Masukkan prompt test..." className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl outline-none focus:border-indigo-500"/>
                        <button onClick={runApiTest} className="px-6 py-3 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-700">Test Request</button>
                        {testResult && (
                            <div className="mt-4 bg-black p-4 rounded-xl font-mono text-xs overflow-x-auto border border-gray-800">
                                <pre className="text-green-400">{testResult}</pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- AUTH & PROFILE COMPONENTS ---
const AuthModal = ({ isOpen, onClose, onLogin, addToast, isDark }) => {
  const [step, setStep] = useState('email'); 
  const [email, setEmail] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [serverOtp, setServerOtp] = useState(null); 
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setServerOtp(code);

    const data = {
      service_id: EMAIL_CONFIG.SERVICE_ID,
      template_id: EMAIL_CONFIG.TEMPLATE_ID,
      user_id: EMAIL_CONFIG.PUBLIC_KEY,
      template_params: { to_email: email, otp_code: code, time: "15 Menit", reply_to: 'no-reply@shanove.ai', from_name: APP_INFO.name }
    };

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (response.ok) { setStep('otp'); addToast("OTP terkirim ke email!", "success"); }
      else throw new Error("Gagal");
    } catch (err) { addToast("Gagal kirim email. Cek koneksi.", "error"); } finally { setLoading(false); }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (inputOtp === serverOtp) onLogin(email);
    else addToast("Kode OTP Salah!", "error");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl relative overflow-hidden ${isDark ? 'bg-[#1e1e1e] border border-gray-700' : 'bg-white'}`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X size={20}/></button>
        <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{step === 'email' ? 'Login Akun' : 'Verifikasi'}</h2>
            <p className="text-gray-500 text-sm mt-1">Dapatkan 50 Limit/Hari dengan login.</p>
        </div>
        {step === 'email' ? (
          <form onSubmit={handleSendEmail} className="space-y-4">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className={`w-full p-3 rounded-xl border outline-none ${isDark ? 'bg-[#2a2a2a] border-gray-700' : 'bg-gray-50'}`} />
            <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20"><AlertTriangle size={14} /> <span>Cek folder <b>SPAM</b> jika email tak masuk!</span></div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#5436DA] text-white rounded-xl flex justify-center items-center gap-2">{loading ? <Loader2 className="animate-spin"/> : 'Kirim Kode'}</button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input type="text" required value={inputOtp} onChange={e => setInputOtp(e.target.value)} placeholder="000000" className={`w-full p-3 rounded-xl border outline-none tracking-widest text-center text-xl font-mono ${isDark ? 'bg-[#2a2a2a] border-gray-700' : 'bg-gray-50'}`} />
            <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-xl">Verifikasi</button>
          </form>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [toasts, setToasts] = useState([]);
  
  // USER DATABASE (MOCK DB in LocalStorage)
  const [usersDb, setUsersDb] = useState(() => JSON.parse(localStorage.getItem('shanove_db_users') || '{}'));
  const [currentUserEmail, setCurrentUserEmail] = useState(localStorage.getItem('shanove_curr_email') || null);
  
  // App State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState(() => JSON.parse(localStorage.getItem('shanove_chats_v3') || `[{"id":1,"title":"New Chat","messages":[{"role":"assistant","content":"Halo! Saya Shanove AI."}]}]`));
  const [currentChatId, setCurrentChatId] = useState(() => chats[0]?.id || 1);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState('shanove'); 
  const [statusText, setStatusText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null);
  const bottomRef = useRef(null);

  // Derived User State
  const currentUser = currentUserEmail ? usersDb[currentUserEmail] : { role: 'guest', limit: LIMITS.GUEST, usage: 0 };
  const isAdmin = currentUserEmail === APP_INFO.admin_email;

  // Persist DB
  useEffect(() => localStorage.setItem('shanove_db_users', JSON.stringify(usersDb)), [usersDb]);
  useEffect(() => localStorage.setItem('shanove_chats_v3', JSON.stringify(chats)), [chats]);
  useEffect(() => { if(currentUserEmail) localStorage.setItem('shanove_curr_email', currentUserEmail); else localStorage.removeItem('shanove_curr_email'); }, [currentUserEmail]);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [chats, isLoading, statusText]);

  // DAILY RESET LOGIC (Check on mount)
  useEffect(() => {
      const today = new Date().toDateString();
      const lastReset = localStorage.getItem('shanove_last_reset');
      if (lastReset !== today) {
          // Reset usage for all users in DB
          const updatedDb = { ...usersDb };
          Object.keys(updatedDb).forEach(email => {
              updatedDb[email].usage = 0;
          });
          setUsersDb(updatedDb);
          localStorage.setItem('shanove_last_reset', today);
          localStorage.removeItem('shanove_guest_usage'); // Reset guest too
      }
  }, []);

  // TOAST SYSTEM
  const addToast = (message, type = 'info') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // HANDLERS
  const handleLoginSuccess = (email) => {
      if (!usersDb[email]) {
          // Register new user
          setUsersDb(prev => ({
              ...prev,
              [email]: { role: email === APP_INFO.admin_email ? 'admin' : 'user', limit: email === APP_INFO.admin_email ? LIMITS.ADMIN : LIMITS.USER, usage: 0, isAdmin: email === APP_INFO.admin_email }
          }));
      }
      setCurrentUserEmail(email);
      setShowAuthModal(false);
      addToast(`Selamat datang, ${email.split('@')[0]}!`, 'success');
  };

  const handleLogout = () => {
      setCurrentUserEmail(null);
      setSidebarOpen(false);
      addToast("Berhasil Logout.", "info");
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // LIMIT CHECKING
    let currentUsage = currentUser.usage;
    if (!currentUserEmail) {
        // Guest usage from localstorage specific key
        currentUsage = parseInt(localStorage.getItem('shanove_guest_usage') || '0');
    }

    if (currentUsage >= currentUser.limit) {
        addToast("Limit Habis! Login atau tunggu besok.", "error");
        if (!currentUserEmail) setShowAuthModal(true);
        return;
    }

    const text = input;
    if (model === 'nano' && !selectedImage) { addToast("Upload gambar dulu!", "error"); return; }

    // Update UI immediately
    const userMsg = { role: 'user', content: text, image: (model === 'nano' ? previewUrl : null) };
    const updatedChats = chats.map(c => c.id === currentChatId ? { ...c, messages: [...c.messages, userMsg] } : c);
    setChats(updatedChats);
    setInput('');
    setIsLoading(true);
    setStatusText(model === 'nano' ? "Bentar bg lagi proses nano Banana..." : "Sedang berpikir...");

    // Increment Usage
    if (currentUserEmail) {
        setUsersDb(prev => ({ ...prev, [currentUserEmail]: { ...prev[currentUserEmail], usage: prev[currentUserEmail].usage + 1 } }));
    } else {
        localStorage.setItem('shanove_guest_usage', (currentUsage + 1).toString());
    }

    try {
        let reply = "";
        let imgResult = null;

        if (model === 'shanove') {
            const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
                method: 'POST', headers: { 'Authorization': `Bearer ${CEREBRAS_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: CEREBRAS_MODEL_ID, messages: [{ role: "system", content: SYSTEM_PROMPT }, ...updatedChats.find(c=>c.id===currentChatId).messages.slice(-5)], max_completion_tokens: 1000 })
            });
            const data = await res.json();
            reply = data.choices[0].message.content;
        } else if (model === 'worm') {
            const res = await fetch(`${BACKEND_URL}/api/worm`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: text }) });
            const data = await res.json();
            reply = "🐛 **WormGPT:**\n" + (data.result || "Error");
        } else if (model === 'nano') {
            const formData = new FormData();
            formData.append('prompt', text);
            formData.append('image', selectedImage);
            const res = await fetch(`${BACKEND_URL}/api/nano`, { method: 'POST', body: formData });
            const data = await res.json();
            if(data.error) throw new Error(data.error);
            reply = "🍌 **Nano Banana Result:**";
            imgResult = data.result;
        }

        setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: [...c.messages, userMsg, { role: 'assistant', content: reply, image: imgResult }] } : c));

    } catch (err) {
        addToast(err.message, "error");
        setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: [...c.messages, userMsg, { role: 'assistant', content: `Error: ${err.message}` }] } : c));
    } finally {
        setIsLoading(false);
        setStatusText('');
        if (model === 'nano') { 
            // Keep preview URL for history but reset selection logic for next upload if needed
            // But user might want to edit same image. Let's keep it selected.
        }
    }
  };

  const handleImageSelect = (e) => {
      if (e.target.files?.[0]) {
          const file = e.target.files[0];
          setSelectedImage(file);
          setPreviewUrl(URL.createObjectURL(file));
          setModel('nano');
      }
  };

  return (
    <div className={`flex h-[100dvh] overflow-hidden font-sans transition-colors duration-300 ${isDark ? 'bg-[#212121] text-white' : 'bg-white text-gray-800'}`}>
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(p => p.filter(t => t.id !== id))} />
      <AdminPanel isOpen={showAdminPanel} onClose={() => setShowAdminPanel(false)} users={usersDb} setUsers={setUsersDb} stats={{totalHits: Object.values(usersDb).reduce((a,b)=>a+b.usage,0)}} isDark={isDark} />
      
      {/* SIDEBAR & HEADER logic similar to previous version but calling handleLogout and showing limit bar */}
      <div className={`fixed top-0 left-0 h-full w-72 z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static border-r ${isDark ? 'bg-[#171717] border-[#2f2f2f]' : 'bg-gray-50'}`}>
          <div className="p-4 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                  <img src={APP_INFO.logo_url} className="w-8 h-8 rounded-lg" alt="Logo"/>
                  <div className="font-bold">Shanove AI</div>
                  <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto"><X/></button>
              </div>
              <button onClick={() => { 
                  const newId = Date.now(); setChats([{id:newId, title:'New Chat', messages:[]} , ...chats]); setCurrentChatId(newId); 
              }} className="w-full py-3 bg-indigo-600 text-white rounded-xl mb-4 flex items-center justify-center gap-2 font-medium"><Plus size={18}/> Chat Baru</button>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                  {chats.map(c => (
                      <div key={c.id} onClick={() => {setCurrentChatId(c.id); setSidebarOpen(false)}} className={`p-3 rounded-lg cursor-pointer flex items-center gap-2 text-sm ${currentChatId === c.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                          <MessageSquare size={16}/> <span className="truncate">{c.title}</span>
                          <button onClick={(e)=>{e.stopPropagation(); setChats(chats.filter(ch=>ch.id!==c.id))}} className="ml-auto opacity-0 group-hover:opacity-100 hover:text-red-400"><Trash2 size={14}/></button>
                      </div>
                  ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                  {currentUserEmail ? (
                      <div className="space-y-3">
                          <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">{currentUserEmail.charAt(0).toUpperCase()}</div>
                              <div className="flex-1 min-w-0">
                                  <div className="text-sm font-bold truncate">{currentUserEmail.split('@')[0]}</div>
                                  <div className="text-xs opacity-60 truncate">{isAdmin ? 'Administrator' : 'Pro User'}</div>
                              </div>
                          </div>
                          {/* Limit Bar */}
                          <div className="space-y-1">
                              <div className="flex justify-between text-[10px] uppercase font-bold opacity-60"><span>Usage</span><span>{currentUser.usage} / {currentUser.limit}</span></div>
                              <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 transition-all duration-500" style={{width: `${Math.min(100, (currentUser.usage / currentUser.limit) * 100)}%`}}></div>
                              </div>
                          </div>
                          
                          {isAdmin && (
                              <button onClick={() => setShowAdminPanel(true)} className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-gray-700">
                                  <Key size={14}/> Admin Panel
                              </button>
                          )}
                          
                          <button onClick={handleLogout} className="w-full py-2 hover:bg-red-500/10 text-red-400 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                              <LogOut size={14}/> Logout
                          </button>
                      </div>
                  ) : (
                      <div className="space-y-2">
                          <div className="text-xs text-center opacity-60 mb-1">Guest Limit: {parseInt(localStorage.getItem('shanove_guest_usage')||0)} / {LIMITS.GUEST}</div>
                          <button onClick={() => setShowAuthModal(true)} className="w-full py-2 bg-white text-black font-bold rounded-lg text-sm">Login / Daftar</button>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative w-full">
          <header className={`p-3 border-b flex justify-between items-center ${isDark ? 'bg-[#212121] border-[#2f2f2f]' : 'bg-white'}`}>
              <div className="flex items-center gap-3">
                  <button onClick={() => setSidebarOpen(true)} className="md:hidden"><Menu/></button>
                  <div className="flex bg-black/10 rounded-lg p-1 gap-1">
                      {['shanove', 'worm', 'nano'].map(m => (
                          <button key={m} onClick={() => setModel(m)} className={`px-3 py-1 text-xs font-bold rounded-md uppercase transition-all ${model === m ? (isDark ? 'bg-[#2f2f2f] text-white shadow' : 'bg-white text-black shadow') : 'opacity-50'}`}>
                              {m}
                          </button>
                      ))}
                  </div>
              </div>
              <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-lg hover:bg-white/10">{isDark ? <Sun size={20}/> : <Moon size={20}/>}</button>
          </header>

          <main className="flex-1 overflow-y-auto px-2 custom-scrollbar">
              <div className="flex flex-col items-center pb-32 pt-4">
                  {chats.find(c=>c.id===currentChatId)?.messages.map((m,i) => <MessageItem key={i} role={m.role} content={m.content} image={m.image} isDark={isDark} />)}
                  {(isLoading || statusText) && <div className="animate-pulse text-xs opacity-50 mt-2">{statusText}</div>}
                  <div ref={bottomRef} />
              </div>
          </main>

          <footer className={`p-3 ${isDark ? 'bg-[#212121]' : 'bg-white'}`}>
              <div className="max-w-3xl mx-auto">
                  <form onSubmit={handleSend} className={`flex gap-2 p-2 rounded-2xl border ${isDark ? 'bg-[#2f2f2f] border-gray-700' : 'bg-gray-100'}`}>
                      <input id="imgUpload" type="file" onChange={handleImageSelect} accept="image/*" className="hidden" />
                      <button type="button" onClick={() => document.getElementById('imgUpload').click()} className={`p-2 rounded-lg ${model==='nano' && selectedImage ? 'text-green-500 bg-green-500/10' : 'text-gray-400 hover:bg-white/5'}`}>
                          {model === 'nano' && selectedImage ? <img src={previewUrl} className="w-6 h-6 rounded object-cover"/> : <Upload size={20}/>}
                      </button>
                      <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ketik pesan..." className="flex-1 bg-transparent outline-none text-sm"/>
                      <button type="submit" disabled={isLoading} className="p-2 bg-indigo-600 rounded-xl text-white disabled:opacity-50"><Send size={18}/></button>
                  </form>
              </div>
          </footer>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLogin={handleLoginSuccess} addToast={addToast} isDark={isDark} />
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 0px; }`}</style>
    </div>
  );
}


