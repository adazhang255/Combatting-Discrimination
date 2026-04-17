# Equity Navigator

A comprehensive web application to help people understand, document, and report discrimination incidents anonymously with guidance and support resources.

## Features

### 1. **Anonymous Incident Reporting** 📋
- Completely anonymous reporting form with no identifiers recorded
- Discrimination-focused questions specific to different incident types
- Categories including: Race/Color, Gender, Religion, Age, Disability, National Origin, Sexual Orientation, Pregnancy, etc.
- Support for different incident locations: Workplace, School, Housing, Law Enforcement, Healthcare, etc.
- Timeline options to help victims remember incident dates
- Optional witness and evidence documentation

### 2. **AI-Powered Chatbot** 🤖
- Two guidance chatbots powered by **Gemma running directly in your browser**:
  - **"What should I do?"** - Get immediate guidance on next steps and options
  - **"Identify an experience"** - Help understanding if an experience constitutes discrimination
- **Zero configuration** - No API keys, accounts, or setup required!
- Works perfectly on GitHub Pages - no server needed
- **Private & Free** - All AI processing happens on your computer
- Graceful fallback to mock responses
- Intelligent responses trained to provide:
  - Clear explanations of US discrimination law
  - Guidance on documenting incidents
  - Information about reporting channels (HR, EEOC, state agencies)
  - Support resources and protections against retaliation

### 3. **Interactive Forums** 💬
- Browse real discussions about discrimination experiences
- Click on any forum post to see:
  - Full post content
  - Community replies and support
  - User avatars and timestamps
  - Engagement metrics (comments, likes)
- Topics include: Hate crimes, microaggressions, psychological support, historical context

### 4. **Support Resources** 🆘
- Organized help articles:
  - Essentials (what is discrimination, legal rights, evidence documentation)
  - Connect (advocates, support groups, EEOC filing)
  - Good to know (FAQs, retaliation protections, mental health resources)
- Quick reference for immediate help

### 5. **Navigation** 🗺️
- Bottom navigation bar for easy access to all features
- Persistent state management
- Smooth screen transitions
- Back buttons for easy navigation

## Getting Started

### Basic Setup (< 2 minutes)

1. **Clone/Open the Project**
   ```bash
   cd Combatting-Discrimination
   ```

2. **Open in Browser**
   - Simply open `index.html` in any modern web browser
   - Chatbot AI loads automatically in the background (first time ~2 minutes)
   - Everything works with zero configuration!

### Zero Configuration Needed

✅ No API keys  
✅ No account setup  
✅ No server needed  
✅ Just open and use!

See [BROWSER_AI.md](BROWSER_AI.md) for technical details about how the browser-based AI works.

## Project Structure

```
Combatting-Discrimination/
├── index.html                # Main HTML file
├── css/
│   └── styles.css           # All styling
├── js/
│   ├── main.js              # Main application logic
│   └── data.js              # App data, prompts, forum posts
├── OLLAMA_SETUP.md          # AI setup instructions
├── docker-compose.yml       # Docker configuration for Ollama
├── ollama-proxy.js          # Optional CORS proxy server
├── package.json             # Node.js dependencies
└── archive/
    └── app.html             # Legacy version
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
2. Enter question about their situation
3. If Ollama available → Get AI response from Gemma
4. If Ollama unavailable → Get contextual mock response
5. Continue conversation with follow-up questions

### Forum Flow
1. User clicks "Forums"
2. Sees list of community discussions
3. Click on any post to see full discussion with replies
4. Back button returns to forum list

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI Backend**: Transformers.js + Gemma 2B (runs in browser!)
- **Styling**: Custom CSS with mobile-first design
- **Storage**: Client-side state management
- **Deployment**: GitHub Pages ready (no server needed)

## Configuration

### Enable AI Chatbot

Set your Hugging Face token (see [HF_SETUP.md](HF_SETUP.md)):
```javascript
// In browser console:
localStorage.setItem('hf_token', 'hf_YOUR_TOKEN_HERE');
```

### Change AI Model

In `js/main.js`, update:
```javascript
const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';
// Or other models from huggingface.co
```

### Customize System Prompt
In `js/data.js`, modify `OLLAMA_SYSTEM_PROMPT` to change how the AI responds.

## Data & Privacy

- **No Server** - App runs entirely in your browser
- **No Tracking** - No analytics or cookies
- **Cloud AI** - Hugging Face processes AI requests (your token stays private)
- **Anonymous Reporting** - Reports contain no identifiers
- **Offline Capable** - Works without internet once loaded (with mock responses)
- **Token Safe** - Only stored in your browser's localStorage, never sent to our servers

## Customization

### Add Forum Posts
Edit `js/data.js` - `FORUM_POSTS` array:
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
Edit `js/data.js` - `REPORT_STEPS` array to add/remove questions or change types.

### Update Styling
Edit `css/styles.css` - All styles are organized by component.

## Troubleshooting

### Chatbot gives mock responses?
- You haven't set your Hugging Face token yet
- See [HF_SETUP.md](HF_SETUP.md) for setup (takes 2 minutes)
- Or use in console: `localStorage.setItem('hf_token', 'hf_YOUR_TOKEN')`

### Chatbot not responding at all?
- Check browser console for errors (F12)
- Verify your HF token: `localStorage.getItem('hf_token')`
- See "[Troubleshooting](HF_SETUP.md#troubleshooting)" in HF_SETUP.md

### Forum posts not showing?
- Check browser console for errors
- Verify `js/data.js` loads correctly
- Clear browser cache and reload

### Styling looks broken?
- Refresh the page
- Clear CSS cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check that all CSS files are loaded

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
- [ ] More AI models support

## Contributing

This is an open project aimed at supporting discrimination victims. 

Ideas for contribution:
- Add more forum discussions
- Improve AI prompts
- Add more resources
- Translate to other languages
- Design improvements

## License

MIT License - Feel free to use and modify for good causes.

## Support

For issues or questions:
1. Check [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for AI-related questions
2. Review the browser console for error messages
3. Check that all files are in the correct directories

---

**Built with ❤️ to help combat discrimination**
