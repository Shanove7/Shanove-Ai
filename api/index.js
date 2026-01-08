const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require('form-data');
const crypto = require('crypto');
const multer = require('multer');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors()); // Allow all origins for Vercel
app.use(express.json());

// --- CONFIG ---
const CEREBRAS_API_KEY = "csk-mwxrfk94v8txn2nw2ym538hk38j6cm9vketfxrd9xcf6jc4t";
const CEREBRAS_MODEL_ID = "qwen-3-235b-a22b-instruct-2507";

// --- UTILS ---
const rand = n => Array.from({ length: n }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');

// --- 1. SHANOVE (CEREBRAS) LOGIC ---
async function shanoveChat(messages) {
    try {
        const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: CEREBRAS_MODEL_ID,
                messages: messages,
                max_completion_tokens: 1000
            })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Maaf, Shanove sedang sibuk.";
    } catch (e) {
        throw new Error("Shanove Server Error: " + e.message);
    }
}

// --- 2. WORMGPT LOGIC ---
async function wormgptChat(query) {
    const messageId = `${rand(8)}-${rand(4)}-${rand(4)}-${rand(4)}-${rand(12)}`;
    const userId = `${rand(8)}-${rand(4)}-${rand(4)}-${rand(4)}-${rand(12)}`;
    // Cookie mungkin perlu diupdate berkala jika WormGPT mengubah auth
    const cookie = '__Secure-authjs.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiRnlESjQ1UXFQeDVRSVhoaVNSQk5uNFBHcFBFVnQzbjBZTVhRVGlEZ3hNeS1KaEZCNTJQOWx6d0lvNTRIODU1X3JNVzhWTHE0UUVDUExTWF9aLTh2aXcifQ..BC1-RXYYZM0oVmP7FaXUsw.f5LshHBNgG24G0uaj9te9vcDqm7zynNtVRvuuFjiHJzChQHQ4TYDCG35JXFCtiy29JcTWULM3ynjMp9l3ygwnv4FVIo9BIZBcyUQBzFyPNYcF6FGQEYke-D5ebIXcQi_tXLbxkhLTh9jTJJ4qfqZC13CgeaG-8je-x_dLT7yDe7A0s9QYqk7edr0YT_AmngvgS3MvcvhNmVC35aDurZO3dV2egpNvwgjlJaCn3aNRoiXjmtZow8pX3BUig8pfdE1.TiCtK3B8lnk4_K7R9ZxQvjqd3SVeoBzEUr8V9BKjGN0; __Secure-authjs.callback-url=https%3A%2F%2Fchat.wrmgpt.com%2Flogin';

    const res = await fetch('https://chat.wrmgpt.com/api/chat', {
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
            'Content-Type': 'application/json',
            'Cookie': cookie,
            'Origin': 'https://chat.wrmgpt.com',
            'Referer': 'https://chat.wrmgpt.com/'
        },
        body: JSON.stringify({
            id: messageId,
            message: { role: 'user', parts: [{ type: 'text', text: query }], id: userId },
            selectedChatModel: 'wormgpt-v5.5',
            selectedVisibilityType: 'private',
            searchEnabled: false,
            memoryLength: 8
        })
    });

    if (!res.ok) throw new Error(`WormGPT Error: ${res.status}`);
    const raw = await res.text();
    let result = '';
    
    for (const line of raw.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        try {
            const json = JSON.parse(data);
            if (json.type === 'text-delta' && json.delta) result += json.delta;
        } catch {}
    }
    return result || 'WormGPT tidak merespon.';
}

// --- 3. NANO BANANA LOGIC ---
const NANO_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
    'Origin': 'https://nano-banana-pro.co',
    'Referer': 'https://nano-banana-pro.co/'
};

