# Equity Navigator

A comprehensive web application to help people understand, document, and report discrimination incidents anonymously with guidance and support resources.

## Features

### 1. **Anonymous Incident Reporting**
- Completely anonymous reporting form with no identifiers recorded
- Discrimination-focused questions specific to different incident types
- Categories including: Race/Color, Gender, Religion, Age, Disability, National Origin, Sexual Orientation, Pregnancy, etc.
- Support for different incident locations: Workplace, School, Housing, Law Enforcement, Healthcare, etc.
- Timeline options to help victims remember incident dates
- Optional witness and evidence documentation

### 2. **AI-Powered Chatbot**
- Two guidance modes powered by **Llama 3.2** running locally via Ollama
  - **"What should I do?"** - Get 3 actionable next steps for your situation
  - **"Identify an experience"** - Help understanding if an experience constitutes discrimination
- **Private & Local** - All AI processing happens on your machine, nothing sent to external services
- Graceful fallback to contextual mock responses if Ollama is unavailable
- Responses cover:
  - US discrimination law (workplace, housing, education, public accommodations)
  - Documenting incidents and preserving evidence
  - Reporting channels (HR, EEOC, Title IX, HUD, state agencies, legal aid)
  - Protections against retaliation

### 3. **Interactive Forums**
- Browse real discussions about discrimination experiences
- Click on any forum post to see full content, community replies, and engagement metrics
- Topics include: Hate crimes, microaggressions, psychological support, historical context

### 4. **Support Resources**
- Organized help articles:
  - Essentials (what is discrimination, legal rights, evidence documentation)
  - Connect (advocates, support groups, EEOC filing)
  - Good to know (FAQs, retaliation protections, mental health resources)

### 5. **Navigation**
- Bottom navigation bar for easy access to all features
- Persistent state management and smooth screen transitions

## Getting Started

### Requirements

- [Ollama](https://ollama.com) installed and running
- Node.js 16+

### Setup (< 5 minutes)

1. **Clone the project and install dependencies**
   ```bash
   cd Combatting-Discrimination
   npm install
   ```

2. **Pull the AI model**
   ```bash
   ollama pull llama3.2
   ```

3. **Start the proxy server**
   ```bash
   npm start
   ```

4. **Open the app**
   - Go to `http://localhost:3001` in your browser
   - The chatbot is ready immediately — no model download wait

### Without Ollama

You can still open `index.html` directly in a browser. The chatbot will automatically fall back to contextual mock responses when the proxy server is not running.

## Project Structure

```
Combatting-Discrimination/
├── index.html           # Main HTML
├── css/
│   └── styles.css       # All styling (responsive mobile design)
├── js/
│   ├── main.js          # App logic and AI integration
│   └── data.js          # Forum posts, report steps, system prompts
├── ollama-proxy.js      # Express server — CORS proxy between app and Ollama
├── package.json         # Node.js dependencies
├── coi-serviceworker.js # Cross-origin isolation header (legacy)
└── archive/
    └── app.html         # Legacy version
```

## How It Works

### Reporting Flow
1. User clicks "Anonymously document an incident"
2. App shows anonymity confirmation
3. Multi-step form with discrimination-focused questions
4. Optional description and witness information
5. Submit anonymously with success confirmation

### Chat Flow
1. User clicks "What should I do?" or "Identify an experience"
2. App checks `http://localhost:3001/health` for Ollama availability
3. If available → message sent to proxy → proxy calls Ollama → response returned
4. If unavailable → contextual mock response shown
5. Continue conversation with follow-up questions

### Forum Flow
1. User clicks "Forums"
2. Sees list of community discussions
3. Click on any post to see full discussion with replies

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI**: Llama 3.2 via [Ollama](https://ollama.com)
- **Proxy Server**: Node.js + Express (handles CORS, routes chat requests)
- **Styling**: CSS3 with mobile-first responsive design
- **Storage**: Browser localStorage for report data

## Configuration

### Change the AI Model

Edit `ollama-proxy.js`, line 8:
```javascript
const MODEL = 'llama3.2';  // change to any model you have pulled
```

Then pull the model:
```bash
ollama pull <model-name>
```

### Customize the System Prompt

In `js/data.js`, modify `LLM_SYSTEM_PROMPT`, or edit the `getSystemPrompt()` function in `ollama-proxy.js` directly.

### Change the Proxy Port

Edit `ollama-proxy.js`, line 7:
```javascript
const PORT = 3001;
```

And update `AI_PROXY_URL` in `js/main.js` to match.

## Data & Privacy

- **No External AI** - All AI calls go to your local Ollama instance
- **No Tracking** - No analytics or cookies
- **Anonymous Reporting** - Reports contain no identifiers and are stored only in browser localStorage
- **Offline Capable** - Mock responses work without internet; full AI works without internet once the model is pulled

## Customization

### Add Forum Posts
Edit `js/data.js` — `FORUM_POSTS` array:
```javascript
{
  id: 4,
  initials: 'XX',
  bg: '#color',
  tc: '#text-color',
  title: 'Your Topic',
  user: 'User Name',
  time: '1h ago',
  comments: 0,
  likes: 0,
  body: 'Full post text...',
  replies: [{ initials: 'XX', user: 'Name', time: '1h ago', text: 'Reply...' }]
}
```

### Modify Report Questions
Edit `js/data.js` — `REPORT_STEPS` array to add/remove questions or change types.

### Update Styling
Edit `css/styles.css` — all styles are organized by component.

## Troubleshooting

### Chatbot gives mock responses?
- Make sure Ollama is running: `ollama serve`
- Make sure the proxy server is running: `npm start`
- Check health endpoint: `curl http://localhost:3001/health`
- Make sure llama3.2 is pulled: `ollama list`

### Chatbot not responding at all?
- Check browser console for errors (F12)
- Confirm the proxy is reachable: `http://localhost:3001/health`
- Confirm Ollama is running on port 11434: `curl http://localhost:11434/api/tags`

### Forum posts not showing?
- Check browser console for errors
- Verify `js/data.js` loads correctly
- Clear browser cache and reload

### Styling looks broken?
- Refresh the page (Ctrl+Shift+R / Cmd+Shift+R)

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- [ ] Database integration for actual report storage
- [ ] Email notifications for reports
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with EEOC API
- [ ] Video tutorials

## Contributing

This is an open project aimed at supporting discrimination victims.

Ideas for contribution:
- Add more forum discussions
- Improve AI prompts
- Add more resources
- Translate to other languages
- Design improvements

## License

MIT License — feel free to use and modify for good causes.

## Support

For issues or questions:
1. Check browser console for error messages (F12)
2. Verify Ollama is running: `ollama serve`
3. Verify the proxy server is running: `npm start`
4. Check that all files are in the correct directories

---

**Built with care to help combat discrimination**
