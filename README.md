# Write Like Me

A free, serverless tool that analyzes your writing samples and generates new content in your unique voice—free of common AI writing patterns.

**Live Demo:** [https://97115104.github.io/writelikeme/](https://97115104.github.io/writelikeme/)

## Quick Start

1. **Add samples** — Paste text, enter URLs, or upload files (.txt, .md, .rtf, .pdf, or Scrivener .scriv folders)
2. **Analyze** — The tool extracts your voice patterns, tone, vocabulary, and style markers
3. **Generate** — Write prompts and get content that sounds like you
4. **Save** — Store your profile to browser or download as JSON

## Key Features

### AI Pattern Detection & Removal

Detects and fixes patterns that make AI writing sound artificial:

- **Critical** — Em dashes, antithetical constructions, bullet lists, third-person self-references
- **High** — Formulaic transitions (However, Moreover), colon declarations, meta-commentary  
- **Medium** — AI vocabulary (landscape, ecosystem, journey), passive voice, engagement bait
- **Format** — Long paragraphs, excessive whitespace, run-on sentences

Generated text receives a **quality score (0-100)** showing how authentic it sounds.

### Writing Profile Analysis

Based on research-backed frameworks:

| Metric | Description |
|--------|-------------|
| **Mastery Level** | Dreyfus model: Novice → Emerging → Competent → Proficient → Expert → Masterful |
| **Technical Level** | Complexity: Accessible → Conversational → Articulate → Refined → Elevated → Scholarly → Specialized |
| **Voice Consistency** | How consistent your voice is across samples (1-10) |
| **Pattern Density** | Unique, replicable patterns detected (1-10) |
| **Emotional Resonance** | How deeply the writing connects (1-10) |
| **Authenticity** | How genuine the voice feels (1-10) |
| **Narrative Flow** | Pacing and momentum (1-10) |
| **Persuasive Clarity** | Rhetorical effectiveness (1-10) |

### Platform-Aware Generation

Mention a platform and style adapts automatically:

- **X/Twitter** — Ultra-brief, punchy
- **LinkedIn** — Professional, 100-200 words
- **Instagram/TikTok** — Brief captions, hook-focused
- **Email/Substack** — Proper structure and formatting

### Style Tags

Guide output with tone and format tags:

| Category | Tags |
|----------|------|
| **Tone** | Casual, Conversational, Professional, Warm, Kind, Empathetic |
| **Emotional** | Upbeat, Somber, Witty, Funny |
| **Purpose** | Persuasive, Educational, Narrative, Analytical |
| **Format** | Concise, Thorough, Emoji |

### Smart Features

- **GitHub repo detection** — Fetches README and metadata for code projects
- **URL fetching** — Extracts content from links in your prompt
- **One-click sharing** — Direct share to X, LinkedIn, Facebook, Reddit
- **Revision history** — Browse and restore previous generations
- **Edit tracking** — Your edits inform the next regeneration

## Input Methods

| Method | Supported Formats |
|--------|-------------------|
| **Paste** | Any text |
| **URL** | Blog posts, articles, GitHub repos |
| **Upload** | .txt, .md, .rtf, .pdf |
| **Scrivener** | Drag & drop .scriv folders |
| **Load Profile** | Previously saved JSON |

## API Providers

| Provider | Notes |
|----------|-------|
| **Puter GPT-OSS** | Default. Free, no API key required |
| **OpenRouter** | Many models, single API key |
| **Anthropic** | Direct Claude API |
| **OpenAI** | Direct GPT API |
| **Google Gemini** | Direct Gemini API |
| **Ollama** | Local models, fully offline |
| **Custom** | Any OpenAI-compatible endpoint |

## Running Locally

```bash
git clone https://github.com/97115104/writelikeme.git
cd writelikeme
python3 -m http.server 8000
# Open http://localhost:8000
```

### Ollama (Fully Offline)

```bash
ollama pull gpt-oss:20b
OLLAMA_ORIGINS=* ollama serve
# Select "Ollama (Local)" in API Settings
```

## Technical Details

- Pure HTML/CSS/JavaScript — no build step
- Serverless for GitHub Pages deployment
- Multi-provider API abstraction
- localStorage for profile persistence
- See [docs/ai-writing-patterns-research.md](docs/ai-writing-patterns-research.md) for slop detection research

## Privacy

All processing happens through your selected API provider. No data is stored on any server. Ollama runs entirely offline.

## Related Tools

- [Quality Prompts](https://github.com/97115104/qualityprompts) — Transform ideas into production-ready prompts
- [Assess Prompts](https://github.com/97115104/assessprompts) — Get expert AI feedback on prompts
- [Reclassifier](https://github.com/97115104/reclassifier) — Add and edit fields in JSON data

## License

MIT — see [LICENSE](LICENSE)

## Author

[97 115 104](https://github.com/97115104) · [Sponsor](https://github.com/sponsors/97115104)
