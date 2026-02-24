# Write Like Me

A free, serverless tool that analyzes your writing samples and creates a detailed writing profile. Use that profile to generate new text in your unique style, free of common AI writing patterns.

**Live Demo:** [https://97115104.github.io/writelikeme/](https://97115104.github.io/writelikeme/)

## What It Does

Write Like Me solves the "AI slop" problem. When you use AI to generate text, it often sounds generic, formulaic, and obviously machine-generated. This tool analyzes your actual writing to understand your voice, then uses that understanding to generate content that sounds like you.

## Key Features

### Advanced Slop Detection & Removal

The heart of Write Like Me is its **comprehensive AI pattern detection system** based on extensive research into what makes AI writing sound artificial. The tool detects and removes:

**Critical Patterns (Always Fixed):**
- Em dashes and en dashes used as parentheticals
- Antithetical constructions ("It's not X, it's Y")
- Sycophantic phrases ("Great question!", "That's fascinating!")
- Bullet points and numbered lists (converted to flowing prose)
- Third-person self-references ("The post explores..." → "I explore...")

**High Priority Patterns:**
- Lazy declarative openers ("Here's the thing:", "The bottom line:")
- Colon-based declarations ("The answer is simple: X")
- Formulaic transitions (However, Moreover, Furthermore)
- Formulaic conclusions (In summary, At the end of the day)
- Meta-commentary ("As I mentioned above", "Let me explain")
- Rhetorical Q&A patterns

**Medium Priority Patterns:**
- Overly formal phrasing ("It is worth noting", "utilize", "leverage")
- AI vocabulary clusters (landscape, ecosystem, journey, robust)
- Forced perspective balancing ("On one hand... on the other hand")
- Passive voice constructions
- Engagement bait phrases

**Low Priority Patterns:**
- Excessive intensifiers (incredibly, absolutely, truly)
- Hedge word clusters (perhaps, maybe, might)
- Filler adjectives (various, numerous, significant)

**Formatting Issues:**
- Wall of text without paragraph breaks
- Very long paragraphs (150+ words)
- Excessive whitespace and spacing issues
- Extra long sentences (50+ words)

Generated text receives a **quality score from 0-100** showing how authentic it sounds. Text with critical or formatting issues is automatically fixed or rewritten to remove AI patterns while preserving your voice.

### Writing Profile Analysis

Share your writing samples and get a comprehensive analysis:

- **Style** — Formality level, descriptiveness, directness, perspective
- **Tone & Voice** — Primary tone, emotional register, voice consistency
- **Vocabulary** — Word complexity, characteristic words, reading level
- **Structure** — Sentence length patterns, variety, paragraph style
- **Stylistic Markers** — Unique patterns, signature phrases, punctuation preferences
- **Patterns to Replicate** — Key constructions that define your voice

### Profile Quality Metrics

Your profile is rated as **Excellent**, **Good**, **Fair**, or **Needs More** based on:
- Number of writing samples (3-5+ recommended)
- Total word count (2,000+ words recommended)
- Source variety (different types of content)

### Platform-Aware Generation

Mention a social platform in your prompt and the tool automatically adapts:

- **X/Twitter** — Ultra-brief, 1-2 sentences, punchy
- **LinkedIn** — Professional but concise, 100-200 words max
- **Instagram** — Brief captions, 1-3 sentences
- **TikTok** — Ultra-short, hook-focused
- **Threads/Bluesky** — Brief takes, 2-4 sentences
- **Facebook** — Conversational but concise
- **Reddit** — Community-aware, varies by context
- **Email/Substack** — Professional structure

For professional platforms (LinkedIn, Email), you can choose to adjust capitalization, grammar, and formality while maintaining your voice.

### One-Click Sharing

After generating content for social media, share directly:
- **Share on X** — Opens X/Twitter with your content pre-filled
- **Share on LinkedIn** — Opens LinkedIn share dialog
- **Share on Facebook** — Opens Facebook share dialog
- **Share on Reddit** — Opens Reddit submission

If your prompt mentioned a URL, it's automatically appended for clean link sharing.

### GitHub Repo Detection

GitHub repository URLs in your prompt are automatically detected. The tool fetches:
- README content
- Repository metadata (description, language, stars)

This provides rich technical context when generating content about code projects.

### Style Sketch

Based on your prompt content, the tool detects and suggests relevant tones:
- **Accessible** — General audience, explains technical concepts simply
- **Technical** — Precise, detailed terminology for expert readers
- **Casual** — Relaxed, conversational language
- **Professional** — Polished, business-appropriate
- **Somber** — Gentle, emotionally measured for difficult topics
- **Empathetic** — Shows understanding and compassion
- **Upbeat** — Energetic, positive, celebratory
- **Witty** — Light humor and clever observations
- **Persuasive** — Compelling, action-oriented
- **Educational** — Clear explanations, step-by-step
- **Narrative** — Story structure with vivid details
- **Analytical** — Data-driven, logical reasoning
- **Concise** — Ultra-brief, every word earns its place
- **Thorough** — Comprehensive with full context

Toggle tones on/off to guide generation while preserving your core voice. Hover for descriptions.

**Style Studio**: Click "Open Style Studio" for the full builder with all styles organized by category. Add custom feedback like "Make it more confident" to further guide generation. After generating, click "Edit Style" to adjust and regenerate.

### Profile Persistence

- **Save to Browser** — Your profile saves to localStorage
- **Auto-load** — Returns to your saved profile automatically
- **Quick View** — Preview your profile while generating
- **Full Profile Modal** — View complete profile without losing context
- **Clear & Restart** — Start fresh with a new profile anytime

## Input Methods

- **Paste** — Copy and paste writing samples directly. Multiple samples separated by blank lines.
- **URL** — Enter URLs to blog posts/articles. Supports bulk URLs (one per line). GitHub repo URLs are auto-detected and fetched with README + metadata.
- **Upload** — Upload .txt or .md files. Supports batch uploads.
- **Load Profile** — Paste or upload a previously saved profile JSON to skip analysis.

## Content Types

- **Social Media (Personal)** — For X, Instagram, Twitter
- **Social Media (Professional)** — For LinkedIn
- **Blog (Personal)** — Conversational, story-driven
- **Blog (Professional)** — Informative, authoritative
- **Long-form Writing** — Articles, essays, reports
- **Creative Writing** — Fiction, narrative, experimental

## API Providers

- **Puter GPT-OSS** — Default. Free with no API key required.
- **OpenRouter** — Access to many models through a single API key.
- **Anthropic** — Direct connection to Claude API.
- **OpenAI** — Direct connection to GPT API.
- **Google Gemini** — Direct connection to Gemini API.
- **Ollama** — Run models locally. No API key, no data leaves your machine.
- **Custom Endpoint** — Any OpenAI-compatible API.

## Running Locally

### Quick Start

```bash
git clone https://github.com/97115104/writelikeme.git
cd writelikeme
python3 -m http.server 8000
```

Open http://localhost:8000 in your browser.

### Using Ollama (Fully Offline)

1. Install Ollama from [ollama.com/download](https://ollama.com/download)

2. Pull a model and start with browser access:
   ```bash
   ollama pull gpt-oss:20b
   OLLAMA_ORIGINS=* ollama serve
   ```

3. Select "Ollama (Local)" in the API Settings panel.

## Technical Details

### Slop Research

The slop detection system is based on documented AI writing research. See [docs/ai-writing-patterns-research.md](docs/ai-writing-patterns-research.md) for the full research document covering:

- 50+ documented AI writing patterns
- Categorized by severity and type
- Remediation strategies for each pattern
- Platform-specific AI tells

### Architecture

- Pure HTML/CSS/JavaScript — no build step required
- Serverless design for GitHub Pages deployment
- Multi-provider API abstraction
- LZ-String for URL compression
- localStorage for profile persistence

## Privacy

- All processing happens through the selected API provider
- No data is stored on any server
- Puter uses a user-pays model
- Ollama runs entirely offline

## Related Tools

- [Quality Prompts](https://github.com/97115104/qualityprompts) — Transform ideas into production-ready prompts
- [Assess Prompts](https://github.com/97115104/assessprompts) — Get expert AI feedback on prompts
- [Reclassifier](https://github.com/97115104/reclassifier) — Add and edit fields in JSON data

## License

MIT License — see [LICENSE](LICENSE) for details.

## Author

Created by [97 115 104](https://github.com/97115104)

[Sponsor this project](https://github.com/sponsors/97115104)
