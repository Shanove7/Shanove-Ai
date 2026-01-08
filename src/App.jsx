import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sun, Moon, Trash2, User, Lock, Loader2, Upload, Menu, X, 
  MessageSquare, Plus, AlertTriangle, LogOut, Check, Terminal, 
  LayoutDashboard, Home, Heart, Instagram, Shield, Edit2, Save, Book, 
  FileJson, Image as ImageIcon, Copy, Smartphone, Mail
} from 'lucide-react';

// --- 1. CONFIGURATION ---
const BACKEND_URL = ""; // Kosongkan untuk Vercel (Relative Path)
const CEREBRAS_API_KEY = "csk-mwxrfk94v8txn2nw2ym538hk38j6cm9vketfxrd9xcf6jc4t";
const CEREBRAS_MODEL_ID = "qwen-3-235b-a22b-instruct-2507";

const APP_INFO = {
    name: "Shanove AI",
    version: "v34.0 Mobile API",
    logo_url: "https://raw.githubusercontent.com/Shanove7/Shanove-Ai/refs/heads/main/1764308690923.jpg",
    wa_url: "https://wa.me/6285185032092",
    ig_url: "https://instagram.com/shanv.konv",
    admin_email: "kasannudin29@gmail.com",
    api_domain: "https://ai.shanove.my.id"
};

const EMAIL_CONFIG = {
    SERVICE_ID: "service_rlpso0c",
    TEMPLATE_ID: "template_ozkoz93",
    PUBLIC_KEY: "0eVdYs-0usPaFRNPf"
};

const LIMITS = { GUEST: 3, USER: 50, ADMIN: 999999 };
const SYSTEM_PROMPT = "Nama: Shanove AI. Sifat: Asisten Cerdas & Ramah. Gunakan Bahasa Indonesia.";

// --- 2. UTILS (SAFE METHODS) ---
const safeParse = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch { return fallback; }
};

