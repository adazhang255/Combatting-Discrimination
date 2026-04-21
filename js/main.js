// Application state
let currentScreen = "splash";
let reportStep = 0;
let chatMode = "steps";
let chatIndex = 0;
let chatMessages = [];
let chatDraft = "";
let forumPostId = null;
let usingAI = false;
let modelReady = false;
let modelLoadFailed = false;
let pipeline = null;
let modelLoadProgress = {
  lastPercent: -1,
  lastLogTime: 0,
};

// Configuration - Transformers.js for browser-side LLM
const MODEL_ID = "onnx-community/gemma-3-1b-it-ONNX";
const TRANSFORMERS_JS_URL =
  "https://cdn.jsdelivr.net/npm/@huggingface/transformers@next";
const MODEL_DEVICE = "webgpu";
// Alternative ungated models:
// gpt-2
// HuggingFaceTB/SmolLM2-135M-Instruct
// onnx-community/Qwen3.5-0.8B-ONNX

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
      <div class="grid-btn" onclick="openChat('steps')">What should I do?</div>
      <div class="grid-btn" onclick="openChat('identify')">Identify an experience</div>
      <div class="grid-btn" onclick="go('support')">Get support</div>
      <div class="grid-btn" onclick="go('forums')">Forums</div>
    </div>
  </div>`;
}

/**
 * Render the current browser model status on the home screen.
 */
function renderModelStatus() {
  if (modelReady) {
    return `<div class="ai-status">AI Ready (Browser)</div>`;
  }

  if (modelLoadFailed) {
    return `<div class="ai-status ai-status-warn">AI unavailable. Using fallback responses.</div>`;
  }

  if (modelLoadProgress.lastPercent >= 0) {
    return `<div class="ai-loading">Downloading AI (${modelLoadProgress.lastPercent}%)...</div>`;
  }

  return `<div class="ai-loading">Starting AI model...</div>`;
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
    // Vertical layout for mobile
    fieldHtml = `<div class="radio-col">
      ${step.opts
        .map(
          (opt, i) =>
            `<label class="radio-label"><input type="radio" name="ropt" ${i === 0 ? "checked" : ""}> ${opt}</label>`,
        )
        .join("")}
    </div>`;
  } else if (step.type === "select") {
    // Use real select element with unique ID to prevent focus loss on re-render
    fieldHtml = `<select class="report-select" id="report-select-step-${reportStep}">
      <option value="">${step.placeholder}</option>
      ${step.opts.map((opt) => `<option value="${opt}">${opt}</option>`).join("")}
    </select>`;
  } else if (step.type === "textarea") {
    fieldHtml = `<textarea class="report-textarea" placeholder="Describe what happened..."></textarea>`;
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
      (msg) => `
    <div class="bubble bubble-user">${msg.user}</div>
    ${renderBotMessage(msg)}`,
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
function renderBotMessage(msg) {
  if (!msg.pending) {
    return `<div class="bubble bubble-bot">${msg.bot}</div>`;
  }

  const label = msg.status || "Thinking";
  return `<div class="bubble bubble-bot bubble-loading" aria-live="polite">
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
function submitReport() {
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

  // Let the browser paint the user's message before starting model work.
  queueChatResponse(val, messageIndex, responseMode);

  // Scroll to bottom again after response
  scrollChatToBottom(100);
}

/**
 * Start the AI response after the user message has rendered.
 */
