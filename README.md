> [!IMPORTANT]
> **This course has moved.** It now lives alongside my other courses in
> **[The Engineering Atlas](https://github.com/CaptainBlue793/palak-engineering-atlas)** — one repo, one site, shared progress
> and search across every chapter.
>
> **Read it here → https://captainblue793.github.io/palak-engineering-atlas/ml-ai-systems/**
>
> This repository is archived and kept only so existing links keep working.

# Palak's ML & AI Systems Playlist

An interactive course on machine learning and AI systems: **52 chapters** across five levels, from
how learning actually works up to a 10,000-GPU frontier training run — each with animated diagrams,
live simulators, an interview drill and a 5-question quiz, plus a 175-term glossary, a
spaced-repetition flashcard deck and a timed mock-interview room.

No build step, no dependencies, no server, no account. Progress is saved in your browser.

---

## Get the app

### Option 1 — one file, offline (recommended)

**[⬇ Download `ml-ai-systems-course.html`](https://github.com/CaptainBlue793/palak_ML_AI_system_playlist/releases/latest/download/ml-ai-systems-course.html)** (~2 MB)

Double-click it. The whole course opens in your browser and runs completely offline — every
chapter, simulator, quiz and study tool is inside that single file. Nothing is installed,
nothing phones home. Works on Windows, macOS, Linux, Android and iOS.

Keep it on a USB stick, email it to a friend, read it on a plane.

### Option 2 — read it online

**<https://captainblue793.github.io/palak_ML_AI_system_playlist/>**

### Option 3 — run from source

```bash
git clone https://github.com/CaptainBlue793/palak_ML_AI_system_playlist.git
cd palak_ML_AI_system_playlist
```

Open `index.html` in any browser. That's the whole setup.

---

## What's inside

| Level | Chapters | Covers |
| --- | --- | --- |
| **Beginner** | 1–9 | The ML lifecycle, the maths you actually need, data & labels, features, gradient descent, trees & ensembles, evaluation, neural networks, training deep nets |
| **Intermediate** | 10–20 | GPUs & the roofline, the DL stack, computer vision, attention, transformers, tokenizers & embeddings, pretraining & scaling laws, fine-tuning & PEFT, alignment, prompting, vector search |
| **Advanced** | 21–30 | RAG, agents & tools, distributed training (ZeRO/FSDP, tensor/pipeline/MoE), running big training jobs, inference & serving, compression, data engineering, feature stores, recommenders |
| **Expert** | 31–40 | Experiment tracking, MLOps, deployment & online experiments, monitoring & drift, LLM evaluation, AI security, privacy & governance, GPU cost engineering, AI platforms, the interview playbook |
| **Case Studies** | 41–52 | Recommendation feed, e-commerce search, ad CTR at 1M QPS, fraud detection, LLM chat assistant, enterprise RAG, code assistant, image generation, voice assistant, self-driving perception, content moderation, training a frontier LLM |

**Study tools:** a searchable glossary, a flashcard deck generated from every chapter quiz, and a
mock-interview room with a timer, ML-shaped phases and a scoring rubric. `Ctrl`+`K` opens search
from anywhere.

---

## Repository layout

```
index.html              home: progress ring, architecture map, roadmap
NN-slug.html            one self-contained chapter per file (52 of them)
glossary.html           175 terms, filterable
flashcards.html         spaced-repetition deck
mock-interview.html     timed drill + rubric
assets/
  app.js                chapter registry, page shell, Ctrl+K search, shared ML.* helpers
  style.css             design system, light + dark themes
  study-data.js         generated: search index + flashcard deck
tools/
  build-study-data.js   regenerates assets/study-data.js from the chapters
build.js                bundles everything into the single-file edition
src/router.js           hash router used only by the single-file build
dist/                   build output: ml-ai-systems-course.html
```

## Building

```bash
node tools/build-study-data.js   # -> assets/study-data.js  (search index + flashcards)
node build.js                    # -> dist/ml-ai-systems-course.html
```

Requires Node (any recent version) and nothing else — no `npm install`, no dependencies.

`build-study-data.js` parses every chapter for its headings, panel titles, callout titles,
takeaways and quiz blocks. Run it after editing any chapter, or search and the flashcard deck drift
out of sync with the content. It reproduces the same heading-anchor rule that `assets/app.js` uses,
so if you change one you must change the other — the file says so at the top.

`build.js` inlines the stylesheet, the runtime and every page's markup, styles and scripts into one
document, then adds a small hash router (`src/router.js`) that swaps pages in and out of `<body>`
and re-runs the shared runtime, so each page boots exactly as it does when served as its own file.
It asserts on the three places the runtime hard-codes multi-file navigation, so if those lines ever
change the build fails loudly instead of shipping a broken bundle.

## Contributing a chapter

- Register it in `CHAPTERS` in `assets/app.js`; the filename number, the `data-chapter`
  attribute and the hero `Chapter N` pill must all agree.
- Reuse the shared classes (`panel`, `stepper`, `diagram`, `stat`, `callout`, `quiz`) instead of
  adding new CSS.
- Keep 5 quiz questions per chapter — the flashcard deck is generated from them.
- Re-run both build steps above before committing.

---

## License

MIT — see [LICENSE](LICENSE).

Written by **Palak Deb Patra**.
