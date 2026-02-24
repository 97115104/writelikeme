# Write Like Me

A free, serverless tool that analyzes your writing samples and creates a detailed writing profile. Use that profile to generate new text in your unique style, free of common AI writing patterns.

**Live Demo:** [https://97115104.github.io/writelikeme/](https://97115104.github.io/writelikeme/)

## Quick Start Guide

### 1. Create Your Writing Profile

1. **Add writing samples** — Paste text, enter URLs, or upload files
2. **Aim for variety** — Include 3-5 samples from different contexts (emails, social posts, articles)
3. **Click "Analyze"** — The tool extracts your unique voice patterns
4. **Save your profile** — Click "Save to Browser" to reuse it later

### 2. Generate Content

1. **Choose content type** — Select from social media, blog, email, poetry, etc.
2. **Write your prompt** — Describe what you want to write about
3. **Select style tags** — Add tones like "Warm" or "Concise" to guide output
4. **Click Generate** — Get content in your voice

### 3. Refine Your Output

1. **Edit directly** — Click on the generated text to make changes
2. **Add feedback** — Open Style Studio and add notes like "Make it more confident"
3. **Regenerate** — The system learns from your edits and feedback
4. **Browse revisions** — Click the clock icon to restore previous versions

### 4. Share or Save

1. **Copy** — One-click copy to clipboard
2. **Share** — Direct sharing to X, LinkedIn, Facebook, Reddit
3. **Save edits** — Keep your refined version
4. **Download** — Export as text file

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
- "Real talk" openers ("Real talk:", "Full transparency:")
- Quick exit/cheap engagement lines ("not writing this for a quick exit")
- "Personal and universal" clichés

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

### Style Sketch Studio

Based on your prompt content, the tool detects and suggests relevant tones with **sentiment-coded colors**:

| Color | Sentiment | Example Styles |
|-------|-----------|----------------|
| 🟢 Green | Positive | Upbeat, Encouraging, Warm |
| 🟠 Orange | Warm/Nurturing | Empathetic, Understanding, Supportive |
| 🔵 Blue | Somber/Reflective | Melancholic, Thoughtful, Gentle |
| 🔴 Red | Assertive/Strong | Bold, Confrontational, Urgent |
| 🟣 Purple | Neutral/Balanced | Professional, Technical, Analytical |

**Available Styles:**

**Audience:**
- **Accessible** — General audience, explains technical concepts simply
- **Technical** — Precise, detailed terminology for expert readers

**Tone:**
- **Casual** — Relaxed, conversational language
- **Conversational** — Natural speech patterns, filler words, authentic rhythm
- **Professional** — Polished, business-appropriate
- **Kind** — Gentle, considerate language
- **Warm** — Personal connection, genuine warmth
- **Understanding** — Acknowledges and validates perspectives
- **Compassionate** — Expresses care and support
- **Reassuring** — Provides comfort and confidence
- **Encouraging** — Motivates and inspires

**Emotional:**
- **Somber** — Gentle, emotionally measured for difficult topics
- **Empathetic** — Shows understanding and compassion
- **Upbeat** — Energetic, positive, celebratory
- **Witty** — Light humor and clever observations

**Purpose:**
- **Persuasive** — Compelling, action-oriented
- **Educational** — Clear explanations, step-by-step
- **Narrative** — Story structure with vivid details
- **Analytical** — Data-driven, logical reasoning

**Format:**
- **Concise** — Ultra-brief, every word earns its place
- **Thorough** — Comprehensive with full context
- **Emoji** — Adds appropriate emojis for warmth and expression

Toggle tones on/off to guide generation while preserving your core voice. Hover for descriptions. **Already-selected tags appear pre-checked** and can be toggled off.

**Smart Auto-Selection**: When writing personal text messages or emails with emotional content (birthday wishes, congratulations, thank you notes), the system automatically suggests **Emoji** and **Conversational** styles.

**Predicted Impact Heuristics**: Each style shows how it might affect your output:
- Word count changes (+/- percentage)
- Sentence length shifts  
- Structural modifications

**Style Studio**: Click "Open Style Studio" for the full builder with all styles organized by category. Add custom feedback like "Make it more confident" to further guide generation. After generating, click "Edit Style" to adjust and regenerate.

### Feedback History & Cumulative Learning

The system tracks your feedback across generations and uses it to **incrementally improve** output quality:

- **Feedback is treated as requirements**, not suggestions
- Each feedback item is prefixed with **REQUIREMENT:** in the prompt
- Historical feedback accumulates, building a richer context
- **View Feedback** button opens a modal showing your complete feedback trail
- Feedback count badge shows how many notes are active
- Percentage changes tracked to show cumulative impact

### Revision History

Track and restore previous versions of your generated content:

- **Clock icon button** — Access revision history (appears after first generation)
- **Version count badge** — Shows how many versions are saved
- **Version preview** — See word count, styles used, and content preview
- **Restore any version** — Click to restore a previous generation
- **Smart deduplication** — Clicking through history doesn't create duplicate entries
- **Current position tracking** — Shows which version you're currently viewing
- **Up to 20 revisions** stored per session

This allows you to experiment freely with regeneration, knowing you can always restore a version you liked better.

### Content Edit Tracking

When you edit generated content, the system analyzes your changes:

- **Word count changes** — Did you add or remove substantial content?
- **Paragraph restructuring** — Did you reorganize the flow?
- **Sentence removal** — Which specific phrases were cut?

These edits inform the next regeneration with specific guidance like:
- "User ADDED substantial content — consider including more detail"
- "User REMOVED these sentences — avoid similar phrasing"
- "User RESTRUCTURED paragraphs — match this new organization"

**Edit Indicator**: Shows "Edited" badge when you've modified generated content, with Save and Discard buttons.

### Regenerate Confirmation

After your first generation, if you've made changes (edits, feedback, or style adjustments), a confirmation modal shows exactly what will be applied:

- **Style tags** — Which tones will guide the generation
- **Feedback notes** — How many feedback items are active
- **Your edits** — Summary of content changes you made
- **New guidance** — Any custom feedback you've added
- **Impact estimates** — Percentage improvements for accuracy, relevance, and tone

The first generation always proceeds without confirmation. Subsequent generations only show confirmation when there are actual changes to apply.

### Profile Persistence

- **Save to Browser** — Your profile saves to localStorage
- **Auto-load** — Returns to your saved profile automatically
- **Quick View** — Preview your profile while generating
- **Full Profile Modal** — View complete profile without losing context
- **Clear & Restart** — Start fresh with a new profile anytime

### Save & Continue Editing

After generating content, you have flexible options:

- **Save** — Finalize the current version
- **Save & Continue Editing** — Save your edits but keep editing
- **Discard Edits** — Revert to the original generated version
- **Regenerate** — Generate a new version with your latest style settings

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
- **Poetry** — With subtypes: Free Verse, Haiku, Sonnet, Limerick, Narrative Poetry, Spoken Word

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
