# Write Like Me

A free, serverless tool that analyzes your writing samples and generates new content in your unique voice, free of common AI writing patterns.

**Live Demo:** [https://97115104.github.io/writelikeme/](https://97115104.github.io/writelikeme/)

## Quick Start

Add your writing samples by pasting text, entering URLs, or uploading files (.txt, .md, .rtf, .pdf, or Scrivener .scriv folders). Click Analyze to extract your voice patterns, tone, vocabulary, and style markers. Then write prompts and generate content that sounds like you. Save your profile to the browser or download it as JSON for later use.

## AI Pattern Detection

Write Like Me detects and removes patterns that make AI writing sound artificial. Critical issues like antithetical constructions, bullet lists, and third-person self-references are fixed automatically. High-priority patterns include formulaic transitions (However, Moreover), colon declarations, and meta-commentary. Medium-priority issues cover AI vocabulary clusters (landscape, ecosystem, journey), passive voice, and engagement bait. Formatting problems like long paragraphs, excessive whitespace, and run-on sentences are also corrected.

Generated text receives a quality score from 0 to 100 showing how authentic it sounds.

## Writing Profile Analysis

Your profile is built using research-backed frameworks. The Mastery Level follows the Dreyfus model (Novice through Masterful), while Technical Level measures complexity from Accessible to Specialized. Voice Consistency shows how uniform your style is across samples. Pattern Density indicates how many unique, replicable patterns were detected.

Psychological metrics include Emotional Resonance (how deeply the writing connects), Authenticity (how genuine the voice feels), Narrative Flow (pacing and momentum), and Persuasive Clarity (rhetorical effectiveness). All metrics are scored from 1 to 10.

## Platform-Aware Generation

Mention a social platform in your prompt and the tool automatically adapts style. For X and Twitter, output is ultra-brief and punchy. LinkedIn content is professional at 100 to 200 words. Instagram and TikTok get brief, hook-focused captions. Email and Substack receive proper structure and formatting. For professional platforms, you can adjust formality while maintaining your voice.

## Style Tags

Guide output with tone and format tags. The Tone category includes Casual, Conversational, Professional, Warm, Kind, and Empathetic. Emotional tags cover Upbeat, Somber, Witty, and Funny. Purpose tags include Persuasive, Educational, Narrative, and Analytical. Format options are Concise, Thorough, and Emoji.

Click tags to toggle them on or off. Use the Style Studio for the full builder with all available styles organized by category. Add custom feedback like "Make it more confident" to further guide generation.

## Smart Features

GitHub repository URLs are detected automatically, fetching the README and metadata for technical context. Regular URLs extract content for use as context when generating. One-click sharing lets you post directly to X, LinkedIn, Facebook, or Reddit. Revision history lets you browse and restore previous generations, while edit tracking ensures your manual edits inform the next regeneration.

## Input Methods

The tool supports multiple input methods. Paste any text directly, enter URLs to blog posts, articles, or GitHub repos, or upload files in .txt, .md, .rtf, or .pdf format. Drag and drop Scrivener .scriv folders to import all documents. You can also load a previously saved profile JSON to skip analysis.

## API Providers

Puter GPT-OSS is the default provider and is completely free with no API key required. OpenRouter provides access to many models through a single API key. Anthropic, OpenAI, and Google Gemini connect directly to their respective APIs. Ollama runs models locally on your machine with no API key needed. Custom Endpoint supports any OpenAI-compatible API.

## Running Locally

```bash
git clone https://github.com/97115104/writelikeme.git
cd writelikeme
python3 -m http.server 8000
# Open http://localhost:8000
```

For fully offline use with Ollama:

```bash
ollama pull gpt-oss:20b
OLLAMA_ORIGINS=* ollama serve
# Select "Ollama (Local)" in API Settings
```

## Technical Details

Write Like Me is pure HTML, CSS, and JavaScript with no build step required. It runs serverless for easy GitHub Pages deployment. The multi-provider API abstraction supports seven different AI providers. Profile persistence uses localStorage. See [docs/ai-writing-patterns-research.md](docs/ai-writing-patterns-research.md) for the research behind slop detection.

## Privacy

All processing happens through your selected API provider. No data is stored on any server. Ollama runs entirely offline.

## Related Tools

Check out [Quality Prompts](https://github.com/97115104/qualityprompts) to transform ideas into production-ready prompts, [Assess Prompts](https://github.com/97115104/assessprompts) for expert AI feedback on prompts, and [Reclassifier](https://github.com/97115104/reclassifier) to add and edit fields in JSON data.

## License

MIT. See [LICENSE](LICENSE).

## Author

[97 115 104](https://github.com/97115104). [Sponsor](https://github.com/sponsors/97115104).