async function nanoBananaImg2Img(prompt, imageBuffer, mimeType) {
    // 1. Temp Mail
    const mailRes = await fetch('https://api.nekolabs.web.id/tools/tempmail/v1/create').then(r => r.json());
    if(!mailRes.result) throw new Error("Gagal membuat email sementara");
    const { email, sessionId } = mailRes.result;

    // 2. Register
    const password = 'Pass' + crypto.randomBytes(4).toString('hex') + '!';
    const name = 'User' + crypto.randomBytes(2).toString('hex');
    await fetch('https://nano-banana-pro.co/api/auth/sign-up/email', {
        method: 'POST',
        headers: { ...NANO_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
    });

    // 3. Polling Email
    let verifyLink = null;
    for(let i=0; i<15; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const inbox = await fetch(`https://api.nekolabs.web.id/tools/tempmail/v1/inbox?id=${sessionId}`).then(r => r.json());
        if(inbox.result?.emails?.length) {
            const body = inbox.result.emails[0].text || inbox.result.emails[0].html || '';
            const match = body.match(/https:\/\/nano-banana-pro\.co\/api\/auth\/verify-email\?token=[^\s"]+/);
            if(match) { verifyLink = match[0]; break; }
        }
    }
    if(!verifyLink) throw new Error("Gagal verifikasi email (Timeout)");

    const verifyRes = await fetch(verifyLink, { headers: NANO_HEADERS, redirect: 'manual' });
    const rawCookies = verifyRes.headers.raw()['set-cookie'];
    const cookie = rawCookies ? rawCookies.map(v => v.split(';')[0]).join('; ') : '';

    // 4. Upload Image
    const form = new FormData();
    form.append('files', imageBuffer, { filename: 'image.jpg', contentType: mimeType });
    const upRes = await fetch('https://nano-banana-pro.co/api/storage/upload-image', {
        method: 'POST',
        headers: { ...NANO_HEADERS, 'Cookie': cookie, ...form.getHeaders() },
        body: form
    });
    const upJson = await upRes.json();
    const uploadedUrl = upJson?.data?.urls?.[0];
    if(!uploadedUrl) throw new Error("Gagal upload gambar ke Nano Server");

    // 5. Generate
    const genRes = await fetch('https://nano-banana-pro.co/api/ai/generate', {
        method: 'POST',
        headers: { ...NANO_HEADERS, 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({
            mediaType: 'image', scene: 'image-to-image', provider: 'kie', model: 'nano-banana', prompt: prompt,
            options: { image_input: [uploadedUrl] }
        })
    });
    const genJson = await genRes.json();
    const taskId = genJson?.data?.id;
    if(!taskId) throw new Error("Gagal memulai task AI");

    // 6. Polling Result
    for(let i=0; i<20; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const qRes = await fetch('https://nano-banana-pro.co/api/ai/query', {
            method: 'POST',
            headers: { ...NANO_HEADERS, 'Content-Type': 'application/json', 'Cookie': cookie },
            body: JSON.stringify({ taskId })
        });
        
        if(qRes.headers.get('content-type')?.includes('image')) {
            const buffer = await qRes.buffer();
            return `data:${qRes.headers.get('content-type')};base64,${buffer.toString('base64')}`;
        }

        try {
            const json = await qRes.json();
            const taskStr = json?.data?.taskResult;
            if(taskStr) {
                const task = JSON.parse(taskStr);
                if(task.state === 'success') {
                    const res = JSON.parse(task.resultJson || '{}');
                    return res?.resultUrls?.[0];
                }
                if(['failed', 'error'].includes(task.state)) throw new Error("Nano Banana Error: " + task.failMsg);
            }
        } catch(e) { if(e.message.includes("Error")) throw e; }
    }
    throw new Error("Timeout: Proses terlalu lama");
}

// --- UNIFIED ENDPOINT ---
app.post('/api/v1/chat', upload.single('image'), async (req, res) => {
    try {
        const model = req.body.model || 'shanove';
        const query = req.body.query || req.body.prompt;
        const history = req.body.history ? JSON.parse(req.body.history) : [];

        if (!query) return res.status(400).json({ status: false, error: 'Query/Prompt wajib diisi' });

        let result;
        if (model === 'shanove') {
            // Include history for context
            const messages = [
                { role: "system", content: "Kamu adalah Shanove AI. Asisten cerdas, ramah, dan membantu." },
                ...history,
                { role: "user", content: query }
            ];
            result = await shanoveChat(messages);
        } else if (model === 'worm') {
            result = await wormgptChat(query);
        } else if (model === 'nano') {
            if (!req.file) return res.status(400).json({ status: false, error: 'Wajib upload gambar untuk Nano Banana' });
            result = await nanoBananaImg2Img(query, req.file.buffer, req.file.mimetype);
        } else {
            return res.status(400).json({ status: false, error: 'Model tidak dikenal' });
        }

        res.json({ status: true, model, result });

    } catch (e) {
        console.error(e);
        res.status(500).json({ status: false, error: e.message });
    }
});

app.get('/', (req, res) => res.send('Shanove AI Backend v27 OK'));

module.exports = app;
