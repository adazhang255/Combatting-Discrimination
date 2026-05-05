// Application state
let currentScreen = "splash";
let reportStep = 0;
let reportResponses = {};
let chatMode = "steps";
let chatIndex = 0;
let chatMessages = [];
let chatDraft = "";
let forumPostId = null;
let usingAI = false;
let aiReady = false;
let aiCheckDone = false;

const REPORT_STORAGE_KEY = "eqnavigator_reports";
const AI_PROXY_URL = "http://localhost:3001";

/**
 * Main render function - updates DOM based on current screen state
 */
function render() {
  const bodyEl = document.getElementById("body-area");
  const app = document.getElementById("app");
  const shouldRestoreChatInput = document.activeElement?.id === "tf-guidance";

  // Remove old bottom nav
  const oldNav = app.querySelector(".bottom-nav");
  if (oldNav) oldNav.remove();

  bodyEl.innerHTML = "";

  if (currentScreen === "splash") {
    renderSplash(bodyEl);
    return;
  }

  let html = "";

  if (currentScreen === "home") {
    html = renderHome();
  } else if (currentScreen === "forums") {
    html = renderForums();
  } else if (currentScreen === "forum-detail") {
    html = renderForumDetail();
  } else if (currentScreen === "report") {
    html = renderReport();
  } else if (currentScreen === "chat-guidance") {
    html = renderChatGuidance();
  } else if (currentScreen === "support") {
    html = renderSupport();
  } else if (currentScreen === "faq") {
    html = renderFaq();
  }

  bodyEl.innerHTML = html;
  renderBottomNav(app);
  restoreChatInputState(shouldRestoreChatInput);
}

/**
 * Restore draft input sizing/focus after chat screen re-renders.
 */
function restoreChatInputState(shouldFocus) {
  if (currentScreen !== "chat-guidance") return;

  requestAnimationFrame(() => {
    const tf = document.getElementById("tf-guidance");
    if (!tf) return;

    autoResizeChatInput(tf);
    if (shouldFocus) {
      tf.focus();
      tf.selectionStart = tf.value.length;
      tf.selectionEnd = tf.value.length;
    }
  });
}

/**
 * Render splash screen
 */
function renderSplash(container) {
  container.innerHTML = `
    <div class="splash">
      <div class="splash-brand">
        <div class="equity-word">
          <span class="eq-dark">E</span><span class="eq-rose">Q</span><span class="eq-dark">U</span><span class="eq-dark">I</span><span class="eq-dark">T</span><span class="eq-salmon">Y</span>
        </div>
        <div class="navigator-word">NAVIGATOR</div>
      </div>
      <div class="logo-icon">
        <div class="arc arc-left"></div>
        <div class="dot"></div>
        <div class="arc arc-right"></div>
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
      <div class="grid-btn" onclick="openChat('steps')">What should I do?</div>
      <div class="grid-btn" onclick="openChat('identify')">Identify an experience</div>
      <div class="grid-btn" onclick="go('support')">Get support</div>
      <div class="grid-btn" onclick="go('forums')">Forums</div>
    </div>
  </div>`;
}

/**
 * Render the AI connection status on the chat screen.
 */
function renderModelStatus() {
  if (aiReady) {
    return `<div class="ai-status">AI Ready (Local)</div>`;
  }
  if (aiCheckDone) {
    return `<div class="ai-status ai-status-warn">AI offline. Using fallback responses. Run: npm start</div>`;
  }
  return `<div class="ai-loading">Connecting to AI...</div>`;
}

/**
 * Render forums screen
 */
function renderForums() {
  const postsHtml = FORUM_POSTS.map(
    (post) => `
    <div class="f-item" onclick="openForumPost(${post.id})">
      <div class="f-title">${post.title}</div>
      <div class="f-meta">
        <div class="av" style="background:${post.bg};color:${post.tc};">${post.initials}</div>
        <span class="f-user">${post.user} &middot; ${post.time}</span>
        <span class="f-stats">&#9997; ${post.comments} &nbsp; &#9829; ${post.likes}</span>
      </div>
    </div>`,
  ).join("");

  return `
    <div class="dark-hdr"><span class="back" onclick="go('home')">&#8249;</span><span class="title">Forums</span></div>
    <div class="forum-list">${postsHtml}</div>`;
}

