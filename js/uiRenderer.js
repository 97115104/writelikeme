const UIRenderer = (() => {
    function renderProfile(profile, container) {
        // Complexity score
        const complexityEl = document.getElementById('complexity-score');
        complexityEl.textContent = profile.complexity_score || '—';

        // Reading level
        const readingEl = document.getElementById('reading-level');
        readingEl.textContent = profile.reading_level || 'Unable to determine';

        // Sample summary
        const summaryEl = document.getElementById('sample-summary');
        summaryEl.textContent = profile.profile_summary || '';

        // Style card
        const styleEl = document.getElementById('style-analysis');
        styleEl.innerHTML = renderStyleCard(profile.style);

        // Tone card
        const toneEl = document.getElementById('tone-analysis');
        toneEl.innerHTML = renderToneCard(profile.tone);

        // Vocabulary card
        const vocabEl = document.getElementById('vocab-analysis');
        vocabEl.innerHTML = renderVocabCard(profile.vocabulary);

        // Structure card
        const structEl = document.getElementById('structure-analysis');
        structEl.innerHTML = renderStructureCard(profile.structure);

        // Markers section
        const markersEl = document.getElementById('markers-analysis');
        markersEl.innerHTML = renderMarkers(profile.markers);

        // Patterns section
        const patternsEl = document.getElementById('patterns-analysis');
        patternsEl.innerHTML = renderPatterns(profile.patterns);
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

    function renderSlopCheck(issues, container) {
        const slopSection = document.getElementById('slop-check');

        if (issues.length === 0) {
            slopSection.classList.add('clean');
            slopSection.classList.remove('hidden');
            container.innerHTML = '<p>No AI writing patterns detected. The text appears natural and authentic.</p>';
            return;
        }

        slopSection.classList.remove('clean', 'hidden');

        const highSeverity = issues.filter(i => i.severity === 'high');
        const mediumSeverity = issues.filter(i => i.severity === 'medium');

        let html = '<p>Some AI patterns were detected:</p><ul>';

        issues.forEach(issue => {
            const severityLabel = issue.severity === 'high' ? '⚠️' : (issue.severity === 'medium' ? '⚡' : '💡');
            html += `<li>${severityLabel} <strong>${escapeHtml(issue.type)}</strong> (${issue.count} found)`;
            if (issue.examples && issue.examples.length > 0) {
                html += `: "${escapeHtml(issue.examples[0])}"`;
            }
            html += '</li>';
        });

        html += '</ul>';

        if (highSeverity.length > 0) {
            html += '<p style="margin-top: 8px; font-size: 12px; color: #e65100;">Consider regenerating or manually editing to remove high-severity patterns.</p>';
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

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        renderProfile,
        renderSamplesList,
        renderSlopCheck,
        showLoading,
        showError,
        hideError,
        createBadge
    };
})();
