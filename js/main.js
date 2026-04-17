// Application state
let currentScreen = 'splash';
let reportStep = 0;
let chatWhatIndex = 0;
let chatIdentifyIndex = 0;
let chatWhatMessages = [];
let chatIdentifyMessages = [];
let forumPostId = null;
let usingAI = false;
let modelReady = false;
let pipeline = null;

// Configuration - Transformers.js for browser-side LLM
// Using Xenova's quantized Gemma model (runs client-side, no API key needed!)
const MODEL_ID = 'Xenova/gemma-1.1-2b-it';  // 2B quantized - works in browser
// Alternative lighter models:
// 'Xenova/Phi-2' - faster, smaller
// 'Xenova/DistilBERT-base-uncased' - minimal, for testing

/**
 * Main render function - updates DOM based on current screen state
 */
function render() {
  const bodyEl = document.getElementById('body-area');
  const app = document.getElementById('app');

  // Remove old bottom nav
  const oldNav = app.querySelector('.bottom-nav');
  if (oldNav) oldNav.remove();

  bodyEl.innerHTML = '';

  if (currentScreen === 'splash') {
    renderSplash(bodyEl);
    return;
  }

  let html = '';

  if (currentScreen === 'home') {
    html = renderHome();
  } else if (currentScreen === 'forums') {
    html = renderForums();
  } else if (currentScreen === 'forum-detail') {
    html = renderForumDetail();
  } else if (currentScreen === 'report') {
    html = renderReport();
  } else if (currentScreen === 'chat-what') {
    html = renderChatWhat();
  } else if (currentScreen === 'chat-identify') {
    html = renderChatIdentify();
  } else if (currentScreen === 'support') {
    html = renderSupport();
  }

  bodyEl.innerHTML = html;
  renderBottomNav(app);
}

/**
 * Render splash screen
 */
function renderSplash(container) {
  container.innerHTML = `
    <div class="splash">
      <div class="logo-text">E<span>Q</span>UITY<br>NAVIGATOR</div>
      <div class="logo-icon">
        <div class="arc"></div>
        <div class="dot"></div>
        <div class="arc" style="transform:rotate(135deg);"></div>
      </div>
      <div class="tagline">Support. Guidance. Action.</div>
      <button class="splash-btn" onclick="go('home')">Get started</button>
    </div>`;
}

/**
 * Render home screen
 */
function renderHome() {
  const statusHtml = modelReady 
    ? '<div class="ai-status">🤖 AI Ready (Browser)</div>'
    : '<div class="ai-loading">⏳ Loading AI Model... (First time only, ~200MB)</div>';
  
  return `<div class="home-inner">
    <div class="home-logo">E<span>Q</span>UITY<br>NAVIGATOR</div>
    <button class="main-btn" onclick="go('report')">Anonymously document an incident</button>
    ${statusHtml}
    <div class="grid2">
      <div class="grid-btn" onclick="go('chat-what')">What should I do?</div>
      <div class="grid-btn" onclick="go('chat-identify')">Identify an experience</div>
      <div class="grid-btn" onclick="go('support')">Get support</div>
      <div class="grid-btn" onclick="go('forums')">Forums</div>
    </div>
  </div>`;
}

/**
 * Render forums screen
 */
function renderForums() {
  const postsHtml = FORUM_POSTS.map(post => `
    <div class="f-item" onclick="openForumPost(${post.id})">
      <div class="f-title">${post.title}</div>
      <div class="f-meta">
        <div class="av" style="background:${post.bg};color:${post.tc};">${post.initials}</div>
        <span class="f-user">${post.user} &middot; ${post.time}</span>
        <span class="f-stats">&#9997; ${post.comments} &nbsp; &#9829; ${post.likes}</span>
      </div>
    </div>`).join('');

  return `
    <div class="dark-hdr"><span class="back" onclick="go('home')">&#8249;</span><span class="title">Forums</span></div>
    <div class="forum-list">${postsHtml}</div>`;
}

/**
 * Render forum post detail screen
 */
