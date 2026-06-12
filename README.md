# 🔥 SafeCylinder — Smart LPG Expiry & Leak Monitor

> **HackIndia Vibe Coding Hackathon 2026** · Track: 🧠 AI Native Apps + 🎓 Student Innovation  

🔗 Live Demo: **https://ai-lpg-guard.lovable.app/**

---

## 💡 The Problem

Every Indian household runs on LPG. Yet two silent dangers go unnoticed every day:

1. **Expired cylinders** — the BIS test code stamped on the metal collar ring is almost never checked
2. **Micro-leaks** — a slow hiss at the regulator is undetectable by smell in a busy kitchen

SafeCylinder turns your smartphone into a **10-second home safety inspector** — no extra hardware, no installation, no technical knowledge needed.

---

## 🎯 Problem → Solution

| Problem | SafeCylinder's Solution |
|---|---|
| Expiry code is cryptic (e.g. `B28`) | Camera scan + AI reads and explains it in plain language |
| Micro-leaks are inaudible to humans | Phone mic + audio AI detects high-frequency hiss (500Hz–4kHz) |
| No reminders for cylinder replacement | Web push notification 30 days before expiry |
| Emergency steps unknown | In-app card with 1906 helpline + step-by-step instructions |

---

## ✨ Current Features (v1.0)

### 📷 Cylinder Expiry Scanner
- Full-screen camera viewfinder with alignment guide
- AI reads the BIS collar code (`A/B/C/D` + year)
- Shows: expiry date, months remaining, green/amber/red safety badge
- Save multiple cylinders by nickname

### 🎙️ Micro-Leak Audio Test
- 3-second mic recording with live waveform visualiser (Web Audio API)
- AI analyses RMS amplitude + peak frequency for gas leak signatures
- Clear result: 🟢 No Leak Detected / 🔴 Possible Leak
- Emergency action card if leak is suspected

### 🏠 Safety Dashboard
- All saved cylinders in one view with live status badges
- Amber warning banner when expiry is within 60 days
- Full scan and test history

### 🔔 Expiry Push Reminders
- Web push notification 30 days before any cylinder expires
- Works offline via Service Worker — no internet needed for alerts

---

## 🗺️ Roadmap — Coming Soon

These features are planned for the next version:

### 🇮🇳 Indian Language Support *(in progress)*
> Make safety accessible to every Indian household, not just English speakers

- Full UI in **10 Indian languages** — Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia
- AI safety responses delivered directly in the user's chosen language
- Emergency instructions localised — 1906 helpline steps in regional scripts
- No separate translation API needed — language baked into AI prompts

### 📊 Cylinder History & Analytics *(planned)*
- Track all past cylinders with usage duration stats
- Average cylinder lifespan per household
- Export safety report as PDF

### 👨‍👩‍👧 Family / Multi-Home Management *(planned)*
- Manage cylinders across multiple addresses (home, parents, office)
- Share cylinder status with family members via link

### 🔗 LPG Distributor Integration *(planned)*
- One-tap cylinder booking from within the app
- Direct link to HP Gas / Bharat Gas / Indane booking portals
- Auto-fill booking with saved cylinder details

### 📸 Cylinder Condition Report *(planned)*
- Photograph the full cylinder body
- AI checks for visible rust, dents, or valve damage
- Generate a shareable safety report for distributors

### 🔔 Smart Notification Upgrade *(planned)*
- WhatsApp alerts (via Twilio) in addition to web push
- SMS fallback for users without smartphones
- Customisable reminder frequency

---

## 🧠 How AI Powers This

```
USER SCANS CYLINDER RING
        ↓
Image → AI Vision (Gemini)
"Read the BIS test code. Return expiry quarter,
year, months remaining, and safety status as JSON"
        ↓
Structured result rendered as safety card

USER RUNS LEAK TEST
        ↓
Web Audio API computes RMS + FFT frequency data
        ↓
Acoustic features → AI
"Analyse these characteristics for high-frequency
hiss consistent with LPG micro-leak"
        ↓
Risk assessment + recommendation rendered
```

No fine-tuning. No custom ML models. Just well-crafted prompts — the essence of vibe coding.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Builder | Lovable (AI-first dev platform) |
| AI Engine | Gemini via Lovable AI Gateway |
| Frontend | React + Tailwind CSS |
| Audio Analysis | Web Audio API (FFT + RMS) |
| Camera | `getUserMedia` browser API |
| Storage | `localStorage` (no backend required) |
| Notifications | Web Push API + Service Worker |
| Hosting | Lovable `.lovable.app` |

**Lines of code written by hand: ~0.** Pure vibe coding.

---

## 📖 Understanding the BIS Cylinder Code

Every domestic LPG cylinder has a test code stamped on the metal collar ring:

| Letter | Quarter |
|---|---|
| `A` | January – March |
| `B` | April – June |
| `C` | July – September |
| `D` | October – December |

**Example:** `C29` = tested in Q3 2029 · valid for 10 years → safe until **September 2039**

Most households never check this. SafeCylinder makes it a 3-second scan.

---

## 🆘 Emergency Protocol (In-App)

If a leak is detected, the app immediately shows:

1. **Turn off** the cylinder knob
2. **Open** all windows and doors — no fans or exhausts
3. **Do not** touch any electrical switches
4. **Evacuate** the kitchen
5. Call **1906** — LPG Emergency Helpline (India, toll-free)

---

## 🚀 Demo Flow (2 minutes)

1. Open [https://ai-lpg-guard.lovable.app] on mobile
2. Tap **Scan New Cylinder** → point camera at collar ring → capture
3. Watch AI parse the code and show expiry status card
4. Tap **Run Leak Test** → hold near regulator → see live waveform
5. View AI safety result with recommendation


## ⚠️ Disclaimer

SafeCylinder is an AI-assisted safety aid and not a certified substitute for professional gas leak detection equipment. Always follow official safety guidelines and contact your LPG distributor for professional inspection.

---

*Submitted for HackIndia Vibe Coding Hackathon 2026 · Theme: Build Anything with AI*


