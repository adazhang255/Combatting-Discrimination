# Hugging Face Gemma Integration Setup

This app uses **Gemma 7B** from Hugging Face for AI-powered discrimination guidance. It's perfect for GitHub Pages deployment!

## Quick Start (2 minutes)

### Step 1: Get a Free Hugging Face Token

1. Go to [hf.co](https://huggingface.co) and sign up (free)
2. Click your profile → **Settings** → **Access Tokens**
3. Click **New token** → Name it "Equity Navigator"
4. Make sure **Access level** is set to **Read**
5. Click **Create token** and copy it

### Step 2: Set Your Token in the App

There are three ways to enable the AI:

#### Option A: Browser Console (Quickest for Testing)
```javascript
localStorage.setItem('hf_token', 'hf_YOUR_TOKEN_HERE');
```
Then refresh the page and try sending a chat message!

#### Option B: In `index.html` (Not Recommended - Exposes Token)
Add before `</body>`:
```html
<script>
  localStorage.setItem('hf_token', 'hf_YOUR_TOKEN_HERE');
</script>
```

#### Option C: Environment Variable (Best for Deployment)
When deploying to GitHub Pages, users can set their own token using the Console method above.

### Step 3: Test It

1. Open the app in your browser
2. Go to "What should I do?" or "Identify an experience"
3. Type a question about discrimination
4. You should get an AI response!

## How It Works

- **No Server Needed** - Works perfectly on GitHub Pages
- **Gemma 7B Model** - Google's open-source AI model
- **Free Tier** - Up to 30k requests/month on Hugging Face free plan
- **Privacy** - Your token isn't stored anywhere, just in your browser's localStorage
- **Fallback** - If token is missing or invalid, app uses mock responses

## Limitations

**Free Tier:**
- 30,000 requests per month
- ~2-5 second response times
- Rate limited to ~1 request per 2 seconds

**Upgrade to Unlimited:**
- $9/month on Hugging Face
- Removes rate limits
- Faster responses

## Troubleshooting

### "Token not found" or Fallback Responses?

1. Check your token: `localStorage.getItem('hf_token')` in browser console
2. Make sure it starts with `hf_`
3. Verify it's a **Read** access token

### AI Not Responding?

1. Check browser console for errors: Open DevTools (F12)
2. Try a simpler question
3. Wait a few seconds - first response may be slow
4. Check your Hugging Face quota at [hf.co/settings/tokens](https://huggingface.co/settings/tokens)

### "Invalid Hugging Face token"?

1. Your token may have expired
2. Generate a new one at [hf.co/settings/tokens](https://huggingface.co/settings/tokens)
3. Set it again: `localStorage.setItem('hf_token', 'hf_...')`

### Rate Limited?

- You've hit the free tier limit
- Wait until tomorrow (limit resets daily)
- Or upgrade to Hugging Face Pro

## Advanced Configuration

### Change the Model

In `js/main.js`, change:
```javascript
const HF_MODEL = 'google/gemma-7b-it';
// Try: 'mistralai/Mistral-7B-Instruct-v0.2'
// Or: 'meta-llama/Llama-2-7b-chat-hf'
```

### Adjust Response Length

In `queryHuggingFace()` function:
```javascript
max_new_tokens: 200,  // Increase to 500 for longer responses
```

### Adjust Response Creativity

```javascript
temperature: 0.7,  // 0 = deterministic, 1 = creative
top_p: 0.9,        // 0.9 = more focused, 1 = more diverse
```

## GitHub Pages Deployment

1. Push your code to GitHub
2. Enable Pages in repository settings
3. Users can then:
   - Open the live app
   - Set their own HF token: `localStorage.setItem('hf_token', 'hf_...')`
   - Enjoy AI-powered guidance!

No server needed!

## Security Notes

- Token is stored only in your browser's localStorage
- Never commit your token to git
- Each user sets their own token
- Requests go directly to Hugging Face, not through our server

## Cost

- **Free**: 30,000 requests/month (enough for ~100 users)
- **Pro**: $9/month for unlimited requests
- **Enterprise**: Custom pricing

## Support

- Hugging Face Documentation: [huggingface.co/docs](https://huggingface.co/docs)
- Gemma Model Card: [hf.co/google/gemma-7b-it](https://huggingface.co/google/gemma-7b-it)
- Report issues: Create a GitHub issue in this repository