const highlightSyntax = (code) => {
  if (!code) return "";
  let colored = code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\b(const|let|var|function|return|if|else|import|from|async|await)\b/g, '<span style="color: #c678dd; font-weight: bold;">$1</span>')
    .replace(/(['"`])(.*?)\1/g, '<span style="color: #98c379;">$&</span>');
  return <div dangerouslySetInnerHTML={{ __html: colored }} />;
};

// --- 3. COMPONENTS ---

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

const CodeBlock = ({ code, language }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div className="my-3 bg-[#1e1e1e] rounded-lg overflow-hidden border border-gray-700 shadow-md">
            <div className="flex justify-between items-center px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
                <span className="text-xs font-mono text-blue-400 uppercase">{language || 'text'}</span>
                <button onClick={handleCopy} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">{copied ? <Check size={12}/> : <Copy size={12}/>} {copied ? 'Disalin' : 'Salin'}</button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs md:text-sm text-gray-300 font-mono whitespace-pre-wrap">{highlightSyntax(code)}</pre>
        </div>
    );
};

const MessageItem = ({ role, content, image, isDark }) => {
    const isUser = role === 'user';
    const parts = (content || "").split(/```(\w*)\n([\s\S]*?)```/g);

    return (
        <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[95%] md:max-w-[80%] gap-2 md:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden ${isUser ? 'bg-blue-600' : 'bg-transparent'}`}>
                    {isUser ? <User size={16} className="text-white" /> : <img src={APP_INFO.logo_url} className="w-full h-full object-cover" alt="Bot" />}
                </div>
                <div className={`flex flex-col min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm md:text-[15px] shadow-sm ${isUser ? (isDark?'bg-[#2f2f2f] text-white':'bg-blue-600 text-white') : (isDark?'bg-[#1e1e1e] border border-gray-700 text-gray-200':'bg-white border border-gray-200 text-gray-800')}`}>
                        {!isUser && <div className="text-[10px] font-bold text-blue-500 mb-1 opacity-70">Shanove AI</div>}
                        {image && <img src={image} className="mb-3 rounded-lg max-h-60 w-full object-cover border border-white/10" alt="Result" />}
                        {parts.map((part, idx) => {
                            if (idx % 3 === 0 && part.trim()) {
                                return <div key={idx} className="whitespace-pre-wrap leading-relaxed break-words">{part.split('**').map((txt, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-blue-400">{txt}</strong> : txt)}</div>;
                            }
                            if (idx % 3 === 2) return <CodeBlock key={idx} language={parts[idx-1]} code={part} />;
                            return null;
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 4. PAGES ---

const DocsPage = ({ isDark }) => (
    <div className="p-4 md:p-8 h-full overflow-y-auto pb-32">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Book className="text-blue-500"/> API Documentation</h2>
        <p className="text-sm opacity-60 mb-6">Dokumentasi resmi untuk integrasi Shanove AI.</p>

        {/* ENDPOINT CARD */}
        <div className={`p-4 rounded-xl border mb-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold flex items-center gap-2"><FileJson size={16}/> Endpoint Chat</span>
                <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-1 rounded font-mono">POST</span>
            </div>
            <div className="bg-black/30 p-3 rounded-lg font-mono text-xs md:text-sm text-blue-300 break-all">
                {APP_INFO.api_domain}/api/v1/chat
            </div>
        </div>

        {/* PAYLOAD EXAMPLES */}
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-bold uppercase tracking-wider opacity-70 mb-2">1. Text Chat (JSON)</h3>
                <CodeBlock language="json" code={`{
  "model": "shanove", // atau "worm"
  "query": "Buatkan saya puisi pendek"
}`} />
            </div>

            <div>
                <h3 className="text-sm font-bold uppercase tracking-wider opacity-70 mb-2">2. Image Generation (Multipart)</h3>
                <CodeBlock language="javascript" code={`// Contoh Node.js (Axios)
const formData = new FormData();
formData.append('model', 'nano');
formData.append('prompt', 'Cyberpunk city');
formData.append('image', fs.createReadStream('foto.jpg'));

await axios.post('${APP_INFO.api_domain}/api/v1/chat', formData, {
  headers: { ...formData.getHeaders() }
});`} />
            </div>
        </div>
    </div>
);

const ProfilePage = ({ user, setUsersDb, currEmail, isDark, addToast }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user.username || '');

    const handleSave = () => {
        if (!newName.trim()) return;
        setUsersDb(prev => ({ ...prev, [currEmail]: { ...prev[currEmail], username: newName } }));
        setIsEditing(false);
        addToast("Username berhasil disimpan!", "success");
    };

    return (
        <div className="p-6 flex flex-col items-center justify-center h-full text-center animate-in fade-in">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-xl">
                {user.username ? user.username[0].toUpperCase() : <User size={40}/>}
            </div>
            
            {/* Username Editor */}
            <div className="flex items-center gap-2 mb-2">
                {isEditing ? (
                    <div className="flex gap-2">
                        <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} className={`bg-transparent border-b border-blue-500 outline-none text-xl font-bold text-center w-32 ${isDark?'text-white':'text-black'}`} />
                        <button onClick={handleSave} className="p-1 bg-blue-500 rounded text-white"><Check size={16}/></button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold">{user.username || 'Guest'}</h2>
                        {currEmail && <button onClick={()=>setIsEditing(true)} className="opacity-50 hover:opacity-100"><Edit2 size={16}/></button>}
                    </>
                )}
            </div>

            {/* Email Read-only */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm mb-4 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                <Mail size={14} className="opacity-50"/>
                <span className="opacity-80">{currEmail || 'Belum Login'}</span>
            </div>

            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest ${user.isAdmin?'bg-red-500/20 text-red-500':currEmail?'bg-blue-500/20 text-blue-500':'bg-gray-500/20 text-gray-500'}`}>
                {user.isAdmin?'ADMINISTRATOR':currEmail?'PRO MEMBER':'FREE TIER'}
            </span>

            {/* Limit Card */}
            <div className={`mt-8 w-full max-w-xs p-5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex justify-between text-sm mb-2 opacity-70">
                    <span>Usage Hari Ini</span>
                    <span className="font-mono">{user.usage} / {user.limit}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{width: `${Math.min(100, (user.usage/user.limit)*100)}%`}}></div>
                </div>
            </div>
        </div>
    );
};

// --- 5. SHELL COMPONENTS ---

