/* =========================================================
   Palak Deb Patra's ML & AI Systems Playlist — shared runtime
   Builds the shell (sidebar, topbar, footer nav) and wires up
   generic components: tabs, steppers, quizzes, flip cards, seg controls.
   Exposes helpers on window.ML for chapter-specific simulations.
   ========================================================= */
(function () {
  const CHAPTERS = [
    { n: 1,  file: '01-what-is-an-ml-system.html',     title: 'What Is an ML System?',                              level: 'Beginner',     icon: '🧭', mins: 25, blurb: 'Where learning beats rules, the full ML lifecycle, and why the model is the small part.' },
    { n: 2,  file: '02-math-intuition.html',           title: 'Math & Intuition You Actually Need',                 level: 'Beginner',     icon: '➗', mins: 35, blurb: 'Vectors, matrices, probability, loss surfaces and gradients — visually, not symbolically.' },
    { n: 3,  file: '03-data-quality.html',             title: 'Data: Sourcing, Labeling & Quality',                 level: 'Beginner',     icon: '🧱', mins: 40, blurb: 'Collection, labels, splits, leakage, imbalance and the dataset bugs that sink models.' },
    { n: 4,  file: '04-features.html',                 title: 'Features & Representations',                         level: 'Beginner',     icon: '🧮', mins: 35, blurb: 'Encoding, scaling, crosses, hashing and embeddings — how raw signal becomes model input.' },
    { n: 5,  file: '05-gradient-descent.html',         title: 'Learning by Gradient Descent',                       level: 'Beginner',     icon: '📉', mins: 40, blurb: 'Linear and logistic regression, loss functions, SGD and learning rates — with a live trainer.' },
    { n: 6,  file: '06-classical-ml.html',             title: 'Classical ML: Trees & Ensembles',                    level: 'Beginner',     icon: '🌳', mins: 35, blurb: 'Decision trees, random forests, gradient boosting, and why they still win on tabular data.' },
    { n: 7,  file: '07-evaluation.html',               title: 'Evaluation, Metrics & Validation',                   level: 'Beginner',     icon: '🎯', mins: 45, blurb: 'Splits, cross-validation, precision/recall, ROC vs PR, calibration and thresholds.' },
    { n: 8,  file: '08-neural-networks.html',          title: 'Neural Networks & Backpropagation',                  level: 'Beginner',     icon: '🧠', mins: 45, blurb: 'Perceptrons, activations, the chain rule — and a network you can train inside the page.' },
    { n: 9,  file: '09-training-deep-nets.html',       title: 'Training Deep Networks in Practice',                 level: 'Beginner',     icon: '🎛️', mins: 45, blurb: 'Initialization, normalization, optimizers, schedules, regularization and mixed precision.' },
    { n: 10, file: '10-hardware.html',                 title: 'Hardware: GPUs, Memory & the Roofline',              level: 'Intermediate', icon: '🖥️', mins: 40, blurb: 'FLOPs vs bandwidth, HBM, tensor cores, interconnects — why your GPU sits at 30% utilization.' },
    { n: 11, file: '11-dl-stack.html',                 title: 'The Deep Learning Stack',                            level: 'Intermediate', icon: '⚙️', mins: 40, blurb: 'Tensors, autodiff, kernels, graph capture and compilers — what happens under model.fit().' },
    { n: 12, file: '12-computer-vision.html',          title: 'Computer Vision Systems',                            level: 'Intermediate', icon: '👁️', mins: 40, blurb: 'Convolutions, CNN architectures, detection, segmentation, ViTs and augmentation pipelines.' },
    { n: 13, file: '13-sequences-attention.html',      title: 'Sequences & Attention',                              level: 'Intermediate', icon: '🔁', mins: 40, blurb: 'RNNs and their limits, seq2seq, and attention derived from first principles.' },
    { n: 14, file: '14-transformers.html',             title: 'Transformers End to End',                            level: 'Intermediate', icon: '🔷', mins: 50, blurb: 'Multi-head attention, positional encodings, the block, decoding and the KV cache.' },
    { n: 15, file: '15-tokenizers-embeddings.html',    title: 'Tokenizers & Embeddings',                            level: 'Intermediate', icon: '🔤', mins: 35, blurb: 'BPE, vocabularies, embedding geometry, similarity, multilingual quirks — and tokens as money.' },
    { n: 16, file: '16-pretraining-scaling.html',      title: 'Pretraining, Scaling Laws & Data Curation',          level: 'Intermediate', icon: '📜', mins: 45, blurb: 'Objectives, Chinchilla-optimal budgets, dedup, filtering, curricula and compute planning.' },
    { n: 17, file: '17-finetuning-peft.html',          title: 'Fine-Tuning & PEFT',                                 level: 'Intermediate', icon: '🪡', mins: 45, blurb: 'Full fine-tuning, LoRA/QLoRA, adapters, instruction tuning — and when not to fine-tune at all.' },
    { n: 18, file: '18-alignment-rlhf.html',           title: 'Alignment: RLHF, DPO & Reward Models',               level: 'Intermediate', icon: '⚖️', mins: 45, blurb: 'Preference data, reward models, PPO vs DPO, reward hacking and alignment evaluation.' },
    { n: 19, file: '19-prompting-context.html',        title: 'Prompting & Context Engineering',                    level: 'Intermediate', icon: '💬', mins: 40, blurb: 'Few-shot, chain-of-thought, structured output, context windows, prompt caching and eval loops.' },
    { n: 20, file: '20-vector-search.html',            title: 'Vector Search & ANN Indexes',                        level: 'Intermediate', icon: '🧲', mins: 45, blurb: 'HNSW, IVF-PQ, recall vs latency, hybrid search, filtering and sharding — with a simulator.' },
    { n: 21, file: '21-rag.html',                      title: 'RAG Systems End to End',                             level: 'Advanced',     icon: '📚', mins: 50, blurb: 'Chunking, hybrid retrieval, reranking, grounding, citations, freshness and RAG evaluation.' },
    { n: 22, file: '22-agents.html',                   title: 'AI Agents, Tools & Orchestration',                   level: 'Advanced',     icon: '🤖', mins: 50, blurb: 'The agent loop, tool calling, planning, memory, sandboxing, multi-agent patterns and failure modes.' },
    { n: 23, file: '23-distributed-training-1.html',   title: 'Distributed Training I: Data Parallel, ZeRO & FSDP', level: 'Advanced',     icon: '🧵', mins: 45, blurb: 'All-reduce, gradient accumulation, sharded optimizer states and the memory maths.' },
    { n: 24, file: '24-distributed-training-2.html',   title: 'Distributed Training II: Tensor, Pipeline & MoE',    level: 'Advanced',     icon: '🧩', mins: 45, blurb: 'Model parallelism, pipeline bubbles, 3D parallelism, expert routing and communication costs.' },
    { n: 25, file: '25-big-training-jobs.html',        title: 'Running Big Training Jobs',                          level: 'Advanced',     icon: '🏗️', mins: 45, blurb: 'Checkpointing, elasticity, stragglers, determinism, loss spikes and cluster babysitting.' },
    { n: 26, file: '26-inference-serving.html',        title: 'Inference & Serving Systems',                        level: 'Advanced',     icon: '🚀', mins: 50, blurb: 'Prefill vs decode, continuous batching, paged KV cache, autoscaling and token streaming.' },
    { n: 27, file: '27-compression.html',              title: 'Making Models Cheap & Fast',                         level: 'Advanced',     icon: '🗜️', mins: 45, blurb: 'Quantization, distillation, pruning, speculative decoding and the accuracy you trade away.' },
    { n: 28, file: '28-data-engineering.html',         title: 'Data Engineering & Streaming for ML',                level: 'Advanced',     icon: '🌊', mins: 45, blurb: 'Batch and stream pipelines, lakehouse tables, CDC, windows, backfills and late data.' },
    { n: 29, file: '29-feature-stores.html',           title: 'Feature Stores & Training/Serving Skew',             level: 'Advanced',     icon: '🏪', mins: 40, blurb: 'Point-in-time correctness, online/offline parity, materialization and the leakage traps.' },
    { n: 30, file: '30-recommenders.html',             title: 'Recommenders & Ranking Systems',                     level: 'Advanced',     icon: '🎬', mins: 50, blurb: 'Candidate generation, two-tower retrieval, ranking models, diversity and feedback loops.' },
    { n: 31, file: '31-experiment-tracking.html',      title: 'Experiment Tracking, Registries & Reproducibility',  level: 'Expert',       icon: '🔬', mins: 35, blurb: 'Runs, artifacts, lineage, model registries and making a result reproducible a year later.' },
    { n: 32, file: '32-mlops.html',                    title: 'MLOps: CI/CD/CT Pipelines',                          level: 'Expert',       icon: '♻️', mins: 45, blurb: 'Testing data and models, automated retraining, pipeline orchestration and release gates.' },
    { n: 33, file: '33-deployment-experiments.html',   title: 'Deployment, Rollout & Online Experiments',           level: 'Expert',       icon: '🚦', mins: 45, blurb: 'Shadow, canary, A/B, interleaving and bandits — plus how to read the results honestly.' },
    { n: 34, file: '34-monitoring-drift.html',         title: 'Monitoring, Drift & ML Observability',               level: 'Expert',       icon: '📡', mins: 45, blurb: 'Data drift, concept drift, delayed labels, proxy metrics and alerting that is not noise.' },
    { n: 35, file: '35-llm-evaluation.html',           title: 'Evaluating LLM Systems',                             level: 'Expert',       icon: '🧪', mins: 45, blurb: 'Golden sets, rubric grading, LLM-as-judge, regression suites, human eval and eval drift.' },
    { n: 36, file: '36-ai-security.html',              title: 'Security for AI Systems',                            level: 'Expert',       icon: '🛡️', mins: 45, blurb: 'Prompt injection, exfiltration, jailbreaks, model theft, poisoning and the AI supply chain.' },
    { n: 37, file: '37-privacy-governance.html',       title: 'Privacy, Governance & Responsible AI',               level: 'Expert',       icon: '🏛️', mins: 45, blurb: 'PII handling, differential privacy, federated learning, fairness, model cards and regulation.' },
    { n: 38, file: '38-cost-engineering.html',         title: 'GPU Capacity & Cost Engineering',                    level: 'Expert',       icon: '💰', mins: 45, blurb: 'MFU, tokens per dollar, spot capacity, scheduling, quotas and knowing when to buy vs rent.' },
    { n: 39, file: '39-ai-platforms.html',             title: 'Multi-Tenant AI Platforms & Gateways',               level: 'Expert',       icon: '🏢', mins: 45, blurb: 'Model routing, quotas, caching, fallbacks, tenancy isolation and platform observability.' },
    { n: 40, file: '40-interview-playbook.html',       title: 'The ML System Design Interview Playbook',            level: 'Expert',       icon: '🎤', mins: 45, blurb: 'A repeatable structure for ML design interviews, with the questions that separate levels.' },
    { n: 41, file: '41-case-recommendation-feed.html', title: 'Case Study: Recommendation Feed',                    level: 'Case Studies', icon: '📱', mins: 50, blurb: 'A TikTok-scale feed: retrieval, ranking, freshness, cold start and feedback loops.' },
    { n: 42, file: '42-case-search-ranking.html',      title: 'Case Study: E-commerce Search & Ranking',            level: 'Case Studies', icon: '🔎', mins: 50, blurb: 'Query understanding, hybrid retrieval, learning-to-rank, personalization and business rules.' },
    { n: 43, file: '43-case-ad-ctr.html',              title: 'Case Study: Ad Click Prediction at 1M QPS',          level: 'Case Studies', icon: '📊', mins: 50, blurb: 'Sparse features, online learning, calibration, auctions and a 10 ms latency budget.' },
    { n: 44, file: '44-case-fraud-detection.html',     title: 'Case Study: Real-Time Fraud Detection',              level: 'Case Studies', icon: '🔐', mins: 50, blurb: 'Streaming features, extreme imbalance, adversaries, delayed labels and human review loops.' },
    { n: 45, file: '45-case-llm-assistant.html',       title: 'Case Study: LLM Chat Assistant Platform',            level: 'Case Studies', icon: '🗨️', mins: 55, blurb: 'Serving fleet, routing, KV cache, streaming, safety, multi-tenancy and cost per conversation.' },
    { n: 46, file: '46-case-enterprise-rag.html',      title: 'Case Study: Enterprise RAG Assistant',               level: 'Case Studies', icon: '📗', mins: 50, blurb: '10M documents, per-user permissions, freshness, citations, evaluation and hallucination control.' },
    { n: 47, file: '47-case-code-assistant.html',      title: 'Case Study: Code Assistant',                         level: 'Case Studies', icon: '💻', mins: 50, blurb: 'Fill-in-the-middle completion, repo context, sub-200 ms latency, caching and acceptance metrics.' },
    { n: 48, file: '48-case-image-generation.html',    title: 'Case Study: Image Generation Service',               level: 'Case Studies', icon: '🎨', mins: 50, blurb: 'Diffusion serving, step budgets, GPU queueing, safety filters, storage and abuse control.' },
    { n: 49, file: '49-case-voice-assistant.html',     title: 'Case Study: Voice Assistant (ASR + TTS)',            level: 'Case Studies', icon: '🎙️', mins: 50, blurb: 'Streaming speech recognition, endpointing, barge-in, latency budgets and full-duplex audio.' },
    { n: 50, file: '50-case-self-driving.html',        title: 'Case Study: Self-Driving Perception',                level: 'Case Studies', icon: '🚗', mins: 50, blurb: 'Sensor fusion, multi-task networks, the data engine, edge compute, safety cases and the long tail.' },
    { n: 51, file: '51-case-content-moderation.html',  title: 'Case Study: Content Moderation at Scale',            level: 'Case Studies', icon: '🚨', mins: 50, blurb: 'Multimodal classifiers, policy thresholds, human review, appeals, adversaries and drift.' },
    { n: 52, file: '52-case-frontier-training.html',   title: 'Case Study: Training a Frontier LLM',                level: 'Case Studies', icon: '🏔️', mins: 55, blurb: 'A 10,000-GPU run end to end: data, parallelism, failures, evals, cost and the launch decision.' },
  ];

  const LEVELS = [
    ['Beginner', 'var(--green)', 'How learning actually works, and the data and evaluation it rests on.'],
    ['Intermediate', 'var(--accent-2)', 'Deep learning, transformers and the machinery that trains them.'],
    ['Advanced', 'var(--accent)', 'Distributed training, retrieval, agents and serving at real scale.'],
    ['Expert', 'var(--amber)', 'Production ML: platforms, cost, safety, reliability and interviews.'],
    ['Case Studies', 'var(--pink)', 'Twelve complete ML system designs, from feed ranking to a frontier training run.'],
  ];


  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const doneSet = () => new Set(LS.get('ml-done', []));

  /* ---------------- helpers ---------------- */
  const SVGNS = 'http://www.w3.org/2000/svg';
  const ML = {
    CHAPTERS, LEVELS, LS,
    $: (s, r = document) => r.querySelector(s),
    $$: (s, r = document) => [...r.querySelectorAll(s)],
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
    rand: (a, b) => a + Math.random() * (b - a),
    randInt: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    fmt(n, d = 1) {
      if (!isFinite(n)) return '∞';
      const a = Math.abs(n);
      if (a >= 1e12) return (n / 1e12).toFixed(d).replace(/\.0+$/, '') + 'T';
      if (a >= 1e9) return (n / 1e9).toFixed(d).replace(/\.0+$/, '') + 'B';
      if (a >= 1e6) return (n / 1e6).toFixed(d).replace(/\.0+$/, '') + 'M';
      if (a >= 1e3) return (n / 1e3).toFixed(d).replace(/\.0+$/, '') + 'K';
      return (Math.round(n * 10 ** d) / 10 ** d).toString();
    },
    bytes(b) {
      const u = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
      let i = 0; while (b >= 1000 && i < u.length - 1) { b /= 1000; i++; }
      return (b >= 100 ? b.toFixed(0) : b >= 10 ? b.toFixed(1) : b.toFixed(2)).replace(/\.0+$/, '') + ' ' + u[i];
    },
    svg(tag, attrs = {}, parent) {
      const e = document.createElementNS(SVGNS, tag);
      for (const k in attrs) {
        if (k === 'text') e.textContent = attrs[k];
        else e.setAttribute(k, attrs[k]);
      }
      if (parent) parent.appendChild(e);
      return e;
    },
    /** centre of any element in the coordinate space of its owner <svg> */
    center(svg, el) {
      if (typeof el === 'string') el = svg.querySelector('#' + CSS.escape(el));
      const r = el.getBoundingClientRect();
      const pt = svg.createSVGPoint();
      pt.x = r.left + r.width / 2; pt.y = r.top + r.height / 2;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      return { x: p.x, y: p.y };
    },
    /** animate a glowing dot from (x1,y1) to (x2,y2). resolves when done */
    packet(svg, x1, y1, x2, y2, o = {}) {
      const color = o.color || 'var(--accent)';
      const dur = o.dur || 700;
      const g = ML.svg('g', { class: 'packet', style: `color:${color}` }, svg);
      const c = ML.svg('circle', { r: o.r || 6, fill: color }, g);
      let t2;
      if (o.label) t2 = ML.svg('text', { 'font-size': 10, 'text-anchor': 'middle', fill: color, 'font-weight': 700, text: o.label, style: 'font-family:var(--mono)' }, g);
      const ease = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
      return new Promise((res) => {
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / dur);
          const e = ease(t);
          const x = x1 + (x2 - x1) * e, y = y1 + (y2 - y1) * e;
          c.setAttribute('cx', x); c.setAttribute('cy', y);
          if (t2) { t2.setAttribute('x', x); t2.setAttribute('y', y - 11); }
          if (t < 1) requestAnimationFrame(tick);
          else { if (!o.keep) g.remove(); res(g); }
        };
        requestAnimationFrame(tick);
      });
    },
    packetBetween(svg, a, b, o) {
      const p = ML.center(svg, a), q = ML.center(svg, b);
      return ML.packet(svg, p.x, p.y, q.x, q.y, o);
    },
    /** animate along an existing <path> */
    packetAlong(svg, path, o = {}) {
      const len = path.getTotalLength();
      const dur = o.dur || 900;
      const g = ML.svg('g', { class: 'packet', style: `color:${o.color || 'var(--accent)'}` }, svg);
      const c = ML.svg('circle', { r: o.r || 6, fill: o.color || 'var(--accent)' }, g);
      return new Promise((res) => {
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / dur);
          const p = path.getPointAtLength(o.reverse ? len * (1 - t) : len * t);
          c.setAttribute('cx', p.x); c.setAttribute('cy', p.y);
          if (t < 1) requestAnimationFrame(tick); else { g.remove(); res(); }
        };
        requestAnimationFrame(tick);
      });
    },
    log(el, html, cls = '') {
      const d = document.createElement('div');
      if (cls) d.className = cls;
      d.innerHTML = html;
      el.appendChild(d);
      while (el.children.length > 120) el.firstChild.remove();
      el.scrollTop = el.scrollHeight;
    },
    toast(msg) {
      let t = document.getElementById('ml-toast');
      if (!t) {
        t = document.createElement('div'); t.id = 'ml-toast';
        t.style.cssText = 'position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(20px);background:var(--text);color:var(--bg);padding:10px 18px;border-radius:12px;font-weight:600;font-size:14px;z-index:200;opacity:0;transition:.3s;pointer-events:none;box-shadow:var(--shadow-lg)';
        document.body.appendChild(t);
      }
      t.textContent = msg;
      requestAnimationFrame(() => { t.style.opacity = 1; t.style.transform = 'translateX(-50%)'; });
      clearTimeout(t._h);
      t._h = setTimeout(() => { t.style.opacity = 0; t.style.transform = 'translateX(-50%) translateY(20px)'; }, 2200);
    },
  };
  window.ML = ML;

  /* ---------------- theme ---------------- */
  function currentTheme() {
    const t = document.documentElement.getAttribute('data-theme');
    if (t) return t;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    LS.set('ml-theme', next);
    ML.$$('.theme-btn').forEach((b) => (b.textContent = next === 'dark' ? '☀️' : '🌙'));
  }

  /* ---------------- shell ---------------- */
  const AUTHOR = 'Palak Deb Patra';

  function buildShell() {
    const body = document.body;
    if (!/Palak/.test(document.title)) document.title += ` · ML & AI Systems by ${AUTHOR}`;
    const chapNum = +body.dataset.chapter || 0;
    const chap = CHAPTERS.find((c) => c.n === chapNum);
    const main = ML.$('main.content');
    if (!main) return { chap };

    const progress = document.createElement('div');
    progress.className = 'read-progress';

    const layout = document.createElement('div'); layout.className = 'layout';
    const sidebar = document.createElement('aside'); sidebar.className = 'sidebar';
    const scrim = document.createElement('div'); scrim.className = 'scrim';
    const mainWrap = document.createElement('div'); mainWrap.className = 'main';

    // sidebar
    const done = doneSet();
    let html = `<a class="brand" href="index.html"><span class="brand-logo">◆</span><span>ML &amp; AI Systems<br><small style="font-weight:500;color:var(--muted);font-size:12px">by Palak Deb Patra</small></span></a>
      <div class="side-progress"><div class="bar"><i style="width:${(done.size / CHAPTERS.length) * 100}%"></i></div><small>${done.size} of ${CHAPTERS.length} chapters complete</small></div>`;
    let lastLevel = '';
    for (const c of CHAPTERS) {
      if (c.level !== lastLevel) { html += `<div class="nav-level">${c.level}</div>`; lastLevel = c.level; }
      const cls = ['nav-link', done.has(c.n) ? 'done' : '', c.n === chapNum ? 'current' : ''].join(' ');
      html += `<a class="${cls}" href="${c.file}"><span class="num">${done.has(c.n) ? '✓' : c.n}</span><span>${c.title}</span></a>`;
      if (c.n === chapNum) html += `<nav class="toc" id="toc"></nav>`;
    }
    html += `<div class="nav-level">Study tools</div>
      <a class="nav-link study" href="glossary.html"><span class="num">📖</span><span>Glossary</span></a>
      <a class="nav-link study" href="flashcards.html"><span class="num">🃏</span><span>Flashcards</span></a>
      <a class="nav-link study" href="mock-interview.html"><span class="num">🎤</span><span>Mock interview</span></a>`;
    sidebar.innerHTML = html;
    const here = location.pathname.split('/').pop();
    ML.$$('.nav-link.study', sidebar).forEach((a) => { if (a.getAttribute('href') === here) a.classList.add('current'); });

    // topbar
    const top = document.createElement('header'); top.className = 'topbar';
    const theme = currentTheme();
    top.innerHTML = `<button class="icon-btn menu-btn" aria-label="Menu">☰</button>
      <div class="crumb">${chap ? `<a href="index.html">Course</a> / Chapter ${chap.n} · <b>${chap.title}</b>` : '<b>ML &amp; AI Systems</b>'}</div>
      <div class="spacer"></div>
      <button class="search-btn" aria-label="Search the course" title="Search (Ctrl+K)">🔎 <span>Search</span> <kbd class="kbd">Ctrl K</kbd></button>
      <button class="icon-btn theme-btn" aria-label="Toggle theme" title="Toggle theme">${theme === 'dark' ? '☀️' : '🌙'}</button>`;

    main.parentNode.insertBefore(layout, main);
    layout.appendChild(sidebar); layout.appendChild(scrim); layout.appendChild(mainWrap);
    mainWrap.appendChild(top); mainWrap.appendChild(main);
    body.insertBefore(progress, body.firstChild);

    top.querySelector('.theme-btn').onclick = toggleTheme;
    const menuBtn = top.querySelector('.menu-btn');
    menuBtn.onclick = () => { sidebar.classList.toggle('open'); scrim.classList.toggle('show'); };
    scrim.onclick = () => { sidebar.classList.remove('open'); scrim.classList.remove('show'); };

    addEventListener('scroll', () => {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      progress.style.width = (p * 100).toFixed(2) + '%';
    }, { passive: true });

    // keep current chapter visible in sidebar
    const cur = sidebar.querySelector('.nav-link.current');
    if (cur) setTimeout(() => cur.scrollIntoView({ block: 'center' }), 0);

    return { chap, main, sidebar };
  }

  function buildToc(chap, main) {
    const toc = document.getElementById('toc');
    const h2s = ML.$$('h2', main);
    h2s.forEach((h, i) => {
      if (!h.id) h.id = 's' + (i + 1) + '-' + h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
      if (chap && !h.querySelector('.sec-num')) {
        const s = document.createElement('span'); s.className = 'sec-num'; s.textContent = `${chap.n}.${i + 1}`;
        h.prepend(s);
      }
      if (toc) {
        const a = document.createElement('a'); a.href = '#' + h.id;
        a.textContent = h.textContent.replace(/^\d+\.\d+/, '').trim();
        toc.appendChild(a);
        a.addEventListener('click', () => { ML.$('.sidebar').classList.remove('open'); ML.$('.scrim').classList.remove('show'); });
      }
    });
    if (!toc || !h2s.length) return;
    const links = ML.$$('a', toc);
    const spy = () => {
      let idx = 0;
      h2s.forEach((h, i) => { if (h.getBoundingClientRect().top < 140) idx = i; });
      links.forEach((l, i) => l.classList.toggle('active', i === idx));
    };
    addEventListener('scroll', spy, { passive: true }); spy();
  }

  function buildFooter(chap, main) {
    if (!chap) return;
    const i = CHAPTERS.indexOf(chap);
    const prev = CHAPTERS[i - 1], next = CHAPTERS[i + 1];
    const box = document.createElement('div');
    const isDone = () => doneSet().has(chap.n);
    const render = () => {
      box.className = 'complete-box' + (isDone() ? ' done' : '');
      box.innerHTML = isDone()
        ? `<p style="font-size:26px;margin:0">🎉</p><p><strong>Chapter ${chap.n} complete!</strong></p><button class="btn sm ghost" data-undo>Mark as not complete</button>`
        : `<p><strong>Finished this chapter?</strong><br><span class="muted small">Track your progress across the course.</span></p><button class="btn primary">✓ Mark chapter complete</button>`;
      box.querySelector('button').onclick = () => {
        const s = doneSet();
        if (isDone()) s.delete(chap.n); else { s.add(chap.n); ML.toast('Nice work! Progress saved.'); }
        LS.set('ml-done', [...s]);
        render();
        const side = ML.$('.sidebar .nav-link.current .num');
        if (side) { side.textContent = isDone() ? '✓' : chap.n; side.parentElement.classList.toggle('done', isDone()); }
        const bar = ML.$('.side-progress');
        if (bar) { const n = doneSet().size; bar.querySelector('i').style.width = (n / CHAPTERS.length) * 100 + '%'; bar.querySelector('small').textContent = `${n} of ${CHAPTERS.length} chapters complete`; }
      };
    };
    render();
    main.appendChild(box);
    const nav = document.createElement('nav'); nav.className = 'chapter-nav';
    nav.innerHTML = (prev ? `<a href="${prev.file}"><small>← Previous</small>${prev.title}</a>` : `<a href="index.html"><small>← Back to</small>Course home</a>`)
      + (next ? `<a class="nx" href="${next.file}"><small>Next →</small>${next.title}</a>` : `<a class="nx" href="index.html"><small>🏁 Finished!</small>Back to course home</a>`);
    main.appendChild(nav);
  }

  /* ---------------- components ---------------- */
  function initTabs(root = document) {
    ML.$$('.tabs', root).forEach((tabs) => {
      if (tabs._init) return; tabs._init = true;
      const btns = ML.$$(':scope > .tab-list > button', tabs);
      const panels = ML.$$(':scope > .tab-panel', tabs);
      const go = (i) => {
        btns.forEach((b, j) => b.classList.toggle('active', i === j));
        panels.forEach((p, j) => p.classList.toggle('active', i === j));
        tabs.dispatchEvent(new CustomEvent('tabchange', { detail: { index: i, panel: panels[i] } }));
      };
      btns.forEach((b, i) => (b.onclick = () => go(i)));
      go(Math.max(0, btns.findIndex((b) => b.classList.contains('active'))));
    });
  }

  function initSeg(root = document) {
    ML.$$('.seg', root).forEach((seg) => {
      if (seg._init) return; seg._init = true;
      const btns = ML.$$('button', seg);
      if (!btns.some((b) => b.classList.contains('active')) && btns[0]) btns[0].classList.add('active');
      seg.dataset.value = (btns.find((b) => b.classList.contains('active')) || {}).dataset?.v || '';
      btns.forEach((b) => b.addEventListener('click', () => {
        btns.forEach((x) => x.classList.toggle('active', x === b));
        seg.dataset.value = b.dataset.v;
        seg.dispatchEvent(new CustomEvent('segchange', { detail: b.dataset.v }));
      }));
    });
  }

  function initFlips(root = document) {
    ML.$$('.flip', root).forEach((f) => {
      if (f._init) return; f._init = true;
      f.setAttribute('tabindex', '0');
      const t = () => f.classList.toggle('flipped');
      f.addEventListener('click', t);
      f.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t(); } });
    });
  }

  function initSteppers(root = document) {
    ML.$$('.stepper', root).forEach((st) => {
      if (st._init) return; st._init = true;
      const diagram = document.getElementById(st.dataset.diagram);
      const steps = ML.$$('ol.steps > li', st);
      const intro = st.dataset.intro || 'Press <b>Next</b> or <b>Play</b> to walk through this flow step by step.';
      st.insertAdjacentHTML('beforeend', `
        <div class="step-text"><div class="st-title"></div><div class="st-desc"></div></div>
        <div class="stepper-bar">
          <div class="stepper-dots">${steps.map(() => '<i></i>').join('')}</div>
          <span class="count"></span>
          <button class="btn sm" data-a="reset" title="Reset">↺</button>
          <button class="btn sm" data-a="prev">← Prev</button>
          <button class="btn sm" data-a="play">▶ Play</button>
          <button class="btn sm primary" data-a="next">Next →</button>
        </div>`);
      const title = ML.$('.st-title', st), desc = ML.$('.st-desc', st), count = ML.$('.count', st);
      const dots = ML.$$('.stepper-dots i', st);
      const playBtn = ML.$('[data-a=play]', st);
      let idx = -1, playing = false, token = 0;

      const clear = () => { if (diagram) ML.$$('.on', diagram).forEach((e) => e.classList.remove('on')); };
      async function go(i) {
        idx = ML.clamp(i, -1, steps.length - 1);
        const my = ++token;
        clear();
        dots.forEach((d, j) => { d.classList.toggle('active', j === idx); d.classList.toggle('past', j < idx); });
        count.textContent = idx < 0 ? `${steps.length} steps` : `Step ${idx + 1} / ${steps.length}`;
        ML.$('[data-a=prev]', st).disabled = idx < 0;
        ML.$('[data-a=next]', st).disabled = idx >= steps.length - 1;
        if (idx < 0) {
          diagram && diagram.classList.remove('stepping');
          title.innerHTML = '👋 Interactive walkthrough'; desc.innerHTML = intro;
          st.dispatchEvent(new CustomEvent('step', { detail: { index: -1 } }));
          return;
        }
        const li = steps[idx];
        diagram && diagram.classList.add('stepping');
        (li.dataset.on || '').split(/\s+/).filter(Boolean).forEach((id) => {
          const e = diagram && diagram.querySelector('#' + CSS.escape(id));
          if (e) e.classList.add('on');
        });
        title.innerHTML = `<span class="n">${idx + 1}</span>${li.dataset.title || ''}`;
        desc.innerHTML = li.innerHTML;
        desc.style.animation = 'none'; void desc.offsetWidth; desc.style.animation = '';
        st.dispatchEvent(new CustomEvent('step', { detail: { index: idx, li } }));
        if (li.dataset.packet && diagram) {
          for (const seg of li.dataset.packet.split(',')) {
            if (my !== token) return;
            const [a, b] = seg.split('>').map((s) => s.trim());
            const ea = diagram.querySelector('#' + CSS.escape(a)), eb = diagram.querySelector('#' + CSS.escape(b));
            if (ea && eb) await ML.packetBetween(diagram, ea, eb, { color: li.dataset.color, dur: 650 });
          }
        }
      }
      async function play() {
        if (playing) { playing = false; playBtn.textContent = '▶ Play'; return; }
        playing = true; playBtn.textContent = '⏸ Pause';
        if (idx >= steps.length - 1) idx = -1;
        while (playing && idx < steps.length - 1) {
          await go(idx + 1);
          await ML.sleep(+st.dataset.delay || 2300);
        }
        playing = false; playBtn.textContent = '▶ Play';
      }
      st.addEventListener('click', (e) => {
        const a = e.target.closest('[data-a]')?.dataset.a;
        if (!a) return;
        if (a !== 'play' && playing) { playing = false; playBtn.textContent = '▶ Play'; }
        if (a === 'next') go(idx + 1);
        if (a === 'prev') go(idx - 1);
        if (a === 'reset') go(-1);
        if (a === 'play') play();
      });
      dots.forEach((d, j) => (d.onclick = () => go(j)));
      st._go = go;
      go(-1);
    });
  }

  function initQuizzes(chap) {
    const quizzes = ML.$$('.quiz');
    if (!quizzes.length) return;
    let answered = 0, correct = 0;
    const scoreEl = ML.$('.quiz-score');
    const update = () => {
      if (!scoreEl) return;
      scoreEl.innerHTML = `<span class="big">${correct}/${quizzes.length}</span><span>${answered < quizzes.length ? `Answered ${answered} of ${quizzes.length} — keep going!` : correct === quizzes.length ? 'Perfect score! You nailed this chapter. 🏆' : correct >= quizzes.length * .6 ? 'Solid! Review the ones you missed. 💪' : 'Worth a re-read of the sections above. 📚'}</span>`;
      if (answered === quizzes.length && chap) {
        const best = LS.get('ml-quiz', {});
        best[chap.n] = Math.max(best[chap.n] || 0, correct / quizzes.length);
        LS.set('ml-quiz', best);
      }
    };
    quizzes.forEach((q, qi) => {
      const qp = ML.$('.q', q);
      if (qp && !qp.querySelector('.qn')) qp.insertAdjacentHTML('afterbegin', `<span class="qn">Q${qi + 1}</span>`);
      const opts = ML.$$('.opt', q);
      const ans = +q.dataset.answer;
      opts.forEach((o, i) => {
        o.dataset.letter = 'ABCDEFG'[i];
        o.onclick = () => {
          if (q.classList.contains('answered')) return;
          q.classList.add('answered');
          answered++;
          if (i === ans) correct++;
          opts.forEach((x, j) => { x.disabled = true; if (j === ans) x.classList.add('correct'); });
          if (i !== ans) o.classList.add('wrong');
          update();
        };
      });
    });
    update();
  }

  function initReveal() {
    const els = ML.$$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  }

  /** Run a callback only while an element is on screen (saves CPU for sims) */
  ML.whenVisible = function (el, onShow, onHide) {
    if (!('IntersectionObserver' in window)) { onShow(); return; }
    new IntersectionObserver((ents) => ents.forEach((en) => (en.isIntersecting ? onShow() : onHide && onHide())), { threshold: 0.05 }).observe(el);
  };

  ML.initComponents = function (root) { initTabs(root); initSeg(root); initFlips(root); initSteppers(root); };

  /* ---------------- command palette (Ctrl+K) ---------------- */
  function initPalette() {
    let box, input, list, results = [], sel = 0, loading = false;

    function build() {
      box = document.createElement('div');
      box.className = 'palette';
      box.innerHTML = `<div class="pal-inner" role="dialog" aria-label="Search the course">
          <div class="pal-top"><span>🔎</span><input id="pal-input" placeholder="Search 52 chapters — topics, demos, concepts…" autocomplete="off" spellcheck="false"><kbd class="kbd">Esc</kbd></div>
          <div class="pal-list" id="pal-list"></div>
          <div class="pal-foot"><span><kbd class="kbd">↑</kbd><kbd class="kbd">↓</kbd> navigate · <kbd class="kbd">↵</kbd> open</span><span>tip: try “LoRA”, “KV cache”, “drift”, “HNSW”</span></div>
        </div>`;
      document.body.appendChild(box);
      input = box.querySelector('#pal-input');
      list = box.querySelector('#pal-list');
      box.addEventListener('click', (e) => { if (e.target === box) close(); });
      input.addEventListener('input', () => { sel = 0; render(); });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { close(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, results.length - 1); render(true); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); render(true); }
        else if (e.key === 'Enter') { e.preventDefault(); go(results[sel]); }
      });
    }

    function search(q) {
      const idx = window.ML_INDEX || [];
      const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) {
        return CHAPTERS.map((c) => ({ n: c.n, f: c.file, ti: c.title, lv: c.level, t: c.blurb, a: '', k: 'chapter', s: 0 })).slice(0, 12);
      }
      const out = [];
      idx.forEach((c) => {
        const push = (t, a, k, base) => {
          const hay = (t + ' ' + c.ti).toLowerCase();
          let score = 0;
          for (const term of terms) {
            const at = hay.indexOf(term);
            if (at < 0) return;                       // every term must appear
            score += at === 0 ? 12 : hay[at - 1] === ' ' ? 8 : 3;
          }
          if (t.toLowerCase().startsWith(terms[0])) score += 10;
          out.push({ n: c.n, f: c.f, ti: c.ti, lv: c.lv, t, a, k, s: score + base - t.length * 0.01 });
        };
        push(c.ti, '', 'chapter', 22);
        c.e.forEach((e) => push(e.t, e.a, e.k, e.k === 'section' ? 16 : e.k === 'demo' ? 12 : e.k === 'topic' ? 8 : 1));
      });
      const seen = new Set();
      return out.sort((a, b) => b.s - a.s).filter((r) => {
        const key = r.n + '|' + r.t;
        if (seen.has(key)) return false;
        seen.add(key); return true;
      }).slice(0, 30);
    }

    const ICON = { chapter: '📘', section: '§', demo: '🕹️', topic: '•', fact: '💡' };
    function render(keepQuery) {
      if (loading) { list.innerHTML = '<div class="pal-empty">Loading index…</div>'; return; }
      results = search(input.value.trim());
      if (!results.length) { list.innerHTML = '<div class="pal-empty">No matches. Try a broader word.</div>'; return; }
      list.innerHTML = results.map((r, i) => `<a class="pal-item ${i === sel ? 'sel' : ''}" href="${r.f}${r.a ? '#' + r.a : ''}" data-i="${i}">
          <span class="pal-ico">${ICON[r.k] || '•'}</span>
          <span class="pal-text"><b>${esc(r.t)}</b><small>Chapter ${r.n} · ${esc(r.ti)}</small></span>
          <span class="pal-lv">${r.lv}</span></a>`).join('');
      ML.$$('.pal-item', list).forEach((el) => {
        el.addEventListener('mouseenter', () => { sel = +el.dataset.i; ML.$$('.pal-item', list).forEach((x) => x.classList.toggle('sel', x === el)); });
      });
      const cur = list.querySelector('.sel');
      if (cur && keepQuery) cur.scrollIntoView({ block: 'nearest' });
    }
    const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    function go(r) { if (r) location.href = r.f + (r.a ? '#' + r.a : ''); }

    function open() {
      if (!box) build();
      box.classList.add('show');
      input.value = ''; sel = 0;
      if (!window.ML_INDEX) {
        loading = true; render();
        const s = document.createElement('script');
        s.src = 'assets/study-data.js';
        s.onload = () => { loading = false; render(); };
        s.onerror = () => { loading = false; list.innerHTML = '<div class="pal-empty">Could not load the search index.</div>'; };
        document.head.appendChild(s);
      } else render();
      setTimeout(() => input.focus(), 30);
    }
    function close() { if (box) box.classList.remove('show'); }

    addEventListener('keydown', (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || '')) || e.target.isContentEditable;
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); box && box.classList.contains('show') ? close() : open(); }
      else if (e.key === '/' && !typing && !(box && box.classList.contains('show'))) { e.preventDefault(); open(); }
      else if (e.key === 'Escape') close();
    });
    ML.$$('.search-btn').forEach((b) => (b.onclick = open));
    ML.openSearch = open;
  }

  /* ---------------- boot ---------------- */
  const { chap, main } = buildShell();
  if (main) {
    buildToc(chap, main);
    buildFooter(chap, main);
    const credit = document.createElement('p');
    credit.className = 'muted small';
    credit.style.cssText = 'text-align:center;margin:44px 0 0';
    credit.innerHTML = `◆ <a href="index.html">${AUTHOR}'s ML &amp; AI Systems Playlist</a> · © 2026 ${AUTHOR}`;
    main.appendChild(credit);
  }
  ML.chapter = chap;
  ML.initComponents(document);
  initQuizzes(chap);
  initReveal();
  initPalette();
})();
