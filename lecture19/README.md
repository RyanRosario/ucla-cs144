# Lecture 19: AI APIs

Two demo applications that use AI APIs (OpenAI or Google Gemini) on the backend. Both apps let you toggle between providers by changing a single environment variable.

---

## Demo 1: Interview Prep (`interview/`)

A FizzBuzz coding interview simulator. Students write a FizzBuzz solution in a Monaco code editor, submit it, and an AI model grades their code out of 10 with personalized feedback.

**Stack:** React + Vite (client), Express (server)

**AI features used:**
- **OpenAI:** Chat Completions API with `gpt-4.1`
- **Gemini:** `generateContent` with `gemini-2.5-flash`

## Demo 2: Profile Moderation (`moderation/`)

A profile picture upload form. Students drag and drop an image and enter a text description. The AI checks whether the image contains a human face (vision) and whether the description violates content policies (moderation).

**Stack:** React + Vite (client), Express + Multer (server)

**AI features used:**
- **OpenAI:** Chat Completions API with `gpt-4.1` for vision, Moderation API with `omni-moderation-latest` for text
- **Gemini:** `generateContent` with `gemini-2.5-flash` for both vision and text moderation

---

## Choosing a Provider

Both demos read an `AI_PROVIDER` variable from the server's `.env` file. Set it to `openai` or `gemini`:

```
AI_PROVIDER=gemini
```

You only need the API key for the provider you choose. The server ignores the other key.

---

## Getting an OpenAI API Key

OpenAI's API is a **separate product** from ChatGPT. A ChatGPT Plus subscription does **not** include API access. The API uses prepaid credits (pay-as-you-go).

1. Go to https://platform.openai.com/ and click **Sign up** (or log in if you already have an account).
2. Verify your email address.
3. Navigate to **Settings > Billing** (https://platform.openai.com/settings/organization/billing/overview).
4. Click **Add credit** and enter a payment method. The minimum deposit is $5. For this class demo, $5 is more than enough.
5. Navigate to **Settings > API Keys** (https://platform.openai.com/api-keys).
6. Click **Create new secret key**. Give it a name (e.g. "CS144 Demo").
7. **Copy the key immediately.** You will not be able to see it again after closing the dialog.
8. Paste it into your `.env` file as `OPENAI_API_KEY`.

**Important:** Do not commit your API key to Git. The `.env` file is gitignored. If your key is leaked, revoke it immediately from the API Keys page and generate a new one.

## Getting a Google Gemini API Key

Google's Gemini API is **free** for low-volume use (up to 10 requests/minute for Gemini 2.5 Flash). No billing setup is required for the free tier.

1. Go to https://aistudio.google.com/ and sign in with your Google account. No separate developer account is needed.
2. Click **Get API Key** in the left sidebar, or go directly to https://aistudio.google.com/apikey.
3. Click **Create API Key**.
4. Select **Create API key in a new project** (recommended) or choose an existing Google Cloud project.
5. **Copy the key immediately.** It starts with `AIza` and is about 39 characters long.
6. Paste it into your `.env` file as `GEMINI_API_KEY`.

**Free tier limits (as of 2026):**
- Gemini 2.5 Flash: 10 requests/minute, 250 requests/day
- Gemini 2.5 Pro: 5 requests/minute, 100 requests/day

These limits are generous enough for classroom demos. If you need higher limits, you can enable billing on your Google Cloud project.

---

## Setup and Running

### Interview Prep

```bash
cd interview

# Install dependencies
npm install --prefix client
npm install --prefix server

# Copy the env template and add your key
cp server/.env.template server/.env
# Edit server/.env — set AI_PROVIDER and the matching API key
```

Then open two terminals:

```bash
# Terminal 1 — start the server
cd interview/server
npm start
```

```bash
# Terminal 2 — start the client
cd interview/client
npm run dev
```

The client runs at http://localhost:1919 and proxies API requests to the server on port 3001.

### Profile Moderation

```bash
cd moderation

# Install dependencies
npm install --prefix client
npm install --prefix server

# Copy the env template and add your key
cp server/.env.template server/.env
# Edit server/.env — set AI_PROVIDER and the matching API key
```

Then open two terminals:

```bash
# Terminal 1 — start the server
cd moderation/server
npm start
```

```bash
# Terminal 2 — start the client
cd moderation/client
npm run dev
```

The client runs at http://localhost:1919 and proxies API requests to the server on port 3001.

---

## .env File Format

Each demo has a `server/.env.template` you can copy. The format is:

```
# Set to "openai" or "gemini"
AI_PROVIDER=gemini

# OpenAI (required if AI_PROVIDER=openai)
OPENAI_API_KEY=sk-...

# Gemini (required if AI_PROVIDER=gemini)
GEMINI_API_KEY=AIza...
```