/**
 * Render forum post detail screen
 */
function renderForumDetail() {
  const post = FORUM_POSTS.find((p) => p.id === forumPostId);
  if (!post) return renderForums();

  const repliesHtml = post.replies
    .map(
      (reply) => `
    <div class="reply">
      <div class="reply-header">
        <div class="av" style="background:${post.bg};color:${post.tc};">${reply.initials}</div>
        <div class="reply-info">
          <div class="reply-user">${reply.user}</div>
          <div class="reply-time">${reply.time}</div>
        </div>
      </div>
      <div class="reply-text">${reply.text}</div>
    </div>`,
    )
    .join("");

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
  let fieldHtml = "";

  if (step.type === "info") {
    fieldHtml = `<div class="info-box" style="background:#f0f8ff;border-left:4px solid #4a90c8;padding:16px;border-radius:4px;color:#1e2235;font-size:14px;">${step.q}</div>`;
  } else if (step.type === "radio") {
    const savedAnswer = getReportAnswer(reportStep) || step.opts[0];
    if (!reportResponses[reportStep]) {
      reportResponses[reportStep] = savedAnswer;
    }
    fieldHtml = `<div class="radio-col">
      ${step.opts
        .map(
          (opt) =>
            `<label class="radio-label"><input type="radio" name="ropt" value="${opt}" ${savedAnswer === opt ? "checked" : ""} onchange="saveReportAnswer(${reportStep}, this.value)"> ${opt}</label>`,
        )
        .join("")}
    </div>`;
  } else if (step.type === "select") {
    const savedAnswer = getReportAnswer(reportStep);
    fieldHtml = `<select class="report-select" id="report-select-step-${reportStep}" onchange="saveReportAnswer(${reportStep}, this.value)">
      <option value="">${step.placeholder}</option>
      ${step.opts
        .map(
          (opt) =>
            `<option value="${opt}" ${savedAnswer === opt ? "selected" : ""}>${opt}</option>`,
        )
        .join("")}
    </select>`;
  } else if (step.type === "textarea") {
    const savedAnswer = getReportAnswer(reportStep);
    fieldHtml = `<textarea class="report-textarea" placeholder="Describe what happened..." oninput="saveReportAnswer(${reportStep}, this.value)">${escapeHtml(savedAnswer)}</textarea>`;
  }

  const isDone = reportStep === REPORT_STEPS.length - 1;
  const backBtn =
    reportStep > 0
      ? `<button class="btn-back" onclick="reportStep--;render()">Back</button>`
      : "";

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
          <button class="btn-next" id="btn-submit" onclick="${isDone ? "submitReport()" : "reportStep++;render()"}">${isDone ? "Submit" : "Next"}</button>
        </div>
      </div>
      <div id="report-success"></div>
    </div>`;
}

/**
 * Render unified chat guidance screen
 */
function renderChatGuidance() {
  const title =
    chatMode === "identify" ? "Identify discrimination" : "What should I do?";
  const placeholder =
    chatMode === "identify" ? "What happened?" : "Describe your situation...";
  const intro =
    chatMode === "identify"
      ? "Tell me what happened and I'll help you understand if it may be discrimination and what category it falls under."
      : "Describe your situation and I'll guide you through your options and next steps.";
  const initialMsg = `<div class="bubble bubble-bot">${intro}</div>`;

  const messagesHtml = chatMessages
    .map(
      (msg, i) => `
    <div class="bubble bubble-user">${escapeHtml(msg.user)}</div>
    ${renderBotMessage(msg, i)}`,
    )
    .join("");

  return `
  <div class="dark-hdr"><span class="back" onclick="go('home')">&#8249;</span><span class="title">${title}</span></div>
    
    <div id="ai-status" style="margin-top: 12px; font-size: 12px; text-align: center;">
      ${renderModelStatus()}
    </div>

    <div class="chat-messages" id="chat-msgs-guidance">
      ${initialMsg}
      ${messagesHtml}
    </div>
    <div class="chat-input-row">
      <textarea class="chat-tf"
        id="tf-guidance"
        placeholder="${placeholder}"
        rows="1"
        oninput="handleChatInput(this)"
        onkeydown="handleChatKeydown(event)">${escapeHtml(chatDraft)}</textarea>
      <div class="send-btn" onclick="sendChat()"><div class="send-arrow"></div></div>
    </div>`;
}

/**
 * Escape text before placing it inside HTML.
 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Render a normal bot reply or an animated waiting indicator.
 */
function renderBotMessage(msg, idx) {
  if (!msg.pending) {
    return `<div class="bubble bubble-bot" id="bot-bubble-${idx}">${msg.bot}</div>`;
  }

  const label = msg.status || "Thinking";
  return `<div class="bubble bubble-bot bubble-loading" id="bot-bubble-${idx}" aria-live="polite">
    <span>${label}</span>
    <span class="typing-dots" aria-hidden="true">
      <span></span><span></span><span></span>
    </span>
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
      <a class="supp-link" href="https://www.eeoc.gov/sites/default/files/2023-06/22-088_EEOC_KnowYourRights6.12ScreenRdr.pdf" target="_blank" rel="noopener">What is workplace discrimination? <span class="chev">&#8250;</span></a>
      <a class="supp-link" href="https://www.aclu.org/know-your-rights" target="_blank" rel="noopener">Know your legal rights <span class="chev">&#8250;</span></a>
      <a class="supp-link" href="https://www.eeoc.gov/how-file-charge-employment-discrimination" target="_blank" rel="noopener">How to document evidence <span class="chev">&#8250;</span></a>
      <a class="supp-link" href="https://www.eeoc.gov/filing-charge-discrimination" target="_blank" rel="noopener">Filing a formal complaint <span class="chev">&#8250;</span></a>
      <div class="supp-cat">Connect</div>
      <a class="supp-link" href="https://www.lawhelp.org/" target="_blank" rel="noopener">Find a trained advocate <span class="chev">&#8250;</span></a>
      <a class="supp-link" href="https://www.nami.org/support-groups/" target="_blank" rel="noopener">Community support groups <span class="chev">&#8250;</span></a>
      <a class="supp-link" href="https://www.eeoc.gov/how-file-charge-employment-discrimination" target="_blank" rel="noopener">EEOC — file externally <span class="chev">&#8250;</span></a>
      <div class="supp-cat">Good to know</div>
      <button class="supp-link" onclick="go('faq')">FAQs <span class="chev">&#8250;</span></button>
      <a class="supp-link" href="https://www.eeoc.gov/retaliation" target="_blank" rel="noopener">Retaliation protections <span class="chev">&#8250;</span></a>
      <a class="supp-link" href="https://www.mentalhealth.gov/get-help" target="_blank" rel="noopener">Mental health resources <span class="chev">&#8250;</span></a>
    </div>`};

/**
 * Render FAQ page
 */
function renderFaq() {
  return `
    <div class="dark-hdr"><span class="back" onclick="go('support')">&#8249;</span><span class="title">FAQs</span></div>
    <div class="faq-inner">
      <div class="faq-item">
        <div class="faq-question">How is this report handled?</div>
        <div class="faq-answer">Your report is kept anonymous within the app. We do not collect names, emails, or device identifiers here.</div>
      </div>
      <div class="faq-item">
        <div class="faq-question">Is this legal advice?</div>
        <div class="faq-answer">No. This app gives educational guidance only. For legal advice, contact a lawyer, your local EEOC office, or a trusted advocate.</div>
      </div>
      <div class="faq-item">
        <div class="faq-question">What counts as discrimination?</div>
        <div class="faq-answer">Discrimination is unfair treatment based on protected characteristics like race, gender, religion, age, disability, national origin, pregnancy, sexual orientation, or retaliation.</div>
      </div>
      <div class="faq-item">
        <div class="faq-question">What should I document?</div>
        <div class="faq-answer">Write down dates, times, locations, what was said or done, who was present, and any evidence such as messages or emails.</div>
      </div>
      <div class="faq-item">
        <div class="faq-question">Where can I get more help?</div>
        <div class="faq-answer">Use the support page links to reach EEOC resources, legal aid, and mental health support. If you are in danger, contact local authorities immediately.</div>
      </div>
    </div>`;
}

/**
 * Render bottom navigation
 */
function renderBottomNav(app) {
  const nav = document.createElement("div");
  nav.className = "bottom-nav";

  NAV.forEach((n) => {
    const btn = document.createElement("button");
    btn.className = "nav-item" + (currentScreen === n.id ? " on" : "");
    btn.innerHTML = `<span class="nav-icon">${n.icon}</span>${n.label}`;
    btn.onclick = () =>
      n.id === "chat-guidance" ? openChat(chatMode || "steps") : go(n.id);
    nav.appendChild(btn);
  });

  app.appendChild(nav);
}

/**
 * Navigate to a screen
 */
function go(screen) {
  if (screen === "chat-what") {
    openChat("steps");
    return;
  }
  if (screen === "chat-identify") {
    openChat("identify");
    return;
  }
  if (screen === "report") {
    reportStep = 0;
  }
  currentScreen = screen;
  render();
}

/**
 * Open the shared guidance chat with mode-specific behavior
 */
function openChat(mode) {
  chatMode = mode === "identify" ? "identify" : "steps";
  currentScreen = "chat-guidance";
  render();
  scrollChatToBottom();
}

/**
 * Open a forum post detail screen
 */
function openForumPost(postId) {
  forumPostId = postId;
  currentScreen = "forum-detail";
  render();
}

/**
 * Submit a report and show success message
 */
function getReportAnswer(step) {
  return reportResponses[step] || "";
}

function saveReportAnswer(step, value) {
  if (typeof step !== "number") {
    step = Number(step);
  }
  reportResponses[step] = value;
}

function getStoredReports() {
  try {
    const raw = localStorage.getItem(REPORT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Unable to read stored reports", error);
    return [];
  }
}

function storeReport(report) {
  try {
    const existing = getStoredReports();
    existing.push(report);
    localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.warn("Unable to save report", error);
  }
}

function submitReport() {
  const report = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    answers: { ...reportResponses },
  };

  storeReport(report);
  reportResponses = {};

  const el = document.getElementById("report-success");
  if (el) {
    el.innerHTML = `<div class="success-box"><p>&#10003; Your report has been submitted anonymously. A case number will be sent to your secure inbox. Thank you for speaking up.</p></div>`;
  }
  const btn = document.getElementById("btn-submit");
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = "0.5";
  }
}