function renderForumDetail() {
  const post = FORUM_POSTS.find(p => p.id === forumPostId);
  if (!post) return renderForums();

  const repliesHtml = post.replies.map(reply => `
    <div class="reply">
      <div class="reply-header">
        <div class="av" style="background:${post.bg};color:${post.tc};">${reply.initials}</div>
        <div class="reply-info">
          <div class="reply-user">${reply.user}</div>
          <div class="reply-time">${reply.time}</div>
        </div>
      </div>
      <div class="reply-text">${reply.text}</div>
    </div>`).join('');

  return `
    <div class="dark-hdr"><span class="back" onclick="go('forums')">&#8249;</span><span class="title">Discussion</span></div>
    <div class="forum-detail">
      <div class="post-header">
        <div class="av" style="background:${post.bg};color:${post.tc};">${post.initials}</div>
        <div class="post-info">
          <div class="post-user">${post.user}</div>
          <div class="post-time">${post.time}</div>
        </div>
      </div>
      <div class="post-title">${post.title}</div>
      <div class="post-body">${post.body}</div>
      <div class="post-stats">${post.comments} comments &nbsp; &#9829; ${post.likes}</div>
      <div class="replies">
        <div class="replies-header">Replies</div>
        ${repliesHtml}
      </div>
    </div>`;
}

/**
 * Render report screen with form fields
 */
function renderReport() {
  const step = REPORT_STEPS[reportStep];
  let fieldHtml = '';

  if (step.type === 'info') {
    fieldHtml = `<div class="info-box" style="background:#f0f8ff;border-left:4px solid #4a90c8;padding:16px;border-radius:4px;color:#1e2235;font-size:14px;">${step.q}</div>`;
  } else if (step.type === 'radio') {
    fieldHtml = `<div class="radio-row">
      ${step.opts.map((opt, i) => 
        `<label><input type="radio" name="ropt" ${i === 0 ? 'checked' : ''}> ${opt}</label>`
      ).join('')}
    </div>`;
  } else if (step.type === 'select') {
    fieldHtml = `<div class="fake-sel"><span>${step.placeholder}</span><span>&#9660;</span></div>`;
  } else if (step.type === 'textarea') {
    fieldHtml = `<textarea style="width:100%;border:1px solid #ccc;border-radius:8px;padding:9px 12px;font-size:12px;font-family:sans-serif;resize:none;height:80px;color:#333;" placeholder="Describe what happened..."></textarea>`;
  }

  const isDone = reportStep === REPORT_STEPS.length - 1;
  const backBtn = reportStep > 0 ? `<button class="btn-back" onclick="reportStep--;render()">Back</button>` : '';

  return `
    <div class="dark-hdr"><span class="back" onclick="go('home')">&#8249;</span><span class="title">Report an incident</span></div>
    <div class="report-inner">
      <div style="font-size:14px;font-weight:700;color:#1e2235;margin-bottom:14px;">New tip</div>
      <div class="rlabel">${step.q}</div>
      ${fieldHtml}
      <div class="step-footer">
        <span class="step-lbl">Step ${reportStep + 1} of ${REPORT_STEPS.length}</span>
        <div class="btn-grp">
          ${backBtn}
          <button class="btn-next" id="btn-submit" onclick="${isDone ? 'submitReport()' : 'reportStep++;render()'}">${isDone ? 'Submit' : 'Next'}</button>
        </div>
      </div>
      <div id="report-success"></div>
    </div>`;
}

/**
 * Render chat-what screen
 */
function renderChatWhat() {
  const initialMsg = chatWhatMessages.length === 0 
    ? `<div class="bubble bubble-bot">Describe your situation and I'll guide you through your options and next steps.</div>`
    : '';

  const messagesHtml = chatWhatMessages.map(msg => `
    <div class="bubble bubble-user">${msg.user}</div>
    <div class="bubble bubble-bot">${msg.bot}</div>`).join('');

  return `
    <div class="dark-hdr"><span class="back" onclick="go('home')">&#8249;</span><span class="title">What should I do?</span></div>
    <div class="chat-messages" id="chat-msgs-what">
      ${initialMsg}
      ${messagesHtml}
    </div>
    <div class="chat-input-row">
      <input class="chat-tf" id="tf-what" placeholder="Describe your situation..." onkeydown="if(event.key==='Enter')sendChat('what')">
      <div class="send-btn" onclick="sendChat('what')"><div class="send-arrow"></div></div>
    </div>`;
}

/**
 * Render chat-identify screen
 */