const Sidebar = ({ isOpen, onClose, page, setPage, user, onLogout, onAuth, isDark }) => (
    <>
        {isOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={onClose}></div>}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static border-r flex flex-col ${isDark ? 'bg-[#171717] border-[#2f2f2f]' : 'bg-white border-gray-200'}`}>
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3 font-bold text-xl"><img src={APP_INFO.logo_url} className="w-8 h-8 rounded-lg"/> Shanove</div>
                <button onClick={onClose} className="md:hidden"><X/></button>
            </div>
            
            <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
                <div className="text-xs font-bold opacity-50 uppercase mb-2">Menu Utama</div>
                {[
                    {id:'chat', icon:Home, label:'Home (AI)'},
                    {id:'profile', icon:User, label:'Profile'},
                    {id:'docs', icon:Book, label:'API Docs'},
                    {id:'thanks', icon:Heart, label:'Credits'}
                ].map(item => (
                    <button key={item.id} onClick={()=>{setPage(item.id); onClose()}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${page===item.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-500/10'}`}>
                        <item.icon size={18}/> {item.label}
                    </button>
                ))}
                
                {user.isAdmin && (
                    <button onClick={()=>{setPage('admin'); onClose()}} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 mt-4 border border-red-500/20">
                        <Shield size={18}/> Admin Panel
                    </button>
                )}
            </div>

            <div className="p-4 border-t border-gray-500/10 bg-gray-500/5">
                {user.email ? (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg">
                            {user.username ? user.username[0].toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold truncate text-sm">{user.username}</div>
                            <div className="text-xs opacity-60 font-bold">{user.isAdmin ? 'ADMIN' : 'PRO'}</div>
                        </div>
                        <button onClick={onLogout} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><LogOut size={18}/></button>
                    </div>
                ) : (
                    <button onClick={onAuth} className="w-full py-3 bg-white text-black font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors">Login / Daftar</button>
                )}
            </div>
        </div>
    </>
);

