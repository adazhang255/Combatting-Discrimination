# Browser-Based Gemma - No API Key Needed! 🚀

The Equity Navigator now runs **Gemma AI directly in your browser** - completely client-side with **zero configuration needed**.

## How It Works

✅ **No Account Required** - No Hugging Face signup needed  
✅ **No API Keys** - Nothing to set up or configure  
✅ **Private** - All processing happens on your computer  
✅ **Free** - No usage limits or billing  
✅ **Works Offline** - After first load, works without internet  

## First Load (One-Time Setup)

**First time you open the app:**
3. **Takes 30 seconds to 2 minutes** depending on internet speed
4. Status changes to "🤖 AI Ready (Browser)"
5. Try the chatbot - it now works!

**After first load:**
- Model is cached in your browser
- Instant startup
- No more waiting

## Using the Chatbot

Once the model loads:
1. Click "What should I do?" or "Identify an experience"
2. Type your question about discrimination
3. Wait 3-10 seconds for AI response (runs locally!)
4. Continue the conversation

## Technical Details

### Model Information
- **Model**: Gemma 2B (quantized)
- **Size**: ~200MB (downloaded once, cached locally)
- **Speed**: 3-10 seconds per response
- **Memory Usage**: ~1-2GB RAM during generation
- **Privacy**: 100% client-side (no data leaves your device)

### Library
Uses [Transformers.js](https://xenova.github.io/transformers.js/) - brings Hugging Face models to JavaScript

### Browser Support
- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+ (may be slower)
- ✅ Edge 90+
- ✅ Mobile browsers (slower on mobile)

## GitHub Pages Ready

**Perfect for deployment:**
```bash
git push to GitHub
Enable Pages → Done! 
```

No backend server needed. It just works.

## Performance Tips

### Make responses faster:
1. **Use a desktop** - Faster than mobile
2. **Close other tabs** - Frees up memory
3. **First response is slower** - Model is warming up
4. **Subsequent responses are faster** - Model is cached

### If it's slow:
- Try Firefox (often faster for certain operations)
- Clear browser cache if you get errors
- Refresh the page and wait for model to load

## Known Limitations

- **First load**: Takes 30 seconds to 2 minutes
- **Response time**: 3-10 seconds (model running locally)
- **Mobile**: Slower, especially on low-memory devices
- **Storage**: Takes up ~200-300MB of browser cache
- **Language**: English only

## Troubleshooting

### "Loading AI Model..." shows forever?
- Check internet connection
- Try a different browser
- Clear browser cache and refresh

### AI not responding / "⏳ Thinking..." stuck?
- Model may be processing
- Wait up to 30 seconds
- Check browser console for errors (F12)
- Try a simpler question

### Browser runs out of memory?
- Close other tabs
- Refresh the page
- Try a different browser
- This is rare but can happen on mobile

### Want faster responses?
- We're using the quantized 2B model for browser compatibility
- Larger models are too big to download

## Offline Mode

After the model loads:
1. Close the browser (or quit internet)
2. Reopen the app
3. It still works! (Model is in your browser cache)
4. Only need internet to update the app

## Disabling the AI

If you want to:
- Free up browser storage: Clear browser cache/cookies
- Use without AI: Just don't click chat buttons (mock responses will show)
- The app works fine without it!

## Future Improvements

- Faster quantized models
- WebGPU acceleration (coming soon)
- Larger local models
- Streaming responses

## Questions?

- Check browser console: Press F12 → Console tab
- Share error messages if reporting issues
- Model loading info will appear in console

---

**Enjoy free, private, AI-powered guidance on discrimination - no signup required!** 💪
