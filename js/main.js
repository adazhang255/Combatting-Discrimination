// Application state
let currentScreen = 'splash';
let reportStep = 0;
let chatWhatIndex = 0;
let chatIdentifyIndex = 0;
let chatWhatMessages = [];
let chatIdentifyMessages = [];

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
  return `<div class="home-inner">
    <div class="home-logo">E<span>Q</span>UITY<br>NAVIGATOR</div>
    <button class="main-btn" onclick="go('report')">Anonymously document an incident</button>
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
    <div class="f-item">
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
 * Render report screen with form fields
 */
function renderReport() {
  const step = REPORT_STEPS[reportStep];
  let fieldHtml = '';

  if (step.type === 'radio') {
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
 * Send a chat message and get a response
 */
function sendChat(which) {
  const tf = document.getElementById('tf-' + which);
  if (!tf) return;

  const val = tf.value.trim();
  if (!val) return;

  const pool = which === 'what' ? WHAT_PROMPTS : IDENTIFY_PROMPTS;
  let idx = which === 'what' ? chatWhatIndex : chatIdentifyIndex;
  const reply = pool[idx % pool.length];

  if (which === 'what') {
    chatWhatMessages.push({ user: val, bot: reply.bot });
    chatWhatIndex++;
  } else {
    chatIdentifyMessages.push({ user: val, bot: reply.bot });
    chatIdentifyIndex++;
  }

  tf.value = '';
  render();

  // Scroll to bottom of messages
  setTimeout(() => {
    const msgs = document.getElementById('chat-msgs-' + which);
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }, 50);
}

// Initialize app on page load
render();
