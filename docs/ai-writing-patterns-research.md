# AI Writing Patterns Research Document

## Overview

This document catalogs known AI writing patterns, slop indicators, and quality issues that distinguish AI-generated text from authentic human writing. This research informs the slop detection and remediation systems in Write Like Me.

---

## 1. Structural Patterns

### 1.1 Formulaic Openings
AI tends to start content with predictable patterns:

| Pattern Type | Examples | Why It's Bad |
|--------------|----------|--------------|
| Declarative starters | "Let me explain...", "I'll walk you through...", "Let's dive into..." | Unnecessary preamble |
| Meta-commentary | "In this post, I will...", "Today we're going to explore..." | Tells instead of shows |
| Rhetorical questions | "Have you ever wondered...?", "What if I told you...?" | Manipulative engagement bait |
| Hook clichés | "Picture this:", "Imagine a world where...", "Here's the thing:" | Overused, signals AI |
| Acknowledgment | "Great question!", "That's a fascinating topic!" | Sycophantic, unnatural |

### 1.2 Formulaic Transitions
AI relies heavily on academic/formal transition words:

**High-frequency AI transitions:**
- However, Moreover, Furthermore, Additionally, Consequently
- That said, To be fair, Interestingly, Notably
- In fact, Indeed, Certainly, Undoubtedly
- First/Second/Third, On one hand/On the other hand
- With that in mind, Building on this, Taking this further

### 1.3 Formulaic Conclusions
AI wraps up with predictable closers:

- "In conclusion...", "To sum up...", "In summary..."
- "At the end of the day...", "When all is said and done..."
- "The bottom line is...", "Ultimately..."
- "Moving forward...", "Going forward..."
- Call-to-action closers: "What do you think?", "I'd love to hear your thoughts!"

---

## 2. Punctuation Patterns

### 2.1 Em Dash Overuse
AI models (especially Claude) heavily overuse em dashes (—) as:
- Parenthetical insertions: "The solution—which took months to develop—finally worked"
- Dramatic pauses: "And then it happened—everything changed"
- List introductions: "Three things mattered—speed, accuracy, and cost"

**Human alternative:** Commas, parentheses, semicolons, or sentence restructuring.

### 2.2 Colon Overuse
AI uses colons for lazy declarations:
- "The answer is simple: just do X"
- "Here's the truth: most people fail"
- "The bottom line: it's not worth it"

**Human alternative:** Integrate naturally into prose.

### 2.3 Semicolon Patterns
AI often uses semicolons in predictable ways:
- Joining two related independent clauses
- Before transitional phrases ("; however,", "; therefore,")

---

## 3. Lexical Patterns

### 3.1 AI Vocabulary Clusters
Certain words appear with abnormally high frequency in AI text:

**Intensifiers:**
- incredibly, extremely, absolutely, truly, deeply
- genuinely, actually, literally, certainly, undoubtedly
- remarkably, exceptionally, fundamentally

**Hedge words:**
- perhaps, maybe, might, could potentially
- arguably, presumably, seemingly, apparently
- it seems, one might argue, it's worth noting

**Filler adjectives:**
- various, numerous, significant, substantial
- comprehensive, robust, seamless, streamlined
- innovative, cutting-edge, state-of-the-art

**Abstract nouns:**
- landscape, ecosystem, framework, paradigm
- journey, space, realm, sphere, arena
- dynamics, synergy, leverage, utilize

### 3.2 Phrase-Level Slop

**Antithetical constructions (very common):**
- "It's not about X, it's about Y"
- "This isn't just X—it's Y"
- "Not X but Y"
- "Less about X and more about Y"

**Pseudo-profound statements:**
- "At its core...", "At the heart of..."
- "What really matters is...", "The real question is..."
- "This is bigger than...", "It goes beyond..."

**Empty intensification:**
- "truly transformative", "deeply impactful"
- "genuinely meaningful", "incredibly powerful"
- "absolutely essential", "critically important"

---

## 4. Structural Slop

### 4.1 List Dependency
AI defaults to lists when prose would be better:
- Bullet points for everything
- Numbered steps for non-sequential content
- "Here are X things..." framing

### 4.2 Parallelism Overuse
AI loves parallel structure to a fault:
- "Not just X, but Y and Z"
- "Whether you're A, B, or C..."
- "From X to Y to Z"

### 4.3 Section Headers
AI tends to over-structure with headers when informal prose would suffice.

### 4.4 The "Sandwich" Pattern
AI often structures arguments as:
1. State the point
2. Elaborate/qualify
3. Restate the point

---

## 5. Tone Markers

### 5.1 Performative Enthusiasm
AI often sounds overly enthusiastic or impressed:
- "This is fascinating!", "How exciting!"
- "What a great question!", "I love this topic!"
- Excessive exclamation marks

### 5.2 Artificial Empathy
AI simulates empathy with formulaic phrases:
- "I understand how you feel"
- "This can be challenging"
- "Many people struggle with this"