/**
 * Send a chat message and get a response from Ollama/Gemma or fallback
 */
function sendChat() {
  const tf = document.getElementById("tf-guidance");
  if (!tf) return;

  const val = tf.value.trim();
  if (!val) return;

  // Add user message immediately
  const responseMode = chatMode;
  const messageIndex =
    chatMessages.push({
      user: val,
      bot: "",
      pending: true,
      status: "Thinking",
    }) - 1;
  chatIndex++;

  tf.value = "";
  chatDraft = "";
  tf.style.height = "auto";
  render();

  // Scroll to bottom after DOM update
  scrollChatToBottom();

  queueChatResponse(val, messageIndex, responseMode);
  scrollChatToBottom(100);
}

/**
 * Start the AI response after the user message has rendered.
 */
function queueChatResponse(message, messageIndex, responseMode) {
  requestAnimationFrame(() => {
    setTimeout(() => queryOllama(message, messageIndex, responseMode), 0);
  });
}

/**
 * Track unsent text so model-loading renders do not wipe the textbox.
 */
function handleChatInput(textarea) {
  chatDraft = textarea.value;
  autoResizeChatInput(textarea);
}

/**
 * Keep chat textarea compact until content needs more space.
 */
function autoResizeChatInput(textarea) {
  textarea.style.height = "auto";
  const nextHeight = Math.min(textarea.scrollHeight, 120);
  textarea.style.height = nextHeight + "px";
  textarea.style.overflowY = textarea.scrollHeight > 120 ? "auto" : "hidden";
}

