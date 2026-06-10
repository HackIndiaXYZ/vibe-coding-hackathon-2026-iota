# 🔥 SafeCylinder — Smart LPG Expiry & Leak Monitor

> **HackIndia Vibe Coding Hackathon 2026**
>  · Track: 🧠 AI Native Apps + 🎓 Student Innovation  


---

## 💡 The Idea

Every Indian household runs on LPG. Yet two silent dangers go unnoticed every day:

1. **Expired cylinders** — the BIS test code stamped on the metal collar ring is almost never checked
2. **Micro-leaks** — a slow hiss at the regulator is undetectable by smell in a busy kitchen

SafeCylinder turns your smartphone into a **10-second home safety inspector** — no extra hardware, no installation, no technical knowledge needed.

---

## 🎯 Problem → Solution

| Problem | SafeCylinder's Solution |
|---|---|
| Expiry code is cryptic (e.g. `B28`) | Camera scan + Claude AI reads and explains it in plain language |
| Micro-leaks are inaudible to humans | Phone mic + audio AI detects high-frequency hiss (500Hz–4kHz) |
| No reminders for cylinder replacement | Web push notification 30 days before expiry |
| Emergency steps unknown | In-app card with 1906 helpline + step-by-step instructions |
| App is English-only, excluding rural users | Full UI + AI responses in 10 Indian languages |

---

## ✨ Features

### 📷 Cylinder Expiry Scanner
- Full-screen camera viewfinder with alignment guide
- Claude AI reads the BIS collar code (`A/B/C/D` + year)
- Shows: expiry date, months remaining, green/amber/red safety badge
- Save multiple cylinders by nickname

### 🎙️ Micro-Leak Audio Test
- 3-second mic recording with live waveform visualiser (Web Audio API)
- Claude AI analyses for acoustic gas leak signatures
- Clear result: 🟢 No Leak / 🔴 Possible Leak
- Emergency action card if leak is suspected

### 🏠 Safety Dashboard
- All saved cylinders with live status badges
- 60-day expiry warning banner
- Full scan + test history

### 🔔 Push Reminders
- Web push notification 30 days before cylinder expiry
- Works offline via Service Worker

### 🇮🇳 Indian Language Support
- Full UI available in **10 Indian languages**
- Expiry results and leak warnings delivered in your preferred language
- Emergency instructions localised — critical safety info reaches users who don't read English

| Language | Script |
|---|---|
| हिंदी | Devanagari |
| বাংলা | Bengali |
| తెలుగు | Telugu |
| मराठी | Devanagari |
| தமிழ் | Tamil |
| ગુજરાતી | Gujarati |
| ಕನ್ನಡ | Kannada |
| മലയാളം | Malayalam |
| ਪੰਜਾਬੀ | Gurmukhi |
| ଓଡ଼ିଆ | Odia |

> Claude AI generates safety responses directly in the user's chosen language — no separate translation step needed.

---

## 🧠 How AI Powers This

This app makes **two distinct Claude API calls** — making it a true AI-native product:

```
USER SCANS CYLINDER RING
        ↓
Image → Claude Vision
"Read the BIS test code. Return expiry quarter,
year, months remaining, and safety status as JSON"
        ↓
Structured result rendered as safety card

USER RUNS LEAK TEST
        ↓
Web Audio API computes RMS + FFT frequency data
        ↓
Audio features → Claude
"Analyse these acoustic characteristics for
high-frequency hiss consistent with LPG leak"
        ↓
Risk assessment + recommendation rendered
```

No fine-tuning. No ML models. Just well-crafted prompts — the essence of vibe coding.

> 🌐 **Language layer:** All Claude prompts include a `language` parameter. When a user selects Hindi, Odia, Tamil (or any of the 10 supported languages), the system prompt instructs Claude to respond entirely in that language — so the expiry result, leak assessment, and emergency steps all come back localised.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Builder | Lovable (AI-first dev platform) |
| AI Engine | Claude API — `claude-sonnet-4-20250514` |
| Frontend | React + Tailwind CSS |
| Audio | Web Audio API (FFT + RMS) |
| Camera | `getUserMedia` |
| Storage | `localStorage` (no backend) |
| Notifications | Web Push + Service Worker |
| Hosting | Lovable `.lovable.app` |

**Lines of code written by hand: ~0.** Pure vibe coding.

---

## 🚀 Live Demo

🔗 **https://lpg-guard-ai.lovable.app** 

### Demo Flow (2 minutes)
1. Open app on mobile → see dashboard with cylinder list
2. Tap **Scan New Cylinder** → point at cylinder collar → capture
3. Watch AI parse the code and show expiry status card
4. Tap **Run Leak Test** → hold near regulator → see live waveform
5. View AI safety result with recommendation

---

## 📖 Understanding the Cylinder Code

Indian BIS standard stamps a test code on every cylinder's metal collar ring:

| Letter | Quarter |
|---|---|
| `A` | January – March |
| `B` | April – June |
| `C` | July – September |
| `D` | October – December |

**Example:** `C29` = tested in Q3 2029 · valid for 10 years → safe until September 2039

---

## 🆘 Emergency Protocol (In-App)

If a leak is detected, the app shows:

1. Turn off the cylinder knob immediately
2. Open all windows and doors — no fans
3. Do not touch any electrical switches
4. Evacuate the kitchen
5. Call **1906** — LPG Emergency Helpline (India)

---

## 👨‍💻 Built By

**Krishna** · HackIndia Vibe Coding Hackathon 2026  
Bhubaneswar, Odisha, India

---

## ⚠️ Disclaimer

SafeCylinder is an AI-assisted safety aid and not a substitute for certified gas leak detection equipment. Always follow official safety guidelines and contact your LPG distributor for professional inspection.

---

*Submitted for HackIndia Vibe Coding Hackathon 2026 · Theme: Build Anything with AI*