### 5.3 Corporate Speak
AI defaults to professional/corporate tone:
- "leverage", "utilize", "facilitate", "optimize"
- "stakeholders", "deliverables", "actionable insights"
- "best practices", "value proposition", "scalable solutions"

---

## 6. Content Patterns

### 6.1 Balanced Perspectives
AI often artificially balances viewpoints:
- "On one hand... on the other hand..."
- "While X is true, Y is also important"
- "There are pros and cons to consider"

### 6.2 Genericization
AI avoids specificity, resulting in:
- Vague examples: "For instance, many companies..."
- Abstract benefits: "This can improve productivity"
- Non-committal conclusions: "It depends on the situation"

### 6.3 Risk Aversion
AI hedges to avoid controversy:
- "Some might argue...", "It could be said that..."
- "In certain contexts...", "Depending on your needs..."
- Excessive qualifications and disclaimers

---

## 7. Platform-Specific AI Tells

### 7.1 LinkedIn AI Patterns
- Starting with "I" + verb (I realized, I learned, I discovered)
- Three-dot line breaks for "impact"
- Ending with questions for engagement
- Humble-brag framing
- "Agree?" or "Thoughts?" closers

### 7.2 Twitter/X AI Patterns
- Thread formatting (1/, 2/, etc.) when unnecessary
- "Here's what I learned:" openers
- Emoji overuse for engagement
- "THREAD:" or "A thread:" introductions

### 7.3 Blog AI Patterns
- SEO-optimized headers
- "In this article, you'll learn..."
- FAQ sections
- "Key takeaways" or "TL;DR" sections

---

## 8. Sentence-Level Patterns

### 8.1 Sentence Length Uniformity
AI often produces sentences of similar length, lacking the natural variation of human writing.

### 8.2 Passive Voice Clusters
AI tends toward passive constructions:
- "It was determined that..."
- "The decision was made to..."
- "It should be noted that..."

### 8.3 Nominalization
AI converts verbs to nouns unnecessarily:
- "make a decision" instead of "decide"
- "provide assistance" instead of "help"
- "conduct an investigation" instead of "investigate"

---

## 9. Meta-Linguistic Patterns

### 9.1 Self-Reference
AI refers to itself or its output:
- "As I mentioned above..."
- "This brings us to..."
- "The point I'm making is..."

### 9.2 Reader Address
AI often directly addresses the reader:
- "You might be wondering..."
- "As you can see..."
- "You'll notice that..."

### 9.3 Process Commentary
AI describes its own writing process:
- "Let me explain..."
- "I'll break this down..."
- "Here's how I think about it..."

---

## 10. Detection Strategies

### 10.1 High-Confidence Indicators
These patterns strongly suggest AI generation:
1. Em dash frequency > 2 per 500 words
2. Multiple formulaic transitions in sequence
3. Antithetical constructions ("not X but Y")
4. Sycophantic openings
5. Perfect parallel structure throughout
6. Uniform sentence length distribution

### 10.2 Medium-Confidence Indicators
These suggest AI but may appear in human writing:
1. Heavy use of intensifiers
2. Hedge word clustering
3. List-heavy formatting
4. Generic examples
5. Balanced perspective framing

### 10.3 Low-Confidence Indicators
These are suggestive but not definitive:
1. Formal transition words
2. Clear structure
3. Passive voice usage
4. Abstract vocabulary

---

## 11. Remediation Strategies

### 11.1 Structural Fixes
- Replace lists with flowing prose
- Vary sentence length dramatically
- Remove unnecessary headers
- Cut formulaic openings and closings

### 11.2 Lexical Fixes
- Replace intensifiers with specific details
- Convert hedges to direct statements
- Swap corporate speak for plain language
- Remove filler adjectives

### 11.3 Punctuation Fixes
- Convert em dashes to commas/periods
- Restructure colon declarations
- Reduce semicolon usage

### 11.4 Tone Fixes
- Remove performative enthusiasm
- Cut sycophantic acknowledgments
- Reduce hedge clustering
- Add authentic voice markers from profile

---

## 12. Implementation Priority

### Critical (Must Fix)
1. Em dash removal
2. Antithetical construction rewriting
3. Formulaic opener removal
4. Sycophantic phrase removal
5. Colon declaration restructuring
6. List-to-prose conversion

### High Priority
1. Transition word reduction
2. Intensifier replacement
3. Hedge word reduction
4. Parallel structure variation
5. Sentence length variation

### Medium Priority
1. Passive voice reduction
2. Nominalization fixes
3. Generic example replacement
4. Self-reference removal

---

## 13. References & Sources

This research synthesizes patterns from:
- Academic papers on AI text detection
- Community-collected "AI slop" examples
- Style guide best practices (Strunk & White, Chicago Manual)
- Real-world editing experience
- User feedback on AI writing issues

---

## Document Version
- Version: 1.0
- Last Updated: February 2026
- Author: Write Like Me Development Team
