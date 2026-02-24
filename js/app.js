(() => {
    // Application state
    const state = {
        samples: [],
        profile: null,
        currentStep: 'input',
        profileAskedToSave: false,
        fetchedUrlContent: {}, // Cache for fetched URL content
        profStyleChecked: false, // Track if professional style modal was shown for current prompt
        profStyleOverride: null // Professional style overrides from modal
    };

    // DOM Elements
    const elements = {};

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        console.log('[WriteMe] Initializing application...');
        cacheElements();
        bindEvents();
        loadSettings();
        checkFileProtocol();
        checkSavedProfile(); // Check for saved profile first
        checkUrlParams();
        console.log('[WriteMe] Initialization complete');
    }

    function cacheElements() {
        // Steps
        elements.stepInput = document.getElementById('step-input');
        elements.stepProfile = document.getElementById('step-profile');
        elements.stepGenerate = document.getElementById('step-generate');

        // Settings
        elements.settingsToggle = document.getElementById('settings-toggle');
        elements.settingsPanel = document.getElementById('settings-panel');
        elements.apiMode = document.getElementById('api-mode');
        elements.puterSettings = document.getElementById('puter-settings');
        elements.ollamaSettings = document.getElementById('ollama-settings');
        elements.keyedSettings = document.getElementById('keyed-settings');
        elements.puterModel = document.getElementById('puter-model');
        elements.ollamaUrl = document.getElementById('ollama-url');
        elements.ollamaModel = document.getElementById('ollama-model');
        elements.apiKey = document.getElementById('api-key');
        elements.baseUrl = document.getElementById('base-url');
        elements.baseUrlGroup = document.getElementById('base-url-group');
        elements.modelName = document.getElementById('model-name');
        elements.saveKey = document.getElementById('save-key');
        elements.providerHint = document.getElementById('provider-hint');

        // Input tabs
        elements.inputTabs = document.querySelectorAll('.input-tab-btn');
        elements.inputPanels = document.querySelectorAll('.input-panel');

        // Saved profile banner
        elements.savedProfileBanner = document.getElementById('saved-profile-banner');
        elements.btnUseSavedProfile = document.getElementById('btn-use-saved-profile');
        elements.btnAddToProfile = document.getElementById('btn-add-to-profile');
        elements.btnClearProfile = document.getElementById('btn-clear-profile');

        // Paste input
        elements.pasteInput = document.getElementById('paste-input');
        elements.pasteCharCount = document.getElementById('paste-char-count');
        elements.btnAddPaste = document.getElementById('btn-add-paste');

        // URL input
        elements.urlInput = document.getElementById('url-input');
        elements.btnFetchUrl = document.getElementById('btn-fetch-url');
        elements.urlStatus = document.getElementById('url-status');

        // File upload
        elements.dropArea = document.getElementById('drop-area');
        elements.fileInput = document.getElementById('file-input');

        // Profile input
        elements.profileInput = document.getElementById('profile-input');
        elements.btnLoadProfile = document.getElementById('btn-load-profile');

        // Samples
        elements.samplesSection = document.getElementById('samples-section');
        elements.samplesList = document.getElementById('samples-list');
        elements.sampleCount = document.getElementById('sample-count');
        elements.totalWords = document.getElementById('total-words');
        elements.totalChars = document.getElementById('total-chars');
        elements.btnAnalyze = document.getElementById('btn-analyze');

        // Profile step
        elements.profileLoading = document.getElementById('profile-loading');
        elements.profileContent = document.getElementById('profile-content');
        elements.btnDownloadProfile = document.getElementById('btn-download-profile');
        elements.btnCopyProfile = document.getElementById('btn-copy-profile');
        elements.btnSaveStorage = document.getElementById('btn-save-storage');
        elements.btnBackInput = document.getElementById('btn-back-input');
        elements.btnToGenerate = document.getElementById('btn-to-generate');

        // Profile quality
        elements.profileQuality = document.getElementById('profile-quality');
        elements.qualityScore = document.getElementById('quality-score');
        elements.qualityFill = document.getElementById('quality-fill');
        elements.qualitySuggestion = document.getElementById('quality-suggestion');

        // Generate step
        elements.contentType = document.getElementById('content-type');
        elements.promptInput = document.getElementById('prompt-input');
        elements.btnGenerate = document.getElementById('btn-generate');
        elements.generateLoading = document.getElementById('generate-loading');
        elements.outputSection = document.getElementById('output-section');
        elements.generatedContent = document.getElementById('generated-content');
        elements.btnCopyOutput = document.getElementById('btn-copy-output');
        elements.btnRegenerate = document.getElementById('btn-regenerate');
        elements.slopCheck = document.getElementById('slop-check');
        elements.slopIssues = document.getElementById('slop-issues');
        elements.btnBackProfile = document.getElementById('btn-back-profile');

        // Profile preview bar
        elements.profileNamePreview = document.getElementById('profile-name-preview');
        elements.btnQuickProfile = document.getElementById('btn-quick-profile');
        elements.btnFullProfile = document.getElementById('btn-full-profile');

        // URL artifacts
        elements.urlArtifacts = document.getElementById('url-artifacts');
        elements.urlArtifactsList = document.getElementById('url-artifacts-list');

        // Platform artifacts
        elements.platformArtifacts = document.getElementById('platform-artifacts');
        elements.platformInfo = document.getElementById('platform-info');

        // Save profile modal
        elements.saveProfileModal = document.getElementById('save-profile-modal');
        elements.btnCloseSaveProfile = document.getElementById('btn-close-save-profile');
        elements.btnSaveProfileYes = document.getElementById('btn-save-profile-yes');
        elements.btnSaveProfileNo = document.getElementById('btn-save-profile-no');

        // Storage saved modal
        elements.storageSavedModal = document.getElementById('storage-saved-modal');
        elements.btnCloseStorageSaved = document.getElementById('btn-close-storage-saved');
        elements.btnCloseStorageOk = document.getElementById('btn-close-storage-ok');

        // Quick profile modal
        elements.quickProfileModal = document.getElementById('quick-profile-modal');
        elements.btnCloseQuickProfile = document.getElementById('btn-close-quick-profile');
        elements.quickProfileContent = document.getElementById('quick-profile-content');
        elements.btnViewFullProfile = document.getElementById('btn-view-full-profile');
        elements.btnEditProfile = document.getElementById('btn-edit-profile');

        // Full profile modal
        elements.fullProfileModal = document.getElementById('full-profile-modal');
        elements.btnCloseFullProfile = document.getElementById('btn-close-full-profile');
        elements.fullProfileContent = document.getElementById('full-profile-content');
        elements.btnCopyProfileModal = document.getElementById('btn-copy-profile-modal');
        elements.btnCloseFullProfileOk = document.getElementById('btn-close-full-profile-ok');

        // Professional style modal
        elements.professionalStyleModal = document.getElementById('professional-style-modal');
        elements.btnCloseProfStyle = document.getElementById('btn-close-prof-style');
        elements.profStylePlatformText = document.getElementById('prof-style-platform-text');
        elements.profFixCapitalization = document.getElementById('prof-fix-capitalization');
        elements.profFixGrammar = document.getElementById('prof-fix-grammar');
        elements.profFormalTone = document.getElementById('prof-formal-tone');
        elements.btnProfStyleSkip = document.getElementById('btn-prof-style-skip');
        elements.btnProfStyleApply = document.getElementById('btn-prof-style-apply');

        // Modals
        elements.infoModal = document.getElementById('info-modal');
        elements.btnInfo = document.getElementById('btn-info');
        elements.btnCloseInfo = document.getElementById('btn-close-info');
        elements.ollamaModal = document.getElementById('ollama-modal');
        elements.btnOllamaHelp = document.getElementById('btn-ollama-help');
        elements.btnCloseOllama = document.getElementById('btn-close-ollama');
        elements.puterFallbackModal = document.getElementById('puter-fallback-modal');
        elements.btnCloseFallback = document.getElementById('btn-close-fallback');
        elements.btnSwitchOllama = document.getElementById('btn-switch-ollama');
        elements.puterFallbackReason = document.getElementById('puter-fallback-reason');

        // OS tabs
        elements.osTabs = document.querySelectorAll('.os-tab-btn');
        elements.osPanels = document.querySelectorAll('.os-panel');
    }

    function bindEvents() {
        // Settings toggle
        elements.settingsToggle.addEventListener('click', toggleSettings);
        elements.apiMode.addEventListener('change', handleApiModeChange);
        elements.saveKey.addEventListener('change', saveSettings);

        // Input tabs
        elements.inputTabs.forEach(tab => {
            tab.addEventListener('click', () => switchInputTab(tab.dataset.tab));
        });

        // Saved profile banner
        elements.btnUseSavedProfile?.addEventListener('click', () => {
            // Load saved profile and go to generate
            const savedProfile = localStorage.getItem('writelikeme_profile');
            if (savedProfile) {
                try {
                    state.profile = JSON.parse(savedProfile);
                    state.profileAskedToSave = true;
                    UIRenderer.renderProfile(state.profile);
                    elements.profileContent.classList.remove('hidden');
                    elements.btnToGenerate.disabled = false;
                    goToStep('generate');
                } catch (e) {
                    console.error('Failed to load saved profile:', e);
                }
            }
        });
        elements.btnAddToProfile?.addEventListener('click', () => {
            // Load profile but stay on input to add more samples
            const savedProfile = localStorage.getItem('writelikeme_profile');
            if (savedProfile) {
                state.profile = JSON.parse(savedProfile);
            }
            elements.savedProfileBanner.classList.add('hidden');
        });
        elements.btnClearProfile?.addEventListener('click', () => {
            clearSavedProfile();
            state.profile = null;
            elements.savedProfileBanner.classList.add('hidden');
        });

        // Paste input
        elements.pasteInput.addEventListener('input', updatePasteCharCount);
        elements.btnAddPaste.addEventListener('click', addPasteSample);

        // URL input
        elements.btnFetchUrl.addEventListener('click', fetchUrlContent);

        // File upload
        elements.dropArea.addEventListener('click', () => elements.fileInput.click());
        elements.dropArea.addEventListener('dragover', handleDragOver);
        elements.dropArea.addEventListener('dragleave', handleDragLeave);
        elements.dropArea.addEventListener('drop', handleDrop);
        elements.fileInput.addEventListener('change', handleFileSelect);

        // Profile input
        elements.btnLoadProfile.addEventListener('click', loadProfile);

        // Samples list
        elements.samplesList.addEventListener('click', handleSampleRemove);

        // Analyze button
        elements.btnAnalyze.addEventListener('click', analyzeWriting);

        // Profile step
        elements.btnDownloadProfile.addEventListener('click', downloadProfile);
        elements.btnCopyProfile.addEventListener('click', copyProfile);
        elements.btnSaveStorage?.addEventListener('click', saveProfileWithConfirmation);
        elements.btnBackInput.addEventListener('click', () => goToStep('input'));
        elements.btnToGenerate.addEventListener('click', () => goToStep('generate'));

        // Storage saved modal
        elements.btnCloseStorageSaved?.addEventListener('click', () => hideModal('storage-saved-modal'));
        elements.btnCloseStorageOk?.addEventListener('click', () => hideModal('storage-saved-modal'));

        // Generate step
        elements.btnGenerate.addEventListener('click', generateContent);
        elements.btnRegenerate.addEventListener('click', generateContent);
        elements.btnCopyOutput.addEventListener('click', copyOutput);
        elements.btnBackProfile.addEventListener('click', () => goToStep('profile'));

        // Profile preview bar
        elements.btnQuickProfile?.addEventListener('click', showQuickProfile);
        elements.btnFullProfile?.addEventListener('click', showFullProfile);

        // URL and platform detection in prompt
        elements.promptInput.addEventListener('input', () => {
            detectUrlsInPrompt();
            detectPlatformInPrompt();
            state.profStyleChecked = false; // Reset on prompt change
        });

        // Save profile modal
        elements.btnCloseSaveProfile?.addEventListener('click', () => hideModal('save-profile-modal'));
        elements.btnSaveProfileYes?.addEventListener('click', saveProfileToStorage);
        elements.btnSaveProfileNo?.addEventListener('click', () => {
            state.profileAskedToSave = true;
            hideModal('save-profile-modal');
        });

        // Quick profile modal
        elements.btnCloseQuickProfile?.addEventListener('click', () => hideModal('quick-profile-modal'));
        elements.btnViewFullProfile?.addEventListener('click', () => {
            hideModal('quick-profile-modal');
            showFullProfile();
        });
        elements.btnEditProfile?.addEventListener('click', () => {
            hideModal('quick-profile-modal');
            goToStep('input');
        });

        // Full profile modal
        elements.btnCloseFullProfile?.addEventListener('click', () => hideModal('full-profile-modal'));
        elements.btnCloseFullProfileOk?.addEventListener('click', () => hideModal('full-profile-modal'));
        elements.btnCopyProfileModal?.addEventListener('click', async () => {
            if (state.profile) {
                await navigator.clipboard.writeText(JSON.stringify(state.profile, null, 2));
                elements.btnCopyProfileModal.textContent = 'Copied!';
                setTimeout(() => elements.btnCopyProfileModal.textContent = 'Copy Profile JSON', 2000);
            }
        });

        // Professional style modal
        elements.btnCloseProfStyle?.addEventListener('click', () => hideModal('professional-style-modal'));
        elements.btnProfStyleSkip?.addEventListener('click', () => {
            state.profStyleOverride = null;
            hideModal('professional-style-modal');
            proceedWithGeneration();
        });
        elements.btnProfStyleApply?.addEventListener('click', () => {
            state.profStyleOverride = {
                fixCapitalization: elements.profFixCapitalization?.checked || false,
                fixGrammar: elements.profFixGrammar?.checked || false,
                formalTone: elements.profFormalTone?.checked || false
            };
            hideModal('professional-style-modal');
            proceedWithGeneration();
        });

        // Modals
        elements.btnInfo.addEventListener('click', () => showModal('info-modal'));
        elements.btnCloseInfo.addEventListener('click', () => hideModal('info-modal'));
        elements.btnOllamaHelp?.addEventListener('click', () => showModal('ollama-modal'));
        elements.btnCloseOllama?.addEventListener('click', () => hideModal('ollama-modal'));
        elements.btnCloseFallback?.addEventListener('click', () => hideModal('puter-fallback-modal'));
        elements.btnSwitchOllama?.addEventListener('click', switchToOllama);

        // OS tabs
        elements.osTabs.forEach(tab => {
            tab.addEventListener('click', () => switchOsTab(tab.dataset.os));
        });

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) hideModal(modal.id);
            });
        });

        // Save settings on change
        elements.apiKey?.addEventListener('change', saveSettings);
        elements.baseUrl?.addEventListener('change', saveSettings);
        elements.modelName?.addEventListener('change', saveSettings);
        elements.puterModel?.addEventListener('change', saveSettings);
        elements.ollamaUrl?.addEventListener('change', saveSettings);
        elements.ollamaModel?.addEventListener('change', saveSettings);
    }

    // --- Settings Management ---

    function toggleSettings() {
        const isHidden = elements.settingsPanel.classList.toggle('hidden');
        elements.settingsToggle.innerHTML = isHidden ? '&#9654; API Settings' : '&#9660; API Settings';
    }

    function handleApiModeChange() {
        const mode = elements.apiMode.value;

        // Hide all provider settings
        elements.puterSettings.classList.add('hidden');
        elements.ollamaSettings.classList.add('hidden');
        elements.keyedSettings.classList.add('hidden');
        elements.baseUrlGroup.classList.add('hidden');

        // Show relevant settings
        if (mode === 'puter') {
            elements.puterSettings.classList.remove('hidden');
        } else if (mode === 'ollama') {
            elements.ollamaSettings.classList.remove('hidden');
        } else {
            elements.keyedSettings.classList.remove('hidden');

            // Show base URL for custom
            if (mode === 'custom') {
                elements.baseUrlGroup.classList.remove('hidden');
            }

            // Update hints and defaults
            updateProviderHints(mode);
        }

        saveSettings();
    }

    function updateProviderHints(mode) {
        const hints = {
            openrouter: 'Get a key at openrouter.ai/keys. Supports hundreds of models.',
            anthropic: 'Get a key at console.anthropic.com. Uses Claude models.',
            openai: 'Get a key at platform.openai.com. Uses GPT models.',
            google: 'Get a key at aistudio.google.com. Uses Gemini models.',
            custom: 'Enter any OpenAI-compatible endpoint URL.'
        };

        const defaults = {
            openrouter: 'anthropic/claude-sonnet-4',
            anthropic: 'claude-sonnet-4-5-20250929',
            openai: 'gpt-4o',
            google: 'gemini-2.0-flash',
            custom: 'gpt-4o'
        };

        elements.providerHint.textContent = hints[mode] || '';
        elements.modelName.placeholder = defaults[mode] || 'model-name';

        if (!elements.modelName.value) {
            elements.modelName.value = defaults[mode] || '';
        }
    }

    function saveSettings() {
        if (!elements.saveKey.checked) return;

        const settings = {
            apiMode: elements.apiMode.value,
            puterModel: elements.puterModel.value,
            ollamaUrl: elements.ollamaUrl.value,
            ollamaModel: elements.ollamaModel.value,
            apiKey: elements.apiKey.value,
            baseUrl: elements.baseUrl.value,
            modelName: elements.modelName.value
        };

        localStorage.setItem('writelikeme_settings', JSON.stringify(settings));
    }

    function loadSettings() {
        const saved = localStorage.getItem('writelikeme_settings');
        if (!saved) return;

        try {
            const settings = JSON.parse(saved);

            if (settings.apiMode) elements.apiMode.value = settings.apiMode;
            if (settings.puterModel) elements.puterModel.value = settings.puterModel;
            if (settings.ollamaUrl) elements.ollamaUrl.value = settings.ollamaUrl;
            if (settings.ollamaModel) elements.ollamaModel.value = settings.ollamaModel;
            if (settings.apiKey) elements.apiKey.value = settings.apiKey;
            if (settings.baseUrl) elements.baseUrl.value = settings.baseUrl;
            if (settings.modelName) elements.modelName.value = settings.modelName;

            elements.saveKey.checked = true;
            handleApiModeChange();
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    }

    function getApiConfig() {
        return {
            apiMode: elements.apiMode.value,
            puterModel: elements.puterModel.value,
            ollamaUrl: elements.ollamaUrl.value,
            ollamaModel: elements.ollamaModel.value,
            apiKey: elements.apiKey.value,
            baseUrl: elements.baseUrl.value,
            model: elements.modelName.value
        };
    }

    // --- Input Tab Management ---

    function switchInputTab(tabName) {
        elements.inputTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        elements.inputPanels.forEach(panel => {
            panel.classList.toggle('active', panel.dataset.tab === tabName);
        });
    }

    // --- Paste Input ---

    function updatePasteCharCount() {
        const count = elements.pasteInput.value.length;
        elements.pasteCharCount.textContent = count.toLocaleString();
    }

    function addPasteSample() {
        const content = elements.pasteInput.value.trim();
        if (!content) return;

        state.samples.push({
            source: 'Pasted text',
            content: content,
            type: 'paste'
        });

        elements.pasteInput.value = '';
        updatePasteCharCount();
        updateSamplesDisplay();
    }

    // --- URL Input ---

    async function fetchUrlContent() {
        const input = elements.urlInput.value.trim();
        if (!input) return;

        // Parse multiple URLs (one per line)
        const lines = input.split(/[\n\r]+/).map(line => line.trim()).filter(line => line.length > 0);
        const urls = [];
        const invalidLines = [];

        for (const line of lines) {
            try {
                new URL(line);
                urls.push(line);
            } catch {
                invalidLines.push(line);
            }
        }

        if (urls.length === 0) {
            showUrlStatus('No valid URLs found. Make sure each URL starts with http:// or https://', 'error');
            return;
        }

        if (invalidLines.length > 0) {
            console.warn('[WriteMe] Skipping invalid lines:', invalidLines);
        }

        // Show progress for multiple URLs
        const progressContainer = document.getElementById('url-fetch-progress');
        const progressFill = document.getElementById('url-progress-fill');
        const progressText = document.getElementById('url-progress-text');

        if (urls.length > 1) {
            progressContainer.classList.remove('hidden');
            progressFill.style.width = '0%';
            progressText.textContent = `0 / ${urls.length}`;
        }

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            showUrlStatus(`Fetching ${i + 1} of ${urls.length}: ${url}`, 'loading');

            try {
                const content = await ApiClient.fetchUrlContent(url);

                if (content.length < 100) {
                    console.warn('[WriteMe] Not enough content from:', url);
                    errorCount++;
                } else {
                    state.samples.push({
                        source: url,
                        content: content,
                        type: 'url'
                    });
                    successCount++;
                }
            } catch (err) {
                console.error('[WriteMe] Failed to fetch:', url, err);
                errorCount++;
            }

            // Update progress
            if (urls.length > 1) {
                const percent = ((i + 1) / urls.length) * 100;
                progressFill.style.width = percent + '%';
                progressText.textContent = `${i + 1} / ${urls.length}`;
            }
        }

        // Clear input and hide progress
        elements.urlInput.value = '';
        progressContainer.classList.add('hidden');

        // Show final status
        if (successCount > 0 && errorCount === 0) {
            showUrlStatus(`Added ${successCount} sample${successCount > 1 ? 's' : ''} successfully!`, 'success');
        } else if (successCount > 0 && errorCount > 0) {
            showUrlStatus(`Added ${successCount} sample${successCount > 1 ? 's' : ''}, ${errorCount} failed.`, 'warning');
        } else {
            showUrlStatus(`Failed to fetch content from ${errorCount} URL${errorCount > 1 ? 's' : ''}.`, 'error');
        }

        updateSamplesDisplay();

        setTimeout(() => {
            elements.urlStatus.classList.add('hidden');
        }, 5000);
    }

    function showUrlStatus(message, type) {
        elements.urlStatus.textContent = message;
        elements.urlStatus.className = 'url-status ' + type;
        elements.urlStatus.classList.remove('hidden');
    }

    // --- File Upload ---

    function handleDragOver(e) {
        e.preventDefault();
        elements.dropArea.classList.add('dragover');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        elements.dropArea.classList.remove('dragover');
    }

    function handleDrop(e) {
        e.preventDefault();
        elements.dropArea.classList.remove('dragover');

        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    }

    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        processFiles(files);
        e.target.value = ''; // Reset for re-upload
    }

    async function processFiles(files) {
        console.log('[WriteMe] Processing', files.length, 'files');
        
        const validFiles = files.filter(f =>
            f.name.endsWith('.txt') || f.name.endsWith('.md') || f.name.endsWith('.text')
        );

        console.log('[WriteMe] Valid files:', validFiles.map(f => f.name));

        if (validFiles.length === 0) {
            console.warn('[WriteMe] No valid files found');
            UIRenderer.showError('Please upload .txt or .md files.');
            return;
        }

        for (const file of validFiles) {
            try {
                console.log('[WriteMe] Reading file:', file.name);
                const content = await readFile(file);
                console.log('[WriteMe] File read successfully:', file.name, '- Length:', content.length);
                state.samples.push({
                    source: file.name,
                    content: content,
                    type: 'file'
                });
            } catch (err) {
                console.error('[WriteMe] Failed to read file:', file.name, err);
            }
        }

        console.log('[WriteMe] Total samples now:', state.samples.length);
        updateSamplesDisplay();
    }

    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    // --- Profile Loading ---

    function loadProfile() {
        const input = elements.profileInput.value.trim();
        if (!input) return;

        try {
            const profile = JSON.parse(input);

            // Validate it looks like a profile
            if (!profile.style && !profile.tone && !profile.vocabulary) {
                throw new Error('Invalid profile format');
            }

            state.profile = profile;
            elements.profileInput.value = '';

            // Skip to generate step
            UIRenderer.renderProfile(state.profile);
            elements.profileContent.classList.remove('hidden');
            elements.btnToGenerate.disabled = false;

            // Hide quality metric for loaded profiles (no samples to measure)
            if (elements.profileQuality) {
                elements.profileQuality.style.display = 'none';
            }

            goToStep('profile');

        } catch (err) {
            UIRenderer.showError('Invalid JSON. Please paste a valid writing profile.');
        }
    }

    // --- Samples Management ---

    function updateSamplesDisplay() {
        if (state.samples.length === 0) {
            elements.samplesSection.classList.add('hidden');
            elements.btnAnalyze.disabled = true;
            return;
        }

        elements.samplesSection.classList.remove('hidden');
        elements.btnAnalyze.disabled = false;

        // Update count
        elements.sampleCount.textContent = `(${state.samples.length})`;

        // Update stats
        const stats = WritingAnalyzer.calculateStats(state.samples);
        elements.totalWords.textContent = stats.totalWords.toLocaleString() + ' words';
        elements.totalChars.textContent = stats.totalChars.toLocaleString() + ' characters';

        // Render list
        UIRenderer.renderSamplesList(state.samples, elements.samplesList);
    }

    function handleSampleRemove(e) {
        const removeBtn = e.target.closest('.sample-remove');
        if (!removeBtn) return;

        const index = parseInt(removeBtn.dataset.index, 10);
        state.samples.splice(index, 1);
        updateSamplesDisplay();
    }

    // --- Analysis ---

    async function analyzeWriting() {
        console.log('[WriteMe] Starting analysis with', state.samples.length, 'samples');
        
        if (state.samples.length === 0) {
            console.warn('[WriteMe] No samples to analyze');
            return;
        }

        UIRenderer.hideError();
        goToStep('profile');

        console.log('[WriteMe] Showing loading indicator');
        elements.profileLoading.classList.remove('hidden');
        elements.profileContent.classList.add('hidden');
        elements.btnToGenerate.disabled = true;

        console.log('[WriteMe] profileLoading hidden class:', elements.profileLoading.classList.contains('hidden'));
        console.log('[WriteMe] profileContent hidden class:', elements.profileContent.classList.contains('hidden'));

        try {
            const config = getApiConfig();
            console.log('[WriteMe] API Config:', { ...config, apiKey: config.apiKey ? '[REDACTED]' : 'none' });

            // Preflight check
            console.log('[WriteMe] Running preflight check...');
            const preflight = await ApiClient.preflightCheck(config);
            if (!preflight.ok) {
                console.error('[WriteMe] Preflight check failed:', preflight.error);
                throw new Error(preflight.error);
            }
            console.log('[WriteMe] Preflight check passed');

            // Analyze
            console.log('[WriteMe] Calling WritingAnalyzer.analyzeWriting...');
            state.profile = await WritingAnalyzer.analyzeWriting(state.samples, config);
            console.log('[WriteMe] Analysis complete, profile:', state.profile);

            // Render profile
            console.log('[WriteMe] Rendering profile...');
            UIRenderer.renderProfile(state.profile);

            // Update quality display (show it if it was hidden)
            if (elements.profileQuality) {
                elements.profileQuality.style.display = '';
            }
            updateProfileQualityDisplay(state.samples);

            elements.profileLoading.classList.add('hidden');
            elements.profileContent.classList.remove('hidden');
            elements.btnToGenerate.disabled = false;
            console.log('[WriteMe] Profile rendered successfully');

        } catch (err) {
            console.error('[WriteMe] Analysis error:', err);
            elements.profileLoading.classList.add('hidden');

            if (err.puterFallback) {
                console.log('[WriteMe] Showing Puter fallback modal');
                showPuterFallback(err.message);
                goToStep('input');
            } else {
                console.log('[WriteMe] Showing error message');
                UIRenderer.showError(err.message);
            }
        }
    }

    // --- Content Generation ---

    // Store pending generation state for professional style modal callback
    let pendingGenerationPrompt = null;

    async function generateContent() {
        let prompt = elements.promptInput.value.trim();
        if (!prompt) {
            UIRenderer.showError('Please enter what you want to write about.');
            return;
        }

        // Check if professional platform detected and writing style is casual
        const platform = detectedPlatform ? PLATFORM_STYLES[detectedPlatform] : null;
        if (platform?.isProfessional && state.profile) {
            const formality = state.profile.style?.formality?.toLowerCase() || '';
            const isCasual = formality.includes('casual') || formality.includes('informal');

            // Check if we already handled this for this prompt
            if (!state.profStyleChecked && isCasual) {
                state.profStyleChecked = true;
                pendingGenerationPrompt = prompt;

                // Update modal text
                if (elements.profStylePlatformText) {
                    elements.profStylePlatformText.innerHTML = `You're writing for <strong>${platform.name}</strong>, a professional platform.`;
                }
                showModal('professional-style-modal');
                return; // Wait for modal callback
            }
        }

        // Continue with actual generation
        await proceedWithGeneration(prompt);
    }

    async function proceedWithGeneration(promptOverride) {
        let prompt = promptOverride || pendingGenerationPrompt || elements.promptInput.value.trim();
        pendingGenerationPrompt = null;

        if (!prompt) return;

        UIRenderer.hideError();
        elements.generateLoading.classList.remove('hidden');
        elements.outputSection.classList.add('hidden');

        try {
            const config = getApiConfig();
            const contentType = elements.contentType.value;

            // Preflight check
            const preflight = await ApiClient.preflightCheck(config);
            if (!preflight.ok) {
                throw new Error(preflight.error);
            }

            // Fetch any URLs in the prompt
            const urlItems = elements.urlArtifactsList.querySelectorAll('.url-artifact-item');
            if (urlItems.length > 0) {
                const loadingStatus = document.querySelector('#generate-loading .loading-status');
                if (loadingStatus) loadingStatus.textContent = 'Fetching referenced URLs...';

                const fetchedContent = await fetchPromptUrls();

                // Append fetched content to the prompt
                if (fetchedContent.length > 0) {
                    prompt += '\n\n--- Referenced Content ---\n';
                    fetchedContent.forEach(({ url, content }) => {
                        // Limit content to prevent token overflow
                        const truncated = content.length > 5000 ? content.substring(0, 5000) + '...[truncated]' : content;
                        prompt += `\n[From ${url}]:\n${truncated}\n`;
                    });
                }

                if (loadingStatus) loadingStatus.textContent = 'Applying your writing profile and removing AI patterns';
            }

            // Build professional style override context if applicable
            let professionalOverride = '';
            if (state.profStyleOverride) {
                const overrides = [];
                if (state.profStyleOverride.fixCapitalization) {
                    overrides.push('Use proper capitalization (capitalize first letter of sentences, proper nouns, etc.)');
                }
                if (state.profStyleOverride.fixGrammar) {
                    overrides.push('Ensure proper grammar and punctuation');
                }
                if (state.profStyleOverride.formalTone) {
                    overrides.push('Use more formal, professional vocabulary');
                }
                if (overrides.length) {
                    professionalOverride = '\n\n## Professional Style Adjustments\n' + overrides.map(o => `- ${o}`).join('\n');
                }
            }

            // Generate with platform context if detected
            const platformContext = getPlatformStyleContext() + professionalOverride;
            let content = await WritingAnalyzer.generateContent(
                state.profile,
                prompt,
                contentType,
                config,
                platformContext
            );

            // Auto-fix slop before presenting
            let slopIssues = WritingAnalyzer.detectSlop(content);
            if (slopIssues.some(i => i.severity === 'high')) {
                console.log('[WriteMe] High severity slop detected, auto-fixing...');
                const loadingStatus = document.querySelector('#generate-loading .loading-status');
                if (loadingStatus) loadingStatus.textContent = 'Fixing AI patterns in generated text...';

                content = await WritingAnalyzer.fixSlop(content, config);
                slopIssues = WritingAnalyzer.detectSlop(content);
            }

            // Display result
            elements.generatedContent.textContent = content;

            // Check for remaining slop
            UIRenderer.renderSlopCheck(slopIssues, elements.slopIssues);

            elements.generateLoading.classList.add('hidden');
            elements.outputSection.classList.remove('hidden');

            // Reset professional style state for next generation
            state.profStyleOverride = null;

        } catch (err) {
            elements.generateLoading.classList.add('hidden');

            if (err.puterFallback) {
                showPuterFallback(err.message);
            } else {
                UIRenderer.showError(err.message);
            }
        }
    }

    // --- Profile Export ---

    function downloadProfile() {
        if (!state.profile) return;

        const blob = new Blob([JSON.stringify(state.profile, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'writing-profile.json';
        a.click();

        URL.revokeObjectURL(url);
    }

    async function copyProfile() {
        if (!state.profile) return;

        const text = WritingAnalyzer.profileToPromptText(state.profile);

        try {
            await navigator.clipboard.writeText(text);
            elements.btnCopyProfile.textContent = 'Copied!';
            setTimeout(() => {
                elements.btnCopyProfile.textContent = 'Copy Profile';
            }, 2000);
        } catch {
            UIRenderer.showError('Failed to copy to clipboard.');
        }
    }

    async function copyOutput() {
        const content = elements.generatedContent.textContent;

        try {
            await navigator.clipboard.writeText(content);
            elements.btnCopyOutput.textContent = 'Copied!';
            setTimeout(() => {
                elements.btnCopyOutput.textContent = 'Copy';
            }, 2000);
        } catch {
            UIRenderer.showError('Failed to copy to clipboard.');
        }
    }

    // --- Step Navigation ---

    function goToStep(stepName) {
        console.log('[WriteMe] Navigating to step:', stepName);

        // Save prompt text when leaving generate step
        if (state.currentStep === 'generate' && stepName !== 'generate') {
            const promptText = elements.promptInput?.value || '';
            if (promptText.trim()) {
                sessionStorage.setItem('writelikeme_temp_prompt', promptText);
            }
        }

        state.currentStep = stepName;

        elements.stepInput.classList.toggle('active', stepName === 'input');
        elements.stepProfile.classList.toggle('active', stepName === 'profile');
        elements.stepGenerate.classList.toggle('active', stepName === 'generate');

        console.log('[WriteMe] Step visibility - input:', elements.stepInput.classList.contains('active'),
            'profile:', elements.stepProfile.classList.contains('active'),
            'generate:', elements.stepGenerate.classList.contains('active'));

        // When going to input step, show saved profile banner if profile exists
        if (stepName === 'input') {
            const savedProfile = localStorage.getItem('writelikeme_profile');
            if (savedProfile) {
                elements.savedProfileBanner.classList.remove('hidden');
            } else {
                elements.savedProfileBanner.classList.add('hidden');
            }
        }

        // When going to generate step, update profile preview and restore prompt
        if (stepName === 'generate' && state.profile) {
            updateProfilePreviewBar();

            // Restore saved prompt if prompt field is empty
            const savedPrompt = sessionStorage.getItem('writelikeme_temp_prompt');
            if (savedPrompt && !elements.promptInput.value.trim()) {
                elements.promptInput.value = savedPrompt;
                detectUrlsInPrompt();
                detectPlatformInPrompt();
            }

            // Delay the save prompt slightly so the UI transition completes
            setTimeout(() => promptToSaveProfile(), 300);
        }

        UIRenderer.hideError();
    }

    // --- Modal Management ---

    function showModal(modalId) {
        document.getElementById(modalId)?.classList.remove('hidden');
    }

    function hideModal(modalId) {
        document.getElementById(modalId)?.classList.add('hidden');
    }

    function switchOsTab(os) {
        elements.osTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.os === os);
        });

        elements.osPanels.forEach(panel => {
            panel.classList.toggle('active', panel.dataset.os === os);
        });
    }

    // --- Puter Fallback ---

    function showPuterFallback(reason) {
        elements.puterFallbackReason.textContent = reason;
        showModal('puter-fallback-modal');
    }

    function switchToOllama() {
        elements.apiMode.value = 'ollama';
        handleApiModeChange();
        hideModal('puter-fallback-modal');

        // Open settings panel
        if (elements.settingsPanel.classList.contains('hidden')) {
            toggleSettings();
        }
    }

    // --- Utilities ---

    function checkFileProtocol() {
        if (window.location.protocol === 'file:') {
            document.getElementById('file-protocol-warning').classList.remove('hidden');
        }
    }

    function checkUrlParams() {
        const params = new URLSearchParams(window.location.search);

        // Support for sharing profiles via URL
        const profileParam = params.get('profile');
        if (profileParam) {
            try {
                const compressed = profileParam;
                const json = LZString.decompressFromEncodedURIComponent(compressed);
                if (json) {
                    const profile = JSON.parse(json);
                    state.profile = profile;
                    UIRenderer.renderProfile(state.profile);
                    elements.profileContent.classList.remove('hidden');
                    elements.btnToGenerate.disabled = false;
                    goToStep('profile');
                }
            } catch (e) {
                console.error('Failed to load profile from URL:', e);
            }
        }
    }

    // --- Profile Storage ---

    function checkSavedProfile() {
        const savedProfile = localStorage.getItem('writelikeme_profile');
        if (!savedProfile) return;

        try {
            const profile = JSON.parse(savedProfile);
            if (profile && (profile.style || profile.tone || profile.vocabulary)) {
                console.log('[WriteMe] Found saved profile, loading...');
                state.profile = profile;
                state.profileAskedToSave = true; // Already saved
                UIRenderer.renderProfile(state.profile);
                elements.profileContent.classList.remove('hidden');
                elements.btnToGenerate.disabled = false;
                updateProfilePreviewBar();
                goToStep('generate'); // Skip to generate step
            }
        } catch (e) {
            console.error('Failed to load saved profile:', e);
            localStorage.removeItem('writelikeme_profile');
        }
    }

    function promptToSaveProfile() {
        if (state.profileAskedToSave) return;
        state.profileAskedToSave = true;
        showModal('save-profile-modal');
    }

    function saveProfileToStorage() {
        if (!state.profile) return;

        try {
            localStorage.setItem('writelikeme_profile', JSON.stringify(state.profile));
            console.log('[WriteMe] Profile saved to localStorage');
            hideModal('save-profile-modal');
        } catch (e) {
            console.error('Failed to save profile:', e);
            UIRenderer.showError('Failed to save profile. Storage may be full.');
        }
    }

    function updateSavedProfile() {
        // Called when profile is updated (more samples added)
        const savedProfile = localStorage.getItem('writelikeme_profile');
        if (savedProfile && state.profile) {
            localStorage.setItem('writelikeme_profile', JSON.stringify(state.profile));
            console.log('[WriteMe] Profile updated in localStorage');
        }
    }

    function clearSavedProfile() {
        localStorage.removeItem('writelikeme_profile');
        console.log('[WriteMe] Saved profile cleared');
    }

    function saveProfileWithConfirmation() {
        if (!state.profile) return;

        try {
            localStorage.setItem('writelikeme_profile', JSON.stringify(state.profile));
            state.profileAskedToSave = true;
            console.log('[WriteMe] Profile saved to localStorage with confirmation');

            // Update button to show saved state
            if (elements.btnSaveStorage) {
                elements.btnSaveStorage.textContent = 'Saved!';
                elements.btnSaveStorage.disabled = true;
                setTimeout(() => {
                    elements.btnSaveStorage.textContent = 'Save to Browser';
                    elements.btnSaveStorage.disabled = false;
                }, 2000);
            }

            // Show confirmation modal
            showModal('storage-saved-modal');
        } catch (e) {
            console.error('Failed to save profile:', e);
            UIRenderer.showError('Failed to save profile. Storage may be full.');
        }
    }

    // --- Profile Quality ---

    function calculateProfileQuality(samples) {
        const sampleCount = samples.length;
        const stats = WritingAnalyzer.calculateStats(samples);
        const wordCount = stats.totalWords;

        // Calculate source variety (different types of inputs)
        const sourceTypes = new Set(samples.map(s => s.type));
        const sourceVariety = sourceTypes.size;

        // Quality scoring
        let score = 0;
        let label = '';
        let suggestion = '';

        // Sample count scoring (0-30 points)
        if (sampleCount >= 10) score += 30;
        else if (sampleCount >= 5) score += 20;
        else if (sampleCount >= 3) score += 10;
        else score += 5;

        // Word count scoring (0-40 points)
        if (wordCount >= 5000) score += 40;
        else if (wordCount >= 2500) score += 30;
        else if (wordCount >= 1000) score += 20;
        else if (wordCount >= 500) score += 10;
        else score += 5;

        // Source variety scoring (0-20 points)
        if (sourceVariety >= 3) score += 20;
        else if (sourceVariety >= 2) score += 10;
        else score += 5;

        // Consistency bonus (0-10 points) - if samples are long enough on average
        const avgWords = wordCount / sampleCount;
        if (avgWords >= 300) score += 10;
        else if (avgWords >= 150) score += 5;

        // Determine quality level
        if (score >= 80) {
            label = 'Excellent';
            suggestion = 'Your profile has strong coverage for accurate style matching.';
        } else if (score >= 60) {
            label = 'Good';
            suggestion = 'Your profile is solid. Adding more samples could improve accuracy.';
        } else if (score >= 40) {
            label = 'Fair';
            const neededWords = 2500 - wordCount;
            const neededSamples = 5 - sampleCount;
            if (neededSamples > 0) {
                suggestion = `Consider adding ${neededSamples} more sample${neededSamples > 1 ? 's' : ''} for better style detection.`;
            } else if (neededWords > 0) {
                suggestion = `Adding about ${Math.ceil(neededWords / 100) * 100} more words would improve accuracy.`;
            } else {
                suggestion = 'Try adding samples from different contexts (blogs, social media, emails).';
            }
        } else {
            label = 'Needs More';
            suggestion = `Add more writing samples. Aim for at least 5 samples with 2,500+ words total.`;
        }

        return {
            score: Math.min(score, 100),
            label,
            suggestion,
            stats: {
                sampleCount,
                wordCount,
                sourceVariety,
                avgWords: Math.round(avgWords)
            }
        };
    }

    function updateProfileQualityDisplay(samples) {
        const quality = calculateProfileQuality(samples);

        // Update score label
        elements.qualityScore.textContent = quality.label;
        elements.qualityScore.className = 'quality-score ' + quality.label.toLowerCase().replace(' ', '-');

        // Update progress bar
        elements.qualityFill.style.width = quality.score + '%';
        elements.qualityFill.className = 'quality-fill ' + quality.label.toLowerCase().replace(' ', '-');

        // Update suggestion
        elements.qualitySuggestion.textContent = quality.suggestion;

        return quality;
    }

    // --- Platform Detection ---

    const PLATFORM_STYLES = {
        x: {
            name: 'X (Twitter)',
            icon: 'X',
            isProfessional: false,
            maxLength: 280,
            style: 'Concise, punchy, thread-friendly. Use short sentences. Hashtags optional but sparingly. No formal greetings. Direct and engaging.',
            tone: 'casual, witty, conversational',
            avoid: 'long paragraphs, formal language, excessive hashtags'
        },
        twitter: {
            name: 'X (Twitter)',
            icon: 'X',
            isProfessional: false,
            maxLength: 280,
            style: 'Concise, punchy, thread-friendly. Use short sentences. Hashtags optional but sparingly. No formal greetings. Direct and engaging.',
            tone: 'casual, witty, conversational',
            avoid: 'long paragraphs, formal language, excessive hashtags'
        },
        linkedin: {
            name: 'LinkedIn',
            icon: 'in',
            isProfessional: true,
            maxLength: 3000,
            style: 'Professional but personable. Start with a hook. Use line breaks for readability. Share insights and lessons. End with a question or call to action.',
            tone: 'professional, thoughtful, authentic',
            avoid: 'jargon overload, overly casual language, clickbait',
            professionalNote: 'LinkedIn is a professional platform. Your writing style may need adjustments for proper capitalization, grammar, and professional tone.'
        },
        facebook: {
            name: 'Facebook',
            icon: 'f',
            isProfessional: false,
            maxLength: null,
            style: 'Personal storytelling, conversational. Can be longer form. Photos/context welcome. Engaging questions work well.',
            tone: 'friendly, personal, community-focused',
            avoid: 'overly promotional content, cold corporate speak'
        },
        instagram: {
            name: 'Instagram',
            icon: 'IG',
            isProfessional: false,
            maxLength: 2200,
            style: 'Visual-first thinking. Caption supports the image. Can be inspirational, behind-the-scenes, or storytelling. Hashtags at end or in first comment.',
            tone: 'aesthetic, aspirational, authentic',
            avoid: 'walls of text, overly salesy language'
        },
        tiktok: {
            name: 'TikTok',
            icon: 'TT',
            isProfessional: false,
            maxLength: 300,
            style: 'Gen Z friendly, trend-aware, hook in first 3 seconds mindset. Casual, fun, slightly chaotic energy welcome.',
            tone: 'playful, relatable, trendy',
            avoid: 'formal language, long explanations, corporate vibes'
        },
        threads: {
            name: 'Threads',
            icon: '@',
            isProfessional: false,
            maxLength: 500,
            style: 'Conversational, text-focused. Similar to Twitter but slightly more room to breathe. Good for hot takes and discussions.',
            tone: 'casual, thoughtful, engaging',
            avoid: 'hashtag spam, overly promotional content'
        },
        bluesky: {
            name: 'Bluesky',
            icon: 'BS',
            isProfessional: false,
            maxLength: 300,
            style: 'Similar to early Twitter. Community-focused, less performative. Authentic voices do well.',
            tone: 'genuine, curious, community-oriented',
            avoid: 'engagement bait, corporate messaging'
        },
        mastodon: {
            name: 'Mastodon',
            icon: 'M',
            isProfessional: false,
            maxLength: 500,
            style: 'Community-minded, content warnings appreciated for sensitive topics. More thoughtful, less viral-chasing.',
            tone: 'respectful, community-focused, thoughtful',
            avoid: 'engagement farming, cross-posting without context'
        },
        reddit: {
            name: 'Reddit',
            icon: 'r/',
            isProfessional: false,
            maxLength: null,
            style: 'Context-rich, community-aware. Know your subreddit culture. Can be long-form for certain communities. Authenticity valued.',
            tone: 'authentic, detailed, community-specific',
            avoid: 'self-promotion, not reading the room/subreddit rules'
        },
        email: {
            name: 'Email Newsletter',
            icon: '@',
            isProfessional: true,
            maxLength: null,
            style: 'Personal greeting, clear sections, value-first. Scannable with headers. Personal sign-off.',
            tone: 'professional-casual, helpful, personal',
            avoid: 'clickbait subjects, walls of text without breaks',
            professionalNote: 'Email newsletters often require professional formatting and clear communication.'
        },
        substack: {
            name: 'Substack',
            icon: 'S',
            isProfessional: false,
            maxLength: null,
            style: 'Long-form welcome. Personal essays, analysis, opinion pieces. Build relationship with reader over time.',
            tone: 'thoughtful, personal, authoritative',
            avoid: 'listicles, shallow takes, pure SEO content'
        }
    };

    let detectedPlatform = null;

    function detectPlatformInPrompt() {
        const text = elements.promptInput.value.toLowerCase();
        const contentType = elements.contentType.value;

        // Only detect for social media content types
        if (!contentType.startsWith('social')) {
            elements.platformArtifacts.classList.add('hidden');
            detectedPlatform = null;
            return;
        }

        // Check for platform mentions
        let platform = null;
        for (const [key, data] of Object.entries(PLATFORM_STYLES)) {
            // Check if platform name is mentioned
            if (text.includes(key) || text.includes(data.name.toLowerCase())) {
                platform = key;
                break;
            }
        }

        // Also check for common abbreviations and variations
        if (!platform) {
            if (text.includes('tweet') || text.includes('post on x')) platform = 'x';
            else if (text.includes('linkedin post') || text.includes('for linkedin')) platform = 'linkedin';
            else if (text.includes('fb') || text.includes('facebook')) platform = 'facebook';
            else if (text.includes('ig') || text.includes('insta')) platform = 'instagram';
            else if (text.includes('tiktok') || text.includes('tik tok')) platform = 'tiktok';
        }

        if (platform && PLATFORM_STYLES[platform]) {
            detectedPlatform = platform;
            const data = PLATFORM_STYLES[platform];

            elements.platformArtifacts.classList.remove('hidden');
            elements.platformInfo.innerHTML = `
                <span class="platform-badge">
                    <span class="platform-icon">${data.icon}</span>
                    ${data.name}
                </span>
                <span class="platform-hint">${data.maxLength ? `Max ${data.maxLength} chars` : 'No character limit'} • ${data.tone}</span>
            `;
        } else {
            elements.platformArtifacts.classList.add('hidden');
            detectedPlatform = null;
        }
    }

    function getPlatformStyleContext() {
        if (!detectedPlatform || !PLATFORM_STYLES[detectedPlatform]) return '';

        const platform = PLATFORM_STYLES[detectedPlatform];
        return `

## Target Platform: ${platform.name}

Platform-specific guidelines:
- Style: ${platform.style}
- Tone: ${platform.tone}
- Avoid: ${platform.avoid}
${platform.maxLength ? `- Character limit: ${platform.maxLength} characters` : ''}

Adapt the writing to fit this platform's culture and expectations while maintaining the user's authentic voice.`;
    }

    // --- Profile Preview ---

    function updateProfilePreviewBar() {
        if (!state.profile) return;

        // Set a preview name based on profile characteristics
        const tone = state.profile.tone?.primary || 'Your';
        const formality = state.profile.style?.formality || 'Style';
        elements.profileNamePreview.textContent = `${tone} ${formality}`.replace(/undefined/g, '').trim() || 'Your Style';
    }

    function showQuickProfile() {
        if (!state.profile) {
            // Show message that profile is not available
            elements.quickProfileContent.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p style="color: #666; margin-bottom: 16px;">No profile loaded. Add writing samples to create your profile.</p>
                </div>
            `;
            // Hide the "View Full Profile" button when no profile
            elements.btnViewFullProfile.style.display = 'none';
            showModal('quick-profile-modal');
            return;
        }

        // Show the button when profile exists
        elements.btnViewFullProfile.style.display = '';

        const profile = state.profile;
        let html = '';

        // Summary
        if (profile.profile_summary) {
            html += `<div class="profile-summary">${escapeHtml(profile.profile_summary)}</div>`;
        }

        // Key traits
        html += '<div class="profile-traits">';
        if (profile.style?.formality) html += UIRenderer.createBadge(profile.style.formality);
        if (profile.tone?.primary) html += UIRenderer.createBadge(profile.tone.primary);
        if (profile.vocabulary?.complexity) html += UIRenderer.createBadge(profile.vocabulary.complexity + ' vocabulary', 'neutral');
        if (profile.structure?.sentence_length) html += UIRenderer.createBadge(profile.structure.sentence_length + ' sentences', 'neutral');
        html += '</div>';

        // Reading level
        if (profile.reading_level) {
            html += `<p style="font-size: 13px; color: #666;"><strong>Reading level:</strong> ${escapeHtml(profile.reading_level)}</p>`;
        }

        elements.quickProfileContent.innerHTML = html;
        showModal('quick-profile-modal');
    }

    function showFullProfile() {
        if (!state.profile) return;

        const profile = state.profile;
        let html = '';

        // Summary
        if (profile.profile_summary) {
            html += `
                <div class="profile-section">
                    <h4>Profile Summary</h4>
                    <p>${escapeHtml(profile.profile_summary)}</p>
                </div>
            `;
        }

        // Key metrics
        html += `
            <div class="profile-section">
                <h4>Key Metrics</h4>
                <div class="profile-metrics">
                    <div class="metric"><span class="metric-label">Complexity Score:</span> ${profile.complexity_score || '—'}</div>
                    <div class="metric"><span class="metric-label">Reading Level:</span> ${profile.reading_level || '—'}</div>
                </div>
            </div>
        `;

        // Style
        if (profile.style) {
            const styleTraits = [];
            if (profile.style.formality) styleTraits.push(UIRenderer.createBadge(profile.style.formality));
            if (profile.style.descriptiveness) styleTraits.push(UIRenderer.createBadge(profile.style.descriptiveness, 'neutral'));
            if (profile.style.directness) styleTraits.push(UIRenderer.createBadge(profile.style.directness, 'neutral'));
            if (profile.style.perspective) styleTraits.push(UIRenderer.createBadge(profile.style.perspective, 'neutral'));

            html += `
                <div class="profile-section">
                    <h4>Writing Style</h4>
                    <div class="trait-badges">${styleTraits.join('')}</div>
                    ${profile.style.notable_traits ? `<p style="margin-top: 8px; font-size: 13px;"><strong>Notable traits:</strong> ${escapeHtml(profile.style.notable_traits.join(', '))}</p>` : ''}
                </div>
            `;
        }

        // Tone
        if (profile.tone) {
            const toneTraits = [];
            if (profile.tone.primary) toneTraits.push(UIRenderer.createBadge(profile.tone.primary));
            if (profile.tone.secondary) toneTraits.push(UIRenderer.createBadge(profile.tone.secondary, 'neutral'));

            html += `
                <div class="profile-section">
                    <h4>Tone</h4>
                    <div class="trait-badges">${toneTraits.join('')}</div>
                    ${profile.tone.emotional_range ? `<p style="margin-top: 8px; font-size: 13px;"><strong>Emotional range:</strong> ${escapeHtml(profile.tone.emotional_range)}</p>` : ''}
                </div>
            `;
        }

        // Vocabulary
        if (profile.vocabulary) {
            html += `
                <div class="profile-section">
                    <h4>Vocabulary</h4>
                    <div class="trait-badges">
                        ${profile.vocabulary.complexity ? UIRenderer.createBadge(profile.vocabulary.complexity + ' complexity', 'neutral') : ''}
                        ${profile.vocabulary.jargon_usage ? UIRenderer.createBadge(profile.vocabulary.jargon_usage + ' jargon', 'neutral') : ''}
                    </div>
                    ${profile.vocabulary.preferred_words?.length ? `<p style="margin-top: 8px; font-size: 13px;"><strong>Preferred words:</strong> ${escapeHtml(profile.vocabulary.preferred_words.slice(0, 10).join(', '))}</p>` : ''}
                </div>
            `;
        }

        // Structure
        if (profile.structure) {
            html += `
                <div class="profile-section">
                    <h4>Structure</h4>
                    <div class="trait-badges">
                        ${profile.structure.sentence_length ? UIRenderer.createBadge(profile.structure.sentence_length + ' sentences', 'neutral') : ''}
                        ${profile.structure.paragraph_length ? UIRenderer.createBadge(profile.structure.paragraph_length + ' paragraphs', 'neutral') : ''}
                    </div>
                    ${profile.structure.list_usage ? `<p style="margin-top: 8px; font-size: 13px;"><strong>List usage:</strong> ${escapeHtml(profile.structure.list_usage)}</p>` : ''}
                </div>
            `;
        }

        // Markers
        if (profile.markers) {
            const markers = [];
            if (profile.markers.contractions) markers.push(`Contractions: ${profile.markers.contractions}`);
            if (profile.markers.exclamations) markers.push(`Exclamations: ${profile.markers.exclamations}`);
            if (profile.markers.questions) markers.push(`Questions: ${profile.markers.questions}`);
            if (profile.markers.capitalization) markers.push(`Caps: ${profile.markers.capitalization}`);

            if (markers.length) {
                html += `
                    <div class="profile-section">
                        <h4>Writing Markers</h4>
                        <p style="font-size: 13px;">${markers.join(' | ')}</p>
                        ${profile.markers.signature_phrases?.length ? `<p style="font-size: 13px; margin-top: 8px;"><strong>Signature phrases:</strong> ${escapeHtml(profile.markers.signature_phrases.slice(0, 5).join(', '))}</p>` : ''}
                    </div>
                `;
            }
        }

        elements.fullProfileContent.innerHTML = html;
        showModal('full-profile-modal');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- URL Detection in Prompt ---

    function detectUrlsInPrompt() {
        const text = elements.promptInput.value;
        const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
        const urls = text.match(urlRegex) || [];

        if (urls.length === 0) {
            elements.urlArtifacts.classList.add('hidden');
            elements.urlArtifactsList.innerHTML = '';
            return;
        }

        // Remove duplicates
        const uniqueUrls = [...new Set(urls)];

        elements.urlArtifacts.classList.remove('hidden');
        elements.urlArtifactsList.innerHTML = uniqueUrls.map(url => `
            <div class="url-artifact-item" data-url="${escapeHtml(url)}">
                <span class="url-text" title="${escapeHtml(url)}">${escapeHtml(url)}</span>
                <span class="url-status" data-status="pending">Pending</span>
            </div>
        `).join('');
    }

    async function fetchPromptUrls() {
        const items = elements.urlArtifactsList.querySelectorAll('.url-artifact-item');
        const fetchedContent = [];

        for (const item of items) {
            const url = item.dataset.url;
            const statusEl = item.querySelector('.url-status');

            // Skip if already fetched
            if (state.fetchedUrlContent[url]) {
                statusEl.textContent = 'Cached';
                statusEl.className = 'url-status success';
                fetchedContent.push({ url, content: state.fetchedUrlContent[url] });
                continue;
            }

            statusEl.textContent = 'Fetching...';
            statusEl.className = 'url-status loading';

            try {
                const content = await ApiClient.fetchUrlContent(url);
                state.fetchedUrlContent[url] = content;
                statusEl.textContent = `${Math.round(content.length / 1000)}KB`;
                statusEl.className = 'url-status success';
                fetchedContent.push({ url, content });
            } catch (err) {
                statusEl.textContent = 'Failed';
                statusEl.className = 'url-status error';
                console.error('Failed to fetch URL:', url, err);
            }
        }

        return fetchedContent;
    }
})();
