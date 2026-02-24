# Write Like Me

A free, serverless tool that analyzes your writing samples and creates a detailed writing profile. Use that profile to generate new text in your unique style, free of common AI writing patterns.

**Live Demo:** [https://97115104.github.io/writelikeme/](https://97115104.github.io/writelikeme/)

## What It Does

Write Like Me solves the "AI slop" problem. When you use AI to generate text, it often sounds generic, formulaic, and obviously machine-generated. This tool analyzes your actual writing to understand your voice, then uses that understanding to generate content that sounds like you.

### Input Methods

Share your writing samples via:

- **Paste** — Copy and paste writing samples directly. Add multiple samples separated by blank lines.
- **URL** — Enter URLs to blog posts, articles, or web pages. The tool fetches and extracts the text content automatically.
- **Upload** — Upload text files (.txt, .md) containing your writing samples. Supports batch uploads of multiple files.
- **Load Profile** — Paste a previously saved writing profile JSON to skip analysis.

### Writing Profile

The tool analyzes your samples and creates a comprehensive profile covering:

- **Style** — Formality level, descriptiveness, directness, perspective
- **Tone & Voice** — Primary tone, emotional register, voice consistency
- **Vocabulary** — Word complexity, characteristic words and phrases, reading level
- **Structure** — Sentence length patterns, variety, paragraph style
- **Stylistic Markers** — Unique patterns, signature phrases, punctuation preferences
- **Patterns to Replicate** — Key constructions that define your voice

The profile is downloadable as JSON and can be reused across sessions or shared with others.

### Content Types

Generate content for:

- **Social Media (Personal)** — For X, Instagram, Twitter. Casual, engaging, personal voice.
- **Social Media (Professional)** — For LinkedIn. Polished but authentic.
- **Blog (Personal)** — Conversational, story-driven, personal essays.
- **Blog (Professional)** — Informative, authoritative, expertise-focused.
- **Long-form Writing** — Articles, essays, reports with sustained arguments.
- **Creative Writing** — Fiction, narrative, experimental styles.

### Slop Removal

The tool actively avoids common AI writing patterns:

- **No em dashes** — Sentences are rewritten to flow naturally without them
- **No antitheticals** — Avoids "It's not X, it's Y" constructions
- **No singleton phrases** — No "Here's the thing." or "Let me be clear."
- **No lists or tables** — Content flows in natural paragraphs
- **No formulaic transitions** — No "However," "Moreover," "Furthermore,"
- **No rhetorical Q&A** — Avoids "What does this mean? It means..."
- **No excessive exclamation marks** — Maintains authentic tone
- **No hedge words clusters** — Minimizes "perhaps," "maybe," "might"

Generated text is checked for these patterns and flagged if any slip through.

## API Providers

Write Like Me supports multiple AI providers:

- **Puter GPT-OSS** — Default. Completely free with no API key required. Uses Puter's user-pays model.
- **OpenRouter** — Access to hundreds of models through a single API key. CORS-friendly.
- **Anthropic** — Direct connection to Claude API.
- **OpenAI** — Direct connection to GPT API.
- **Google Gemini** — Direct connection to Gemini API.
- **Ollama** — Run models locally on your machine. No API key, no data leaves your computer.
- **Custom Endpoint** — Any OpenAI-compatible API.

## Running Locally

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/97115104/writelikeme.git
   cd writelikeme
   ```

2. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```

3. Open http://localhost:8000 in your browser.

### Using Ollama (Fully Offline)

For completely offline usage with no data leaving your machine:

1. Install Ollama from [ollama.com/download](https://ollama.com/download)

2. Pull a model:
   ```bash
   ollama pull gpt-oss:20b
   ```

3. Start Ollama with browser access:
   ```bash
   OLLAMA_ORIGINS=* ollama serve
   ```

4. Select "Ollama (Local)" in the API Settings panel.

## Using Your Profile

The writing profile JSON can be used as a system prompt for any LLM. Download it and include it in your prompts to maintain consistent voice across different tools and platforms.

Example usage with any chat interface:

```
[Paste your writing profile here]

Now write a blog post about remote work culture in my style.
```

## Privacy

- All processing happens through the selected API provider
- No data is stored on any server
- Puter uses a user-pays model (users cover their own inference costs)
- Ollama runs entirely offline on your machine

## Related Tools

- [Quality Prompts](https://github.com/97115104/qualityprompts) — Transform simple ideas into production-ready prompts
- [Assess Prompts](https://github.com/97115104/assessprompts) — Get expert AI feedback on your prompts
- [Reclassifier](https://github.com/97115104/reclassifier) — Add and edit fields in JSON data

## License

MIT License — see [LICENSE](LICENSE) for details.

## Author

Created by [97 115 104](https://github.com/97115104)

[Sponsor this project](https://github.com/sponsors/97115104)
