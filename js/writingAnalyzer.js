const WritingAnalyzer = (() => {
    // System prompt for analyzing writing samples
    const ANALYSIS_SYSTEM_PROMPT = `You are an expert writing analyst specializing in stylistic analysis and voice profiling. Your task is to analyze writing samples and create a comprehensive writing profile.

Analyze the following aspects in detail:

1. STYLE CHARACTERISTICS
- Formality level (formal, semi-formal, casual, conversational)
- Descriptiveness (sparse, moderate, rich, ornate)
- Directness (direct, measured, indirect, circumlocutory)
- Perspective (first person, second person, third person, mixed)

2. TONE & VOICE
- Primary tone (professional, friendly, authoritative, humorous, serious, warm, detached, etc.)
- Emotional register (neutral, passionate, reserved, enthusiastic, contemplative)
- Voice consistency across samples

3. VOCABULARY
- Word complexity level (simple, moderate, sophisticated, technical)
- Reading level estimate (e.g., "Grade 8", "College level", "Professional")
- Characteristic word choices and phrases
- Use of jargon, idioms, or specialized terminology
- Average word length tendencies

4. SENTENCE STRUCTURE
- Average sentence length tendency (short, medium, long, varied)
- Sentence variety (simple, compound, complex patterns)
- Paragraph structure patterns
- Use of fragments or run-ons (intentional stylistic choices)

5. STYLISTIC MARKERS (unique to this writer)
- Signature phrases or expressions
- Opening and closing patterns
- Transition styles
- Punctuation preferences (comma usage, semicolons, dashes, etc.)
- Capitalization patterns

6. PATTERNS TO REPLICATE
- Key phrases or constructions that define this voice
- Rhythmic patterns in the prose
- How the writer builds arguments or narratives
- How the writer handles emphasis

Return your analysis as valid JSON with this exact structure:
{
    "complexity_score": <number 1-10>,
    "reading_level": "<string describing reading level>",
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
        const contentTypeInstructions = {
            'social-personal': 'Generate content for personal social media (X, Instagram, Twitter). Keep it casual, engaging, authentic. Aim for 1-3 short paragraphs maximum.',
            'social-professional': 'Generate content for professional social media (LinkedIn). Maintain professionalism while keeping authenticity. Typically 2-4 paragraphs.',
            'blog-personal': 'Generate content for a personal blog. Conversational, story-driven, allows for personal anecdotes and reflections. Can be multiple paragraphs.',
            'blog-professional': 'Generate content for a professional blog. Informative, expertise-focused, authoritative but accessible. Multiple well-structured paragraphs.',
            'long-form': 'Generate long-form content such as articles or essays. Sustained arguments, detailed exploration, multiple sections if needed.',
            'creative': 'Generate creative writing. Narrative focus, experimental where appropriate to the style, emphasis on voice and rhythm.'
        };

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

${contentTypeInstructions[contentType] || contentTypeInstructions['blog-personal']}

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

    // Slop detection patterns - comprehensive list based on real AI writing issues
    const SLOP_PATTERNS = [
        // High severity - must be fixed
        { name: 'Em dashes', pattern: /—/g, severity: 'high' },
        { name: 'En dashes used as em dashes', pattern: /\s–\s/g, severity: 'high' },
        { name: 'Hyphen dashes', pattern: /\s-\s(?=[A-Z])/g, severity: 'high' }, // " - Something"
        
        // Antithetical constructions - very common AI pattern
        { name: 'Antithetical (not X but Y)', pattern: /\b(is|are|was|were|isn't|aren't|wasn't|weren't) not ([\w\s]+?) but (the |a |an )?[\w]/gi, severity: 'high' },
        { name: 'Antithetical (it\'s not about)', pattern: /\b(it'?s|this is|that'?s) not (about |just |only )?[\w\s]+,\s*(it'?s|this is|that'?s)/gi, severity: 'high' },
        { name: 'Antithetical (not just X)', pattern: /\bnot just\b[^.]*\bbut (also )?\b/gi, severity: 'medium' },
        
        // Third person self-reference (should be "my" not "the")
        { name: 'Third person self-reference', pattern: /\b(The|This|That) (post|article|blog|essay|piece|write-up) (walks|goes|takes|dives|delves|looks|explores|examines|discusses|covers|explains)/gi, severity: 'high' },
        
        // Formulaic transitions
        { name: 'Formulaic transition', pattern: /\b(However|Moreover|Furthermore|In conclusion|That said|To be fair|Interestingly|Notably|Additionally|Consequently|Nevertheless),/g, severity: 'medium' },
        
        // Singleton openers
        { name: 'Singleton opener', pattern: /^(Here'?s the thing|The bottom line|Let me be clear|Here'?s what|Simply put|Look|The reality is|The truth is|At the end of the day)[.:,]/gm, severity: 'high' },
        
        // AI-specific phrases
        { name: 'AI request acknowledgment', pattern: /\b(I'?d love (your|to hear)|Great question|That'?s (a|an) (great|excellent|fascinating|important) (question|point|topic))/gi, severity: 'high' },
        { name: 'Formulaic conclusions', pattern: /\b(In summary|To sum up|All in all|In essence|At its core|When all is said and done)\b/gi, severity: 'medium' },
        
        // Rhetorical patterns
        { name: 'Rhetorical Q&A', pattern: /\?[\s\n]+(It |This |That |The answer |Well, )(is|means|comes down to)/g, severity: 'medium' },
        
        // Lists and structure
        { name: 'Bullet/numbered list', pattern: /^[\s]*[-•*]\s|^\s*\d+\.\s/gm, severity: 'high' },
        
        // Excessive punctuation
        { name: 'Excessive exclamation', pattern: /!/g, severity: 'low', threshold: 2 },
        
        // Hedge words
        { name: 'Hedge words', pattern: /\b(perhaps|maybe|might|could potentially|it seems|arguably|presumably)\b/gi, severity: 'low', threshold: 3 },
        
        // Overly formal AI phrasing
        { name: 'Overly formal phrasing', pattern: /\b(it is worth noting|it bears mentioning|one might argue|it should be noted|it is important to)\b/gi, severity: 'medium' },
        
        // Common AI intensifiers
        { name: 'AI intensifiers', pattern: /\b(incredibly|extremely|absolutely|truly|deeply|genuinely|actually|literally|certainly)\b/gi, severity: 'low', threshold: 3 }
    ];

    function detectSlop(text) {
        const issues = [];

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
                        examples: matches.slice(0, 3)
                    });
                }
            }
        }

        return issues;
    }

    // Auto-fix slop by rewriting problematic text
    async function fixSlop(text, apiConfig) {
        const fixPrompt = `You are an expert editor. The following text contains AI writing patterns that need to be fixed. Rewrite the text to sound more natural and human while preserving the exact meaning and voice.

FIX THESE SPECIFIC ISSUES:
1. Remove ALL em dashes (—) and en dashes (–). Replace with commas, semicolons, periods, or restructure sentences.
2. Remove ALL antithetical constructions like "is not X but Y" or "It's not about X, it's about Y". Rewrite as direct statements.
3. Change third-person references like "The post walks through" to first-person like "I walk through" or "my post walks through".
4. Remove formulaic transitions (However, Moreover, Furthermore, etc.). Use natural connectors or restructure.
5. Remove singleton openers (Here's the thing, The bottom line, etc.). Start with substantive content.
6. Remove rhetorical questions followed by answers. Make direct statements instead.
7. Write in flowing prose. Never use bullet points, numbered lists, or tables.
8. Remove hedge words (perhaps, maybe, might) where possible. Be direct.
9. Remove sycophantic phrases (Great question, That's fascinating, etc.).

TEXT TO FIX:
${text}

Return ONLY the fixed text. No explanations, no meta-commentary. Just the improved content.`;

        try {
            const response = await ApiClient.sendRequest({
                ...apiConfig,
                systemMessage: 'You are a meticulous editor who removes AI writing patterns. Output only the revised text with no commentary.',
                userMessage: fixPrompt
            });

            // Clean up response
            let fixed = response.trim();
            fixed = fixed.replace(/^(Here'?s|Here is|Sure,? here'?s)[^:]*:\s*/i, '');
            
            return fixed;
        } catch (err) {
            console.error('[WritingAnalyzer] Failed to fix slop:', err);
            return text; // Return original if fix fails
        }
    }

    async function analyzeWriting(samples, apiConfig) {
        console.log('[WritingAnalyzer] Starting analysis with', samples.length, 'samples');
        
        const combinedSamples = samples.map((s, i) => `--- Sample ${i + 1} ---\n${s.content}`).join('\n\n');
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
            return profile;
        } catch (err) {
            console.error('[WritingAnalyzer] API request failed:', err);
            throw err;
        }
    }

    function parseProfileResponse(response) {
        console.log('[WritingAnalyzer] Parsing response...');
        let text = response.trim();

        // Strip markdown code fences
        text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');

        // Try direct parse
        try {
            return JSON.parse(text);
        } catch { /* continue */ }

        // Find first { ... last }
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
            try {
                return JSON.parse(text.substring(firstBrace, lastBrace + 1));
            } catch { /* continue */ }
        }

        // Return a basic structure if parsing fails
        return {
            complexity_score: 5,
            reading_level: 'Unable to determine',
            style: { summary: 'Analysis could not be parsed. Please try again.' },
            tone: { summary: 'Analysis could not be parsed.' },
            vocabulary: { summary: 'Analysis could not be parsed.' },
            structure: { summary: 'Analysis could not be parsed.' },
            markers: [],
            patterns: [],
            profile_summary: 'The writing profile could not be fully analyzed. Please try with different samples.'
        };
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