function renderChatIdentify() {
  const initialMsg = chatIdentifyMessages.length === 0 
    ? `<div class="bubble bubble-bot">Tell me what happened and I'll help you understand if it may be discrimination and what category it falls under.</div>`
    : '';

  const messagesHtml = chatIdentifyMessages.map(msg => `
    <div class="bubble bubble-user">${msg.user}</div>
    <div class="bubble bubble-bot">${msg.bot}</div>`).join('');

  return `
    <div class="dark-hdr"><span class="back" onclick="go('home')">&#8249;</span><span class="title">Identify discrimination</span></div>
    <div class="chat-messages" id="chat-msgs-identify">
      ${initialMsg}
      ${messagesHtml}
    </div>
    <div class="chat-input-row">
      <input class="chat-tf" id="tf-identify" placeholder="What happened?" onkeydown="if(event.key==='Enter')sendChat('identify')">
      <div class="send-btn" onclick="sendChat('identify')"><div class="send-arrow"></div></div>
    </div>`;
}

/**
 * Render support screen
 */
function renderSupport() {
  return `
    <div class="dark-hdr"><span class="back" onclick="go('home')">&#8249;</span><span class="title">Get support</span></div>
    <div class="support-inner">
      <input class="supp-search" placeholder="Search help articles..." readonly>
      <div class="supp-cat">Essentials</div>
      <div class="supp-link">What is workplace discrimination? <span class="chev">&#8250;</span></div>
      <div class="supp-link">Know your legal rights <span class="chev">&#8250;</span></div>
      <div class="supp-link">How to document evidence <span class="chev">&#8250;</span></div>
      <div class="supp-link">Filing a formal complaint <span class="chev">&#8250;</span></div>
      <div class="supp-cat">Connect</div>
      <div class="supp-link">Find a trained advocate <span class="chev">&#8250;</span></div>
      <div class="supp-link">Community support groups <span class="chev">&#8250;</span></div>
      <div class="supp-link">EEOC — file externally <span class="chev">&#8250;</span></div>
      <div class="supp-cat">Good to know</div>
      <div class="supp-link">FAQs <span class="chev">&#8250;</span></div>
      <div class="supp-link">Retaliation protections <span class="chev">&#8250;</span></div>
      <div class="supp-link">Mental health resources <span class="chev">&#8250;</span></div>
    </div>`;
}

/**
 * Render bottom navigation
 */
function renderBottomNav(app) {
  const nav = document.createElement('div');
  nav.className = 'bottom-nav';

  NAV.forEach(n => {
    const btn = document.createElement('button');
    btn.className = 'nav-item' + (currentScreen === n.id ? ' on' : '');
    btn.innerHTML = `<span class="nav-icon">${n.icon}</span>${n.label}`;
    btn.onclick = () => go(n.id);
    nav.appendChild(btn);
  });

  app.appendChild(nav);
}

/**
 * Navigate to a screen
 */
function go(screen) {
  if (screen === 'report') {
    reportStep = 0;
  }
  currentScreen = screen;
  render();
}

/**
 * Open a forum post detail screen
 */
function openForumPost(postId) {
  forumPostId = postId;
  currentScreen = 'forum-detail';
  render();
}

/**
 * Submit a report and show success message
 */
function submitReport() {
  const el = document.getElementById('report-success');
  if (el) {
    el.innerHTML = `<div class="success-box"><p>&#10003; Your report has been submitted anonymously. A case number will be sent to your secure inbox. Thank you for speaking up.</p></div>`;
  }
  const btn = document.getElementById('btn-submit');
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.5';
  }
}

/**
 * Send a chat message and get a response from Ollama/Gemma or fallback
 */
function sendChat(which) {
  const tf = document.getElementById('tf-' + which);
  if (!tf) return;

  const val = tf.value.trim();
  if (!val) return;

  // Add user message immediately
  if (which === 'what') {
    chatWhatMessages.push({ user: val, bot: '...' });
    chatWhatIndex++;
  } else {
    chatIdentifyMessages.push({ user: val, bot: '...' });
    chatIdentifyIndex++;
  }

  tf.value = '';
  render();

  // Try to get response from browser-based Gemma
  queryGemma(val, which);

  // Scroll to bottom of messages
  setTimeout(() => {
    const msgs = document.getElementById('chat-msgs-' + which);
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }, 50);
}

/**
 * Initialize the AI model (called once on startup)
 */