function queueChatResponse(message, messageIndex, responseMode) {
  requestAnimationFrame(() => {
    setTimeout(() => queryGemma(message, messageIndex, responseMode), 0);
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
 * Check WebGPU support and optimizations
 */
function detectWebGPU() {
  if (navigator.gpu) {
    console.log("✓ WebGPU available");
    return true;
  }
  console.log("WebGPU not available, will use WASM");
  return false;
}

/**
 * Initialize the AI model with optimizations: 4-bit quantization, WebGPU, and progress tracking
 */
async function initializeModel() {
  if (modelReady || pipeline) return;

  try {
    // Check for WebGPU support
    const webgpuAvailable = detectWebGPU();
    if (!webgpuAvailable) {
      throw new Error("WebGPU is required for this model.");
    }

    // Dynamic import of Transformers.js
    const { pipeline: transformersPipeline } = await import(
      TRANSFORMERS_JS_URL
    );

    const modelName = MODEL_ID;

    console.log("Loading browser AI model...");
    console.log("Model: " + modelName);
    console.log("Device: " + MODEL_DEVICE);
    resetModelLoadProgress();

    // Create pipeline for text generation
    pipeline = await transformersPipeline("text-generation", modelName, {
      device: MODEL_DEVICE,
      progress_callback: updateModelLoadProgress,
    });

    modelReady = true;
    modelLoadFailed = false;
    modelLoadProgress.lastPercent = 100;
    console.log("Download: 100%");
    updateModelLoadStatus(100);
    console.log("✓ Model ready! (WebGPU)");

    // Re-render to show ready status
    if (currentScreen === "home") render();
  } catch (error) {
    console.warn("Model initialization failed:", error);
    console.warn("This is often due to network issues or browser limitations.");
    console.warn("The app will still work with mock responses as fallback.");
    modelReady = false;
    modelLoadFailed = true;
    pipeline = null;
  }
}

/**
 * Reset model load progress before a fresh pipeline load.
 */
function resetModelLoadProgress() {
  modelLoadProgress = {
    lastPercent: -1,
    lastLogTime: 0,
  };
}

/**
 * Track Transformers.js progress similarly to the original callback, with throttled logs.
 */
function updateModelLoadProgress(progress) {
  const percent = getModelLoadPercent(progress);
  if (percent === null) return;
  const displayPercent = Math.max(modelLoadProgress.lastPercent, percent);

  const now = Date.now();
  const shouldLog =
    displayPercent !== modelLoadProgress.lastPercent &&
    (displayPercent === 100 || now - modelLoadProgress.lastLogTime >= 500);

  modelLoadProgress.lastPercent = displayPercent;
  updateModelLoadStatus(displayPercent);

  if (shouldLog) {
    modelLoadProgress.lastLogTime = now;
    console.log(`Download: ${displayPercent}%`);
  }
}

/**
 * Convert the current progress callback into a percentage.
 */
function getModelLoadPercent(progress) {
  if (progress.status === "progress") {
    const loaded = Number(progress.loaded);
    const total = Number(progress.total);

    if (Number.isFinite(loaded) && Number.isFinite(total) && total > 0) {
      return Math.round((loaded / total) * 100);
    }

    const directPercent = Number(progress.progress);
    return Number.isFinite(directPercent) ? Math.round(directPercent) : null;
  }

  if (progress.status === "done" || progress.status === "ready") {
    return 100;
  }

  return null;
}

/**
 * Update model download/load status in the UI.
 */
function updateModelLoadStatus(percent) {
  if (currentScreen !== "home") return;

  const statusEl = document.getElementById("ai-status");
  if (!statusEl) return;

  if (percent < 100) {
    statusEl.innerHTML = `<div class="ai-loading">Loading AI (${percent}%)...</div>`;
  } else {
    statusEl.innerHTML = `<div class="ai-status">AI Ready (Browser)</div>`;
  }
}

/**
 * Query Gemma model running in browser (no API key needed!)
 */
async function queryGemma(userMessage, messageIndex, responseMode = chatMode) {
  try {
    if (modelLoadFailed) {
      useMockResponse(responseMode, messageIndex);
      scrollChatToBottom();
      return;
    }

    // Wait for model to be ready (max 5 minutes)
    let attempts = 0;
    while (!modelReady && !modelLoadFailed && attempts < 300) {
      if (!chatMessages[messageIndex]) return;
      chatMessages[messageIndex].pending = true;
      chatMessages[messageIndex].status = "Loading AI model";
      render();
      // Scroll to bottom while loading
      scrollChatToBottom();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    if (!modelReady || modelLoadFailed) {
      console.warn("Model failed to load, using mock response");
      useMockResponse(responseMode, messageIndex);
      scrollChatToBottom();
      return;
    }

    // Show thinking state
    if (!chatMessages[messageIndex]) return;
    chatMessages[messageIndex].pending = true;
    chatMessages[messageIndex].status = "Generating response";
    render();
    // Scroll to bottom
    scrollChatToBottom();

    // Build the prompt
    const systemContext = getChatSystemPrompt(responseMode);
    const fullPrompt = `${systemContext}\n\nUser: ${userMessage}\n\nAssistant:`;

    // Generate response (this runs entirely in the browser!)
    const result = await pipeline(fullPrompt, {
      max_new_tokens: 150,
      temperature: 0.7,
      top_p: 0.9,
      repetition_penalty: 1.2,
    });

    // Text-generation pipelines return { generated_text: "prompt + generated" }
    let botReply = Array.isArray(result)
      ? result[0]?.generated_text
      : result?.generated_text || "";

    // Remove the input prompt to get just the assistant's response
    if (botReply.startsWith(fullPrompt)) {
      botReply = botReply.substring(fullPrompt.length).trim();
    }

    // Further cleanup
    botReply = botReply.replace(/^["']|["']$/g, "").trim();

    if (!botReply) {
      botReply = "I apologize, I could not generate a response.";
    }

    // Update message with generated response
    if (!chatMessages[messageIndex]) return;
    chatMessages[messageIndex].bot = botReply;
    chatMessages[messageIndex].pending = false;
    chatMessages[messageIndex].status = "";
    usingAI = true;
    render();
    // Scroll to bottom with new response
    scrollChatToBottom();
  } catch (error) {
    console.warn("Generation error:", error);
    useMockResponse(responseMode, messageIndex);
    scrollChatToBottom();
  }
}

/**
 * Build mode-specific instructions for the AI while allowing the conversation to adapt.
 */
function getChatSystemPrompt(mode) {
  const sharedInstructions = `You are a supportive educational assistant for discrimination, workplace rights, school rights, housing, public accommodations, and related reporting options.
Start with: "I am an AI, not an attorney. This is educational information and not legal advice."
Be empathetic, ask clarifying questions when facts are missing, and prioritize the user's safety and well-being.
If the user changes the subject or asks for a different kind of help, adapt your guidance regardless of the initial button clicked.`;

  if (mode === "identify") {
    return `${sharedInstructions}
Prioritize identifying whether the described conduct may involve discrimination, harassment, retaliation, or another concern.
Classify the likely category when possible, such as race/color, religion, sex, gender identity, sexual orientation, pregnancy, national origin, age, disability, genetic information, housing, education, public accommodations, or retaliation.
Explain uncertainty clearly and name the facts that would matter.`;
  }

  return `${sharedInstructions}
Prioritize giving 3 actionable next steps.
Focus on practical actions such as documenting dates and witnesses, preserving messages or records, checking internal reporting options, contacting a trusted advocate, and considering external agencies such as the EEOC, a state civil rights agency, school Title IX office, housing authority, or local legal aid when relevant.`;
}

/**
 * Query Hugging Face Gemma API for a response
 */
async function queryHuggingFace(
  userMessage,
  messageIndex = chatMessages.length - 1,
  responseMode = chatMode,
) {
  const hfToken = getHFToken();

  // If no token, use mock responses
  if (!hfToken) {
    useMockResponse(responseMode, messageIndex);
    return;
  }

  try {
    // Build the prompt with context
    const prompt = `System: ${getChatSystemPrompt(responseMode)}\n\nUser: ${userMessage}\n\nAssistant:`;

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn("Invalid Hugging Face token");
      }
      throw new Error(`HF API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle different response formats
    let botReply;
    if (Array.isArray(data) && data[0]?.generated_text) {
      // Extract just the assistant's response (remove the prompt)
      botReply =
        data[0].generated_text.split("Assistant:")[1]?.trim() ||
        "I apologize, I could not generate a response.";
    } else if (data.generated_text) {
      botReply = data.generated_text.trim();
    } else {
      throw new Error("Unexpected response format");
    }

    // Update the last message with the actual response
    if (!chatMessages[messageIndex]) return;
    chatMessages[messageIndex].bot = botReply;
    chatMessages[messageIndex].pending = false;
    chatMessages[messageIndex].status = "";
    usingAI = true;
    render();
  } catch (error) {
    console.warn("HF API error:", error.message);
    useMockResponse(responseMode, messageIndex);
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
