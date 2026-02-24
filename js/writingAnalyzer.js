const WritingAnalyzer = (() => {
    // Content Types Configuration - JSON structure for easy querying and updating
    const CONTENT_TYPES = {
        categories: {
            'social': {
                label: 'Social Media',
                hasTones: true,
                defaultTone: 'personal',
                tones: {
                    'personal': {
                        label: 'Personal',
                        description: 'X, Instagram, TikTok - casual, engaging',
                        instruction: 'Generate content for personal social media (X, Instagram, TikTok). Keep it casual, engaging, authentic. Aim for 1-3 short paragraphs maximum.',
                        formatting: {
                            maxParagraphs: 3,
                            useLineBreaks: true,
                            allowEmoji: true,
                            signature: false
                        }
                    },
                    'professional': {
                        label: 'Professional',
                        description: 'LinkedIn - polished but authentic',
                        instruction: 'Generate content for professional social media (LinkedIn). Maintain professionalism while keeping authenticity. Typically 2-4 paragraphs.',
                        formatting: {
                            maxParagraphs: 4,
                            useLineBreaks: true,
                            allowEmoji: false,
                            signature: false
                        }
                    }
                }
            },
            'blog': {
                label: 'Blog Post',
                hasTones: true,
                defaultTone: 'personal',
                tones: {
                    'personal': {
                        label: 'Personal',
                        description: 'Conversational, story-driven',
                        instruction: 'Generate content for a personal blog. Conversational, story-driven, allows for personal anecdotes and reflections. Can be multiple paragraphs.',
                        formatting: {
                            useLineBreaks: true,
                            allowHeadings: false,
                            signature: false
                        }
                    },
                    'professional': {
                        label: 'Professional',
                        description: 'Informative, authoritative',
                        instruction: 'Generate content for a professional blog. Informative, expertise-focused, authoritative but accessible. Multiple well-structured paragraphs.',
                        formatting: {
                            useLineBreaks: true,
                            allowHeadings: true,
                            signature: false
                        }
                    }
                }
            },
            'email': {
                label: 'Email',
                hasTones: true,
                defaultTone: 'professional',
                tones: {
                    'personal': {
                        label: 'Personal',
                        description: 'Warm, conversational',
                        instruction: 'Generate a personal email. Warm, direct, conversational. Get to the point but maintain connection. Match the relationship context (friend, family, acquaintance).',
                        formatting: {
                            greeting: true,
                            signoff: true,
                            useLineBreaks: true,
                            template: 'personal-email'
                        }
                    },
                    'professional': {
                        label: 'Professional',
                        description: 'Clear, action-oriented',
                        instruction: 'Generate a professional email. Clear, concise, action-oriented. Start with purpose, provide context briefly, end with clear next steps. Maintain warmth without being overly casual. Include a professional greeting (Dear/Hi [Name]) and sign-off (Best regards, etc.).',
                        formatting: {
                            greeting: true,
                            signoff: true,
                            useLineBreaks: true,
                            template: 'professional-email'
                        }
                    }
                }
            },
            'long-form': {
                label: 'Long-form Article',
                hasTones: false,
                instruction: 'Generate long-form content such as articles or essays. Sustained arguments, detailed exploration, multiple sections if needed.',
                formatting: {
                    useLineBreaks: true,
                    allowHeadings: true,
                    minParagraphs: 4
                }
            },
            'creative': {
                label: 'Creative Writing',
                hasTones: false,
                instruction: 'Generate creative writing. Narrative focus, experimental where appropriate to the style, emphasis on voice and rhythm.',
                formatting: {
                    useLineBreaks: true,
                    allowDialogue: true
                }
            },
            'readme': {
                label: 'README / Docs',
                hasTones: false,
                instruction: 'Generate README or technical documentation. Clear, concise, well-structured. Use headings, brief explanations, and practical examples. Focus on clarity over personality. Write for developers who will scan quickly.',
                formatting: {
                    useMarkdown: true,
                    allowHeadings: true,
                    allowCodeBlocks: true,
                    allowLists: true // Exception: lists OK for docs
                }
            },
            'marketing': {
                label: 'Marketing Copy',
                hasTones: false,
                instruction: 'Generate marketing copy. Persuasive, benefit-focused, clear value proposition. Punchy and compelling. Connect emotionally while being specific. No fluff or corporate jargon.',
                formatting: {
                    useLineBreaks: true,
                    punchyParagraphs: true
                }
            },
            'chat': {
                label: 'Text / Chat',
                hasTones: false,
                instruction: 'Generate text message or chat content. Ultra-brief, conversational, casual. Use natural speech patterns. No formality. Can use sentence fragments. Keep it real.',
                formatting: {
                    ultraBrief: true,
                    allowFragments: true,
                    allowEmoji: true,
                    noGreeting: true
                }
            },
            'bio': {
                label: 'Bio / About Me',
                hasTones: true,
                defaultTone: 'personal',
                tones: {
                    'personal': {
                        label: 'Personal',
                        description: 'Social media bio, casual intro',
                        instruction: 'Generate a personal bio or About Me section. Concise personal introduction. Highlight personality and interests. Balance confidence with authenticity. Usually 2-4 sentences.',
                        formatting: {
                            maxSentences: 4,
                            ultraBrief: true
                        }
                    },
                    'professional': {
                        label: 'Professional',
                        description: 'LinkedIn, company profile',
                        instruction: 'Generate a professional bio. Concise introduction highlighting expertise and achievements. Third person optional. Balance confidence with authenticity. 2-4 sentences for bios, 1-2 paragraphs for About sections.',
                        formatting: {
                            maxParagraphs: 2
                        }
                    }
                }
            },
            'cover-letter': {
                label: 'Cover Letter',
                hasTones: false,
                instruction: 'Generate a cover letter. Professional but personable. Connect experience to requirements. Show enthusiasm without being sycophantic. Concrete examples over generic claims. 3-4 paragraphs max. Include proper greeting and professional sign-off.',
                formatting: {
                    greeting: true,
                    signoff: true,
                    useLineBreaks: true,
                    maxParagraphs: 4,
                    template: 'cover-letter'
                }
            },
            'poetry': {
                label: 'Poetry',
                hasTones: true,
                defaultTone: 'free-verse',
                tones: {
                    'free-verse': {
                        label: 'Free Verse',
                        description: 'No fixed form, natural rhythm',
                        instruction: 'Generate free verse poetry. No fixed meter or rhyme scheme. Focus on imagery, emotion, and natural speech rhythms. Use line breaks for emphasis and pacing. Let the content determine the form.',
                        formatting: {
                            useLineBreaks: true,
                            preserveLineBreaks: true,
                            noJustify: true
                        }
                    },
                    'haiku': {
                        label: 'Haiku',
                        description: '5-7-5 syllables, nature focus',
                        instruction: 'Generate a haiku. Traditional 5-7-5 syllable structure across three lines. Focus on nature imagery, seasons, or moments of insight. Capture a single vivid image or feeling. No titles needed.',
                        formatting: {
                            useLineBreaks: true,
                            exactLines: 3,
                            noTitle: true
                        }
                    },
                    'sonnet': {
                        label: 'Sonnet',
                        description: '14 lines, iambic pentameter',
                        instruction: 'Generate a sonnet. 14 lines in iambic pentameter. Can be Shakespearean (ABAB CDCD EFEF GG) or Petrarchan (ABBAABBA CDECDE). Develop an argument or emotion across the poem with a turn (volta) near the end.',
                        formatting: {
                            useLineBreaks: true,
                            exactLines: 14
                        }
                    },
                    'limerick': {
                        label: 'Limerick',
                        description: 'AABBA rhyme, humorous',
                        instruction: 'Generate a limerick. Five lines with AABBA rhyme scheme. Lines 1, 2, 5 have 7-10 syllables; lines 3, 4 have 5-7 syllables. Humorous, often with a twist or punchline in the final line.',
                        formatting: {
                            useLineBreaks: true,
                            exactLines: 5
                        }
                    },
                    'ballad': {
                        label: 'Ballad',
                        description: 'Narrative, quatrain form',
                        instruction: 'Generate a ballad. Narrative poetry in quatrain stanzas (4 lines each). Typically ABAB or ABCB rhyme. Tell a story with dramatic or emotional content. Use repetition and refrain for effect.',
                        formatting: {
                            useLineBreaks: true,
                            stanzaBreaks: true
                        }
                    },
                    'spoken-word': {
                        label: 'Spoken Word',
                        description: 'Performance poetry',
                        instruction: 'Generate spoken word / slam poetry. Written for oral performance. Powerful, emotional, rhythmic. Use repetition, wordplay, and dramatic pauses. Address themes directly and personally. Raw and authentic.',
                        formatting: {
                            useLineBreaks: true,
                            allowFragments: true
                        }
                    }
                }
            }
        },

        // Get instruction for a content type key (e.g., 'email-professional' or 'creative')
        getInstruction(typeKey) {
            const [category, tone] = typeKey.includes('-') ? typeKey.split('-') : [typeKey, null];
            const cat = this.categories[category];
            if (!cat) return this.categories['blog'].tones.personal.instruction;
            
            if (cat.hasTones && tone && cat.tones[tone]) {
                return cat.tones[tone].instruction;
            } else if (cat.hasTones) {
                return cat.tones[cat.defaultTone].instruction;
            }
            return cat.instruction;
        },

        // Get formatting config for a content type key
        getFormatting(typeKey) {
            const [category, tone] = typeKey.includes('-') ? typeKey.split('-') : [typeKey, null];
            const cat = this.categories[category];
            if (!cat) return {};
            
            if (cat.hasTones && tone && cat.tones[tone]) {
                return cat.tones[tone].formatting || {};
            } else if (cat.hasTones) {
                return cat.tones[cat.defaultTone].formatting || {};
            }
            return cat.formatting || {};
        },

        // Get all categories for dropdown
        getAllCategories() {
            return Object.entries(this.categories).map(([key, cat]) => ({
                key,
                label: cat.label,
                hasTones: cat.hasTones
            }));
        },

        // Get tones for a category
        getTones(categoryKey) {
            const cat = this.categories[categoryKey];
            if (!cat || !cat.hasTones) return null;
            return Object.entries(cat.tones).map(([key, tone]) => ({
                key,
                label: tone.label,
                description: tone.description
            }));
        }
    };

    // Expose CONTENT_TYPES for other modules
    window.CONTENT_TYPES = CONTENT_TYPES;

    // System prompt for analyzing writing samples
    // Writing Mastery Levels based on Dreyfus Model of Skill Acquisition
    // Reference: Dreyfus, H.L. & Dreyfus, S.E. (1986) "Mind over Machine"
    const MASTERY_LEVELS = {
        1: { label: 'Novice', description: 'Basic functional writing. Follows rules rigidly. Limited vocabulary and simple sentence structures.' },
        2: { label: 'Emerging', description: 'Beginning to develop personal voice. Can vary sentence structure. Starting to show situational awareness.' },
        3: { label: 'Competent', description: 'Deliberate and organized writing. Clear purpose. Can adapt tone for different contexts.' },
        4: { label: 'Proficient', description: 'Holistic understanding of writing craft. Intuitive decisions. Consistent voice with intentional variation.' },
        5: { label: 'Expert', description: 'Deep intuitive mastery. Distinctive voice. Sophisticated control of rhythm, tone, and structure.' },
        6: { label: 'Masterful', description: 'Transcendent craft. Creates new patterns. Writing has signature quality instantly recognizable.' }
    };

    // Grade Level Mapping based on Flesch-Kincaid and educational standards
    // Labels designed for psychological impact - describe the WRITING, not the reader
    const GRADE_LEVELS = {
        'accessible': { label: 'Accessible', description: 'Clear and direct. Broad audience appeal. Economy of expression.', flesch: '80-90' },
        'conversational': { label: 'Conversational', description: 'Natural flow. Balanced complexity. Engaging readability.', flesch: '70-80' },
        'articulate': { label: 'Articulate', description: 'Polished expression. Thoughtful construction. Confident voice.', flesch: '60-70' },
        'refined': { label: 'Refined', description: 'Sophisticated phrasing. Nuanced vocabulary. Deliberate rhythm.', flesch: '50-60' },
        'elevated': { label: 'Elevated', description: 'Complex ideas elegantly expressed. Rich vocabulary. Dense meaning.', flesch: '40-50' },
        'scholarly': { label: 'Scholarly', description: 'Academic rigor. Technical precision. Layered argumentation.', flesch: '30-40' },
        'specialized': { label: 'Specialized', description: 'Expert discourse. Field-specific mastery. Maximum information density.', flesch: '0-30' }
    };

    // Expose for other modules
    window.MASTERY_LEVELS = MASTERY_LEVELS;
    window.GRADE_LEVELS = GRADE_LEVELS;

    const ANALYSIS_SYSTEM_PROMPT = `You are an expert writing analyst specializing in stylistic analysis and voice profiling using established linguistic and psychological frameworks.

## ANALYSIS FRAMEWORK

### 1. WRITING MASTERY LEVEL (Dreyfus Model of Skill Acquisition)
Evaluate the writer's craft mastery on a 1-6 scale:
- 1 (Novice): Functional but rigid. Simple sentences, limited vocabulary, rule-following.
- 2 (Emerging): Developing personal voice. Beginning sentence variety. Basic situational awareness.
- 3 (Competent): Deliberate, organized. Clear purpose. Can adapt tone for context.
- 4 (Proficient): Holistic craft understanding. Intuitive decisions. Consistent voice with intentional variation.
- 5 (Expert): Deep mastery. Distinctive voice. Sophisticated rhythm, tone, and structure control.
- 6 (Masterful): Transcendent craft. Creates new patterns. Instantly recognizable signature style.

### 2. TECHNICAL READING LEVEL (Flesch-Kincaid equivalent)
Provide a complexity descriptor (NOT education-based):
- "Accessible" (Flesch 80-90): Clear, direct, broad appeal
- "Conversational" (Flesch 70-80): Natural, balanced, engaging
- "Articulate" (Flesch 60-70): Polished, thoughtful, confident
- "Refined" (Flesch 50-60): Sophisticated, nuanced, deliberate
- "Elevated" (Flesch 40-50): Complex ideas, rich vocabulary
- "Scholarly" (Flesch 30-40): Academic rigor, technical precision
- "Specialized" (Flesch 0-30): Expert discourse, maximum density

### 3. PSYCHOLOGICAL IMPACT METRICS (1-10 scales)
- **Emotional Resonance**: How deeply does the writing connect? Does it evoke feeling?
- **Authenticity**: How genuine and distinctive is the voice? Does it feel real?
- **Narrative Flow**: How well does it pull readers forward? Pacing and momentum.
- **Persuasive Clarity**: How effectively does it communicate intent? Rhetorical power.

### 4. STYLE CHARACTERISTICS
- Formality: formal, semi-formal, casual, conversational
- Descriptiveness: sparse, moderate, rich, ornate
- Directness: direct, measured, indirect, circumlocutory
- Perspective: first person, second person, third person, mixed

### 5. TONE & VOICE
- Primary tone (professional, friendly, authoritative, funny, humorous, serious, warm, detached, etc.)
- Emotional register (neutral, passionate, reserved, enthusiastic, contemplative, playful, comedic)
- Voice consistency score (1-10): How consistent is the voice across samples?

### 5. VOCABULARY PROFILE
- Lexical diversity score (1-10): Variety of unique words used
- Technical density (1-10): Amount of specialized/technical terminology
- Characteristic words and phrases unique to this writer

### 6. SENTENCE & STRUCTURE PATTERNS
- Average sentence length tendency (short <15 words, medium 15-25, long >25, varied)
- Sentence variety (simple, compound, complex, or mixed patterns)
- Paragraph structure (tight/focused, expansive, fragmented, flowing)

### 8. DISTINCTIVE MARKERS (unique fingerprint elements)
- Signature phrases or constructions
- Punctuation preferences (em-dashes, semicolons, ellipses, etc.)
- Opening/closing patterns
- Transition styles
- Rhythmic patterns

### 9. PATTERN DENSITY SCORE (1-10)
How many distinctive, replicable patterns were identified? Higher = more unique fingerprint.

Return your analysis as valid JSON with this exact structure:
{
    "mastery_level": <number 1-6>,
    "mastery_label": "<Novice|Emerging|Competent|Proficient|Expert|Masterful>",
    "technical_level": "<Accessible|Conversational|Articulate|Refined|Elevated|Scholarly|Specialized>",
    "complexity_score": <number 1-10>,
    "voice_consistency": <number 1-10>,
    "lexical_diversity": <number 1-10>,
    "technical_density": <number 1-10>,
    "pattern_density": <number 1-10>,
    "emotional_resonance": <number 1-10>,
    "authenticity": <number 1-10>,
    "narrative_flow": <number 1-10>,
    "persuasive_clarity": <number 1-10>,
    "style": {
        "formality": "<level>",
        "descriptiveness": "<level>",
        "directness": "<level>",
        "perspective": "<type>",
        "summary": "<2-3 sentence summary>"
    },
    "tone": {
        "primary": "<tone>",
        "secondary": ["<tone>", "<tone>"],
        "emotional_register": "<register>",
        "summary": "<2-3 sentence summary>"
    },
    "vocabulary": {
        "complexity": "<level>",
        "characteristic_words": ["<word>", "<word>", ...],
        "phrases": ["<phrase>", "<phrase>", ...],
        "summary": "<2-3 sentence summary>"
    },
    "structure": {
        "sentence_length": "<tendency>",
        "variety": "<description>",
        "paragraph_style": "<description>",
        "summary": "<2-3 sentence summary>"
    },
    "markers": [
        {"type": "<category>", "description": "<specific marker>"},
        ...
    ],
    "patterns": [
        "<pattern to replicate>",
        ...
    ],
    "profile_summary": "<comprehensive 3-4 sentence summary of this writer's voice>"
}`;

    // System prompt for generating content in the writer's style
    function getGenerationSystemPrompt(profile, contentType) {
        const instruction = CONTENT_TYPES.getInstruction(contentType);
        const formatting = CONTENT_TYPES.getFormatting(contentType);
        
        // Build formatting hints based on content type
        let formattingHints = '';
        if (formatting.greeting && formatting.signoff) {
            formattingHints += '\n- Include appropriate greeting and sign-off';
        }
        if (formatting.template === 'professional-email') {
            formattingHints += '\n- Format: Greeting line, blank line, body paragraphs, blank line, sign-off';
        }
        if (formatting.template === 'cover-letter') {
            formattingHints += '\n- Format: Professional greeting, introduction paragraph, 1-2 body paragraphs showing fit, closing paragraph with call to action, professional sign-off';
        }
        if (formatting.ultraBrief) {
            formattingHints += '\n- Keep extremely brief and punchy';
        }
        if (formatting.useMarkdown) {
            formattingHints += '\n- Use markdown formatting where appropriate';
        }

        return `You are a writing ghost-writer. Your task is to generate content that perfectly matches a specific writer's voice and style.

## CRITICAL RULES - SLOP AVOIDANCE

You MUST avoid these common AI writing patterns that make text feel artificial. VIOLATIONS WILL REQUIRE REGENERATION.

### ABSOLUTELY FORBIDDEN (High Priority):

1. **NO DASHES AS PARENTHETICALS**: Never use em dashes (—), en dashes (–), or hyphens (-) to insert asides or break up sentences. Always use commas, semicolons, periods, or restructure into complete sentences. WRONG: "I'd love your take on the roadmap I outline – especially" RIGHT: "I would love your take on the roadmap I outline, especially"

2. **NO ANTITHETICAL CONSTRUCTIONS**: Never use "not X but Y" patterns. WRONG: "is not model accuracy but the" or "It's not about the technology, it's about the people" RIGHT: State what something IS directly, without saying what it is NOT.

3. **NO THIRD-PERSON SELF-REFERENCES**: When writing about the user's own content, use first person. WRONG: "The post walks through a concrete" RIGHT: "My post walks through a concrete" or "I walk through a concrete"

4. **NO SINGLETON OPENERS**: Never start with punchy standalone phrases. WRONG: "Here's the thing." or "The bottom line." or "Let me be clear." RIGHT: Start with substantive content.

5. **NO LISTS OR BULLET POINTS**: Write in flowing paragraphs only. No numbered lists, no bullet points, no tables.

### STRONGLY AVOID (Medium Priority):

6. **NO FORMULAIC TRANSITIONS**: Avoid "However,", "Moreover,", "Furthermore,", "In conclusion,", "That said,", "To be fair,", "Interestingly,", "Notably,", "Additionally,"

7. **NO RHETORICAL Q&A**: Don't ask questions then immediately answer them. WRONG: "What does this mean? It means..." RIGHT: Make direct statements.

8. **NO SYCOPHANCY**: Don't say "Great question!" or "That's a fascinating topic!" or "I'd love your take"

### MINIMIZE (Low Priority):

9. **MINIMAL EXCLAMATION MARKS**: Use very sparingly, if at all.

10. **MINIMAL HEDGE WORDS**: Reduce "perhaps", "maybe", "might", "could potentially", "it seems", "arguably"

## WRITING PROFILE TO MATCH

${JSON.stringify(profile, null, 2)}

## CONTENT TYPE

${instruction}${formattingHints}

## YOUR TASK

Write content that:
- Sounds exactly like the writer in the profile
- Uses their vocabulary patterns and word choices
- Matches their sentence structure and rhythm  
- Incorporates their stylistic markers naturally
- Feels authentic and human, not AI-generated
- Flows naturally in paragraph form with proper punctuation (commas, semicolons, periods)
- Uses complete sentences without dashes or parenthetical asides
- Avoids ALL the slop patterns listed above

Return ONLY the generated content. No explanations, no meta-commentary, no "Here's the content:" prefix. Just the actual content.`;
    }

    // Slop detection patterns - comprehensive list based on AI writing research
    // See docs/ai-writing-patterns-research.md for full documentation
    const SLOP_PATTERNS = [
        // ============================================
        // CRITICAL SEVERITY - Must always be fixed
        // ============================================
        
        // Punctuation patterns
        { name: 'Em dashes', pattern: /—/g, severity: 'critical', category: 'punctuation' },
        { name: 'En dashes as em dashes', pattern: /\s–\s/g, severity: 'critical', category: 'punctuation' },
        { name: 'Hyphen dashes', pattern: /\s-\s(?=[A-Z])/g, severity: 'critical', category: 'punctuation' },
        
        // Antithetical constructions - hallmark of AI writing
        { name: 'Antithetical: not X but Y', pattern: /\b(is|are|was|were|isn't|aren't|wasn't|weren't) not ([\w\s]{2,30}?) but (the |a |an )?[\w]/gi, severity: 'critical', category: 'structure' },
        { name: 'Antithetical: it\'s not about', pattern: /\b(it'?s|this is|that'?s) not (about |just |only |merely )?[\w\s]{2,40}[,;]\s*(it'?s|this is|that'?s)/gi, severity: 'critical', category: 'structure' },
        { name: 'Antithetical: less X more Y', pattern: /\b(less|more) (about |of |like )[\w\s]{2,30}(and )?(less|more) (about |of |like )/gi, severity: 'critical', category: 'structure' },
        { name: 'Antithetical: not just X', pattern: /\bnot just\b[^.]{2,50}\bbut (also )?\b/gi, severity: 'high', category: 'structure' },
        { name: 'Antithetical: isn\'t X nor Y', pattern: /\b(isn't|aren't|wasn't|weren't|is not|are not) (a |an |the )?[\w\-]+[^.]*,?\s*nor\b/gi, severity: 'critical', category: 'structure' },
        { name: 'Antithetical: split sentence', pattern: /\b(It |This |That )(isn't|wasn't|isn't|is not|was not)[^.]{10,80}\.\s*(It's|It is|This is|That's)/gi, severity: 'critical', category: 'structure' },
        
        // Raw/unfiltered AI combos
        { name: 'AI combo: raw unfiltered', pattern: /\b(raw,? (and )?unfiltered|unfiltered,? (and )?raw|pure,? (and )?(unfiltered|raw)|authentic,? (and )?(raw|unfiltered))\b/gi, severity: 'critical', category: 'vocabulary' },
        
        // Flowery metaphorical language
        { name: 'Flowery: crafted for', pattern: /\b(crafted|designed|engineered|calibrated|calculated) for (applause|impact|effect|maximum|optimal)\b/gi, severity: 'high', category: 'vocabulary' },
        { name: 'Flowery: glide/dance past', pattern: /\b(glide|dance|sail|float|drift|slip) (past|by|through|over|beyond)\b/gi, severity: 'high', category: 'vocabulary' },
        { name: 'Flowery: the obvious and the', pattern: /\bthe (obvious|mundane|ordinary|everyday|simple) and the (absurd|extraordinary|profound|sublime|complex)\b/gi, severity: 'high', category: 'vocabulary' },
        { name: 'Flowery: brains keep', pattern: /\b(brains?|minds?) (keep|keeps|kept) (ticking|turning|churning|working|spinning)\b/gi, severity: 'medium', category: 'vocabulary' },
        
        // Sycophantic phrases - immediate AI tells
        { name: 'Sycophancy: great question', pattern: /\b(great|excellent|fantastic|wonderful|amazing|good) (question|point|observation|thought|idea)[.!]?/gi, severity: 'critical', category: 'tone' },
        { name: 'Sycophancy: I\'d love', pattern: /\bI'?d love (your|to hear|to know|to see|to get|to learn)/gi, severity: 'critical', category: 'tone' },
        { name: 'Sycophancy: that\'s fascinating', pattern: /\bthat'?s (a )?(fascinating|interesting|great|excellent|wonderful|intriguing)/gi, severity: 'critical', category: 'tone' },
        { name: 'Sycophancy: appreciate you', pattern: /\b(I )?(really |truly )?appreciate (you|your|the)/gi, severity: 'high', category: 'tone' },
        
        // Lists and formatting - should be prose
        { name: 'Bullet points', pattern: /^[\s]*[-•*]\s.+$/gm, severity: 'critical', category: 'structure' },
        { name: 'Numbered lists', pattern: /^\s*\d+[.)]\s.+$/gm, severity: 'critical', category: 'structure' },
        { name: 'Thread numbering', pattern: /^\s*\d+\/\d*\s/gm, severity: 'critical', category: 'structure' },
        
        // Third person self-reference
        { name: 'Third person self-ref', pattern: /\b(The|This|That) (post|article|blog|essay|piece|write-up|thread|content) (walks|goes|takes|dives|delves|looks|explores|examines|discusses|covers|explains|breaks|outlines|presents)/gi, severity: 'critical', category: 'voice' },
        
        // ============================================
        // HIGH SEVERITY - Should almost always be fixed
        // ============================================
        
        // Lazy declarative openers
        { name: 'Opener: here\'s the thing', pattern: /^(here'?s (the thing|what|the deal|my take)|the (bottom line|reality|truth) is|let me (be clear|explain|break))[.:,]/gim, severity: 'high', category: 'opener' },
        { name: 'Opener: real talk', pattern: /\b(real talk[,:] |look,? here'?s|okay,? so|alright,? so)|(^|[.!?]\s+)honest(ly)?[,:] /gi, severity: 'high', category: 'opener' },
        { name: 'Opener: picture this', pattern: /^(picture this|imagine (this|a|if)|what if I told you|have you ever)[.:,]?/gim, severity: 'high', category: 'opener' },
        { name: 'Opener: let\'s dive', pattern: /\blet'?s (dive|dig|jump|get) (in|into|started|going)\b/gi, severity: 'high', category: 'opener' },
        { name: 'Opener: in this post', pattern: /^(in this (post|article|thread|piece)|today (I|we|I'm|we're)|I'm going to (show|explain|walk|break))/gim, severity: 'high', category: 'opener' },
        
        // Colon-based lazy declarations
        { name: 'Colon declaration', pattern: /\b(the (bottom line|reality|truth|point|takeaway|lesson|key|answer|solution|problem|question)|here'?s (the thing|what|the deal|my take))\s*:/gi, severity: 'high', category: 'structure' },
        { name: 'X is simple colon', pattern: /\b(the |my |our )?(\w+ )?(rule|approach|answer|solution|method|formula|secret|trick|key) (is|are) (simple|easy|clear|straightforward)\s*:/gi, severity: 'high', category: 'structure' },
        { name: 'My take colon', pattern: /\b(my (take|view|perspective|advice|thoughts|opinion)|the (idea|concept|insight|point))\s*:/gi, severity: 'high', category: 'structure' },
        
        // Formulaic transitions
        { name: 'Transition: however', pattern: /\bHowever,/g, severity: 'high', category: 'transition' },
        { name: 'Transition: moreover', pattern: /\b(Moreover|Furthermore|Additionally|Consequently|Nevertheless|Nonetheless),/g, severity: 'high', category: 'transition' },
        { name: 'Transition: that said', pattern: /\b(That said|That being said|With that (said|in mind)|Having said that),/g, severity: 'high', category: 'transition' },
        { name: 'Transition: interestingly', pattern: /\b(Interestingly|Notably|Importantly|Significantly|Remarkably|Surprisingly)(,| enough)/g, severity: 'high', category: 'transition' },
        
        // Formulaic conclusions
        { name: 'Conclusion: in summary', pattern: /\b(In (summary|conclusion|closing|essence)|To (sum up|summarize|conclude|wrap up)|All in all|When all is said and done)\b/gi, severity: 'high', category: 'closer' },
        { name: 'Conclusion: at the end', pattern: /\b(At the end of the day|Ultimately|Moving forward|Going forward|The bottom line)\b/gi, severity: 'high', category: 'closer' },
        { name: 'Closer: what do you think', pattern: /\b(What do you think|I'?d love (to hear|your)|Thoughts|Agree|Let me know)\s*[?.]?\s*$/gim, severity: 'high', category: 'closer' },
        
        // Meta-commentary
        { name: 'Meta: as I mentioned', pattern: /\b(as I (mentioned|said|noted|discussed)|as we (discussed|saw|noted)|mentioned (above|earlier|previously))\b/gi, severity: 'high', category: 'meta' },
        { name: 'Meta: this brings us', pattern: /\b(this (brings|leads|takes) us to|which brings (us|me) to|the point (I'm|I am) making)\b/gi, severity: 'high', category: 'meta' },
        { name: 'Meta: let me explain', pattern: /\b(let me (explain|elaborate|clarify|break this down)|I('ll| will) (explain|elaborate|break))\b/gi, severity: 'high', category: 'meta' },
        { name: 'Meta: not for quick exit', pattern: /\b(not (writing|doing|sharing) this for a? quick (exit|win|buck|read)|want to share a moment that feels? (both )?personal and universal|feels? both personal and universal)\b/gi, severity: 'high', category: 'meta' },
        { name: 'Meta: personal and universal', pattern: /\b(resonate(s)? (on )?a (deeply )?(personal|universal) level|speaks? to (something|a truth) (that's |that is )?(both )?(personal|universal)|something we all)\b/gi, severity: 'high', category: 'meta' },
        
        // Rhetorical Q&A patterns
        { name: 'Rhetorical Q&A', pattern: /\?[\s\n]+(It |This |That |The answer |Well,? |So,? |And |But )?(is|means|comes? down to|boils? down to)/gi, severity: 'high', category: 'structure' },
        { name: 'Self-answered question', pattern: /\?\s+(The answer is|It'?s simple|Simply put|In short)/gi, severity: 'high', category: 'structure' },
        
        // ============================================
        // MEDIUM SEVERITY - Fix when possible
        // ============================================
        
        // Overly formal phrasing
        { name: 'Formal: it is worth noting', pattern: /\b(it is (worth|important to) (noting|note|mentioning|mention)|it bears mentioning|one might argue|it should be noted|it goes without saying)\b/gi, severity: 'medium', category: 'formality' },
        { name: 'Formal: in order to', pattern: /\bin order to\b/gi, severity: 'medium', category: 'formality', threshold: 2 },
        { name: 'Formal: utilize/leverage', pattern: /\b(utilize|leverage|facilitate|endeavor|commence)\b/gi, severity: 'medium', category: 'formality' },
        
        // AI vocabulary clusters
        { name: 'AI vocab: landscape/ecosystem', pattern: /\b(landscape|ecosystem|paradigm|synergy|holistic|robust)\b/gi, severity: 'medium', category: 'vocabulary', threshold: 2 },
        { name: 'AI vocab: journey/space', pattern: /\b(journey|space|realm|sphere|arena|dynamics)\b(?! (bar|shuttle|station|program|mission))/gi, severity: 'medium', category: 'vocabulary', threshold: 2 },
        { name: 'AI vocab: seamless/streamlined', pattern: /\b(seamless|streamlined|comprehensive|innovative|cutting-?edge|state-?of-?the-?art)\b/gi, severity: 'medium', category: 'vocabulary', threshold: 2 },
        
        // Balanced perspective forcing
        { name: 'Forced balance', pattern: /\b(on (the )?one hand|on the other hand|while .{10,50} (is )?(true|valid|important),? (it'?s|there'?s|we) (also|must)|pros and cons|both sides)\b/gi, severity: 'medium', category: 'structure' },
        
        // Passive constructions
        { name: 'Passive: it was', pattern: /\b(it was (determined|decided|found|discovered|noted|observed|concluded|established)|the decision was made|it has been shown)\b/gi, severity: 'medium', category: 'voice' },
        
        // Nominalization
        { name: 'Nominalization', pattern: /\b(make (a|an|the) (decision|determination|assessment|evaluation)|provide (assistance|guidance|support)|conduct (an?|the) (investigation|analysis|review))\b/gi, severity: 'medium', category: 'voice' },
        
        // Engagement bait
        { name: 'Engagement bait', pattern: /\b(you won'?t believe|this will (blow|change)|the secret (is|to)|what (happened )?next|number \d+ will|you need to know)\b/gi, severity: 'medium', category: 'tone' },
        
        // ============================================
        // LOW SEVERITY - Flag but don't require fix
        // ============================================
        
        // Intensifiers (only flag if excessive)
        { name: 'Intensifiers', pattern: /\b(incredibly|extremely|absolutely|truly|deeply|genuinely|literally|certainly|undoubtedly|remarkably|exceptionally|fundamentally)\b/gi, severity: 'low', category: 'vocabulary', threshold: 3 },
        
        // Hedge words (only flag if excessive)
        { name: 'Hedge words', pattern: /\b(perhaps|maybe|might|could potentially|it seems|arguably|presumably|seemingly|apparently)\b/gi, severity: 'low', category: 'vocabulary', threshold: 3 },
        
        // Excessive exclamation
        { name: 'Exclamation marks', pattern: /!/g, severity: 'low', category: 'punctuation', threshold: 2 },
        
        // Filler adjectives (only flag if excessive)
        { name: 'Filler adjectives', pattern: /\b(various|numerous|significant|substantial|specific|particular|certain|given)\b/gi, severity: 'low', category: 'vocabulary', threshold: 4 },
        
        // Empty intensification
        { name: 'Empty intensification', pattern: /\b(truly transformative|deeply impactful|genuinely meaningful|incredibly powerful|absolutely essential|critically important)\b/gi, severity: 'low', category: 'vocabulary' },
        
        // Reader address (only flag if excessive)
        { name: 'Reader address', pattern: /\b(you might (be wondering|think|notice)|as you can see|you'?ll (notice|find|see)|if you'?re like me)\b/gi, severity: 'low', category: 'voice', threshold: 2 }
    ];

    // Check for formatting/whitespace issues
    function checkFormatting(text) {
        const issues = [];
        const lines = text.split('\n');
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
        const wordCount = text.split(/\s+/).filter(w => w).length;
        
        // Wall of text - single paragraph with many words
        if (paragraphs.length === 1 && wordCount > 100) {
            issues.push({
                type: 'Wall of text',
                count: 1,
                severity: 'high',
                category: 'formatting',
                examples: ['Single paragraph with ' + wordCount + ' words']
            });
        }
        
        // Very long paragraphs (over 150 words each)
        const longParagraphs = paragraphs.filter(p => p.split(/\s+/).length > 150);
        if (longParagraphs.length > 0) {
            issues.push({
                type: 'Very long paragraphs',
                count: longParagraphs.length,
                severity: 'medium',
                category: 'formatting',
                examples: longParagraphs.slice(0, 2).map(p => p.substring(0, 50) + '...')
            });
        }
        
        // Missing line breaks between paragraphs (single newline instead of double)
        const singleNewlines = (text.match(/[^\n]\n[^\n\s]/g) || []).length;
        if (singleNewlines > 2 && paragraphs.length < 3) {
            issues.push({
                type: 'Missing paragraph breaks',
                count: singleNewlines,
                severity: 'medium',
                category: 'formatting',
                examples: ['Use double line breaks between paragraphs']
            });
        }
        
        // Multiple consecutive spaces
        const multipleSpaces = (text.match(/  +/g) || []);
        if (multipleSpaces.length > 2) {
            issues.push({
                type: 'Multiple consecutive spaces',
                count: multipleSpaces.length,
                severity: 'low',
                category: 'formatting',
                examples: multipleSpaces.slice(0, 3).map(() => '[double space]')
            });
        }
        
        // Leading/trailing whitespace on lines
        const whitespaceLines = lines.filter(l => l !== l.trim() && l.trim().length > 0);
        if (whitespaceLines.length > 3) {
            issues.push({
                type: 'Extra whitespace on lines',
                count: whitespaceLines.length,
                severity: 'low',
                category: 'formatting',
                examples: ['Lines with leading/trailing spaces']
            });
        }
        
        // Very long sentences (over 50 words without punctuation break)
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        const longSentences = sentences.filter(s => s.split(/\s+/).length > 50);
        if (longSentences.length > 0) {
            issues.push({
                type: 'Very long sentences',
                count: longSentences.length,
                severity: 'medium',
                category: 'formatting',
                examples: longSentences.slice(0, 2).map(s => s.trim().substring(0, 60) + '...')
            });
        }
        
        // Missing space after punctuation
        const missingSpaceAfterPunct = (text.match(/[.!?,;:][a-zA-Z]/g) || []);
        if (missingSpaceAfterPunct.length > 0) {
            issues.push({
                type: 'Missing space after punctuation',
                count: missingSpaceAfterPunct.length,
                severity: 'medium',
                category: 'formatting',
                examples: missingSpaceAfterPunct.slice(0, 3)
            });
        }
        
        return issues;
    }

    // Fix formatting issues
    function fixFormatting(text) {
        let fixed = text;
        
        // Fix multiple consecutive spaces
        fixed = fixed.replace(/  +/g, ' ');
        
        // Fix missing space after punctuation (but not in URLs or numbers)
        fixed = fixed.replace(/([.!?,;:])([a-zA-Z])/g, (match, punct, letter) => {
            // Don't fix if it looks like a URL or decimal
            if (punct === '.' && /\d/.test(letter)) return match;
            return punct + ' ' + letter;
        });
        
        // Trim whitespace from lines
        fixed = fixed.split('\n').map(line => line.trim()).join('\n');
        
        // Normalize paragraph breaks (ensure double newlines between paragraphs)
        fixed = fixed.replace(/\n{3,}/g, '\n\n');
        
        // Add paragraph breaks for wall of text (heuristic: after ~100 words if no breaks)
        const paragraphs = fixed.split(/\n\s*\n/).filter(p => p.trim());
        if (paragraphs.length === 1 && fixed.split(/\s+/).length > 100) {
            // Try to break at sentence boundaries roughly every 80-100 words
            const sentences = fixed.split(/(?<=[.!?])\s+/);
            let currentParagraph = [];
            let currentWordCount = 0;
            const newParagraphs = [];
            
            for (const sentence of sentences) {
                const sentenceWords = sentence.split(/\s+/).length;
                currentParagraph.push(sentence);
                currentWordCount += sentenceWords;
                
                if (currentWordCount >= 80) {
                    newParagraphs.push(currentParagraph.join(' '));
                    currentParagraph = [];
                    currentWordCount = 0;
                }
            }
            
            if (currentParagraph.length > 0) {
                newParagraphs.push(currentParagraph.join(' '));
            }
            
            if (newParagraphs.length > 1) {
                fixed = newParagraphs.join('\n\n');
            }
        }
        
        return fixed;
    }

    function detectSlop(text) {
        const issues = [];
        const categoryStats = {};

        // Check slop patterns
        for (const pattern of SLOP_PATTERNS) {
            const matches = text.match(pattern.pattern);
            if (matches) {
                const count = matches.length;
                const threshold = pattern.threshold || 1;

                if (count >= threshold) {
                    issues.push({
                        type: pattern.name,
                        count: count,
                        severity: pattern.severity,
                        category: pattern.category,
                        examples: matches.slice(0, 3)
                    });
                    
                    // Track category stats
                    categoryStats[pattern.category] = (categoryStats[pattern.category] || 0) + count;
                }
            }
        }
        
        // Formatting checks
        const formattingIssues = checkFormatting(text);
        issues.push(...formattingIssues);
        formattingIssues.forEach(issue => {
            categoryStats['formatting'] = (categoryStats['formatting'] || 0) + issue.count;
        });
        
        // Calculate overall slop score (0-100, lower is better)
        const criticalCount = issues.filter(i => i.severity === 'critical').reduce((sum, i) => sum + i.count, 0);
        const highCount = issues.filter(i => i.severity === 'high').reduce((sum, i) => sum + i.count, 0);
        const mediumCount = issues.filter(i => i.severity === 'medium').reduce((sum, i) => sum + i.count, 0);
        const lowCount = issues.filter(i => i.severity === 'low').reduce((sum, i) => sum + i.count, 0);
        
        const slopScore = Math.min(100, (criticalCount * 20) + (highCount * 10) + (mediumCount * 5) + (lowCount * 2));
        
        return {
            issues,
            categoryStats,
            slopScore,
            requiresFix: criticalCount > 0 || highCount > 2,
            summary: {
                critical: criticalCount,
                high: highCount,
                medium: mediumCount,
                low: lowCount
            }
        };
    }

    // Tier 1: Instant local fixes that don't need LLM
    function applyLocalFixes(text) {
        let fixed = text;
        let fixesApplied = [];
        
        // Em dash fixes - replace with appropriate punctuation
        // Pattern: "word—word" (no spaces) → "word, word" or "word - word"
        // Pattern: "word — word" (with spaces) → "word, word" or restructure
        const emDashCount = (fixed.match(/—/g) || []).length;
        if (emDashCount > 0) {
            // Em dash with spaces around it (parenthetical) → commas
            fixed = fixed.replace(/\s—\s/g, ', ');
            // Em dash at end of clause followed by explanation → colon or comma
            fixed = fixed.replace(/—(?=[A-Z])/g, '. ');
            // Em dash connecting words → comma
            fixed = fixed.replace(/—/g, ', ');
            // Clean up double commas
            fixed = fixed.replace(/,\s*,/g, ',');
            fixesApplied.push(`Removed ${emDashCount} em dash(es)`);
        }
        
        // En dash fixes
        const enDashCount = (fixed.match(/–/g) || []).length;
        if (enDashCount > 0) {
            // En dash used as em dash replacement
            fixed = fixed.replace(/\s–\s/g, ', ');
            fixed = fixed.replace(/–/g, '-');
            fixesApplied.push(`Removed ${enDashCount} en dash(es)`);
        }
        
        // Remove trailing engagement bait
        const engagementPatterns = [
            /\s*What do you think\??\s*$/i,
            /\s*Let me know (?:your thoughts|what you think|in the comments)!?\s*$/i,
            /\s*I['']d love (?:your take|to hear from you|your thoughts)!?\s*$/i,
            /\s*Thoughts\??\s*$/i,
            /\s*Agree or disagree\??\s*$/i,
            /\s*Share your (?:thoughts|experience|take)!?\s*$/i
        ];
        
        for (const pattern of engagementPatterns) {
            if (pattern.test(fixed)) {
                fixed = fixed.replace(pattern, '');
                fixesApplied.push('Removed trailing engagement bait');
                break;
            }
        }
        
        // Remove sycophantic openers
        const sycophantPatterns = [
            /^(?:Great question!|That's (?:a )?(?:great|excellent|fascinating|interesting) (?:question|point)!?)\s*/i,
            /^(?:Absolutely!|Definitely!|Of course!)\s*/i
        ];
        
        for (const pattern of sycophantPatterns) {
            if (pattern.test(fixed)) {
                fixed = fixed.replace(pattern, '');
                fixesApplied.push('Removed sycophantic opener');
                break;
            }
        }
        
        // Remove double exclamation marks
        if (/!!+/.test(fixed)) {
            fixed = fixed.replace(/!!+/g, '!');
            fixesApplied.push('Fixed excessive exclamation marks');
        }
        
        // Remove triple dots used excessively (keep single ellipsis)
        if (/\.{4,}/.test(fixed)) {
            fixed = fixed.replace(/\.{4,}/g, '...');
            fixesApplied.push('Fixed excessive ellipses');
        }
        
        // Apply formatting fixes
        const originalFormatting = fixed;
        fixed = fixFormatting(fixed);
        if (fixed !== originalFormatting) {
            fixesApplied.push('Fixed formatting issues');
        }
        
        return {
            text: fixed,
            fixesApplied,
            wasModified: fixesApplied.length > 0
        };
    }

    // Auto-fix slop by rewriting problematic text with comprehensive AI pattern removal
    async function fixSlop(text, apiConfig, slopResults) {
        // TIER 1: Apply instant local fixes first
        const localResult = applyLocalFixes(text);
        let fixedText = localResult.text;
        
        // Re-check after local fixes
        let recheck = detectSlop(fixedText);
        
        // If local fixes resolved the critical issues, return early
        if (!recheck.requiresFix) {
            console.log('[WriteMe] Local fixes sufficient:', localResult.fixesApplied);
            return fixedText;
        }
        
        // TIER 2: LLM fix for complex structural issues
        console.log('[WriteMe] Local fixes applied, but LLM fix needed for remaining issues');
        
        // Build a targeted fix prompt based on detected issues (use recheck results after local fixes)
        const detectedCategories = recheck?.categoryStats ? Object.keys(recheck.categoryStats) : [];
        const criticalIssues = recheck?.issues?.filter(i => i.severity === 'critical') || [];
        const highIssues = recheck?.issues?.filter(i => i.severity === 'high') || [];
        
        // Create specific examples from detected issues
        const specificExamples = [...criticalIssues, ...highIssues]
            .slice(0, 10)
            .map(issue => `- "${issue.examples?.[0] || issue.type}"`)
            .join('\n');

        const fixPrompt = `You are an expert human editor specializing in removing AI writing patterns. Your goal is to make text sound authentically human while preserving meaning and the writer's intended voice.

## DETECTED AI PATTERNS IN THIS TEXT:
${specificExamples || '(Multiple AI patterns detected)'}

## COMPREHENSIVE FIX INSTRUCTIONS:

### PUNCTUATION (Critical)
1. REMOVE ALL EM DASHES (—) AND EN DASHES (–)
   - Replace with commas, semicolons, periods, or restructure entirely
   - "The solution—which took months—worked" → "The solution, which took months, worked."
   - "And then it happened—everything changed" → "And then it happened. Everything changed."

### STRUCTURE (Critical)
2. ELIMINATE ANTITHETICAL CONSTRUCTIONS
   - "is not X but Y" → State what it IS directly
   - "It's not about the tech, it's about people" → "This is fundamentally about people."
   - "Less about X and more about Y" → "This focuses on Y."

3. FIX THIRD-PERSON SELF-REFERENCES
   - "The post explores" → "I explore" or "My post explores"
   - "This article discusses" → "I discuss"

4. REMOVE ALL LISTS
   - Convert bullet points and numbered lists to flowing prose
   - Integrate items naturally into paragraphs

### OPENERS & CLOSERS (Critical)
5. REMOVE LAZY DECLARATIVE OPENERS
   - "Here's the thing:" → Start with the actual point
   - "The bottom line:" → Make a direct statement
   - "Let me explain:" → Just explain
   - "Picture this:" → Start with the scene directly

6. REMOVE COLON DECLARATIONS
   - "The answer is simple: X" → "X works because..." (integrate naturally)
   - "My take: Y" → Just state Y as a direct opinion

7. REMOVE FORMULAIC CLOSERS
   - "In conclusion..." → Remove or make the final point directly
   - "What do you think?" → Remove engagement bait
   - "Let me know your thoughts!" → Remove

### TRANSITIONS (High)
8. REPLACE FORMULAIC TRANSITIONS
   - "However," → Restructure without transition or use natural flow
   - "Moreover," "Furthermore," "Additionally," → Cut or restructure
   - "That said," "To be fair," → Remove hedge

### TONE (Critical)
9. REMOVE SYCOPHANTIC PHRASES
   - "Great question!" → Remove entirely
   - "That's fascinating!" → Remove entirely
   - "I'd love your take" → Remove entirely

10. REMOVE META-COMMENTARY
    - "As I mentioned above" → Remove
    - "Let me break this down" → Just break it down
    - "This brings us to" → Remove, just move to next point

### RHETORICAL PATTERNS (High)
11. FIX RHETORICAL Q&A
    - "What does this mean? It means..." → "This means..."
    - Question then immediate answer → Direct statement

### VOCABULARY (Medium)
12. REDUCE AI VOCABULARY CLUSTERS
    - "leverage" → "use"
    - "utilize" → "use"
    - "landscape" → be specific (market, industry, field)
    - "journey" → be specific (process, experience, time)
    - "seamless/robust/comprehensive" → be specific

13. REDUCE INTENSIFIERS
    - "incredibly powerful" → "powerful" or be specific
    - "truly transformative" → describe the actual transformation

## RULES:
- Preserve the EXACT meaning and key information
- Match the writer's overall voice and formality level
- Vary sentence lengths naturally (some short, some long)
- Prefer active voice
- Be direct and specific
- If restructuring removes meaning, find another way to fix it

## TEXT TO FIX:
${fixedText}

Return ONLY the fixed text. No explanations, no comments, no "Here's the revised text:" prefix. Just output the improved content directly.`;

        try {
            const response = await ApiClient.sendRequest({
                ...apiConfig,
                systemMessage: 'You are a meticulous human editor. You remove AI writing patterns while preserving meaning and voice. Output ONLY the revised text with zero commentary or explanation.',
                userMessage: fixPrompt
            });

            // Clean up response - remove any AI-style prefixes
            let fixed = response.trim();
            fixed = fixed.replace(/^(Here'?s|Here is|Sure,? here'?s|I'?ve|Below is|The following is)[^:.\n]*[:.]\s*/i, '');
            fixed = fixed.replace(/^[\s\n]*"(.+)"[\s\n]*$/s, '$1'); // Remove wrapping quotes
            
            return fixed;
        } catch (err) {
            console.error('[WritingAnalyzer] Failed to fix slop:', err);
            return fixedText; // Return locally-fixed text if LLM fix fails
        }
    }

    /**
     * Smart content sampling to avoid overwhelming the model.
     * Takes representative portions from beginning, middle, and end of each sample.
     * This prevents the model from getting confused by seeing too much content
     * and outputting JSON that matches the content structure instead of our schema.
     */
    function smartSampleContent(samples, maxTotalChars, maxPerSample) {
        const sampleCount = samples.length;
        if (sampleCount === 0) return '';
        
        // Calculate how much space each sample gets
        const targetPerSample = Math.floor(maxTotalChars / sampleCount);
        const sampleLimit = Math.min(targetPerSample, maxPerSample);
        
        console.log(`[WritingAnalyzer] Smart sampling: ${sampleCount} samples, ${sampleLimit} chars each (max total: ${maxTotalChars})`);
        
        const sampledParts = [];
        
        samples.forEach((sample, index) => {
            const content = (sample.content || '').trim();
            const source = sample.source || `Sample ${index + 1}`;
            
            if (content.length === 0) return;
            
            let sampledText;
            
            if (content.length <= sampleLimit) {
                // Use full content if it fits
                sampledText = content;
            } else {
                // Take beginning, middle, and end for better representation
                const chunkSize = Math.floor(sampleLimit / 3);
                const middleStart = Math.floor((content.length - chunkSize) / 2);
                
                const beginning = content.substring(0, chunkSize);
                const middle = content.substring(middleStart, middleStart + chunkSize);
                const end = content.substring(content.length - chunkSize);
                
                // Find natural break points (sentences) where possible
                const cleanBeginning = trimToLastSentence(beginning);
                const cleanMiddle = trimToCompleteSentence(middle);
                const cleanEnd = trimFromFirstSentence(end);
                
                sampledText = `${cleanBeginning}\n\n[...]\n\n${cleanMiddle}\n\n[...]\n\n${cleanEnd}`;
            }
            
            sampledParts.push(`--- Sample ${index + 1}: ${truncateSource(source)} ---\n${sampledText}`);
        });
        
        return sampledParts.join('\n\n');
    }
    
    // Trim to the last complete sentence
    function trimToLastSentence(text) {
        const match = text.match(/^([\s\S]*[.!?])\s*[^.!?]*$/);
        return match ? match[1].trim() : text.trim();
    }
    
    // Trim to a complete sentence (find first and last sentence boundaries)
    function trimToCompleteSentence(text) {
        // Find first sentence start (after a period or start)
        const startMatch = text.match(/^[^.!?]*[.!?]\s*(.+)/s);
        const trimmedStart = startMatch ? startMatch[1] : text;
        
        // Find last sentence end
        return trimToLastSentence(trimmedStart);
    }
    
    // Trim from the first complete sentence
    function trimFromFirstSentence(text) {
        const match = text.match(/^[^.!?]*[.!?]\s*([\s\S]*)$/);
        return match ? match[1].trim() : text.trim();
    }
    
    // Truncate long source names
    function truncateSource(source) {
        if (source.length <= 40) return source;
        return source.substring(0, 37) + '...';
    }

    async function analyzeWriting(samples, apiConfig, options = {}) {
        console.log('[WritingAnalyzer] Starting analysis with', samples.length, 'samples');
        
        // Smart sampling: limit total content to avoid overwhelming the model
        // Truncate mode uses more aggressive limits
        const truncateMode = options.truncate === true;
        const MAX_TOTAL_CHARS = truncateMode ? 30000 : 60000; // 30K in truncate mode
        const MAX_PER_SAMPLE = truncateMode ? 4000 : 8000;    // 4K per sample in truncate mode
        
        if (truncateMode) {
            console.log('[WritingAnalyzer] TRUNCATE MODE: Using aggressive sampling limits');
        }
        
        const sampledContent = smartSampleContent(samples, MAX_TOTAL_CHARS, MAX_PER_SAMPLE);
        console.log('[WritingAnalyzer] Sampled content length:', sampledContent.length, 'characters');
        
        // Combine samples with clear separators
        const combinedSamples = sampledContent;
        console.log('[WritingAnalyzer] Combined samples length:', combinedSamples.length, 'characters');

        const userMessage = `Analyze these writing samples and create a detailed writing profile:

${combinedSamples}

Remember to return valid JSON matching the specified structure.`;

        console.log('[WritingAnalyzer] Sending request to API...');
        
        try {
            const response = await ApiClient.sendRequest({
                ...apiConfig,
                systemMessage: ANALYSIS_SYSTEM_PROMPT,
                userMessage: userMessage
            });

            console.log('[WritingAnalyzer] Received response, length:', response?.length || 0);
            console.log('[WritingAnalyzer] Response preview:', response?.substring(0, 200));

            // Parse the JSON response
            const profile = parseProfileResponse(response);
            console.log('[WritingAnalyzer] Parsed profile:', profile);
            
            // Validate that we got a real writing profile, not garbage
            const validation = validateProfileSchema(profile);
            if (!validation.valid) {
                console.error('[WritingAnalyzer] Profile schema validation failed:', validation.reason);
                console.error('[WritingAnalyzer] Invalid profile received:', JSON.stringify(profile).substring(0, 500));
                
                // The model returned wrong JSON structure - this is a critical error
                const error = new Error(`The AI returned an invalid response format. ${validation.reason} This can happen with smaller models or when processing large amounts of content. Please try again or use a different API provider.`);
                error.code = 'INVALID_PROFILE_SCHEMA';
                error.invalidProfile = profile;
                throw error;
            }
            
            return profile;
        } catch (err) {
            console.error('[WritingAnalyzer] API request failed:', err);
            throw err;
        }
    }

    // Validate that a parsed JSON object matches our expected profile schema
    function validateProfileSchema(profile) {
        if (!profile || typeof profile !== 'object') {
            return { valid: false, reason: 'Response is not an object.' };
        }
        
        // Check for obvious wrong structures (content-derived JSON)
        const wrongStructures = [
            'story', 'characters', 'scenes',  // Fiction structure
            'entries', 'changelog', 'date',   // Changelog structure  
            'title', 'firstName', 'lastName', // Contact/metadata
            'items', 'products', 'tasks',     // List structures
            'chapters', 'sections', 'content' // Document structure
        ];
        
        const topLevelKeys = Object.keys(profile);
        const hasWrongStructure = wrongStructures.some(key => 
            topLevelKeys.includes(key) && !topLevelKeys.includes('style') && !topLevelKeys.includes('tone')
        );
        
        if (hasWrongStructure) {
            return { 
                valid: false, 
                reason: `Response appears to match content structure (found keys: ${topLevelKeys.slice(0, 5).join(', ')}) rather than writing profile schema.`
            };
        }
        
        // Check for required profile fields - at least some should be present
        const profileIndicators = [
            'style', 'tone', 'vocabulary', 'structure', 'markers', 'patterns',
            'profile_summary', 'complexity_score', 'mastery_level', 'reading_level',
            'technical_level', 'voice_consistency', 'pattern_density'
        ];
        
        const matchingFields = profileIndicators.filter(field => profile.hasOwnProperty(field));
        
        if (matchingFields.length < 3) {
            return {
                valid: false,
                reason: `Response missing required profile fields. Only found ${matchingFields.length} profile indicators: ${matchingFields.join(', ') || 'none'}.`
            };
        }
        
        // Check that style/tone are objects if present
        if (profile.style && typeof profile.style !== 'object') {
            return { valid: false, reason: 'Style field is not an object.' };
        }
        
        if (profile.tone && typeof profile.tone !== 'object') {
            return { valid: false, reason: 'Tone field is not an object.' };
        }
        
        return { valid: true };
    }

    /**
     * Sanitize JSON string to fix common LLM escape character issues.
     * Fixes invalid escape sequences like \s, \m, etc.
     */
    function sanitizeJsonString(jsonStr) {
        // Fix invalid escape sequences inside strings
        // JSON only allows: \" \\ \/ \b \f \n \r \t \uXXXX
        // LLMs often output things like \s \m \w etc which are invalid
        
        let result = '';
        let inString = false;
        let i = 0;
        
        while (i < jsonStr.length) {
            const char = jsonStr[i];
            
            if (char === '"' && (i === 0 || jsonStr[i-1] !== '\\')) {
                inString = !inString;
                result += char;
                i++;
            } else if (inString && char === '\\' && i + 1 < jsonStr.length) {
                const nextChar = jsonStr[i + 1];
                // Valid JSON escapes
                if (nextChar === '"' || nextChar === '\\' || nextChar === '/' || 
                    nextChar === 'b' || nextChar === 'f' || nextChar === 'n' || 
                    nextChar === 'r' || nextChar === 't') {
                    result += char + nextChar;
                    i += 2;
                } else if (nextChar === 'u' && i + 5 < jsonStr.length) {
                    // Unicode escape \uXXXX
                    result += jsonStr.substring(i, i + 6);
                    i += 6;
                } else {
                    // Invalid escape - just include the character without backslash
                    // e.g., \s becomes s, \m becomes m
                    result += nextChar;
                    i += 2;
                }
            } else if (inString && (char === '\n' || char === '\r')) {
                // Replace actual newlines in strings with \n
                result += '\\n';
                i++;
            } else {
                result += char;
                i++;
            }
        }
        
        return result;
    }

    /**
     * More aggressive JSON repair for common LLM output issues.
     * Handles: trailing commas, truncated JSON, unbalanced brackets.
     */
    function repairJson(jsonStr) {
        let text = jsonStr;
        
        // Remove trailing commas before } or ]
        text = text.replace(/,(\s*[}\]])/g, '$1');
        
        // Fix unescaped double quotes inside strings (heuristic approach)
        // Look for patterns like: "value with "quote" in it"
        // This is tricky because we need to identify which quotes are structural
        
        // Count unbalanced brackets and try to close them
        let braceCount = 0;
        let bracketCount = 0;
        for (const char of text) {
            if (char === '{') braceCount++;
            else if (char === '}') braceCount--;
            else if (char === '[') bracketCount++;
            else if (char === ']') bracketCount--;
        }
        
        // Close unclosed brackets (truncated JSON)
        while (bracketCount > 0) {
            text += ']';
            bracketCount--;
        }
        while (braceCount > 0) {
            text += '}';
            braceCount--;
        }
        
        // Remove any text after the final closing brace
        const lastBrace = text.lastIndexOf('}');
        if (lastBrace !== -1 && lastBrace < text.length - 1) {
            text = text.substring(0, lastBrace + 1);
        }
        
        return text;
    }

    function parseProfileResponse(response) {
        console.log('[WritingAnalyzer] Parsing response...');
        let text = response.trim();

        // Strip markdown code fences
        text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
        
        // Also strip any code fences in the middle
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');

        // Try direct parse
        try {
            const parsed = JSON.parse(text);
            console.log('[WritingAnalyzer] Direct JSON parse successful');
            return parsed;
        } catch (e) { 
            console.log('[WritingAnalyzer] Direct parse failed:', e.message);
        }

        // Find first { ... last }
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
            const jsonSubstring = text.substring(firstBrace, lastBrace + 1);
            
            try {
                const parsed = JSON.parse(jsonSubstring);
                console.log('[WritingAnalyzer] Extracted JSON parse successful');
                return parsed;
            } catch (e) { 
                console.log('[WritingAnalyzer] Extracted JSON parse failed:', e.message);
            }
            
            // Try with sanitization for bad escape characters
            try {
                const sanitized = sanitizeJsonString(jsonSubstring);
                const parsed = JSON.parse(sanitized);
                console.log('[WritingAnalyzer] Sanitized JSON parse successful');
                return parsed;
            } catch (e) {
                console.log('[WritingAnalyzer] Sanitized JSON parse failed:', e.message);
            }
            
            // Try with repair for trailing commas, truncation, etc.
            try {
                const sanitized = sanitizeJsonString(jsonSubstring);
                const repaired = repairJson(sanitized);
                const parsed = JSON.parse(repaired);
                console.log('[WritingAnalyzer] Repaired JSON parse successful');
                return parsed;
            } catch (e) {
                console.log('[WritingAnalyzer] Repaired JSON parse failed:', e.message);
            }
            
            // Last resort: extract values using regex from malformed JSON
            const regexProfile = extractProfileFromMalformedJson(jsonSubstring);
            if (regexProfile) {
                console.log('[WritingAnalyzer] Regex extraction from malformed JSON successful');
                return regexProfile;
            }
        }
        
        // If the response is prose, try to extract useful info
        console.log('[WritingAnalyzer] Attempting to extract profile from prose...');
        const proseProfile = extractProfileFromProse(text);
        if (proseProfile.profile_summary !== 'The writing profile could not be fully analyzed.') {
            console.log('[WritingAnalyzer] Extracted profile from prose');
            return proseProfile;
        }

        // Return a basic structure if parsing fails
        console.error('[WritingAnalyzer] All parsing methods failed');
        return {
            mastery_level: 3,
            mastery_label: 'Competent',
            technical_level: 'Articulate',
            complexity_score: 5,
            voice_consistency: 5,
            lexical_diversity: 5,
            technical_density: 5,
            pattern_density: 3,
            emotional_resonance: 5,
            authenticity: 5,
            narrative_flow: 5,
            persuasive_clarity: 5,
            reading_level: 'Unable to determine',
            style: { summary: 'Analysis could not be parsed. Please try again with a different API provider.' },
            tone: { summary: 'Analysis could not be parsed.' },
            vocabulary: { summary: 'Analysis could not be parsed.' },
            structure: { summary: 'Analysis could not be parsed.' },
            markers: [],
            patterns: [],
            profile_summary: 'The writing profile could not be fully analyzed. The API returned prose instead of JSON. Try using a different model or API provider.'
        };
    }
    
    /**
     * Extract profile values from malformed JSON using regex.
     * Used when JSON parsing fails but the response contains valid-looking data.
     */
    function extractProfileFromMalformedJson(text) {
        // Helper to extract a number value
        const extractNumber = (key) => {
            const match = text.match(new RegExp(`"${key}"\\s*:\\s*(\\d+(?:\\.\\d+)?)`));
            return match ? parseFloat(match[1]) : null;
        };
        
        // Helper to extract a string value
        const extractString = (key) => {
            const match = text.match(new RegExp(`"${key}"\\s*:\\s*"([^"]*?)"`));
            return match ? match[1] : null;
        };
        
        // Helper to extract an array of strings
        const extractStringArray = (key) => {
            const match = text.match(new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]*?)\\]`));
            if (!match) return [];
            const items = match[1].match(/"([^"]*?)"/g);
            return items ? items.map(s => s.replace(/"/g, '')) : [];
        };
        
        // Try to extract main fields
        const masteryLevel = extractNumber('mastery_level');
        const masteryLabel = extractString('mastery_label');
        const technicalLevel = extractString('technical_level');
        const complexityScore = extractNumber('complexity_score');
        const voiceConsistency = extractNumber('voice_consistency');
        
        // If we can't even get basic fields, return null
        if (!masteryLabel && !technicalLevel && !complexityScore) {
            return null;
        }
        
        // Build profile from extracted values
        const profile = {
            mastery_level: masteryLevel || 4,
            mastery_label: masteryLabel || 'Proficient',
            technical_level: technicalLevel || 'Articulate',
            complexity_score: complexityScore || 6,
            voice_consistency: voiceConsistency || extractNumber('voice_consistency') || 6,
            lexical_diversity: extractNumber('lexical_diversity') || 6,
            technical_density: extractNumber('technical_density') || 5,
            pattern_density: extractNumber('pattern_density') || 5,
            emotional_resonance: extractNumber('emotional_resonance') || 6,
            authenticity: extractNumber('authenticity') || 6,
            narrative_flow: extractNumber('narrative_flow') || 6,
            persuasive_clarity: extractNumber('persuasive_clarity') || 6,
            style: {
                formality: extractString('formality') || 'semi-formal',
                descriptiveness: extractString('descriptiveness') || 'moderate',
                directness: extractString('directness') || 'direct',
                perspective: extractString('perspective') || 'first person',
                summary: extractString('summary') || 'Style extracted from partial JSON data.'
            },
            tone: {
                primary: extractString('primary') || 'professional',
                secondary: extractStringArray('secondary'),
                emotional_register: extractString('emotional_register') || 'neutral',
                summary: ''
            },
            vocabulary: {
                complexity: extractString('complexity') || 'moderate',
                characteristic_words: extractStringArray('characteristic_words'),
                phrases: extractStringArray('phrases'),
                summary: ''
            },
            structure: {
                sentence_length: extractString('sentence_length') || 'varied',
                variety: extractString('variety') || 'mixed',
                paragraph_style: extractString('paragraph_style') || 'focused',
                summary: ''
            },
            markers: [],
            patterns: extractStringArray('patterns'),
            profile_summary: extractString('profile_summary') || 'Profile extracted from partially valid JSON response.'
        };
        
        // Try to extract markers array (more complex structure)
        const markersMatch = text.match(/"markers"\s*:\s*\[([\s\S]*?)\]/);
        if (markersMatch) {
            const markerItems = markersMatch[1].match(/\{[^}]+\}/g);
            if (markerItems) {
                profile.markers = markerItems.map(item => {
                    const typeMatch = item.match(/"type"\s*:\s*"([^"]+)"/);
                    const descMatch = item.match(/"description"\s*:\s*"([^"]+)"/);
                    return {
                        type: typeMatch ? typeMatch[1] : 'general',
                        description: descMatch ? descMatch[1] : ''
                    };
                }).filter(m => m.description);
            }
        }
        
        return profile;
    }
    
    function extractProfileFromProse(text) {
        // Try to extract useful information from prose response
        const profile = {
            mastery_level: 4,
            mastery_label: 'Proficient',
            technical_level: 'Refined',
            complexity_score: 7,
            voice_consistency: 6,
            lexical_diversity: 6,
            technical_density: 5,
            pattern_density: 5,
            emotional_resonance: 6,
            authenticity: 6,
            narrative_flow: 6,
            persuasive_clarity: 6,
            reading_level: 'College level',
            style: { summary: '' },
            tone: { summary: '' },
            vocabulary: { summary: '', characteristic_words: [], phrases: [] },
            structure: { summary: '' },
            markers: [],
            patterns: [],
            profile_summary: ''
        };
        
        // Try to detect mastery level from prose
        if (/master|exceptional|transcendent|signature|instantly recognizable/i.test(text)) {
            profile.mastery_level = 6;
            profile.mastery_label = 'Masterful';
        } else if (/expert|sophisticated|deep mastery|distinctive voice/i.test(text)) {
            profile.mastery_level = 5;
            profile.mastery_label = 'Expert';
        } else if (/proficient|consistent|intuitive|holistic/i.test(text)) {
            profile.mastery_level = 4;
            profile.mastery_label = 'Proficient';
        } else if (/competent|deliberate|organized|clear purpose/i.test(text)) {
            profile.mastery_level = 3;
            profile.mastery_label = 'Competent';
        } else if (/emerging|developing|beginning|basic/i.test(text)) {
            profile.mastery_level = 2;
            profile.mastery_label = 'Emerging';
        }
        
        // Try to detect technical level from prose (using new descriptive labels)
        if (/specialized|expert.*discourse|maximum density|technical jargon/i.test(text)) {
            profile.technical_level = 'Specialized';
        } else if (/graduate|scholarly|academic rigor|technical precision/i.test(text)) {
            profile.technical_level = 'Scholarly';
        } else if (/elevated|complex ideas|rich vocabulary|undergraduate|college/i.test(text)) {
            profile.technical_level = 'Elevated';
        } else if (/refined|sophisticated|nuanced|deliberate rhythm/i.test(text)) {
            profile.technical_level = 'Refined';
        } else if (/articulate|polished|thoughtful|confident voice/i.test(text)) {
            profile.technical_level = 'Articulate';
        } else if (/conversational|natural flow|balanced|engaging/i.test(text)) {
            profile.technical_level = 'Conversational';
        } else if (/accessible|clear|direct|simple|broad audience/i.test(text)) {
            profile.technical_level = 'Accessible';
        }
        
        // Extract style info
        const styleMatch = text.match(/(?:style|formality|writing style)[:\s]*([^.]+\.)/i);
        if (styleMatch) profile.style.summary = styleMatch[1].trim();
        
        // Extract tone info
        const toneMatch = text.match(/(?:tone|voice)[:\s]*([^.]+\.)/i);
        if (toneMatch) {
            profile.tone.summary = toneMatch[1].trim();
            profile.tone.primary = toneMatch[1].split(/[,;]/)[0].trim().toLowerCase();
        }
        
        // Extract vocabulary patterns
        const vocabMatch = text.match(/(?:vocabulary|word choice|lexical)[:\s]*([^.]+\.)/i);
        if (vocabMatch) profile.vocabulary.summary = vocabMatch[1].trim();
        
        // Look for quoted phrases
        const phrases = text.match(/"([^"]+)"/g);
        if (phrases) {
            profile.vocabulary.phrases = phrases.slice(0, 10).map(p => p.replace(/"/g, ''));
        }
        
        // Try to build a profile summary from the text
        const paragraphs = text.split(/\n\n+/);
        if (paragraphs.length > 0) {
            // Use first substantial paragraph as summary
            const summary = paragraphs.find(p => p.length > 100 && !p.startsWith('#'));
            if (summary) {
                profile.profile_summary = summary.substring(0, 500).trim();
            }
        }
        
        // If we couldn't extract anything useful, return indication
        if (!profile.profile_summary && !profile.style.summary && !profile.tone.summary) {
            profile.profile_summary = 'The writing profile could not be fully analyzed.';
        }
        
        return profile;
    }

    async function generateContent(profile, prompt, contentType, apiConfig, platformContext = '') {
        let systemPrompt = getGenerationSystemPrompt(profile, contentType);

        // Append platform-specific context if provided
        if (platformContext) {
            systemPrompt += platformContext;
        }

        const userMessage = `Generate the following content in this writer's voice:

${prompt}

Remember: Write ONLY the content. No meta-commentary. Avoid all AI writing patterns. Make it sound authentically human.`;

        const response = await ApiClient.sendRequest({
            ...apiConfig,
            systemMessage: systemPrompt,
            userMessage: userMessage
        });

        // Clean up the response
        let content = response.trim();

        // Remove any "Here's..." prefix that might slip through
        content = content.replace(/^(Here'?s|Here is|Sure,? here'?s)[^:]*:\s*/i, '');

        return content;
    }

    function calculateStats(samples) {
        let totalWords = 0;
        let totalChars = 0;

        samples.forEach(sample => {
            const text = sample.content || '';
            totalChars += text.length;
            totalWords += text.split(/\s+/).filter(w => w.length > 0).length;
        });

        return { totalWords, totalChars };
    }

    function profileToPromptText(profile) {
        // Convert the profile to a usable system prompt for other tools
        return `# Writing Style Profile

## Summary
${profile.profile_summary || 'No summary available.'}

## Style Characteristics
- Formality: ${profile.style?.formality || 'Not specified'}
- Descriptiveness: ${profile.style?.descriptiveness || 'Not specified'}
- Directness: ${profile.style?.directness || 'Not specified'}
- Perspective: ${profile.style?.perspective || 'Not specified'}
${profile.style?.summary ? `\n${profile.style.summary}` : ''}

## Tone & Voice
- Primary tone: ${profile.tone?.primary || 'Not specified'}
- Secondary tones: ${(profile.tone?.secondary || []).join(', ') || 'None'}
- Emotional register: ${profile.tone?.emotional_register || 'Not specified'}
${profile.tone?.summary ? `\n${profile.tone.summary}` : ''}

## Vocabulary
- Complexity: ${profile.vocabulary?.complexity || 'Not specified'}
- Characteristic words: ${(profile.vocabulary?.characteristic_words || []).join(', ') || 'None identified'}
- Signature phrases: ${(profile.vocabulary?.phrases || []).join('; ') || 'None identified'}
${profile.vocabulary?.summary ? `\n${profile.vocabulary.summary}` : ''}

## Sentence Structure
- Sentence length tendency: ${profile.structure?.sentence_length || 'Not specified'}
- Variety: ${profile.structure?.variety || 'Not specified'}
- Paragraph style: ${profile.structure?.paragraph_style || 'Not specified'}
${profile.structure?.summary ? `\n${profile.structure.summary}` : ''}

## Stylistic Markers
${(profile.markers || []).map(m => `- ${m.type}: ${m.description}`).join('\n') || 'None identified'}

## Patterns to Replicate
${(profile.patterns || []).map(p => `- ${p}`).join('\n') || 'None identified'}

## Writing Guidelines
When writing in this style:
1. Match the formality and tone described above
2. Use vocabulary complexity appropriate to the profile
3. Follow the sentence structure patterns
4. Incorporate the characteristic phrases naturally
5. Maintain consistency with the identified stylistic markers
6. AVOID: em dashes, antithetical constructions, lists, formulaic transitions, and other AI patterns`;
    }

    return {
        analyzeWriting,
        generateContent,
        detectSlop,
        fixSlop,
        calculateStats,
        profileToPromptText
    };
})();