const AuthModal = ({ isOpen, onClose, onLogin, showToast, isDark }) => {
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [serverOtp, setServerOtp] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const sendOtp = async (e) => {
        e.preventDefault(); setLoading(true);
        const code = Math.floor(100000+Math.random()*900000).toString();
        setServerOtp(code);
        try {
            await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ service_id: EMAIL_CONFIG.SERVICE_ID, template_id: EMAIL_CONFIG.TEMPLATE_ID, user_id: EMAIL_CONFIG.PUBLIC_KEY, template_params: { to_email: email, otp_code: code, time: "15 Menit" } })
            });
            setStep('otp'); showToast("OTP terkirim ke email", "success");
        } catch { showToast("Gagal kirim email", "error"); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95">
            <div className={`w-full max-w-md p-8 rounded-2xl relative ${isDark ? 'bg-[#1e1e1e] text-white border border-gray-700' : 'bg-white text-black'}`}>
                <button onClick={onClose} className="absolute top-4 right-4 hover:opacity-50"><X/></button>
                <h2 className="text-2xl font-bold mb-4 text-center">{step==='email'?'Login Akun':'Verifikasi'}</h2>
                {step==='email' ? (
                    <form onSubmit={sendOtp} className="space-y-4">
                        <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className={`w-full p-3 rounded-xl border bg-transparent outline-none ${isDark?'border-gray-600':'border-gray-300'}`}/>
                        <button disabled={loading} className="w-full py-3 bg-blue-600 rounded-xl font-bold flex justify-center text-white">{loading?<Loader2 className="animate-spin"/>:'Kirim OTP'}</button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <input required type="text" value={otp} onChange={e=>setOtp(e.target.value)} placeholder="000000" className={`w-full p-3 rounded-xl border bg-transparent text-center text-xl font-mono outline-none ${isDark?'border-gray-600':'border-gray-300'}`}/>
                        <button onClick={()=>{ if(otp===serverOtp) onLogin(email); else showToast("Kode Salah", "error"); }} className="w-full py-3 bg-green-600 rounded-xl font-bold text-white">Verifikasi</button>
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
    const [page, setPage] = useState('chat');
    const [showAuth, setShowAuth] = useState(false);
    const [toasts, setToasts] = useState([]);

    // DATA
    const [users, setUsers] = useState(() => safeParse('shanove_users', {}));
    const [currEmail, setCurrEmail] = useState(localStorage.getItem('shanove_email'));
    const [chats, setChats] = useState(() => safeParse('shanove_chats_v33', [{id:1, title:'New Chat', messages:[{role:'assistant', content:'Halo! Saya Shanove AI.'}]}]));
    const [chatId, setChatId] = useState(() => chats[0]?.id || 1);

    // CHAT STATE
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [model, setModel] = useState('shanove');
    const [img, setImg] = useState(null);
    const [preview, setPreview] = useState(null);
    const bottomRef = useRef(null);

    const user = currEmail ? (users[currEmail] || { role:'user', limit:LIMITS.USER, usage:0, username:'User' }) : { role:'guest', limit:LIMITS.GUEST, usage: parseInt(localStorage.getItem('shanove_guest')||0) };
    const currentChat = chats.find(c => c.id === chatId) || chats[0];

    useEffect(() => localStorage.setItem('shanove_users', JSON.stringify(users)), [users]);
    useEffect(() => localStorage.setItem('shanove_chats_v33', JSON.stringify(chats)), [chats]);
    useEffect(() => bottomRef.current?.scrollIntoView({behavior:"smooth"}), [chats, loading, page]);

    const addToast = (msg, type='info') => { const id=Date.now(); setToasts(p=>[...p,{id,msg,type}]); setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3000); };

    const handleLogin = (email) => {
        if(!users[email]) {
            const isAdm = email === APP_INFO.admin_email;
            const randUser = `User_${Math.floor(Math.random()*9999)}`;
            setUsers(p => ({...p, [email]: { role: isAdm?'admin':'user', limit: isAdm?LIMITS.ADMIN:LIMITS.USER, usage: 0, isAdmin: isAdm, username: randUser }}));
        }
        setCurrEmail(email); localStorage.setItem('shanove_email', email); setShowAuth(false);
        addToast("Login Berhasil!", "success");
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if(!input.trim() || loading) return;
        if(user.usage >= user.limit) { addToast("Limit Habis!", "error"); if(!currEmail) setShowAuth(true); return; }
        if(model === 'nano' && !img) { addToast("Upload gambar dulu!", "error"); return; }

        const userMsg = { role: 'user', content: input, image: model==='nano'?preview:null };
        const newMsgs = [...currentChat.messages, userMsg];
        setChats(prev => prev.map(c => c.id===chatId ? {...c, messages: newMsgs, title: input.slice(0,15)} : c));
        
        setInput(''); setLoading(true);
        if(currEmail) setUsers(p => ({...p, [currEmail]: {...p[currEmail], usage: p[currEmail].usage+1}}));
        else localStorage.setItem('shanove_guest', (user.usage+1).toString());

        try {
            // Using logic directly for client-side demo if backend url empty, otherwise fetch backend
            let reply = "", resImg = null;
            
            if (model === 'shanove') {
                const res = await fetch('https://api.cerebras.ai/v1/chat/completions', { method: 'POST', headers: { 'Authorization': `Bearer ${CEREBRAS_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: CEREBRAS_MODEL_ID, messages: [{role:"system",content:SYSTEM_PROMPT}, ...newMsgs.slice(-5)], max_completion_tokens: 800 }) });
                const d = await res.json(); reply = d.choices[0].message.content;
            } else if (model === 'worm') {
                // If using Backend
                if(BACKEND_URL) {
                    const res = await fetch(`${BACKEND_URL}/api/v1/chat`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ model:'worm', query: userMsg.content }) });
                    const d = await res.json(); reply = "🐛 " + (d.result || "Error");
                } else {
                    reply = "⚠️ WormGPT butuh Backend (localhost/vercel).";
                }
            } else if (model === 'nano') {
                if(BACKEND_URL) {
                    const fd = new FormData(); fd.append('model', 'nano'); fd.append('prompt', userMsg.content); fd.append('image', img);
                    const res = await fetch(`${BACKEND_URL}/api/v1/chat`, { method: 'POST', body: fd });
                    const d = await res.json(); reply = "🍌 Selesai!"; resImg = d.result;
                } else {
                    reply = "⚠️ Nano Banana butuh Backend (localhost/vercel).";
                }
            }
            
            setChats(prev => prev.map(c => c.id===chatId ? {...c, messages: [...newMsgs, { role: 'assistant', content: reply, image: resImg }]} : c));
        } catch (e) {
            setChats(prev => prev.map(c => c.id===chatId ? {...c, messages: [...newMsgs, { role: 'assistant', content: `Error: ${e.message}` }]} : c));
        } finally { setLoading(false); if(model==='nano') { setImg(null); setPreview(null); } }
    };

    return (
        <div className={`flex h-[100dvh] overflow-hidden font-sans ${isDark ? 'bg-[#212121] text-white' : 'bg-white text-gray-900'}`}>
            <ToastContainer toasts={toasts} removeToast={(id) => setToasts(p => p.filter(t => t.id !== id))} />
            
            <Sidebar isOpen={sidebarOpen} onClose={()=>setSidebarOpen(false)} page={page} setPage={setPage} user={user} onLogout={()=>{setCurrEmail(null);localStorage.removeItem('shanove_email');addToast("Logout OK");}} onAuth={()=>setShowAuth(true)} isDark={isDark} />
            
            <div className="flex-1 flex flex-col relative w-full h-full">
                <header className={`p-3 border-b flex justify-between items-center z-20 ${isDark ? 'bg-[#212121] border-[#2f2f2f]' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                        <button onClick={()=>setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/10 md:hidden"><Menu/></button>
                        {page === 'chat' && (
                            <div className="flex flex-col">
                                <div className="flex bg-black/10 rounded-lg p-1 gap-1">
                                    {['shanove','worm','nano'].map(m => <button key={m} onClick={()=>setModel(m)} className={`px-3 py-1 text-xs font-bold rounded uppercase ${model===m ? 'bg-blue-600 text-white':'opacity-50'}`}>{m}</button>)}
                                </div>
                                <div className="text-[10px] mt-1 font-bold opacity-60">Sisa: {Math.max(0, user.limit - user.usage)}</div>
                            </div>
                        )}
                        {page !== 'chat' && <h1 className="font-bold text-lg capitalize">{page === 'docs' ? 'API Docs' : page}</h1>}
                    </div>
                    <button onClick={()=>setIsDark(!isDark)} className="p-2"><Sun/></button>
                </header>

                <main className="flex-1 overflow-y-auto px-2 relative custom-scrollbar">
                    {page === 'chat' && (
                        <div className="flex flex-col items-center pb-32 pt-4">
                            {currentChat.messages.map((m, i) => <MessageItem key={i} role={m.role} content={m.content} image={m.image} isDark={isDark} />)}
                            {loading && <div className="animate-pulse text-xs opacity-50 mt-2">Sedang berpikir...</div>}
                            <div ref={bottomRef} />
                        </div>
                    )}
                    {page === 'docs' && <DocsPage isDark={isDark} />}
                    {page === 'profile' && <ProfilePage user={user} currEmail={currEmail} setUsersDb={setUsers} isDark={isDark} addToast={addToast} />}
                    {page === 'thanks' && <div className="p-8 text-center font-bold text-xl h-full flex items-center justify-center">Thanks to Kasan, Leo, Cerebras, Vercel</div>}
                </main>

                {page === 'chat' && (
                    <footer className={`p-3 md:p-4 z-20 ${isDark ? 'bg-[#212121]' : 'bg-white'}`}>
                        <div className="max-w-3xl mx-auto">
                            <form onSubmit={handleSend} className={`flex items-center gap-2 p-2 rounded-2xl border ${isDark ? 'bg-[#2f2f2f] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                <input id="imgUp" type="file" className="hidden" onChange={e => {if(e.target.files[0]){setImg(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); setModel('nano')}}} />
                                {model === 'nano' && <button type="button" onClick={()=>document.getElementById('imgUp').click()} className={`p-2 rounded-lg ${preview ? 'text-green-500' : 'text-gray-400'}`}>{preview?<img src={preview} className="w-6 h-6 rounded object-cover"/>:<Upload size={20}/>}</button>}
                                <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ketik pesan..." className="flex-1 bg-transparent outline-none text-sm min-w-0" disabled={loading} />
                                <button type="submit" disabled={loading} className="p-2 bg-blue-600 rounded-xl text-white"><Send size={18}/></button>
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


