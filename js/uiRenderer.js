const UIRenderer = (() => {
    // Authors data cache
    let authorsData = null;
    let authorsLoading = false;
    let authorsLoadPromise = null;

    // Load authors data from JSON
    async function loadAuthors() {
        if (authorsData) return authorsData;
        if (authorsLoadPromise) return authorsLoadPromise;
        
        authorsLoading = true;
        console.log('[WriteMe] Loading authors data...');
        authorsLoadPromise = fetch('data/authors.json')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                authorsData = data;
                authorsLoading = false;
                console.log('[WriteMe] Loaded', data.authors?.length || 0, 'authors');
                return data;
            })
            .catch(err => {
                console.warn('[WriteMe] Failed to load authors data:', err);
                authorsLoading = false;
                return null;
            });
        
        return authorsLoadPromise;
    }

    // Calculate similarity score between user profile and author
    function calculateAuthorSimilarity(profile, author, weights) {
        let score = 0;
        let maxScore = 0;

        // Formality match
        if (profile.style?.formality && author.style?.formality) {
            maxScore += weights.formality;
            if (normalizeStyle(profile.style.formality) === normalizeStyle(author.style.formality)) {
                score += weights.formality;
            } else if (isCloseMatch(profile.style.formality, author.style.formality, 'formality')) {
                score += weights.formality * 0.5;
            }
        }

        // Primary tone match
        if (profile.tone?.primary && author.tone?.primary) {
            maxScore += weights.tone_primary;
            if (normalizeStyle(profile.tone.primary) === normalizeStyle(author.tone.primary)) {
                score += weights.tone_primary;
            } else if (isCloseMatch(profile.tone.primary, author.tone.primary, 'tone')) {
                score += weights.tone_primary * 0.5;
            }
        }

        // Secondary tone match
        if (profile.tone?.secondary && author.tone?.secondary) {
            const profileSecondary = Array.isArray(profile.tone.secondary) 
                ? profile.tone.secondary 
                : [profile.tone.secondary];
            const authorSecondary = Array.isArray(author.tone.secondary)
                ? author.tone.secondary
                : [author.tone.secondary];
            
            maxScore += weights.tone_secondary;
            const matches = profileSecondary.filter(t => 
                authorSecondary.some(at => normalizeStyle(t) === normalizeStyle(at))
            ).length;
            if (matches > 0) {
                score += weights.tone_secondary * Math.min(1, matches / 2);
            }
        }

        // Vocabulary complexity match
        if (profile.vocabulary?.complexity && author.vocabulary?.complexity) {
            maxScore += weights.vocabulary_complexity;
            if (normalizeStyle(profile.vocabulary.complexity) === normalizeStyle(author.vocabulary.complexity)) {
                score += weights.vocabulary_complexity;
            } else if (isCloseMatch(profile.vocabulary.complexity, author.vocabulary.complexity, 'vocabulary')) {
                score += weights.vocabulary_complexity * 0.5;
            }
        }

        // Sentence length match
        if (profile.structure?.sentence_length && author.structure?.sentence_length) {
            maxScore += weights.sentence_length;
            if (normalizeStyle(profile.structure.sentence_length) === normalizeStyle(author.structure.sentence_length)) {
                score += weights.sentence_length;
            } else if (isCloseMatch(profile.structure.sentence_length, author.structure.sentence_length, 'length')) {
                score += weights.sentence_length * 0.5;
            }
        }

        // Directness match
        if (profile.style?.directness && author.style?.directness) {
            maxScore += weights.directness;
            if (normalizeStyle(profile.style.directness) === normalizeStyle(author.style.directness)) {
                score += weights.directness;
            }
        }

        // Emotional register match
        if (profile.tone?.emotional_register && author.tone?.emotional_register) {
            maxScore += weights.emotional_register;
            if (normalizeStyle(profile.tone.emotional_register) === normalizeStyle(author.tone.emotional_register)) {
                score += weights.emotional_register;
            } else if (isCloseMatch(profile.tone.emotional_register, author.tone.emotional_register, 'register')) {
                score += weights.emotional_register * 0.5;
            }
        }

        return maxScore > 0 ? score / maxScore : 0;
    }

    // Normalize style strings for comparison
    function normalizeStyle(str) {
        if (!str) return '';
        return str.toLowerCase().trim().replace(/[-_]/g, ' ');
    }

    // Check if two style values are close matches
    function isCloseMatch(value1, value2, category) {
        const v1 = normalizeStyle(value1);
        const v2 = normalizeStyle(value2);

        const closeMatches = {
            formality: [
                ['casual', 'conversational', 'informal'],
                ['formal', 'literary', 'academic'],
                ['moderate', 'balanced']
            ],
            tone: [
                ['conversational', 'casual', 'friendly', 'warm'],
                ['epic', 'mythic', 'grand', 'heroic'],
                ['dark', 'gritty', 'bleak', 'macabre'],
                ['witty', 'satirical', 'humorous', 'ironic'],
                ['poetic', 'lyrical', 'romantic'],
                ['introspective', 'philosophical', 'meditative']
            ],
            vocabulary: [
                ['simple', 'accessible', 'plain'],
                ['sophisticated', 'complex', 'ornate', 'antiquated'],
                ['moderate', 'varied', 'balanced']
            ],
            length: [
                ['short', 'brief', 'clipped'],
                ['medium', 'moderate', 'balanced', 'varied'],
                ['long', 'flowing', 'very long']
            ],
            register: [
                ['passionate', 'intense', 'heightened', 'visceral'],
                ['restrained', 'controlled', 'understated'],
                ['warm', 'intimate', 'accessible', 'friendly'],
                ['elevated', 'grand', 'epic']
            ]
        };

        const groups = closeMatches[category] || [];
        for (const group of groups) {
            if (group.includes(v1) && group.includes(v2)) {
                return true;
            }
        }
        return false;
    }

    // Find similar authors for a profile
    async function findSimilarAuthors(profile, maxResults = 3) {
        const data = await loadAuthors();
        if (!data || !data.authors) return [];

        const weights = data.matching_weights || {
            formality: 1.5,
            tone_primary: 2.0,
            tone_secondary: 1.0,
            vocabulary_complexity: 1.5,
            sentence_length: 1.2,
            directness: 1.0,
            emotional_register: 1.3
        };

        const scoredAuthors = data.authors.map(author => ({
            author,
            score: calculateAuthorSimilarity(profile, author, weights)
        }));

        // Sort by score descending
        scoredAuthors.sort((a, b) => b.score - a.score);

        // Log top scores for debugging
        console.log('[WriteMe] Top author matches:', scoredAuthors.slice(0, 5).map(s => `${s.author.name}: ${(s.score * 100).toFixed(0)}%`));

        // Return top matches with score above threshold (lowered to 0.15 for better matches)
        const threshold = 0.15;
        return scoredAuthors
            .filter(item => item.score >= threshold)
            .slice(0, maxResults);
    }

    // Find shared traits between profile and author
    function findSharedTraits(profile, author) {
        const traits = [];

        // Check formality
        if (profile.style?.formality && author.style?.formality) {
            if (normalizeStyle(profile.style.formality) === normalizeStyle(author.style.formality)) {
                traits.push(profile.style.formality + ' style');
            }
        }

        // Check tone
        if (profile.tone?.primary && author.tone?.primary) {
            if (normalizeStyle(profile.tone.primary) === normalizeStyle(author.tone.primary)) {
                traits.push(profile.tone.primary + ' tone');
            }
        }

        // Check secondary tones
        if (profile.tone?.secondary && author.tone?.secondary) {
            const profileSecondary = Array.isArray(profile.tone.secondary) 
                ? profile.tone.secondary.map(normalizeStyle)
                : [normalizeStyle(profile.tone.secondary)];
            const authorSecondary = Array.isArray(author.tone.secondary)
                ? author.tone.secondary.map(normalizeStyle)
                : [normalizeStyle(author.tone.secondary)];
            
            for (const tone of profileSecondary) {
                if (authorSecondary.includes(tone) && !traits.some(t => t.includes(tone))) {
                    traits.push(tone + ' undertones');
                }
            }
        }

        // Check vocabulary
        if (profile.vocabulary?.complexity && author.vocabulary?.complexity) {
            if (normalizeStyle(profile.vocabulary.complexity) === normalizeStyle(author.vocabulary.complexity)) {
                traits.push(profile.vocabulary.complexity + ' vocabulary');
            }
        }

        // Check sentence structure
        if (profile.structure?.sentence_length && author.structure?.sentence_length) {
            if (normalizeStyle(profile.structure.sentence_length) === normalizeStyle(author.structure.sentence_length)) {
                traits.push(profile.structure.sentence_length + ' sentences');
            }
        }

        // Check directness
        if (profile.style?.directness && author.style?.directness) {
            if (normalizeStyle(profile.style.directness) === normalizeStyle(author.style.directness)) {
                traits.push(profile.style.directness + ' approach');
            }
        }

        return traits.slice(0, 4); // Limit to 4 traits
    }

    // Render similar authors section
    async function renderSimilarAuthors(profile) {
        console.log('[WriteMe] renderSimilarAuthors called');
        const container = document.getElementById('similar-authors');
        const content = document.getElementById('similar-authors-content');
        
        if (!container || !content) {
            console.log('[WriteMe] Similar authors container not found');
            return;
        }

        // Show loading state
        container.classList.remove('hidden');
        content.innerHTML = '<div class="similar-authors-loading">Finding similar authors...</div>';

        try {
            const matches = await findSimilarAuthors(profile, 2);
            console.log('[WriteMe] Similar authors matches:', matches.length);

            if (matches.length === 0) {
                container.classList.add('hidden');
                return;
            }

            let html = '';
            for (const match of matches) {
                const author = match.author;
                const sharedTraits = findSharedTraits(profile, author);
                const confidence = Math.round(match.score * 100);

                html += `
                    <div class="similar-author-card">
                        <div class="similar-author-main">
                            <span class="similar-author-name">${escapeHtml(author.name)}</span>
                            <span class="similar-author-genre">${escapeHtml(author.genre)}</span>
                        </div>
                        ${sharedTraits.length > 0 ? `
                            <div class="similar-author-traits">
                                <span class="traits-label">You both share:</span>
                                <span class="traits-list">${sharedTraits.map(t => escapeHtml(t)).join(', ')}</span>
                            </div>
                        ` : ''}
                        <div class="similar-author-desc">${escapeHtml(author.description)}</div>
                    </div>
                `;
            }

            content.innerHTML = html;
        } catch (err) {
            console.error('[WriteMe] Error finding similar authors:', err);
            container.classList.add('hidden');
        }
    }

    // Render similar authors in modal
    async function renderSimilarAuthorsInModal(profile) {
        const container = document.getElementById('similar-authors-modal');
        if (!container) return;

        try {
            const matches = await findSimilarAuthors(profile, 2);

            if (matches.length === 0) {
                container.innerHTML = '';
                return;
            }

            let html = '<div class="similar-authors">';
            html += '<div class="similar-authors-header"><span class="similar-authors-label">You Write Like</span></div>';
            html += '<div class="similar-authors-content">';
            
            for (const match of matches) {
                const author = match.author;
                const sharedTraits = findSharedTraits(profile, author);

                html += `
                    <div class="similar-author-card">
                        <div class="similar-author-main">
                            <span class="similar-author-name">${escapeHtml(author.name)}</span>
                            <span class="similar-author-genre">${escapeHtml(author.genre)}</span>
                        </div>
                        ${sharedTraits.length > 0 ? `
                            <div class="similar-author-traits">
                                <span class="traits-label">You both share:</span>
                                <span class="traits-list">${sharedTraits.map(t => escapeHtml(t)).join(', ')}</span>
                            </div>
                        ` : ''}
                        <div class="similar-author-desc">${escapeHtml(author.description)}</div>
                    </div>
                `;
            }
            
            html += '</div></div>';
            container.innerHTML = html;
        } catch (err) {
            console.error('[WriteMe] Error rendering similar authors in modal:', err);
            container.innerHTML = '';
        }
    }

    function renderProfile(profile, container) {
        // Find and display similar authors (async, non-blocking)
        renderSimilarAuthors(profile);

        // Mastery level (Dreyfus-based) - fallback to complexity-based estimation
        const masteryEl = document.getElementById('mastery-level');
        if (masteryEl) {
            const masteryLabel = profile.mastery_label || getMasteryFromComplexity(profile.complexity_score);
            masteryEl.textContent = masteryLabel;
        }

        // Technical level (grade-based) - fallback to reading_level
        const technicalEl = document.getElementById('technical-level');
        if (technicalEl) {
            technicalEl.textContent = profile.technical_level || profile.reading_level || 'Unable to determine';
        }

        // Legacy support: still update complexity-score if element exists
        const complexityEl = document.getElementById('complexity-score');
        if (complexityEl) {
            complexityEl.textContent = profile.complexity_score || '—';
        }

        // Legacy support: still update reading-level if element exists
        const readingEl = document.getElementById('reading-level');
        if (readingEl) {
            readingEl.textContent = profile.reading_level || profile.technical_level || 'Unable to determine';
        }

        // Sample summary
        const summaryEl = document.getElementById('sample-summary');
        if (summaryEl) {
            summaryEl.textContent = profile.profile_summary || '';
        }

        // New metrics row
        const voiceConsistencyEl = document.getElementById('voice-consistency');
        if (voiceConsistencyEl) {
            const score = profile.voice_consistency || estimateMetric(profile, 'voice');
            voiceConsistencyEl.textContent = score + '/10';
            voiceConsistencyEl.dataset.score = score >= 7 ? 'high' : score >= 5 ? 'medium' : 'low';
        }

        const patternDensityEl = document.getElementById('pattern-density');
        if (patternDensityEl) {
            const score = profile.pattern_density || estimateMetric(profile, 'pattern');
            patternDensityEl.textContent = score + '/10';
            patternDensityEl.dataset.score = score >= 7 ? 'high' : score >= 5 ? 'medium' : 'low';
        }

        const lexicalDiversityEl = document.getElementById('lexical-diversity');
        if (lexicalDiversityEl) {
            const score = profile.lexical_diversity || estimateMetric(profile, 'lexical');
            lexicalDiversityEl.textContent = score + '/10';
            lexicalDiversityEl.dataset.score = score >= 7 ? 'high' : score >= 5 ? 'medium' : 'low';
        }

        // Psychological impact metrics
        const emotionalResonanceEl = document.getElementById('emotional-resonance');
        if (emotionalResonanceEl) {
            const score = profile.emotional_resonance || estimateMetric(profile, 'emotional');
            emotionalResonanceEl.textContent = score + '/10';
            emotionalResonanceEl.dataset.score = score >= 7 ? 'high' : score >= 5 ? 'medium' : 'low';
        }

        const authenticityEl = document.getElementById('authenticity');
        if (authenticityEl) {
            const score = profile.authenticity || estimateMetric(profile, 'authenticity');
            authenticityEl.textContent = score + '/10';
            authenticityEl.dataset.score = score >= 7 ? 'high' : score >= 5 ? 'medium' : 'low';
        }

        const narrativeFlowEl = document.getElementById('narrative-flow');
        if (narrativeFlowEl) {
            const score = profile.narrative_flow || estimateMetric(profile, 'flow');
            narrativeFlowEl.textContent = score + '/10';
            narrativeFlowEl.dataset.score = score >= 7 ? 'high' : score >= 5 ? 'medium' : 'low';
        }

        const persuasiveClarityEl = document.getElementById('persuasive-clarity');
        if (persuasiveClarityEl) {
            const score = profile.persuasive_clarity || estimateMetric(profile, 'persuasive');
            persuasiveClarityEl.textContent = score + '/10';
            persuasiveClarityEl.dataset.score = score >= 7 ? 'high' : score >= 5 ? 'medium' : 'low';
        }

        // Style card
        const styleEl = document.getElementById('style-analysis');
        if (styleEl) styleEl.innerHTML = renderStyleCard(profile.style);

        // Tone card
        const toneEl = document.getElementById('tone-analysis');
        if (toneEl) toneEl.innerHTML = renderToneCard(profile.tone);

        // Vocabulary card
        const vocabEl = document.getElementById('vocab-analysis');
        if (vocabEl) vocabEl.innerHTML = renderVocabCard(profile.vocabulary);

        // Structure card
        const structEl = document.getElementById('structure-analysis');
        if (structEl) structEl.innerHTML = renderStructureCard(profile.structure);

        // Markers section
        const markersEl = document.getElementById('markers-analysis');
        if (markersEl) markersEl.innerHTML = renderMarkers(profile.markers);

        // Patterns section
        const patternsEl = document.getElementById('patterns-analysis');
        if (patternsEl) patternsEl.innerHTML = renderPatterns(profile.patterns);
    }

    // Map complexity score to Dreyfus mastery level
    function getMasteryFromComplexity(score) {
        if (!score) return 'Competent';
        if (score >= 9) return 'Masterful';
        if (score >= 8) return 'Expert';
        if (score >= 6) return 'Proficient';
        if (score >= 4) return 'Competent';
        if (score >= 2) return 'Emerging';
        return 'Novice';
    }

    // Estimate metrics from available profile data
    function estimateMetric(profile, type) {
        const complexity = profile.complexity_score || 5;
        const markersCount = (profile.markers || []).length;
        const patternsCount = (profile.patterns || []).length;
        const vocabWords = (profile.vocabulary?.characteristic_words || []).length;

        switch (type) {
            case 'voice':
                // Estimate voice consistency from markers and structure data
                return Math.min(10, Math.round((markersCount + patternsCount) / 2 + 4));
            case 'pattern':
                // Pattern density from markers and patterns
                return Math.min(10, Math.round((markersCount + patternsCount) / 3 + 3));
            case 'lexical':
                // Lexical diversity from vocab data
                return Math.min(10, Math.round(vocabWords / 2 + complexity / 2));
            case 'emotional':
                // Emotional resonance - estimate from tone and style
                const toneScore = profile.tone?.emotional_register === 'passionate' ? 8 : 
                                  profile.tone?.emotional_register === 'enthusiastic' ? 7 : 5;
                return Math.min(10, Math.round((toneScore + complexity) / 2));
            case 'authenticity':
                // Authenticity - inversely related to formality, related to markers
                const formalityPenalty = profile.style?.formality === 'formal' ? -1 : 
                                         profile.style?.formality === 'conversational' ? 1 : 0;
                return Math.min(10, Math.max(3, Math.round(markersCount / 2 + 5 + formalityPenalty)));
            case 'flow':
                // Narrative flow - from structure and patterns
                return Math.min(10, Math.round((patternsCount / 2) + (complexity / 2) + 3));
            case 'persuasive':
                // Persuasive clarity - from directness and complexity balance
                const directnessBonus = profile.style?.directness === 'direct' ? 2 : 0;
                return Math.min(10, Math.round(complexity / 2 + 4 + directnessBonus));
            default:
                return 5;
        }
    }

    function renderStyleCard(style) {
        if (!style) return '<p>No style data available.</p>';

        const traits = [];
        if (style.formality) traits.push(createBadge(style.formality));
        if (style.descriptiveness) traits.push(createBadge(style.descriptiveness, 'neutral'));
        if (style.directness) traits.push(createBadge(style.directness, 'neutral'));
        if (style.perspective) traits.push(createBadge(style.perspective, 'neutral'));

        return `
            <div style="margin-bottom: 8px;">${traits.join('')}</div>
            <p>${style.summary || ''}</p>
        `;
    }

    function renderToneCard(tone) {
        if (!tone) return '<p>No tone data available.</p>';

        const badges = [];
        if (tone.primary) badges.push(createBadge(tone.primary));
        if (tone.secondary && Array.isArray(tone.secondary)) {
            tone.secondary.forEach(t => badges.push(createBadge(t, 'neutral')));
        }
        if (tone.emotional_register) badges.push(createBadge(tone.emotional_register, 'highlight'));

        return `
            <div style="margin-bottom: 8px;">${badges.join('')}</div>
            <p>${tone.summary || ''}</p>
        `;
    }

    function renderVocabCard(vocab) {
        if (!vocab) return '<p>No vocabulary data available.</p>';

        let html = '';

        if (vocab.complexity) {
            html += `<div style="margin-bottom: 8px;">${createBadge(vocab.complexity)}</div>`;
        }

        if (vocab.characteristic_words && vocab.characteristic_words.length > 0) {
            html += `<p style="font-size: 12px; color: #666; margin-bottom: 4px;">Characteristic words:</p>`;
            html += `<div style="margin-bottom: 8px;">${vocab.characteristic_words.slice(0, 8).map(w => createBadge(w, 'neutral')).join('')}</div>`;
        }

        if (vocab.summary) {
            html += `<p>${vocab.summary}</p>`;
        }

        return html || '<p>No vocabulary data available.</p>';
    }

    function renderStructureCard(structure) {
        if (!structure) return '<p>No structure data available.</p>';

        const traits = [];
        if (structure.sentence_length) traits.push(createBadge(structure.sentence_length + ' sentences', 'neutral'));
        if (structure.variety) traits.push(createBadge(structure.variety, 'neutral'));

        let html = '';
        if (traits.length > 0) {
            html += `<div style="margin-bottom: 8px;">${traits.join('')}</div>`;
        }

        if (structure.paragraph_style) {
            html += `<p style="font-size: 13px; color: #555; margin-bottom: 8px;"><strong>Paragraphs:</strong> ${structure.paragraph_style}</p>`;
        }

        if (structure.summary) {
            html += `<p>${structure.summary}</p>`;
        }

        return html || '<p>No structure data available.</p>';
    }

    function renderMarkers(markers) {
        if (!markers || markers.length === 0) {
            return '<p>No distinctive markers identified.</p>';
        }

        const items = markers.map(m => `
            <li>
                <strong>${escapeHtml(m.type)}:</strong> ${escapeHtml(m.description)}
            </li>
        `).join('');

        return `<ul>${items}</ul>`;
    }

    function renderPatterns(patterns) {
        if (!patterns || patterns.length === 0) {
            return '<p>No specific patterns identified.</p>';
        }

        const items = patterns.map(p => `<li>${escapeHtml(p)}</li>`).join('');
        return `<ul>${items}</ul>`;
    }

    function createBadge(text, type = '') {
        const className = type ? `trait-badge ${type}` : 'trait-badge';
        return `<span class="${className}">${escapeHtml(text)}</span>`;
    }

    function renderSamplesList(samples, container) {
        container.innerHTML = '';

        samples.forEach((sample, index) => {
            const item = document.createElement('div');
            item.className = 'sample-item';
            item.dataset.index = index;

            const wordCount = sample.content.split(/\s+/).filter(w => w.length > 0).length;
            const preview = sample.content.substring(0, 60).replace(/\s+/g, ' ') + (sample.content.length > 60 ? '...' : '');

            item.innerHTML = `
                <div class="sample-info">
                    <div class="sample-source" title="${escapeHtml(sample.source)}">${escapeHtml(sample.source)}</div>
                    <div class="sample-meta">${wordCount} words • ${escapeHtml(preview)}</div>
                </div>
                <button class="sample-remove" data-index="${index}" title="Remove sample">&times;</button>
            `;

            container.appendChild(item);
        });
    }

    function renderSlopCheck(slopResults, container) {
        const slopSection = document.getElementById('slop-check');
        
        // Handle both old array format and new object format
        const issues = Array.isArray(slopResults) ? slopResults : (slopResults?.issues || []);
        const slopScore = slopResults?.slopScore ?? (issues.length === 0 ? 0 : 50);
        const summary = slopResults?.summary || {};

        if (issues.length === 0) {
            slopSection.classList.add('clean');
            slopSection.classList.remove('hidden');
            container.innerHTML = `
                <div class="slop-success">
                    <span class="slop-score-badge excellent">Score: ${slopScore}</span>
                    <p>No AI writing patterns detected. The text appears natural and authentic.</p>
                </div>
            `;
            return;
        }

        slopSection.classList.remove('clean', 'hidden');

        const criticalIssues = issues.filter(i => i.severity === 'critical');
        const highIssues = issues.filter(i => i.severity === 'high');
        const mediumIssues = issues.filter(i => i.severity === 'medium');
        const lowIssues = issues.filter(i => i.severity === 'low');

        // Determine score class
        let scoreClass = 'excellent';
        if (slopScore > 60) scoreClass = 'poor';
        else if (slopScore > 30) scoreClass = 'fair';
        else if (slopScore > 10) scoreClass = 'good';

        let html = `<div class="slop-header">
            <span class="slop-score-badge ${scoreClass}">Quality Score: ${100 - slopScore}/100</span>
            <span class="slop-summary">${criticalIssues.length + highIssues.length} issues need attention</span>
        </div>`;

        // Critical issues (must fix)
        if (criticalIssues.length > 0) {
            html += '<div class="slop-category critical"><h5>Critical Issues</h5><ul>';
            criticalIssues.forEach(issue => {
                html += `<li><strong>${escapeHtml(issue.type)}</strong>`;
                if (issue.examples?.[0]) html += `: <code>${escapeHtml(issue.examples[0].substring(0, 50))}</code>`;
                html += '</li>';
            });
            html += '</ul></div>';
        }

        // High severity issues
        if (highIssues.length > 0) {
            html += '<div class="slop-category high"><h5>High Priority</h5><ul>';
            highIssues.slice(0, 5).forEach(issue => {
                html += `<li><strong>${escapeHtml(issue.type)}</strong>`;
                if (issue.examples?.[0]) html += `: <code>${escapeHtml(issue.examples[0].substring(0, 40))}</code>`;
                html += '</li>';
            });
            if (highIssues.length > 5) html += `<li><em>+${highIssues.length - 5} more...</em></li>`;
            html += '</ul></div>';
        }

        // Medium/low summary
        if (mediumIssues.length + lowIssues.length > 0) {
            html += `<p class="slop-minor">${mediumIssues.length} medium + ${lowIssues.length} minor patterns detected (less critical)</p>`;
        }

        if (criticalIssues.length > 0 || highIssues.length > 2) {
            html += '<p class="slop-advice">Consider regenerating or manually editing to improve authenticity.</p>';
        }

        container.innerHTML = html;
    }

    function showLoading(containerId, show) {
        const container = document.getElementById(containerId);
        if (container) {
            container.classList.toggle('hidden', !show);
        }
    }

    function showError(message) {
        const errorSection = document.getElementById('error-section');
        errorSection.textContent = message;
        errorSection.classList.remove('hidden');
    }

    function hideError() {
        const errorSection = document.getElementById('error-section');
        errorSection.classList.add('hidden');
    }

    function showToast(message, duration = 3000) {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        renderProfile,
        renderSimilarAuthorsInModal,
        renderSamplesList,
        renderSlopCheck,
        showLoading,
        showError,
        hideError,
        showToast,
        createBadge
    };
})();
