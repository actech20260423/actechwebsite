# 🚀 ACTech Official Documentation

> Your ultimate partner in modern technological solutions, custom web development, and next-gen digital learning.

---

## 📋 Table of Contents
1. [About the Company](#about-the-company)
2. [Core Services & Business Model](#core-services--business-model)
3. [Future AI Vision: AC Technology](#future-ai-vision-ac-technology)
4. [Project Structure & Tech Stack](#project-structure--tech-stack)

---

## 🏢 1. About the Company
**ACTech** is an innovative technology company designed to bridge the gap for both small-scale businesses and large enterprises looking for fast, reliable, and high-performance websites and digital systems. Whether you need a custom build or ready-to-deploy digital solutions, ACTech delivers.

---

## ⚙️ 2. Core Services & Business Model
* **Custom Web Development:** Clients submit their project requirements, which are then routed to our specialized developer teams within ACTech to build custom systems from scratch.
* **Free & Paid Systems:** An expansive collection of pre-built websites and systems available for businesses—ranging from complimentary open templates to premium, ready-to-use business solutions.
* **Dedicated Team Allocation:** Multi-team infrastructure ensuring speedy delivery, distinct focus, and robust code maintenance for every client.

---

## 🤖 3. Future AI Vision: "AC" (Artificial Clone Technology)
In the near future, ACTech is expanding its ecosystem by introducing **AC (Artificial Clone Technology)**. 
* **The Concept:** AC is an exact digital clone containing the company's internal knowledge base, operational procedures, and expertise.
* **Personalized AI Clones:** Moving forward, ACTech aims to empower clients who want personalized websites integrated with an AI clone. Users will be able to train their own individual AI clones to think, respond, and interact precisely like them or tailored to their exact brand preferences.

---

## 💻 4. Project Structure & Tech Stack
* **HTML5:** The landing page and supporting pages are lightweight static documents.
* **Tailwind CSS Browser CDN:** Provides the responsive layouts, spacing, colors, and interactive visual states.
* **Font Awesome:** Supplies the interface icons used throughout the site.
* **AC chat:** `ac-chat.js` and `ac-chat.css` provide the shared chat widget, backed by the server-side Vercel Function in `api/chat.js`.

### Public Pages
* `index.html` — ACTech overview, services, and future AC vision.
* `content/about.html` — ACTech introduction and founder overview.
* `content/profile-details.html` — Clarke Pudpud's public profile.
* `content/pricing.html` — Pricing status and numbered showcase slots. Package prices and payment terms are not yet published.

---

## AC Floating Chat

The site now includes an accessible **AC** chat button on every page. The browser calls
same-origin `/api/chat`; it never receives the Gemini API key. The UI keeps only the
current tab's short chat history in `sessionStorage` and renders AI text as plain text.

### Deploy as a serverless static site with Vercel

This project uses a [Vercel Function](api/chat.js) for the chat
endpoint. It remains a static HTML site except when a visitor sends a chat message.

1. Rotate any API key that has been pasted into a chat, commit, browser console, or
   other public place. Do not add the replacement key to this repository.
2. Import this folder/repository into Vercel. No framework or additional package is
   required; Vercel deploys `api/chat.js` as the `/api/chat` serverless endpoint.
3. In **Project Settings → Environment Variables**, add `GEMINI_API_KEY` to the
   Production environment. Optionally add `GEMINI_MODEL` (the default is
   `gemini-3.5-flash-lite`). Redeploy after adding or changing a variable.
4. Add a Vercel Firewall/rate-limit rule for `POST /api/chat` before announcing the
   feature publicly. Keeping a key server-side prevents disclosure, but rate limiting
   protects its Gemini quota from automated requests to the public endpoint.
   The chat function retries Gemini `503` / `UNAVAILABLE` responses up to two times
   with exponential delays before returning an error.

For local Vercel development, store a *throwaway* test key in an uncommitted `.env.local`
file:

```dotenv
GEMINI_API_KEY="replace-with-a-test-key"
GEMINI_MODEL="gemini-3.5-flash-lite"
```

Then run `npx vercel dev`. `.env` files are ignored by Git.

### File Layout:
```text
ACTechwebsite/
├── api/
│   └── chat.js
├── content/
│   ├── about.html
│   ├── pricing.html
│   └── profile-details.html
├── ac-chat.css
├── ac-chat.js
├── index.html
└── README.md