/**
 * Enter sends, Shift+Enter inserts a newline.
 */
function handleChatKeydown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendChat();
  }
}

/**
 * Scroll the shared chat feed to the newest message.
 */
function scrollChatToBottom(delay = 0) {
  const scroll = () => {
    requestAnimationFrame(() => {
      const msgs = document.getElementById("chat-msgs-guidance");
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    });
  };

  if (delay > 0) {
    setTimeout(scroll, delay);
  } else {
    scroll();
  }
}

/**
 * Check if the local AI proxy is up and the model is ready.
 */
async function initializeModel() {
  try {
    const res = await fetch(`${AI_PROXY_URL}/health`);
    const data = await res.json();
    aiReady = data.ok === true;
    if (!aiReady) console.warn("AI proxy:", data.error);
  } catch {
    aiReady = false;
  }
  aiCheckDone = true;
  render();
}

/**
 * Send a message to the local Ollama proxy and update the chat.
 */
async function queryOllama(userMessage, messageIndex, responseMode = chatMode) {
  if (!chatMessages[messageIndex]) return;

  try {
    const history = chatMessages
      .slice(0, messageIndex)
      .filter((m) => m.bot && !m.pending)
      .flatMap((m) => [
        { role: "user", content: m.user },
        { role: "assistant", content: m.bot },
      ]);

    const res = await fetch(`${AI_PROXY_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage, mode: responseMode, history }),
    });

    if (!res.ok) throw new Error(`Server error ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let accumulated = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop(); // keep any incomplete trailing line for the next chunk

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();

        if (payload === "[DONE]") { streamDone = true; break; }

        try {
          const json = JSON.parse(payload);
          if (json.error) throw new Error(json.error);
          if (json.token) {
            accumulated += json.token;
            chatMessages[messageIndex].bot = accumulated;
            const el = document.getElementById(`bot-bubble-${messageIndex}`);
            if (el) {
              el.className = "bubble bubble-bot";
              el.textContent = accumulated;
              const msgs = document.getElementById("chat-msgs-guidance");
              if (msgs) msgs.scrollTop = msgs.scrollHeight;
            }
          }
        } catch (e) {
          // skip unparseable lines; re-throw real errors (e.g. model errors)
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }

    chatMessages[messageIndex].pending = false;
    chatMessages[messageIndex].status = "";
    usingAI = true;
    if (!accumulated) throw new Error("Empty stream response");
    render();
    scrollChatToBottom();
  } catch (err) {
    console.warn("AI error:", err.message);
    useMockResponse(responseMode, messageIndex);
    scrollChatToBottom();
  }
}

/**
 * Use mock response as fallback
 */
function useMockResponse(
  mode = chatMode,
  messageIndex = chatMessages.length - 1,
) {
  const pool = mode === "steps" ? WHAT_PROMPTS : IDENTIFY_PROMPTS;
  const idx = messageIndex;
  const mockReply = pool[idx % pool.length].bot;

  if (!chatMessages[messageIndex]) return;
  chatMessages[messageIndex].bot = mockReply;
  chatMessages[messageIndex].pending = false;
  chatMessages[messageIndex].status = "";
  usingAI = false;
  render();
}

// Initialize app on page load
render();

// Start loading the model in the background (no API key needed!)
initializeModel();