async function initializeModel() {
  if (modelReady || pipeline) return;
  
  try {
    // Dynamic import of Transformers.js
    const { pipeline: transformersPipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.13.4');
    console.log('Loading Gemma model (first load ~200MB, please wait)...');
    pipeline = await transformersPipeline('text2text-generation', MODEL_ID);
    modelReady = true;
    console.log('✓ Gemma model ready!');
    if (currentScreen === 'home') render();
  } catch (error) {
    console.warn('Model initialization failed:', error);
  }
}

/**
 * Query Gemma model running in browser (no API key needed!)
 */
async function queryGemma(userMessage, which) {
  try {
    // Ensure model is ready
    if (!modelReady) {
      useMockResponse(which);
      return;
    }

    // Show thinking state
    if (which === 'what') {
      chatWhatMessages[chatWhatMessages.length - 1].bot = '⏳ Generating response...';
    } else {
      chatIdentifyMessages[chatIdentifyMessages.length - 1].bot = '⏳ Generating response...';
    }
    render();

    // Build the prompt
    const systemContext = `You are a helpful assistant providing guidance on discrimination and workers' rights. Give clear, concise advice in 1-2 sentences.`;
    const fullPrompt = `${systemContext}\n\nUser: ${userMessage}\n\nAssistant:`;

    // Generate response (this runs entirely in the browser!)
    const result = await pipeline(fullPrompt, {
      max_new_tokens: 150,
      temperature: 0.7,
      top_p: 0.9,
      repetition_penalty: 1.2
    });

    let botReply = result[0]?.generated_text || '';
    
    // Clean up the response (remove the prompt part)
    if (botReply.includes('Assistant:')) {
      botReply = botReply.split('Assistant:')[1]?.trim() || 'I apologize, I could not generate a response.';
    }
    
    // Further cleanup and truncate
    botReply = botReply.replace(/^["']|["']$/g, '').trim();
    if (botReply.length > 400) {
      botReply = botReply.substring(0, 400) + '...';
    }

    // Update message with generated response
    if (which === 'what') {
      chatWhatMessages[chatWhatMessages.length - 1].bot = botReply || 'I apologize, I could not generate a response.';
    } else {
      chatIdentifyMessages[chatIdentifyMessages.length - 1].bot = botReply || 'I apologize, I could not generate a response.';
    }
    usingAI = true;
    render();
  } catch (error) {
    console.warn('Generation error:', error);
    useMockResponse(which);
  }
}

/**
 * Query Hugging Face Gemma API for a response
 */
async function queryHuggingFace(userMessage, which) {
  const hfToken = getHFToken();
  
  // If no token, use mock responses
  if (!hfToken) {
    useMockResponse(which);
    return;
  }

  try {
    // Build the prompt with context
    const prompt = `System: ${OLLAMA_SYSTEM_PROMPT}\n\nUser: ${userMessage}\n\nAssistant:`;

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          top_p: 0.9
        }
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('Invalid Hugging Face token');
      }
      throw new Error(`HF API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    let botReply;
    if (Array.isArray(data) && data[0]?.generated_text) {
      // Extract just the assistant's response (remove the prompt)
      botReply = data[0].generated_text.split('Assistant:')[1]?.trim() || 'I apologize, I could not generate a response.';
    } else if (data.generated_text) {
      botReply = data.generated_text.trim();
    } else {
      throw new Error('Unexpected response format');
    }
    
    // Limit response length
    if (botReply.length > 500) {
      botReply = botReply.substring(0, 500) + '...';
    }
    
    // Update the last message with the actual response
    if (which === 'what') {
      chatWhatMessages[chatWhatMessages.length - 1].bot = botReply;
    } else {
      chatIdentifyMessages[chatIdentifyMessages.length - 1].bot = botReply;
    }
    usingAI = true;
    render();
  } catch (error) {
    console.warn('HF API error:', error.message);
    useMockResponse(which);
  }
}

/**
 * Use mock response as fallback
 */
function useMockResponse(which) {
  const pool = which === 'what' ? WHAT_PROMPTS : IDENTIFY_PROMPTS;
  const idx = which === 'what' ? (chatWhatIndex - 1) : (chatIdentifyIndex - 1);
  const mockReply = pool[idx % pool.length].bot;

  if (which === 'what') {
    chatWhatMessages[chatWhatMessages.length - 1].bot = mockReply;
  } else {
    chatIdentifyMessages[chatIdentifyMessages.length - 1].bot = mockReply;
  }
  usingAI = false;
  render();
}

// Initialize app on page load
render();

// Start loading the model in the background (no API key needed!)
initializeModel();
