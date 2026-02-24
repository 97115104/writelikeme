(() => {
    // Application state
    const state = {
        samples: [],
        profile: null,
        currentStep: 'input',
        profileAskedToSave: false,
        fetchedUrlContent: {}, // Cache for fetched URL content
        fetchedGitHubRepos: {}, // Cache for GitHub repo data
        selectedStyleTags: [], // Pending style suggestions
        appliedStyleTags: [], // Styles used for last generation
        styleFeedback: '', // Custom style feedback from studio
        appliedStyleFeedback: '', // Feedback used for last generation
        feedbackHistory: [], // Track all feedback with timestamps: [{text, timestamp, appliedStyles}]
        originalGeneratedContent: '', // Original content from generation (for diff tracking)
        editedContent: '', // User's edited version of content
        hasUnsavedEdits: false, // Track if user has edited content
        profStyleChecked: false, // Track if professional style modal was shown for current prompt
        profStyleOverride: null, // Professional style overrides from modal
        revisionHistory: [], // Array of {content, timestamp, styles, prompt} for result history
        currentRevisionIndex: -1, // Current position in revision history (-1 = not viewing history)
        hasGeneratedOnce: false // Track if user has generated at least once
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
        elements.folderInput = document.getElementById('folder-input');
        elements.btnSelectFolder = document.getElementById('btn-select-folder');

        // Analysis error modal
        elements.analysisErrorModal = document.getElementById('analysis-error-modal');
        elements.analysisErrorReason = document.getElementById('analysis-error-reason');
        elements.btnRetryAnalysis = document.getElementById('btn-retry-analysis');
        elements.btnTruncateRetry = document.getElementById('btn-truncate-retry');
        elements.truncateInfo = document.getElementById('truncate-info');
        elements.btnCloseAnalysisError = document.getElementById('btn-close-analysis-error');
        elements.btnCloseAnalysisError2 = document.getElementById('btn-close-analysis-error-2');

        // Profile input
        elements.profileInput = document.getElementById('profile-input');
        elements.btnLoadProfile = document.getElementById('btn-load-profile');
        elements.profileFileInput = document.getElementById('profile-file-input');

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

        // Profile metrics (Dreyfus-based)
        elements.masteryLevel = document.getElementById('mastery-level');
        elements.technicalLevel = document.getElementById('technical-level');
        elements.sampleSummary = document.getElementById('sample-summary');
        elements.voiceConsistency = document.getElementById('voice-consistency');
        elements.patternDensity = document.getElementById('pattern-density');
        elements.lexicalDiversity = document.getElementById('lexical-diversity');

        // Generate step
        elements.contentCategory = document.getElementById('content-category');
        elements.toneSelector = document.getElementById('tone-selector');
        elements.contentTone = document.getElementById('content-tone');
        elements.promptInput = document.getElementById('prompt-input');
        elements.btnGenerate = document.getElementById('btn-generate');
        elements.generateLoading = document.getElementById('generate-loading');
        elements.outputSection = document.getElementById('output-section');
        elements.outputHeader = document.getElementById('output-header');
        elements.outputBody = document.getElementById('output-body');
        elements.btnToggleOutput = document.getElementById('btn-toggle-output');
        elements.generatedContent = document.getElementById('generated-content');
        elements.editIndicator = document.getElementById('edit-indicator');
        elements.btnSaveEdits = document.getElementById('btn-save-edits');
        elements.btnDiscardEdits = document.getElementById('btn-discard-edits');
        elements.btnCopyOutput = document.getElementById('btn-copy-output');
        elements.btnRegenerate = document.getElementById('btn-regenerate');
        elements.btnViewFeedback = document.getElementById('btn-view-feedback');
        elements.btnEditStyle = document.getElementById('btn-edit-style');
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

        // GitHub artifacts
        elements.githubArtifacts = document.getElementById('github-artifacts');
        elements.githubArtifactsList = document.getElementById('github-artifacts-list');

        // Style builder
        elements.styleBuilder = document.getElementById('style-builder');
        elements.styleSuggestions = document.getElementById('style-suggestions');

        // Style Studio modal
        elements.styleStudioModal = document.getElementById('style-studio-modal');
        elements.btnCloseStyleStudio = document.getElementById('btn-close-style-studio');
        elements.styleStudioList = document.getElementById('style-studio-list');
        elements.styleFeedback = document.getElementById('style-feedback');
        elements.btnStyleStudioCancel = document.getElementById('btn-style-studio-cancel');
        elements.btnStyleStudioSave = document.getElementById('btn-style-studio-save');
        elements.btnStyleStudioApply = document.getElementById('btn-style-studio-apply');
        elements.btnStyleStudioRegenerate = document.getElementById('btn-style-studio-regenerate');
        elements.stylePreviewSection = document.getElementById('style-preview-section');
        elements.stylePreviewMetrics = document.getElementById('style-preview-metrics');
        elements.feedbackHistorySection = document.getElementById('feedback-history-section');
        elements.feedbackHistoryList = document.getElementById('feedback-history-list');
        elements.feedbackCount = document.getElementById('feedback-count');

        // Regenerate confirmation modal
        elements.regenerateConfirmModal = document.getElementById('regenerate-confirm-modal');
        elements.btnCloseRegenerateConfirm = document.getElementById('btn-close-regenerate-confirm');
        elements.regenerateChangesList = document.getElementById('regenerate-changes-list');
        elements.btnRegenerateEditMore = document.getElementById('btn-regenerate-edit-more');
        elements.btnRegenerateConfirm = document.getElementById('btn-regenerate-confirm');

        // Revision history
        elements.btnRevisionHistory = document.getElementById('btn-revision-history');
        elements.revisionHistoryModal = document.getElementById('revision-history-modal');
        elements.btnCloseRevisionHistory = document.getElementById('btn-close-revision-history');
        elements.revisionHistoryList = document.getElementById('revision-history-list');

        // Feedback modal
        elements.feedbackModal = document.getElementById('feedback-modal');
        elements.btnCloseFeedbackModal = document.getElementById('btn-close-feedback-modal');
        elements.feedbackModalList = document.getElementById('feedback-modal-list');

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

        // Clear profile modal (on generate step)
        elements.btnClearProfileGenerate = document.getElementById('btn-clear-profile-generate');
        elements.clearProfileModal = document.getElementById('clear-profile-modal');
        elements.btnCloseClearProfile = document.getElementById('btn-close-clear-profile');
        elements.btnClearProfileCancel = document.getElementById('btn-clear-profile-cancel');
        elements.btnClearProfileConfirm = document.getElementById('btn-clear-profile-confirm');

        // Share buttons
        elements.shareButtons = document.getElementById('share-buttons');
        elements.btnShareX = document.getElementById('btn-share-x');
        elements.btnShareLinkedin = document.getElementById('btn-share-linkedin');
        elements.btnShareFacebook = document.getElementById('btn-share-facebook');
        elements.btnShareReddit = document.getElementById('btn-share-reddit');
        elements.btnShareInstagram = document.getElementById('btn-share-instagram');
        elements.btnShareThreads = document.getElementById('btn-share-threads');
        elements.btnShowAllShare = document.getElementById('btn-show-all-share');
        elements.shareAllPlatforms = document.getElementById('share-all-platforms');

        // LinkedIn share modal
        elements.linkedinShareModal = document.getElementById('linkedin-share-modal');
        elements.btnCloseLinkedinModal = document.getElementById('btn-close-linkedin-modal');
        elements.btnLinkedinOpen = document.getElementById('btn-linkedin-open');

        // URL content preview modal
        elements.urlContentModal = document.getElementById('url-content-modal');
        elements.btnCloseUrlContent = document.getElementById('btn-close-url-content');
        elements.urlContentSourceLink = document.getElementById('url-content-source-link');
        elements.urlContentText = document.getElementById('url-content-text');
        elements.btnUrlContentSave = document.getElementById('btn-url-content-save');

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
        elements.dropArea.addEventListener('click', (e) => {
            // Don't trigger file input if clicking on the folder button
            if (e.target !== elements.btnSelectFolder) {
                elements.fileInput.click();
            }
        });
        elements.dropArea.addEventListener('dragover', handleDragOver);
        elements.dropArea.addEventListener('dragleave', handleDragLeave);
        elements.dropArea.addEventListener('drop', handleDrop);
        elements.fileInput.addEventListener('change', handleFileSelect);
        
        // Folder input (for Scrivener projects)
        elements.folderInput?.addEventListener('change', handleFolderSelect);
        elements.btnSelectFolder?.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.folderInput?.click();
        });

        // Analysis error modal
        elements.btnRetryAnalysis?.addEventListener('click', () => {
            hideModal('analysis-error-modal');
            analyzeWriting();
        });
        elements.btnTruncateRetry?.addEventListener('click', () => {
            hideModal('analysis-error-modal');
            analyzeWriting({ truncate: true });
        });
        elements.btnCloseAnalysisError?.addEventListener('click', () => hideModal('analysis-error-modal'));
        elements.btnCloseAnalysisError2?.addEventListener('click', () => hideModal('analysis-error-modal'));

        // Profile input
        elements.btnLoadProfile.addEventListener('click', loadProfile);
        elements.profileFileInput?.addEventListener('change', handleProfileFileUpload);

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
        elements.btnGenerate.addEventListener('click', handleGenerateClick);
        elements.btnRegenerate.addEventListener('click', handleRegenerateClick);
        elements.btnCopyOutput.addEventListener('click', copyOutput);
        elements.btnSaveEdits?.addEventListener('click', saveContentEdits);
        elements.btnEditStyle?.addEventListener('click', openStyleStudio);
        elements.btnViewFeedback?.addEventListener('click', openFeedbackModal);
        elements.btnBackProfile.addEventListener('click', () => goToStep('profile'));
        
        // Revision history
        elements.btnRevisionHistory?.addEventListener('click', openRevisionHistory);
        elements.btnCloseRevisionHistory?.addEventListener('click', () => hideModal('revision-history-modal'));
        elements.revisionHistoryList?.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-restore');
            if (btn) {
                const item = btn.closest('.revision-item');
                const index = parseInt(item?.dataset.index, 10);
                if (!isNaN(index)) handleRevisionSelect(index);
            }
        });
        
        // Content edit tracking
        elements.generatedContent?.addEventListener('input', handleContentEdit);

        // Content type category and tone selection
        elements.contentCategory?.addEventListener('change', handleContentCategoryChange);
        elements.contentTone?.addEventListener('change', detectPlatformInPrompt);

        // Profile preview bar
        elements.btnQuickProfile?.addEventListener('click', showQuickProfile);
        elements.btnFullProfile?.addEventListener('click', showFullProfile);

        // URL, GitHub, platform detection and style suggestions in prompt
        let lastPromptForPlatformReset = '';
        elements.promptInput.addEventListener('input', () => {
            detectUrlsInPrompt();
            detectGitHubRepos();
            
            // Reset platformDismissed if prompt changed significantly
            const currentPrompt = elements.promptInput.value;
            if (Math.abs(currentPrompt.length - lastPromptForPlatformReset.length) > 20) {
                platformDismissed = false;
                lastPromptForPlatformReset = currentPrompt;
            }
            
            detectPlatformInPrompt();
            updateStyleSuggestions();
            autoSelectEmojiStyle();
            state.profStyleChecked = false; // Reset on prompt change
            
            // Handle output collapse when prompt is cleared after generating
            handlePromptClearBehavior();
        });

        // Dismiss platform detection
        elements.platformInfo?.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-dismiss-platform')) {
                platformDismissed = true;
                detectedPlatform = null;
                elements.platformArtifacts.classList.add('hidden');
            }
        });

        // Output toggle button
        elements.btnToggleOutput?.addEventListener('click', toggleOutputCollapse);

        // Style tag clicks
        elements.styleSuggestions?.addEventListener('click', handleStyleTagClick);

        // Style Studio modal
        elements.btnCloseStyleStudio?.addEventListener('click', () => hideModal('style-studio-modal'));
        elements.btnStyleStudioCancel?.addEventListener('click', () => hideModal('style-studio-modal'));
        elements.btnStyleStudioSave?.addEventListener('click', saveStylesAndContinue);
        elements.btnStyleStudioApply?.addEventListener('click', applyStyleStudio);
        elements.btnStyleStudioRegenerate?.addEventListener('click', regenerateWithStyles);
        elements.styleStudioList?.addEventListener('click', handleStyleStudioItemClick);

        // Regenerate confirmation modal
        elements.btnCloseRegenerateConfirm?.addEventListener('click', () => hideModal('regenerate-confirm-modal'));
        elements.btnRegenerateEditMore?.addEventListener('click', () => {
            hideModal('regenerate-confirm-modal');
            openStyleStudio();
        });
        elements.btnRegenerateConfirm?.addEventListener('click', () => {
            hideModal('regenerate-confirm-modal');
            // Save any unsaved edits as feedback before regenerating
            if (state.hasUnsavedEdits) {
                saveContentEdits();
            }
            generateContent();
        });
        
        // Revision history modal
        elements.btnCloseRevisionHistory?.addEventListener('click', () => hideModal('revision-history-modal'));
        elements.revisionHistoryList?.addEventListener('click', (e) => {
            const restoreBtn = e.target.closest('.btn-restore');
            if (restoreBtn) {
                const item = restoreBtn.closest('.revision-item');
                if (item) {
                    const index = parseInt(item.dataset.index, 10);
                    handleRevisionSelect(index);
                }
            }
        });
        
        // Feedback modal
        elements.btnCloseFeedbackModal?.addEventListener('click', () => hideModal('feedback-modal'));
        
        // Edit controls
        elements.btnDiscardEdits?.addEventListener('click', discardContentEdits);

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

        // Clear profile modal (from generate step)
        elements.btnClearProfileGenerate?.addEventListener('click', () => showModal('clear-profile-modal'));
        elements.btnCloseClearProfile?.addEventListener('click', () => hideModal('clear-profile-modal'));
        elements.btnClearProfileCancel?.addEventListener('click', () => hideModal('clear-profile-modal'));
        elements.btnClearProfileConfirm?.addEventListener('click', clearProfileAndRestart);

        // Share buttons - primary
        elements.btnShareX?.addEventListener('click', () => shareToX());
        elements.btnShareLinkedin?.addEventListener('click', () => shareToLinkedin());
        elements.btnShareFacebook?.addEventListener('click', () => shareToFacebook());
        elements.btnShareReddit?.addEventListener('click', () => shareToReddit());
        elements.btnShareInstagram?.addEventListener('click', () => shareToInstagram());
        elements.btnShareThreads?.addEventListener('click', () => shareToThreads());
        
        // Share buttons - all platforms section
        document.getElementById('btn-share-x-all')?.addEventListener('click', () => shareToX());
        document.getElementById('btn-share-linkedin-all')?.addEventListener('click', () => shareToLinkedin());
        document.getElementById('btn-share-facebook-all')?.addEventListener('click', () => shareToFacebook());
        document.getElementById('btn-share-reddit-all')?.addEventListener('click', () => shareToReddit());
        
        // Show all share platforms toggle
        elements.btnShowAllShare?.addEventListener('click', () => {
            elements.shareAllPlatforms?.classList.toggle('hidden');
            const isHidden = elements.shareAllPlatforms?.classList.contains('hidden');
            elements.btnShowAllShare.textContent = isHidden ? 'More platforms' : 'Hide';
        });

        // LinkedIn share modal
        elements.btnCloseLinkedinModal?.addEventListener('click', () => hideModal('linkedin-share-modal'));
        elements.btnLinkedinOpen?.addEventListener('click', () => {
            hideModal('linkedin-share-modal');
            window.open('https://www.linkedin.com/feed/', '_blank');
        });

        // URL content preview modal
        elements.btnCloseUrlContent?.addEventListener('click', () => hideModal('url-content-modal'));
        elements.btnUrlContentSave?.addEventListener('click', saveUrlContent);
        
        // Delegate click events on URL artifacts list
        elements.urlArtifactsList?.addEventListener('click', handleUrlArtifactClick);

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

        // Whodoneit button
        document.getElementById('whodoneit-check-btn')?.addEventListener('click', () => {
            const url = document.getElementById('whodoneit-check-btn')?.dataset.url;
            if (url) window.open(url, '_blank');
        });

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

        // Initialize content category state
        handleContentCategoryChange();
    }

    // --- Content Type Management ---

    // Categories that have tone options - dynamically pull from CONTENT_TYPES
    function getCategoriesWithTones() {
        if (!window.CONTENT_TYPES?.categories) return ['social', 'blog', 'email', 'bio', 'poetry'];
        return Object.entries(window.CONTENT_TYPES.categories)
            .filter(([key, cat]) => cat.hasTones)
            .map(([key]) => key);
    }

    function handleContentCategoryChange() {
        const category = elements.contentCategory?.value;
        const contentTypes = window.CONTENT_TYPES?.categories;
        const categoryConfig = contentTypes?.[category];
        const hasTones = categoryConfig?.hasTones;
        
        if (hasTones && categoryConfig.tones) {
            elements.toneSelector?.classList.remove('hidden');
            
            // Populate tone dropdown dynamically
            const toneOptions = Object.entries(categoryConfig.tones).map(([key, tone]) => 
                `<option value="${key}">${tone.label}</option>`
            ).join('');
            elements.contentTone.innerHTML = toneOptions;
            
            // Set default tone
            elements.contentTone.value = categoryConfig.defaultTone || Object.keys(categoryConfig.tones)[0];
        } else {
            elements.toneSelector?.classList.add('hidden');
        }
        
        // Auto-add emoji style for personal text/email with emotional content
        autoSelectEmojiStyle();
        
        // Re-detect platform when category changes
        detectPlatformInPrompt();
    }
    
    function autoSelectEmojiStyle() {
        const category = elements.contentCategory?.value;
        const tone = elements.contentTone?.value;
        const promptText = elements.promptInput?.value.toLowerCase() || '';
        
        // Check if personal text/chat or personal email category
        const isPersonalMessaging = category === 'text' && (tone === 'personal' || tone === 'chat');
        const isPersonalEmail = category === 'email' && tone === 'personal';
        
        if (isPersonalMessaging || isPersonalEmail) {
            // Check for emotional keywords
            const emotionalKeywords = ['love', 'miss', 'heart', 'happy', 'sad', 'excited', 'congrats', 'congratulations', 
                'thank', 'sorry', 'support', 'proud', 'amazing', 'celebrate', 'birthday', 'anniversary', 'hug', 
                'feel', 'feeling', 'emotional', 'care', 'caring'];
            const hasEmotion = emotionalKeywords.some(kw => promptText.includes(kw));
            
            if (hasEmotion) {
                let updated = false;
                if (!state.selectedStyleTags.includes('emoji')) {
                    state.selectedStyleTags.push('emoji');
                    updated = true;
                }
                if (!state.selectedStyleTags.includes('conversational')) {
                    state.selectedStyleTags.push('conversational');
                    updated = true;
                }
                if (updated) {
                    updateStyleSuggestions();
                }
            }
        }
    }

    function getContentTypeKey() {
        const category = elements.contentCategory?.value || 'blog';
        const contentTypes = window.CONTENT_TYPES?.categories;
        const categoryConfig = contentTypes?.[category];
        const hasTones = categoryConfig?.hasTones;
        
        if (hasTones) {
            const tone = elements.contentTone?.value || categoryConfig?.defaultTone || 'personal';
            return `${category}-${tone}`;
        }
        return category;
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
        const items = e.dataTransfer.items;
        
        // Check if any item is a directory (for .scriv folder support)
        if (items && items.length > 0) {
            const hasDirectory = Array.from(items).some(item => {
                const entry = item.webkitGetAsEntry && item.webkitGetAsEntry();
                return entry && entry.isDirectory;
            });
            
            if (hasDirectory) {
                // Process directory (Scrivener project)
                processDirectoryUpload(items);
                return;
            }
        }
        
        processFiles(files);
    }

    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        processFiles(files);
        e.target.value = ''; // Reset for re-upload
    }

    function handleFolderSelect(e) {
        console.log('[WriteMe] Folder selected via input');
        const files = Array.from(e.target.files);
        console.log('[WriteMe] Found', files.length, 'files in folder');
        processFiles(files);
        e.target.value = ''; // Reset for re-upload
    }

    // Process a dropped directory (for Scrivener .scriv packages)
    async function processDirectoryUpload(items) {
        console.log('[WriteMe] Processing directory upload...');
        const files = [];
        
        for (const item of items) {
            const entry = item.webkitGetAsEntry && item.webkitGetAsEntry();
            if (entry) {
                await traverseDirectory(entry, files);
            }
        }
        
        if (files.length > 0) {
            console.log('[WriteMe] Found', files.length, 'files in directory');
            processFiles(files);
        } else {
            UIRenderer.showError('No readable text files found in the dropped folder.');
        }
    }
    
    // Recursively traverse directory to find RTF/text files
    async function traverseDirectory(entry, files) {
        if (entry.isFile) {
            const file = await getFileFromEntry(entry);
            if (file) files.push(file);
        } else if (entry.isDirectory) {
            const reader = entry.createReader();
            const entries = await new Promise((resolve) => {
                reader.readEntries(resolve);
            });
            for (const childEntry of entries) {
                await traverseDirectory(childEntry, files);
            }
        }
    }
    
    function getFileFromEntry(entry) {
        return new Promise((resolve) => {
            entry.file(file => resolve(file), () => resolve(null));
        });
    }

    async function processFiles(files) {
        console.log('[WriteMe] Processing', files.length, 'files');
        
        // Supported file types: txt, md, rtf (Scrivener), text
        const validFiles = files.filter(f =>
            f.name.endsWith('.txt') || 
            f.name.endsWith('.md') || 
            f.name.endsWith('.text') ||
            f.name.endsWith('.rtf') ||  // Scrivener uses RTF
            f.name.endsWith('.pdf')     // PDF support via PDF.js
        );

        console.log('[WriteMe] Valid files:', validFiles.map(f => f.name));

        if (validFiles.length === 0) {
            console.warn('[WriteMe] No valid files found');
            UIRenderer.showError('Please upload .txt, .md, .rtf, or .pdf files. For Scrivener projects, you can drop the .scriv folder directly.');
            return;
        }

        for (const file of validFiles) {
            try {
                console.log('[WriteMe] Reading file:', file.name);
                let content;
                
                if (file.name.endsWith('.pdf')) {
                    // Parse PDF to plain text using PDF.js
                    content = await parsePDF(file);
                    console.log('[WriteMe] PDF parsed:', file.name, '- Text length:', content.length);
                } else if (file.name.endsWith('.rtf')) {
                    // Parse RTF to plain text
                    const rtfContent = await readFile(file);
                    content = parseRTF(rtfContent);
                    console.log('[WriteMe] RTF parsed:', file.name, '- Text length:', content.length);
                } else {
                    content = await readFile(file);
                }
                
                // Skip empty or very short files
                if (content.trim().length < 50) {
                    console.log('[WriteMe] Skipping short file:', file.name);
                    continue;
                }
                
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

    // Parse RTF content to plain text (handles Scrivener RTF format)
    function parseRTF(rtf) {
        // Remove RTF header/control words and extract text
        let text = rtf;
        
        // Remove RTF version and charset headers
        text = text.replace(/^\{\\rtf1[^}]*\{/i, '{');
        
        // Handle Unicode escapes: \u12345? (the ? is a placeholder)
        text = text.replace(/\\u(-?\d+)[\?\s]?/g, (match, code) => {
            return String.fromCharCode(parseInt(code, 10));
        });
        
        // Remove font tables, color tables, stylesheet, etc.
        text = text.replace(/\{\\fonttbl[^}]*\}/gi, '');
        text = text.replace(/\{\\colortbl[^}]*\}/gi, '');
        text = text.replace(/\{\\stylesheet[^}]*\}/gi, '');
        text = text.replace(/\{\\info[^}]*\}/gi, '');
        text = text.replace(/\{\\[^{}]*\}/g, '');
        
        // Remove Scrivener-specific control sequences
        text = text.replace(/\\Scrivener[a-z]*/gi, '');
        
        // Handle line breaks
        text = text.replace(/\\par\s*/g, '\n');
        text = text.replace(/\\line\s*/g, '\n');
        text = text.replace(/\\\n/g, '\n');
        
        // Handle special characters
        text = text.replace(/\\'/g, '\'');
        text = text.replace(/\\rquote\s*/g, '\'');
        text = text.replace(/\\lquote\s*/g, '\'');
        text = text.replace(/\\rdblquote\s*/g, '"');
        text = text.replace(/\\ldblquote\s*/g, '"');
        text = text.replace(/\\endash\s*/g, '–');
        text = text.replace(/\\emdash\s*/g, '—');
        text = text.replace(/\\bullet\s*/g, '•');
        text = text.replace(/\\tab\s*/g, '\t');
        
        // Remove all remaining control words (\word or \word0)
        text = text.replace(/\\[a-z]+\d*\s*/gi, '');
        
        // Remove braces
        text = text.replace(/[{}]/g, '');
        
        // Clean up whitespace
        text = text.replace(/\r\n/g, '\n');
        text = text.replace(/\r/g, '\n');
        text = text.replace(/\n{3,}/g, '\n\n');
        text = text.replace(/[ \t]+/g, ' ');
        text = text.trim();
        
        return text;
    }

    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    // Parse PDF to plain text using PDF.js
    async function parsePDF(file) {
        // Check if PDF.js is available
        if (typeof pdfjsLib === 'undefined') {
            console.error('[WriteMe] PDF.js not loaded');
            throw new Error('PDF.js library not available');
        }

        // Set worker source (use CDN)
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        try {
            // Read file as ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            
            // Load the PDF document
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            console.log('[WriteMe] PDF loaded:', file.name, '- Pages:', pdf.numPages);
            
            let fullText = '';
            
            // Extract text from each page
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                
                // Combine text items, preserving some structure
                const pageText = textContent.items
                    .map(item => item.str)
                    .join(' ');
                
                fullText += pageText + '\n\n';
            }
            
            // Clean up the text
            fullText = fullText
                .replace(/\s+/g, ' ')           // Normalize whitespace
                .replace(/\n\s*\n/g, '\n\n')    // Clean up paragraph breaks
                .trim();
            
            return fullText;
        } catch (err) {
            console.error('[WriteMe] PDF parsing error:', err);
            throw new Error(`Failed to parse PDF: ${err.message}`);
        }
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

    async function analyzeWriting(options = {}) {
        console.log('[WriteMe] Starting analysis with', state.samples.length, 'samples');
        
        if (state.samples.length === 0) {
            console.warn('[WriteMe] No samples to analyze');
            return;
        }

        UIRenderer.hideError();
        goToStep('profile');

        console.log('[WriteMe] Showing loading indicator');
        if (options.truncate) {
            console.log('[WriteMe] TRUNCATE MODE ENABLED');
        }
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
            state.profile = await WritingAnalyzer.analyzeWriting(state.samples, config, options);
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
            } else if (err.code === 'INVALID_PROFILE_SCHEMA') {
                console.log('[WriteMe] Showing analysis error modal');
                showAnalysisError(err.message);
                goToStep('input');
            } else {
                console.log('[WriteMe] Showing error message');
                UIRenderer.showError(err.message);
                goToStep('input');
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
        
        if (!state.profile) {
            UIRenderer.showError('No writing profile found. Please analyze your writing samples first.');
            return;
        }
        
        // Validate profile has required structure
        if (!state.profile.style && !state.profile.tone && !state.profile.vocabulary) {
            UIRenderer.showError('Invalid writing profile. Please re-analyze your writing samples.');
            return;
        }
        
        console.log('[WriteMe] Starting generation with profile:', state.profile ? 'present' : 'null');
        console.log('[WriteMe] Profile summary:', state.profile?.profile_summary?.substring(0, 100) || 'No summary');

        UIRenderer.hideError();
        elements.generateLoading.classList.remove('hidden');
        elements.outputSection.classList.add('hidden');

        try {
            const config = getApiConfig();
            const contentType = getContentTypeKey();

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

            // Fetch any GitHub repos in the prompt
            const githubItems = elements.githubArtifactsList?.querySelectorAll('.github-artifact-item') || [];
            if (githubItems.length > 0) {
                const loadingStatus = document.querySelector('#generate-loading .loading-status');
                if (loadingStatus) loadingStatus.textContent = 'Fetching GitHub repository data...';

                const repos = await fetchAllGitHubRepos();

                // Append repo data to the prompt
                if (repos.length > 0) {
                    prompt += '\n\n--- GitHub Repository Data ---\n';
                    repos.forEach(({ repo, data }) => {
                        prompt += `\n[Repository: ${repo}]\n`;
                        prompt += `Description: ${data.description || 'No description'}\n`;
                        prompt += `Language: ${data.language || 'Unknown'}\n`;
                        prompt += `Stars: ${data.stars}, Forks: ${data.forks}\n`;
                        prompt += `License: ${data.license}\n`;
                        if (data.topics?.length) prompt += `Topics: ${data.topics.join(', ')}\n`;
                        if (data.readme) {
                            const readmeTruncated = data.readme.length > 3000 
                                ? data.readme.substring(0, 3000) + '...[truncated]' 
                                : data.readme;
                            prompt += `\nREADME:\n${readmeTruncated}\n`;
                        }
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

            // Get style builder overrides
            const styleOverride = getStyleOverridePrompt();
            
            // Track what styles are being applied for this generation
            state.appliedStyleTags = [...state.selectedStyleTags];
            state.appliedStyleFeedback = state.styleFeedback;

            // Generate with platform context if detected
            const platformContext = getPlatformStyleContext() + professionalOverride + styleOverride;
            let content = await WritingAnalyzer.generateContent(
                state.profile,
                prompt,
                contentType,
                config,
                platformContext
            );

            // Auto-fix slop before presenting - comprehensive AI pattern detection
            let slopResults = WritingAnalyzer.detectSlop(content);
            console.log('[WriteMe] Slop detection:', slopResults.slopScore, 'score,', slopResults.issues.length, 'issues');
            
            if (slopResults.requiresFix) {
                console.log('[WriteMe] Critical/high severity slop detected, auto-fixing...');
                const loadingStatus = document.querySelector('#generate-loading .loading-status');
                if (loadingStatus) loadingStatus.textContent = 'Removing AI patterns from generated text...';

                content = await WritingAnalyzer.fixSlop(content, config, slopResults);
                slopResults = WritingAnalyzer.detectSlop(content);
                console.log('[WriteMe] Post-fix slop:', slopResults.slopScore, 'score');
            }

            // Display result
            elements.generatedContent.textContent = content;
            
            // Store original for diff tracking
            state.originalGeneratedContent = content;
            state.editedContent = '';
            state.hasUnsavedEdits = false;
            state.hasGeneratedOnce = true;
            state.currentRevisionIndex = -1; // Reset to "not viewing history"
            updateEditIndicator();
            
            // Save to revision history
            saveToRevisionHistory(content);
            
            // Store for sharing
            state.generatedContent = content;
            state.lastDetectedPlatform = detectedPlatform;
            
            // Update share buttons visibility
            updateShareButtons();

            // Check for remaining slop
            UIRenderer.renderSlopCheck(slopResults, elements.slopIssues);

            elements.generateLoading.classList.add('hidden');
            elements.outputSection.classList.remove('hidden');
            expandOutput(); // Ensure output is visible when generating new content
            elements.btnToggleOutput?.classList.add('hidden'); // Hide toggle on fresh generation

            // Reset professional style state for next generation
            state.profStyleOverride = null;

        } catch (err) {
            console.error('[WriteMe] Generation error:', err);
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
        // Use innerText to get edited content from contenteditable, preserving line breaks
        const content = elements.generatedContent.innerText;

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

    // --- Content Edit Tracking ---

    function handleContentEdit() {
        const currentContent = elements.generatedContent.innerText;
        const hasChanged = currentContent !== state.originalGeneratedContent;
        
        if (hasChanged && !state.hasUnsavedEdits) {
            state.hasUnsavedEdits = true;
            state.editedContent = currentContent;
            updateEditIndicator();
        } else if (hasChanged) {
            state.editedContent = currentContent;
        } else if (!hasChanged && state.hasUnsavedEdits) {
            // User reverted to original
            state.hasUnsavedEdits = false;
            state.editedContent = '';
            updateEditIndicator();
        }
    }

    function updateEditIndicator() {
        if (!elements.editIndicator) return;
        
        if (state.hasUnsavedEdits) {
            elements.editIndicator.classList.remove('hidden');
        } else {
            elements.editIndicator.classList.add('hidden');
        }
    }

    function saveContentEdits() {
        if (!state.hasUnsavedEdits) return;
        
        // Calculate edit summary for feedback
        const original = state.originalGeneratedContent;
        const edited = state.editedContent;
        const editSummary = generateEditSummary(original, edited);
        
        // Add as implicit feedback
        if (editSummary) {
            addFeedbackToHistory(`[User edits] ${editSummary}`);
        }
        
        // Update original to the saved version
        state.originalGeneratedContent = edited;
        state.editedContent = '';
        state.hasUnsavedEdits = false;
        state.generatedContent = edited; // Update for sharing
        updateEditIndicator();
        updateViewFeedbackButton();
        
        // Show confirmation
        elements.btnSaveEdits.textContent = 'Saved!';
        setTimeout(() => {
            elements.btnSaveEdits.textContent = 'Save Edits';
        }, 1500);
    }

    function discardContentEdits() {
        if (!state.hasUnsavedEdits) return;
        
        // Restore original content
        elements.generatedContent.textContent = state.originalGeneratedContent;
        state.editedContent = '';
        state.hasUnsavedEdits = false;
        updateEditIndicator();
    }

    function generateEditSummary(original, edited) {
        const originalWords = original.split(/\s+/).filter(w => w);
        const editedWords = edited.split(/\s+/).filter(w => w);
        
        const wordDiff = editedWords.length - originalWords.length;
        const charDiff = edited.length - original.length;
        
        const parts = [];
        
        if (wordDiff > 0) {
            parts.push(`added ${wordDiff} words`);
        } else if (wordDiff < 0) {
            parts.push(`removed ${Math.abs(wordDiff)} words`);
        }
        
        if (charDiff > 0) {
            parts.push(`expanded by ${charDiff} characters`);
        } else if (charDiff < 0) {
            parts.push(`shortened by ${Math.abs(charDiff)} characters`);
        }
        
        // Check for structural changes
        const originalParagraphs = original.split(/\n\n+/).length;
        const editedParagraphs = edited.split(/\n\n+/).length;
        if (editedParagraphs !== originalParagraphs) {
            parts.push(`restructured paragraphs (${originalParagraphs} → ${editedParagraphs})`);
        }
        
        return parts.length > 0 ? parts.join(', ') : 'minor edits';
    }

    function handleGenerateClick() {
        // Only show confirmation modal if:
        // 1. We've already generated once, AND
        // 2. There are edits, feedback, or style changes to apply
        if (state.hasGeneratedOnce) {
            const hasEdits = state.hasUnsavedEdits;
            const hasFeedback = state.feedbackHistory.length > 0;
            const hasUnsavedFeedback = elements.styleFeedback?.value.trim();
            const hasStyleChanges = state.selectedStyleTags.length > 0 && 
                JSON.stringify(state.selectedStyleTags) !== JSON.stringify(state.appliedStyleTags);
            
            if (hasEdits || hasFeedback || hasUnsavedFeedback || hasStyleChanges) {
                showRegenerateConfirmation();
                return;
            }
        }
        
        generateContent();
    }

    function handleRegenerateClick() {
        // Check if there are any changes that warrant a confirmation
        const hasStyleChanges = state.selectedStyleTags.length > 0 || 
            (state.appliedStyleTags.length > 0 && 
             JSON.stringify(state.selectedStyleTags) !== JSON.stringify(state.appliedStyleTags));
        const hasFeedback = state.feedbackHistory.length > 0;
        const hasEdits = state.hasUnsavedEdits;
        const hasUnsavedFeedback = elements.styleFeedback?.value.trim();
        
        if (hasStyleChanges || hasFeedback || hasEdits || hasUnsavedFeedback) {
            showRegenerateConfirmation();
        } else {
            generateContent();
        }
    }

    function showRegenerateConfirmation() {
        const changes = [];
        
        if (state.feedbackHistory.length > 0) {
            const impactPct = Math.min(state.feedbackHistory.length * 15, 60);
            changes.push({
                label: 'Feedback',
                text: `${state.feedbackHistory.length} note${state.feedbackHistory.length > 1 ? 's' : ''} guiding output`,
                impact: `+${impactPct}% accuracy`
            });
        }
        
        if (state.hasUnsavedEdits) {
            const editSummary = generateEditSummary(state.originalGeneratedContent, state.editedContent);
            changes.push({
                label: 'Your edits',
                text: editSummary,
                impact: '+25% relevance'
            });
        }
        
        if (state.selectedStyleTags.length > 0) {
            const styleLabels = state.selectedStyleTags
                .map(s => STYLE_BUILDER[s]?.label || s)
                .join(', ');
            const tonePct = state.selectedStyleTags.length * 12;
            changes.push({
                label: 'Style',
                text: styleLabels,
                impact: `+${tonePct}% tone match`
            });
        }
        
        if (elements.styleFeedback?.value.trim()) {
            const feedbackText = elements.styleFeedback.value.trim();
            changes.push({
                label: 'New guidance',
                text: `"${feedbackText.substring(0, 50)}${feedbackText.length > 50 ? '...' : ''}"`,
                impact: '+20% direction'
            });
        }
        
        // Build the changes list HTML
        if (elements.regenerateChangesList) {
            elements.regenerateChangesList.innerHTML = changes.map(c => 
                `<li>
                    <span class="change-label">${c.label}</span>
                    <span class="change-text">${c.text}</span>
                    <span class="change-impact">${c.impact}</span>
                </li>`
            ).join('');
        }
        
        showModal('regenerate-confirm-modal');
    }

    // --- Sharing Functions ---

    // Platform to share button mapping
    const PLATFORM_SHARE_MAP = {
        'x': 'btn-share-x',
        'twitter': 'btn-share-x',
        'linkedin': 'btn-share-linkedin',
        'facebook': 'btn-share-facebook',
        'instagram': 'btn-share-instagram',
        'threads': 'btn-share-threads',
        'reddit': 'btn-share-reddit'
    };

    function updateShareButtons() {
        const platform = state.lastDetectedPlatform;
        const socialPlatforms = Object.keys(PLATFORM_SHARE_MAP);
        
        // Hide all primary share buttons first
        const allShareBtns = ['btn-share-x', 'btn-share-linkedin', 'btn-share-facebook', 'btn-share-reddit', 'btn-share-instagram', 'btn-share-threads'];
        allShareBtns.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.classList.add('hidden');
        });
        
        // Hide the "more platforms" section
        elements.shareAllPlatforms?.classList.add('hidden');
        elements.btnShowAllShare?.classList.remove('hidden');
        
        if (platform && socialPlatforms.includes(platform)) {
            elements.shareButtons?.classList.remove('hidden');
            
            // Show only the detected platform's button
            const targetBtnId = PLATFORM_SHARE_MAP[platform];
            const targetBtn = document.getElementById(targetBtnId);
            if (targetBtn) {
                targetBtn.classList.remove('hidden');
            }
        } else {
            elements.shareButtons?.classList.add('hidden');
        }
        
        // Update whodoneit link
        updateWhodoneitLink();
    }

    function updateWhodoneitLink() {
        const content = state.generatedContent || '';
        const whodoneitLink = document.getElementById('whodoneit-link');
        const whodoneitCheckBtn = document.getElementById('whodoneit-check-btn');
        
        if (content && whodoneitLink) {
            whodoneitLink.classList.remove('hidden');
            
            // Store the URL for the button click handler
            if (whodoneitCheckBtn) {
                const encodedContent = encodeURIComponent(content.substring(0, 2000)); // Limit for URL length
                whodoneitCheckBtn.dataset.url = `https://97115104.github.io/whodoneit/?content=${encodedContent}&enter`;
            }
        } else if (whodoneitLink) {
            whodoneitLink.classList.add('hidden');
        }
    }

    function getContentWithUrl() {
        let content = state.generatedContent || '';
        const url = state.extractedUrls?.[0]; // First extracted URL from prompt
        
        if (url && !content.includes(url)) {
            content = content.trim() + '\n\n' + url;
        }
        
        return content;
    }

    function shareToX() {
        const content = getContentWithUrl();
        const encoded = encodeURIComponent(content);
        window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
    }

    function shareToLinkedin() {
        const content = getContentWithUrl();
        
        // LinkedIn doesn't support prefilled text - copy to clipboard and open LinkedIn
        navigator.clipboard.writeText(content).then(() => {
            showLinkedInModal();
        });
    }

    function showLinkedInModal() {
        // Show modal informing user content is copied
        showModal('linkedin-share-modal');
    }

    function shareToFacebook() {
        const url = state.extractedUrls?.[0];
        
        if (url) {
            const encodedUrl = encodeURIComponent(url);
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
        } else {
            const content = state.generatedContent || '';
            navigator.clipboard.writeText(content);
            UIRenderer.showToast('Content copied. Open Facebook to paste and share.');
        }
    }

    function shareToReddit() {
        const content = getContentWithUrl();
        const url = state.extractedUrls?.[0] || '';
        const title = content.split('\n')[0].substring(0, 100) || 'Shared post';
        
        const encodedTitle = encodeURIComponent(title);
        
        if (url) {
            const encodedUrl = encodeURIComponent(url);
            window.open(`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`, '_blank');
        } else {
            const encodedText = encodeURIComponent(content);
            window.open(`https://www.reddit.com/submit?title=${encodedTitle}&text=${encodedText}`, '_blank');
        }
    }

    function shareToInstagram() {
        // Instagram doesn't have web share - copy to clipboard
        const content = getContentWithUrl();
        navigator.clipboard.writeText(content);
        UIRenderer.showToast('Content copied! Open Instagram to paste.');
    }

    function shareToThreads() {
        // Threads doesn't have web share API yet - copy to clipboard
        const content = getContentWithUrl();
        navigator.clipboard.writeText(content);
        UIRenderer.showToast('Content copied! Open Threads to paste.');
    }

    // --- Clear Profile Functions ---

    function clearProfileAndRestart() {
        // Clear state
        state.profile = null;
        state.samples = [];
        state.profileAskedToSave = false;
        state.generatedContent = null;
        state.lastDetectedPlatform = null;
        state.extractedUrls = [];
        
        // Clear localStorage
        clearSavedProfile();
        
        // Clear UI
        elements.samplesList.innerHTML = '';
        elements.profileContent?.classList.add('hidden');
        elements.outputSection?.classList.add('hidden');
        elements.shareButtons?.classList.add('hidden');
        elements.urlArtifacts?.classList.add('hidden');
        elements.platformArtifacts?.classList.add('hidden');
        elements.promptInput.value = '';
        elements.generatedContent.textContent = '';
        
        // Update samples counters
        updateSamplesDisplay();
        
        // Hide modal and go to input step
        hideModal('clear-profile-modal');
        goToStep('input');
        
        UIRenderer.showToast('Profile cleared. Start fresh with new samples.');
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

    function showAnalysisError(reason) {
        if (elements.analysisErrorReason) {
            elements.analysisErrorReason.textContent = reason;
        }
        // Show sample size info for truncate option
        const totalChars = state.samples.reduce((sum, s) => sum + (s.content?.length || 0), 0);
        if (elements.truncateInfo) {
            elements.truncateInfo.textContent = totalChars > 60000 
                ? `Your samples total ${Math.round(totalChars / 1000)}K characters. "Truncate & Retry" will use a smaller portion.`
                : '';
        }
        showModal('analysis-error-modal');
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

    // --- Profile Quality (Fidelity Score) ---
    // The score indicates how closely generated content will match the author's actual writing.
    // Based on research in authorship attribution and stylometric analysis.

    const FIDELITY_LEVELS = {
        exceptional: {
            min: 95,
            label: 'Exceptional',
            meaning: 'Output will be nearly indistinguishable from your actual writing',
            color: 'exceptional'
        },
        high: {
            min: 85,
            label: 'High Fidelity',
            meaning: 'Core voice and style accurately captured with minor variations',
            color: 'excellent'
        },
        good: {
            min: 70,
            label: 'Good Match',
            meaning: 'Major stylistic elements captured; some idiosyncrasies may vary',
            color: 'good'
        },
        moderate: {
            min: 50,
            label: 'Moderate',
            meaning: 'General tone recognizable; specific markers may be inconsistent',
            color: 'fair'
        },
        partial: {
            min: 30,
            label: 'Partial',
            meaning: 'Basic patterns identified; output will have noticeable variations',
            color: 'needs-more'
        },
        insufficient: {
            min: 0,
            label: 'Insufficient',
            meaning: 'Need more samples for reliable style matching',
            color: 'insufficient'
        }
    };

    function calculateProfileQuality(samples) {
        const sampleCount = samples.length;
        const stats = WritingAnalyzer.calculateStats(samples);
        const wordCount = stats.totalWords;

        // Calculate source variety (different types of inputs)
        const sourceTypes = new Set(samples.map(s => s.type));
        const sourceVariety = sourceTypes.size;
        
        // Calculate average words per sample
        const avgWords = sampleCount > 0 ? wordCount / sampleCount : 0;
        
        // Calculate content diversity (rough measure of topic variety)
        const uniqueFirstWords = new Set(
            samples.map(s => (s.text || '').split(/\s+/).slice(0, 10).join(' ').toLowerCase())
        );
        const contentDiversity = Math.min(uniqueFirstWords.size / Math.max(sampleCount, 1), 1);

        // === FIDELITY SCORING (0-100) ===
        // This score directly predicts how closely output will match the author's actual writing.
        
        let score = 0;
        const breakdown = {};

        // 1. Sample Volume (0-25 points)
        // More samples = more patterns to learn from
        if (sampleCount >= 15) {
            breakdown.volume = 25;
        } else if (sampleCount >= 10) {
            breakdown.volume = 22;
        } else if (sampleCount >= 7) {
            breakdown.volume = 18;
        } else if (sampleCount >= 5) {
            breakdown.volume = 14;
        } else if (sampleCount >= 3) {
            breakdown.volume = 10;
        } else if (sampleCount >= 2) {
            breakdown.volume = 6;
        } else {
            breakdown.volume = 3;
        }
        score += breakdown.volume;

        // 2. Content Density (0-30 points)
        // More words = more vocabulary and structure patterns
        if (wordCount >= 10000) {
            breakdown.density = 30;
        } else if (wordCount >= 7500) {
            breakdown.density = 27;
        } else if (wordCount >= 5000) {
            breakdown.density = 24;
        } else if (wordCount >= 3000) {
            breakdown.density = 20;
        } else if (wordCount >= 2000) {
            breakdown.density = 16;
        } else if (wordCount >= 1000) {
            breakdown.density = 12;
        } else if (wordCount >= 500) {
            breakdown.density = 8;
        } else {
            breakdown.density = 4;
        }
        score += breakdown.density;

        // 3. Sample Depth (0-20 points)
        // Longer samples provide better context for voice patterns
        if (avgWords >= 500) {
            breakdown.depth = 20;
        } else if (avgWords >= 350) {
            breakdown.depth = 17;
        } else if (avgWords >= 250) {
            breakdown.depth = 14;
        } else if (avgWords >= 150) {
            breakdown.depth = 10;
        } else if (avgWords >= 100) {
            breakdown.depth = 7;
        } else {
            breakdown.depth = 4;
        }
        score += breakdown.depth;

        // 4. Source Variety (0-15 points)
        // Different contexts reveal different facets of voice
        if (sourceVariety >= 4) {
            breakdown.variety = 15;
        } else if (sourceVariety >= 3) {
            breakdown.variety = 12;
        } else if (sourceVariety >= 2) {
            breakdown.variety = 8;
        } else {
            breakdown.variety = 4;
        }
        score += breakdown.variety;

        // 5. Content Diversity Bonus (0-10 points)
        // Different topics show vocabulary range
        breakdown.diversity = Math.round(contentDiversity * 10);
        score += breakdown.diversity;

        // Clamp to 100 max
        score = Math.min(score, 100);

        // Determine fidelity level
        let fidelityLevel;
        if (score >= 95) fidelityLevel = FIDELITY_LEVELS.exceptional;
        else if (score >= 85) fidelityLevel = FIDELITY_LEVELS.high;
        else if (score >= 70) fidelityLevel = FIDELITY_LEVELS.good;
        else if (score >= 50) fidelityLevel = FIDELITY_LEVELS.moderate;
        else if (score >= 30) fidelityLevel = FIDELITY_LEVELS.partial;
        else fidelityLevel = FIDELITY_LEVELS.insufficient;

        // Generate specific suggestions based on what's lacking
        let suggestion = '';
        const suggestions = [];
        
        if (breakdown.volume < 18 && sampleCount < 7) {
            suggestions.push(`Add ${7 - sampleCount} more sample${7 - sampleCount > 1 ? 's' : ''} to improve pattern detection`);
        }
        if (breakdown.density < 20 && wordCount < 3000) {
            const needed = 3000 - wordCount;
            suggestions.push(`Add ~${Math.ceil(needed / 100) * 100} more words for better vocabulary coverage`);
        }
        if (breakdown.depth < 14 && avgWords < 250) {
            suggestions.push('Include longer-form writing samples (250+ words each)');
        }
        if (breakdown.variety < 12 && sourceVariety < 3) {
            suggestions.push('Add samples from different contexts (emails, social media, articles)');
        }

        if (suggestions.length === 0) {
            suggestion = fidelityLevel.meaning;
        } else {
            suggestion = suggestions.slice(0, 2).join('. ') + '.';
        }

        return {
            score,
            label: fidelityLevel.label,
            meaning: fidelityLevel.meaning,
            color: fidelityLevel.color,
            suggestion,
            breakdown,
            stats: {
                sampleCount,
                wordCount,
                sourceVariety,
                avgWords: Math.round(avgWords),
                contentDiversity: Math.round(contentDiversity * 100)
            }
        };
    }

    function updateProfileQualityDisplay(samples) {
        const quality = calculateProfileQuality(samples);

        // Update score label with percentage
        elements.qualityScore.textContent = `${quality.label} (${quality.score}%)`;
        elements.qualityScore.className = 'quality-score ' + quality.color;

        // Update progress bar
        elements.qualityFill.style.width = quality.score + '%';
        elements.qualityFill.className = 'quality-fill ' + quality.color;

        // Update suggestion with meaning context
        const suggestionText = quality.score >= 70 
            ? quality.meaning 
            : quality.suggestion;
        elements.qualitySuggestion.textContent = suggestionText;

        return quality;
    }

    // --- Platform Detection ---

    // SVG icons for platforms
    const PLATFORM_ICONS = {
        x: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
        linkedin: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
        facebook: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
        instagram: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>',
        threads: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.103-3.96-3.91-5.963-8.349-5.958-2.868.004-5.078.966-6.565 2.86-1.27 1.618-1.97 3.913-1.999 6.967.03 3.057.73 5.35 1.999 6.966 1.484 1.894 3.687 2.857 6.55 2.861 2.478-.032 4.378-.678 5.648-1.921 1.373-1.343 1.463-2.96 1.322-3.94-.198-1.395-.795-2.478-1.736-3.152-.943-.678-2.053-.986-3.243-.986h-.618l-.114-.002c-1.294.014-2.378.343-3.14.95-.659.528-1.007 1.236-1.007 2.048 0 .72.315 1.37.885 1.828.592.476 1.417.738 2.322.738.84 0 1.58-.184 2.204-.548.518-.302.943-.741 1.262-1.31l1.763 1.04c-.5.877-1.185 1.57-2.04 2.058-.966.551-2.08.833-3.312.838h-.026c-1.354-.007-2.54-.358-3.44-.953-1.044-.69-1.67-1.727-1.813-3h-.002c-.136-1.235.18-2.315 1.044-3.243.92-.992 2.267-1.594 3.886-1.752l.162-.015.144-.004c1.55-.015 2.92.265 4.076.821 1.202.58 2.152 1.417 2.823 2.492.645 1.035 1.026 2.275 1.126 3.678.177 2.466-.53 4.636-2.058 6.18-1.708 1.721-4.2 2.612-7.416 2.648z"/></svg>',
        reddit: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>',
        tiktok: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
        bluesky: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/></svg>',
        mastodon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.668 1.978v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"/></svg>',
        email: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
        substack: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/></svg>'
    };

    const PLATFORM_STYLES = {
        x: {
            name: 'X (Twitter)',
            icon: 'X',
            isProfessional: false,
            maxLength: 280,
            style: 'EXTREMELY BRIEF. Single tweet = 1-2 short sentences max. No intros, no conclusions. Jump straight to the point. Each word must earn its place.',
            tone: 'casual, witty, conversational',
            avoid: 'long paragraphs, formal language, excessive hashtags, introductions, conclusions, explanatory text',
            brevity: 'critical'
        },
        twitter: {
            name: 'X (Twitter)',
            icon: 'X',
            isProfessional: false,
            maxLength: 280,
            style: 'EXTREMELY BRIEF. Single tweet = 1-2 short sentences max. No intros, no conclusions. Jump straight to the point. Each word must earn its place.',
            tone: 'casual, witty, conversational',
            avoid: 'long paragraphs, formal language, excessive hashtags, introductions, conclusions, explanatory text',
            brevity: 'critical'
        },
        linkedin: {
            name: 'LinkedIn',
            icon: 'in',
            isProfessional: true,
            maxLength: 700,
            style: 'BRIEF AND PUNCHY. 3-5 short paragraphs max. Hook in first line. One insight per post. Use line breaks. No walls of text. Aim for 100-200 words, never exceed 300.',
            tone: 'professional, thoughtful, authentic',
            avoid: 'jargon overload, long explanations, multi-point essays, clickbait, introductory preambles',
            professionalNote: 'LinkedIn is a professional platform. Your writing style may need adjustments for proper capitalization, grammar, and professional tone.',
            brevity: 'high'
        },
        facebook: {
            name: 'Facebook',
            icon: 'f',
            isProfessional: false,
            maxLength: 500,
            style: 'CONVERSATIONAL AND BRIEF. 2-4 short paragraphs. Get to the point quickly. Personal but concise.',
            tone: 'friendly, personal, community-focused',
            avoid: 'overly promotional content, cold corporate speak, long essays',
            brevity: 'high'
        },
        instagram: {
            name: 'Instagram',
            icon: 'IG',
            isProfessional: false,
            maxLength: 300,
            style: 'BRIEF CAPTIONS. 1-3 sentences for most posts. Let the visual do the talking. Save longer captions for storytelling only.',
            tone: 'aesthetic, aspirational, authentic',
            avoid: 'walls of text, overly salesy language, long explanations',
            brevity: 'high'
        },
        tiktok: {
            name: 'TikTok',
            icon: 'TT',
            isProfessional: false,
            maxLength: 150,
            style: 'ULTRA BRIEF. 1-2 sentences max. Hook immediately. The video is the content, caption is just context.',
            tone: 'playful, relatable, trendy',
            avoid: 'formal language, long explanations, corporate vibes, walls of text',
            brevity: 'critical'
        },
        threads: {
            name: 'Threads',
            icon: '@',
            isProfessional: false,
            maxLength: 300,
            style: 'BRIEF TAKES. 2-4 sentences. Similar to Twitter but slightly more room. Hot takes and discussions.',
            tone: 'casual, thoughtful, engaging',
            avoid: 'hashtag spam, overly promotional content, long essays',
            brevity: 'high'
        },
        bluesky: {
            name: 'Bluesky',
            icon: 'BS',
            isProfessional: false,
            maxLength: 300,
            style: 'BRIEF AND AUTHENTIC. 1-3 sentences. Community-focused, less performative.',
            tone: 'genuine, curious, community-oriented',
            avoid: 'engagement bait, corporate messaging, long posts',
            brevity: 'high'
        },
        mastodon: {
            name: 'Mastodon',
            icon: 'M',
            isProfessional: false,
            maxLength: 500,
            style: 'THOUGHTFUL BUT BRIEF. 2-4 sentences typical. Content warnings when appropriate.',
            tone: 'respectful, community-focused, thoughtful',
            avoid: 'engagement farming, cross-posting without context, walls of text',
            brevity: 'medium'
        },
        reddit: {
            name: 'Reddit',
            icon: 'r/',
            isProfessional: false,
            maxLength: null,
            style: 'Context-rich, community-aware. Know your subreddit culture. Brevity varies by sub.',
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
    let platformDismissed = false;

    function detectPlatformInPrompt() {
        const text = elements.promptInput.value.toLowerCase();
        const contentType = getContentTypeKey();

        // Only detect for social media content types
        if (!contentType.startsWith('social')) {
            elements.platformArtifacts.classList.add('hidden');
            detectedPlatform = null;
            return;
        }

        // If user dismissed the platform, don't re-detect until prompt changes significantly
        if (platformDismissed) {
            return;
        }

        // Check for platform mentions using word boundaries
        let platform = null;
        
        // Check explicit platform mentions first (more specific)
        const platformChecks = [
            { pattern: /\b(linkedin|linked in)\b/, platform: 'linkedin' },
            { pattern: /\b(facebook|fb)\b/, platform: 'facebook' },
            { pattern: /\b(instagram|insta)\b(?!\s*text)/, platform: 'instagram' },
            { pattern: /\b(tiktok|tik tok)\b/, platform: 'tiktok' },
            { pattern: /\b(threads)\b/, platform: 'threads' },
            { pattern: /\b(bluesky|blue sky)\b/, platform: 'bluesky' },
            { pattern: /\b(reddit)\b/, platform: 'reddit' },
            { pattern: /\b(mastodon)\b/, platform: 'mastodon' },
            { pattern: /\btweet\b|post (on|to|for) (x|twitter)\b|\btwitter\b/, platform: 'x' },
            { pattern: /\b(substack|newsletter)\b/, platform: 'substack' },
            { pattern: /\bemail\b(?!\s*(address|me))/, platform: 'email' }
        ];

        for (const check of platformChecks) {
            if (check.pattern.test(text)) {
                platform = check.platform;
                break;
            }
        }

        if (platform && PLATFORM_STYLES[platform]) {
            detectedPlatform = platform;
            const data = PLATFORM_STYLES[platform];
            const svgIcon = PLATFORM_ICONS[platform] || PLATFORM_ICONS.x;

            elements.platformArtifacts.classList.remove('hidden');
            elements.platformInfo.innerHTML = `
                <span class="platform-badge">
                    <span class="platform-icon">${svgIcon}</span>
                    ${data.name}
                </span>
                <span class="platform-hint">${data.maxLength ? `Max ${data.maxLength} chars` : 'No character limit'} • ${data.tone}</span>
                <button class="btn-dismiss-platform" title="Dismiss platform detection">×</button>
            `;
        } else {
            elements.platformArtifacts.classList.add('hidden');
            detectedPlatform = null;
        }
    }

    function getPlatformStyleContext() {
        if (!detectedPlatform || !PLATFORM_STYLES[detectedPlatform]) return '';

        const platform = PLATFORM_STYLES[detectedPlatform];

        // Build brevity instruction based on platform
        let brevityInstruction = '';
        if (platform.brevity === 'critical') {
            brevityInstruction = `
CRITICAL BREVITY REQUIREMENT:
- This is an ultra-short format platform
- Maximum 1-3 sentences TOTAL
- Every word must earn its place
- No introductions, no conclusions, no preambles
- Jump straight to the point`;
        } else if (platform.brevity === 'high') {
            brevityInstruction = `
BREVITY REQUIREMENT:
- Keep it SHORT - aim for ${platform.maxLength ? Math.round(platform.maxLength / 5) + '-' + Math.round(platform.maxLength / 3) : '100-200'} words max
- 3-5 short paragraphs maximum
- No walls of text
- One main idea per post
- Cut ruthlessly - remove any sentence that doesn't add value`;
        } else if (platform.brevity === 'medium') {
            brevityInstruction = `
BREVITY PREFERENCE:
- Keep it concise
- Aim for clarity over length`;
        }

        return `

## Target Platform: ${platform.name}

Platform-specific guidelines:
- Style: ${platform.style}
- Tone: ${platform.tone}
- Avoid: ${platform.avoid}
${platform.maxLength ? `- Target length: Under ${platform.maxLength} characters` : ''}
${brevityInstruction}

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

        // Header with Dreyfus-based mastery metrics
        const masteryLabel = profile.mastery_label || getMasteryFromComplexity(profile.complexity_score);
        const technicalLevel = profile.technical_level || profile.reading_level || 'Not determined';
        
        html += `
            <div class="profile-header-modal">
                <div class="profile-score-modal">
                    <span class="profile-label">Writing Mastery</span>
                    <span class="mastery-level">${escapeHtml(masteryLabel)}</span>
                </div>
                <div class="profile-meta-modal">
                    <span class="technical-level">${escapeHtml(technicalLevel)}</span>
                </div>
            </div>
        `;
        
        // Metrics row
        const voiceScore = profile.voice_consistency || estimateMetricFromProfile(profile, 'voice');
        const patternScore = profile.pattern_density || estimateMetricFromProfile(profile, 'pattern');
        const lexicalScore = profile.lexical_diversity || estimateMetricFromProfile(profile, 'lexical');
        
        html += `
            <div class="profile-metrics-row-modal">
                <div class="profile-metric-modal">
                    <span class="metric-label">Voice Consistency</span>
                    <span class="metric-value" data-score="${voiceScore >= 7 ? 'high' : voiceScore >= 5 ? 'medium' : 'low'}">${voiceScore}/10</span>
                </div>
                <div class="profile-metric-modal">
                    <span class="metric-label">Pattern Density</span>
                    <span class="metric-value" data-score="${patternScore >= 7 ? 'high' : patternScore >= 5 ? 'medium' : 'low'}">${patternScore}/10</span>
                </div>
                <div class="profile-metric-modal">
                    <span class="metric-label">Lexical Diversity</span>
                    <span class="metric-value" data-score="${lexicalScore >= 7 ? 'high' : lexicalScore >= 5 ? 'medium' : 'low'}">${lexicalScore}/10</span>
                </div>
            </div>
        `;

        // Psychological impact metrics row
        const emotionalScore = profile.emotional_resonance || estimateMetricFromProfile(profile, 'emotional');
        const authenticityScore = profile.authenticity || estimateMetricFromProfile(profile, 'authenticity');
        const flowScore = profile.narrative_flow || estimateMetricFromProfile(profile, 'flow');
        const persuasiveScore = profile.persuasive_clarity || estimateMetricFromProfile(profile, 'persuasive');

        html += `
            <div class="profile-metrics-row-modal psychological">
                <div class="profile-metric-modal">
                    <span class="metric-label">Emotional Resonance</span>
                    <span class="metric-value" data-score="${emotionalScore >= 7 ? 'high' : emotionalScore >= 5 ? 'medium' : 'low'}">${emotionalScore}/10</span>
                </div>
                <div class="profile-metric-modal">
                    <span class="metric-label">Authenticity</span>
                    <span class="metric-value" data-score="${authenticityScore >= 7 ? 'high' : authenticityScore >= 5 ? 'medium' : 'low'}">${authenticityScore}/10</span>
                </div>
                <div class="profile-metric-modal">
                    <span class="metric-label">Narrative Flow</span>
                    <span class="metric-value" data-score="${flowScore >= 7 ? 'high' : flowScore >= 5 ? 'medium' : 'low'}">${flowScore}/10</span>
                </div>
                <div class="profile-metric-modal">
                    <span class="metric-label">Persuasive Clarity</span>
                    <span class="metric-value" data-score="${persuasiveScore >= 7 ? 'high' : persuasiveScore >= 5 ? 'medium' : 'low'}">${persuasiveScore}/10</span>
                </div>
            </div>
        `;

        // Summary
        if (profile.profile_summary) {
            html += `<p class="profile-summary-modal">${escapeHtml(profile.profile_summary)}</p>`;
        }

        // Profile grid (matches profile step exactly)
        html += '<div class="profile-grid-modal">';

        // Style card
        html += '<div class="profile-card-modal"><h4>Style</h4>';
        if (profile.style) {
            const styleTraits = [];
            if (profile.style.formality) styleTraits.push(UIRenderer.createBadge(profile.style.formality));
            if (profile.style.descriptiveness) styleTraits.push(UIRenderer.createBadge(profile.style.descriptiveness, 'neutral'));
            if (profile.style.directness) styleTraits.push(UIRenderer.createBadge(profile.style.directness, 'neutral'));
            if (profile.style.perspective) styleTraits.push(UIRenderer.createBadge(profile.style.perspective, 'neutral'));
            html += `<div class="trait-badges">${styleTraits.join('')}</div>`;
            if (profile.style.summary) html += `<p>${escapeHtml(profile.style.summary)}</p>`;
        } else {
            html += '<p>No style data available.</p>';
        }
        html += '</div>';

        // Tone card
        html += '<div class="profile-card-modal"><h4>Tone & Voice</h4>';
        if (profile.tone) {
            const toneTraits = [];
            if (profile.tone.primary) toneTraits.push(UIRenderer.createBadge(profile.tone.primary));
            if (profile.tone.secondary && Array.isArray(profile.tone.secondary)) {
                profile.tone.secondary.forEach(t => toneTraits.push(UIRenderer.createBadge(t, 'neutral')));
            } else if (profile.tone.secondary) {
                toneTraits.push(UIRenderer.createBadge(profile.tone.secondary, 'neutral'));
            }
            if (profile.tone.emotional_register) toneTraits.push(UIRenderer.createBadge(profile.tone.emotional_register, 'highlight'));
            html += `<div class="trait-badges">${toneTraits.join('')}</div>`;
            if (profile.tone.summary) html += `<p>${escapeHtml(profile.tone.summary)}</p>`;
        } else {
            html += '<p>No tone data available.</p>';
        }
        html += '</div>';

        // Vocabulary card
        html += '<div class="profile-card-modal"><h4>Vocabulary</h4>';
        if (profile.vocabulary) {
            if (profile.vocabulary.complexity) {
                html += `<div class="trait-badges">${UIRenderer.createBadge(profile.vocabulary.complexity)}</div>`;
            }
            if (profile.vocabulary.characteristic_words?.length) {
                html += `<p style="font-size: 12px; color: #666; margin: 8px 0 4px;">Characteristic words:</p>`;
                html += `<div class="trait-badges">${profile.vocabulary.characteristic_words.slice(0, 8).map(w => UIRenderer.createBadge(w, 'neutral')).join('')}</div>`;
            }
            if (profile.vocabulary.summary) html += `<p>${escapeHtml(profile.vocabulary.summary)}</p>`;
        } else {
            html += '<p>No vocabulary data available.</p>';
        }
        html += '</div>';

        // Structure card
        html += '<div class="profile-card-modal"><h4>Structure</h4>';
        if (profile.structure) {
            const structTraits = [];
            if (profile.structure.sentence_length) structTraits.push(UIRenderer.createBadge(profile.structure.sentence_length + ' sentences', 'neutral'));
            if (profile.structure.variety) structTraits.push(UIRenderer.createBadge(profile.structure.variety, 'neutral'));
            if (structTraits.length) html += `<div class="trait-badges">${structTraits.join('')}</div>`;
            if (profile.structure.paragraph_style) html += `<p style="font-size: 13px; color: #555;"><strong>Paragraphs:</strong> ${escapeHtml(profile.structure.paragraph_style)}</p>`;
            if (profile.structure.summary) html += `<p>${escapeHtml(profile.structure.summary)}</p>`;
        } else {
            html += '<p>No structure data available.</p>';
        }
        html += '</div>';

        html += '</div>'; // close profile-grid-modal

        // Stylistic Markers section
        html += '<div class="profile-section-modal"><h4>Stylistic Markers</h4>';
        if (profile.markers && Array.isArray(profile.markers) && profile.markers.length) {
            html += '<ul>';
            profile.markers.forEach(m => {
                html += `<li><strong>${escapeHtml(m.type || '')}:</strong> ${escapeHtml(m.description || '')}</li>`;
            });
            html += '</ul>';
        } else if (profile.markers && typeof profile.markers === 'object') {
            // Legacy format
            const markers = [];
            if (profile.markers.contractions) markers.push(`<li><strong>Contractions:</strong> ${escapeHtml(profile.markers.contractions)}</li>`);
            if (profile.markers.exclamations) markers.push(`<li><strong>Exclamations:</strong> ${escapeHtml(profile.markers.exclamations)}</li>`);
            if (profile.markers.questions) markers.push(`<li><strong>Questions:</strong> ${escapeHtml(profile.markers.questions)}</li>`);
            if (profile.markers.capitalization) markers.push(`<li><strong>Capitalization:</strong> ${escapeHtml(profile.markers.capitalization)}</li>`);
            if (profile.markers.signature_phrases?.length) {
                markers.push(`<li><strong>Signature phrases:</strong> ${escapeHtml(profile.markers.signature_phrases.slice(0, 5).join(', '))}</li>`);
            }
            html += markers.length ? `<ul>${markers.join('')}</ul>` : '<p>No distinctive markers identified.</p>';
        } else {
            html += '<p>No distinctive markers identified.</p>';
        }
        html += '</div>';

        // Patterns section
        html += '<div class="profile-section-modal"><h4>Patterns to Replicate</h4>';
        if (profile.patterns && Array.isArray(profile.patterns) && profile.patterns.length) {
            html += '<ul>';
            profile.patterns.forEach(p => {
                html += `<li>${escapeHtml(p)}</li>`;
            });
            html += '</ul>';
        } else {
            html += '<p>No specific patterns identified.</p>';
        }
        html += '</div>';

        elements.fullProfileContent.innerHTML = html;
        showModal('full-profile-modal');
    }
    
    // Helper to map complexity score to Dreyfus mastery level
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
    function estimateMetricFromProfile(profile, type) {
        const complexity = profile.complexity_score || 5;
        const markersCount = (profile.markers || []).length;
        const patternsCount = (profile.patterns || []).length;
        const vocabWords = (profile.vocabulary?.characteristic_words || []).length;

        switch (type) {
            case 'voice':
                return Math.min(10, Math.round((markersCount + patternsCount) / 2 + 4));
            case 'pattern':
                return Math.min(10, Math.round((markersCount + patternsCount) / 3 + 3));
            case 'lexical':
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
            state.extractedUrls = [];
            return;
        }

        // Remove duplicates
        const uniqueUrls = [...new Set(urls)];
        state.extractedUrls = uniqueUrls;

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

    // --- URL Content Preview Modal ---

    let currentEditingUrl = null;

    function handleUrlArtifactClick(e) {
        const item = e.target.closest('.url-artifact-item');
        if (!item) return;

        const url = item.dataset.url;
        const statusEl = item.querySelector('.url-status');
        const status = statusEl?.dataset.status || statusEl?.className.includes('success') ? 'success' : 'pending';

        // Only show modal if we have content or it's been fetched
        if (state.fetchedUrlContent[url] || status === 'success') {
            showUrlContentModal(url);
        } else if (status === 'pending') {
            // Trigger fetch first, then show modal
            fetchSingleUrlAndShowModal(url, item);
        }
    }

    async function fetchSingleUrlAndShowModal(url, item) {
        const statusEl = item.querySelector('.url-status');
        statusEl.textContent = 'Fetching...';
        statusEl.className = 'url-status loading';

        try {
            const content = await ApiClient.fetchUrlContent(url);
            state.fetchedUrlContent[url] = content;
            statusEl.textContent = `${Math.round(content.length / 1000)}KB`;
            statusEl.className = 'url-status success';
            showUrlContentModal(url);
        } catch (err) {
            statusEl.textContent = 'Failed';
            statusEl.className = 'url-status error';
            showToast('Failed to fetch URL content');
            console.error('Failed to fetch URL:', url, err);
        }
    }

    function showUrlContentModal(url) {
        currentEditingUrl = url;
        const content = state.fetchedUrlContent[url] || '';

        elements.urlContentSourceLink.href = url;
        elements.urlContentSourceLink.textContent = url;
        elements.urlContentText.value = content;

        showModal('url-content-modal');
    }

    function saveUrlContent() {
        if (currentEditingUrl) {
            state.fetchedUrlContent[currentEditingUrl] = elements.urlContentText.value;
            
            // Update the status display to show edited
            const item = elements.urlArtifactsList.querySelector(`[data-url="${CSS.escape(currentEditingUrl)}"]`);
            if (item) {
                const statusEl = item.querySelector('.url-status');
                const contentLength = elements.urlContentText.value.length;
                statusEl.textContent = `${Math.round(contentLength / 1000)}KB (edited)`;
            }
            
            showToast('Content saved');
        }
        hideModal('url-content-modal');
    }

    // --- GitHub Repo Detection ---

    function detectGitHubRepos() {
        const text = elements.promptInput.value;
        const githubRegex = /https?:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/gi;
        const matches = [...text.matchAll(githubRegex)];

        if (matches.length === 0) {
            elements.githubArtifacts?.classList.add('hidden');
            if (elements.githubArtifactsList) elements.githubArtifactsList.innerHTML = '';
            return;
        }

        // Extract unique repos
        const repos = [...new Set(matches.map(m => `${m[1]}/${m[2]}`))];
        
        elements.githubArtifacts?.classList.remove('hidden');
        if (elements.githubArtifactsList) {
            elements.githubArtifactsList.innerHTML = repos.map(repo => {
                const cached = state.fetchedGitHubRepos[repo];
                const status = cached ? 'Cached' : 'Pending';
                const statusClass = cached ? 'success' : '';
                return `
                    <div class="github-artifact-item" data-repo="${escapeHtml(repo)}">
                        <span class="repo-name">${escapeHtml(repo)}</span>
                        <span class="repo-details">${cached ? `${cached.stars || 0} stars` : ''}</span>
                        <span class="url-status ${statusClass}" data-status="${cached ? 'cached' : 'pending'}">${status}</span>
                    </div>
                `;
            }).join('');
        }
    }

    async function fetchGitHubRepo(repo) {
        try {
            // Fetch repo info
            const repoResponse = await fetch(`https://api.github.com/repos/${repo}`);
            if (!repoResponse.ok) throw new Error('Repo not found');
            const repoData = await repoResponse.json();

            // Fetch README
            let readme = '';
            try {
                const readmeResponse = await fetch(`https://api.github.com/repos/${repo}/readme`);
                if (readmeResponse.ok) {
                    const readmeData = await readmeResponse.json();
                    readme = atob(readmeData.content);
                }
            } catch (e) {
                console.log('Could not fetch README:', e);
            }

            return {
                name: repoData.name,
                fullName: repoData.full_name,
                description: repoData.description || '',
                stars: repoData.stargazers_count,
                forks: repoData.forks_count,
                language: repoData.language,
                topics: repoData.topics || [],
                readme: readme,
                license: repoData.license?.spdx_id || 'Unknown',
                lastUpdated: repoData.updated_at
            };
        } catch (err) {
            console.error('Failed to fetch GitHub repo:', repo, err);
            throw err;
        }
    }

    async function fetchAllGitHubRepos() {
        const items = elements.githubArtifactsList?.querySelectorAll('.github-artifact-item') || [];
        const results = [];

        for (const item of items) {
            const repo = item.dataset.repo;
            const statusEl = item.querySelector('.url-status');
            const detailsEl = item.querySelector('.repo-details');

            if (state.fetchedGitHubRepos[repo]) {
                statusEl.textContent = 'Cached';
                statusEl.className = 'url-status success';
                results.push({ repo, data: state.fetchedGitHubRepos[repo] });
                continue;
            }

            statusEl.textContent = 'Fetching...';
            statusEl.className = 'url-status loading';

            try {
                const data = await fetchGitHubRepo(repo);
                state.fetchedGitHubRepos[repo] = data;
                statusEl.textContent = 'Fetched';
                statusEl.className = 'url-status success';
                if (detailsEl) detailsEl.textContent = `${data.stars} stars`;
                results.push({ repo, data });
            } catch (err) {
                statusEl.textContent = 'Failed';
                statusEl.className = 'url-status error';
            }
        }

        return results;
    }

    // --- Style Builder ---

    const STYLE_BUILDER = {
        // Audience-related
        accessible: {
            label: 'Accessible',
            description: 'Write for a general audience without assuming technical knowledge. Explain jargon and use relatable examples.',
            keywords: ['less technical', 'non-technical', 'general audience', 'beginners', 'simple terms', 'easy to understand', 'layman', 'accessible'],
            sentiment: 'neutral',
            category: 'audience'
        },
        technical: {
            label: 'Technical',
            description: 'Use precise technical language, be specific about implementation details, and assume reader familiarity with technical concepts.',
            keywords: ['technical', 'code', 'programming', 'developer', 'api', 'software', 'github', 'readme', 'documentation', 'engineering'],
            sentiment: 'neutral',
            category: 'audience'
        },
        // Tone-related
        informal: {
            label: 'Casual',
            description: 'Write in a relaxed, conversational tone. Use contractions, casual phrasing, and approachable language.',
            keywords: ['casual', 'friendly', 'hey', 'cool', 'chill', 'lol', 'btw', 'chat', 'dm', 'message', 'hanging out', 'laid back'],
            sentiment: 'positive',
            category: 'tone'
        },
        conversational: {
            label: 'Conversational',
            description: 'Write naturally as if speaking to a friend. Less polished, more human - include filler words, contractions, and natural rhythm.',
            keywords: ['natural', 'like talking', 'speaking', 'chat', 'real', 'authentic', 'genuine', 'not formal', 'relaxed'],
            sentiment: 'positive',
            category: 'tone'
        },
        formal: {
            label: 'Professional',
            description: 'Maintain professional language, proper grammar, and a respectful tone appropriate for business contexts.',
            keywords: ['professional', 'corporate', 'business', 'meeting', 'presentation', 'report', 'proposal', 'executive'],
            sentiment: 'neutral',
            category: 'tone'
        },
        // Warm/Kind tones
        kind: {
            label: 'Kind',
            description: 'Use gentle, considerate language. Be thoughtful and warm without being overly effusive.',
            keywords: ['kind', 'kindly', 'gentle', 'sweetly', 'nicely', 'please', 'thank you', 'grateful'],
            sentiment: 'warm',
            category: 'tone'
        },
        warm: {
            label: 'Warm',
            description: 'Create a sense of personal connection. Use inclusive language and genuine warmth.',
            keywords: ['warm', 'warmly', 'heartfelt', 'sincere', 'genuine', 'close', 'dear', 'fondly', 'love how', 'love that', 'beautiful', 'special', 'unique', 'authentic', 'authenticity', 'real', 'true to'],
            sentiment: 'warm',
            category: 'tone'
        },
        understanding: {
            label: 'Understanding',
            description: 'Show that you truly hear and acknowledge the other person. Validate their perspective without judgment.',
            keywords: ['understand', 'understanding', 'get it', 'makes sense', 'hear you', 'see where', 'appreciate', 'acknowledge', 'relate', 'can relate', 'resonates', 'feel the same', 'know what', 'been there'],
            sentiment: 'warm',
            category: 'tone'
        },
        compassionate: {
            label: 'Compassionate',
            description: 'Express genuine care and concern. Be present and supportive without trying to fix or minimize.',
            keywords: ['compassion', 'compassionate', 'care', 'caring', 'here for you', 'with you', 'alongside', 'support'],
            sentiment: 'warm',
            category: 'tone'
        },
        reassuring: {
            label: 'Reassuring',
            description: 'Provide comfort and confidence. Help reduce anxiety or worry with calm, steady language.',
            keywords: ['reassure', 'reassuring', 'it\'s okay', 'don\'t worry', 'everything will', 'be fine', 'calm', 'safe'],
            sentiment: 'warm',
            category: 'tone'
        },
        encouraging: {
            label: 'Encouraging',
            description: 'Motivate and inspire confidence. Highlight potential and express belief in the person or outcome.',
            keywords: ['encourage', 'encouraging', 'you can', 'believe in', 'confident', 'proud', 'inspiring', 'motivation', 'unique', 'special', 'amazing', 'incredible', 'capable', 'strength'],
            sentiment: 'positive',
            category: 'tone'
        },
        // Emotional tones
        somber: {
            label: 'Somber',
            description: 'Use a gentle, thoughtful, and emotionally measured tone. Be sensitive and avoid forced positivity.',
            keywords: ['breakup', 'break up', 'ending', 'goodbye', 'farewell', 'sorry', 'apologize', 'loss', 'grief', 'passing', 'difficult', 'hard news', 'bad news'],
            sentiment: 'serious',
            category: 'emotional'
        },
        empathetic: {
            label: 'Empathetic',
            description: 'Show understanding and compassion. Acknowledge feelings and validate emotions without being dismissive.',
            keywords: ['comfort', 'support', 'empathy', 'sympathy', 'care about', 'worried about', 'concerned', 'help with', 'feel', 'feeling', 'connect', 'connection', 'relating', 'relate to', 'emotional', 'deeply'],
            sentiment: 'warm',
            category: 'emotional'
        },
        upbeat: {
            label: 'Upbeat',
            description: 'Bring energy and positivity. Use enthusiastic language and highlight the exciting aspects.',
            keywords: ['excited', 'amazing', 'thrilled', 'celebrate', 'congrats', 'congratulations', 'happy', 'great news', 'awesome news', 'announcement', 'awesome', 'love', 'loving', 'enjoying', 'enjoy', 'wonderful', 'fantastic'],
            sentiment: 'positive',
            category: 'emotional'
        },
        humorous: {
            label: 'Witty',
            description: 'Include wit, clever observations, and light humor where appropriate. Keep it natural, not forced.',
            keywords: ['funny', 'joke', 'humor', 'laugh', 'comedy', 'witty', 'sarcastic', 'ironic', 'playful'],
            sentiment: 'positive',
            category: 'emotional'
        },
        // Purpose-related
        persuasive: {
            label: 'Persuasive',
            description: 'Focus on benefits and value. Build a compelling case. Use action-oriented language.',
            keywords: ['convince', 'marketing', 'sell', 'buy', 'benefit', 'value', 'why you should', 'best', 'pitch', 'proposal'],
            sentiment: 'assertive',
            category: 'purpose'
        },
        educational: {
            label: 'Educational',
            description: 'Explain concepts clearly. Build understanding step by step. Anticipate questions.',
            keywords: ['explain', 'teach', 'learn', 'how to', 'guide', 'tutorial', 'step by step', 'walkthrough', 'lesson'],
            sentiment: 'neutral',
            category: 'purpose'
        },
        storytelling: {
            label: 'Narrative',
            description: 'Use narrative structure. Include specific details that bring the story to life.',
            keywords: ['story', 'narrative', 'journey', 'experience', 'happened', 'remember when', 'tale', 'memoir', 'personal', 'myself', 'my own', 'I believe', 'I think', 'I wonder', 'reflection', 'reflecting', 'watching', 'observed'],
            sentiment: 'neutral',
            category: 'purpose'
        },
        analytical: {
            label: 'Analytical',
            description: 'Present information logically with clear reasoning. Support claims with evidence and data.',
            keywords: ['analyze', 'analysis', 'data', 'research', 'findings', 'evidence', 'compare', 'evaluate', 'assess'],
            sentiment: 'neutral',
            category: 'purpose'
        },
        // Format-related
        concise: {
            label: 'Concise',
            description: 'Be extremely brief. Every word must earn its place. Get to the point immediately.',
            keywords: ['brief', 'short', 'quick', 'tldr', 'summary', 'twitter', 'tweet', 'succinct', 'direct'],
            sentiment: 'neutral',
            category: 'format'
        },
        detailed: {
            label: 'Thorough',
            description: 'Provide comprehensive coverage. Include context, nuances, and supporting details.',
            keywords: ['detailed', 'thorough', 'comprehensive', 'in-depth', 'complete', 'full', 'extensive', 'elaborate'],
            sentiment: 'neutral',
            category: 'format'
        },
        emoji: {
            label: 'Emoji',
            description: 'Include appropriate emojis to add warmth and emotional expression.',
            keywords: ['emoji', 'emojis', 'text', 'texting', 'message', 'dm', 'personal email', 'heart', 'smiley', '❤️', '😊', '🙏', '💕', '🎉'],
            sentiment: 'positive',
            category: 'format'
        }
    };

    // Sentiment color mapping for style tags
    // Blue = sad/somber, Red = aggressive/assertive, Green = positive, Orange = warm, Purple = neutral/ambiguous
    const SENTIMENT_COLORS = {
        positive: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32' },     // Green - positive emotions
        warm: { bg: '#fff3e0', border: '#ff9800', text: '#e65100' },         // Orange - warm/caring
        neutral: { bg: '#f3e5f5', border: '#9c27b0', text: '#6a1b9a' },      // Purple - could be either
        serious: { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' },     // Blue - sad/somber
        assertive: { bg: '#ffebee', border: '#f44336', text: '#c62828' }    // Red - aggressive/forceful
    };

    // Generate STYLE_KEYWORDS and STYLE_LABELS from STYLE_BUILDER for compatibility
    const STYLE_KEYWORDS = {};
    const STYLE_LABELS = {};
    for (const [key, config] of Object.entries(STYLE_BUILDER)) {
        STYLE_KEYWORDS[key] = config.keywords;
        STYLE_LABELS[key] = config.label;
    }

    function updateStyleSuggestions() {
        const text = elements.promptInput.value.toLowerCase();
        
        // Show style builder once there's any text
        if (text.length < 5) {
            elements.styleBuilder?.classList.add('hidden');
            return;
        }

        const detectedStyles = [];
        
        // Detect styles based on keywords
        for (const [style, keywords] of Object.entries(STYLE_KEYWORDS)) {
            if (keywords.some(kw => text.includes(kw))) {
                detectedStyles.push(style);
            }
        }

        // Also include any manually selected styles
        for (const style of state.selectedStyleTags) {
            if (!detectedStyles.includes(style)) {
                detectedStyles.push(style);
            }
        }

        // Always show the style builder with at least the studio button
        elements.styleBuilder?.classList.remove('hidden');
        
        if (elements.styleSuggestions) {
            let tagsHtml = '';
            
            if (detectedStyles.length > 0) {
                tagsHtml = detectedStyles.map(style => {
                    const isActive = state.selectedStyleTags.includes(style);
                    const config = STYLE_BUILDER[style] || {};
                    const desc = config.description || '';
                    const sentiment = config.sentiment || 'neutral';
                    const colors = SENTIMENT_COLORS[sentiment] || SENTIMENT_COLORS.neutral;
                    const colorStyle = `background: ${colors.bg}; border-color: ${colors.border}; color: ${colors.text};`;
                    return `
                        <span class="style-tag ${isActive ? 'active' : ''}" data-style="${style}" data-tooltip="${desc}" data-sentiment="${sentiment}" style="${colorStyle}">
                            ${STYLE_LABELS[style] || style}
                            ${isActive ? '<span class="tag-remove">×</span>' : ''}
                        </span>
                    `;
                }).join('');
            } else {
                tagsHtml = '<span class="style-sketch-empty">No styles detected yet</span>';
            }
            
            elements.styleSuggestions.innerHTML = tagsHtml + 
                '<button class="btn-style-studio" type="button">Open Style Studio</button>' +
                '<p class="style-hint">Hover tags for details. Click to toggle.</p>';
        }
    }

    function handleStyleTagClick(e) {
        // Check if studio button was clicked
        if (e.target.classList.contains('btn-style-studio')) {
            openStyleStudio();
            return;
        }
        
        const tag = e.target.closest('.style-tag');
        if (!tag) return;

        const style = tag.dataset.style;
        const idx = state.selectedStyleTags.indexOf(style);
        
        if (idx === -1) {
            state.selectedStyleTags.push(style);
        } else {
            state.selectedStyleTags.splice(idx, 1);
        }
        
        updateStyleSuggestions();
    }

    // --- Style Sketch Studio ---

    function openStyleStudio() {
        // Auto-select detected styles from prompt if not already selected
        const text = elements.promptInput?.value.toLowerCase() || '';
        if (text.length >= 5) {
            for (const [style, keywords] of Object.entries(STYLE_KEYWORDS)) {
                if (keywords.some(kw => text.includes(kw))) {
                    if (!state.selectedStyleTags.includes(style)) {
                        state.selectedStyleTags.push(style);
                    }
                }
            }
        }
        
        // Render all style options
        renderStyleStudioOptions();
        
        // Render feedback history
        renderFeedbackHistory();
        
        // Populate feedback if any
        elements.styleFeedback.value = state.styleFeedback || '';
        
        // Update button text based on current state
        updateStyleStudioButtons();
        
        // Add dynamic button text update on feedback input
        elements.styleFeedback.removeEventListener('input', updateStyleStudioButtons);
        elements.styleFeedback.addEventListener('input', updateStyleStudioButtons);
        
        showModal('style-studio-modal');
    }

    function renderStyleStudioOptions() {
        const categories = {
            'Audience & Complexity': ['accessible', 'technical'],
            'Tone & Register': ['informal', 'conversational', 'formal', 'somber', 'empathetic', 'upbeat', 'humorous', 'kind', 'warm', 'understanding', 'compassionate', 'reassuring', 'encouraging'],
            'Purpose & Approach': ['persuasive', 'educational', 'storytelling', 'analytical'],
            'Length & Format': ['concise', 'detailed', 'emoji']
        };

        let html = '';
        
        for (const [categoryName, styles] of Object.entries(categories)) {
            html += `<div class="style-studio-section">
                <h4>${categoryName}</h4>
                <div class="style-studio-grid">`;
            
            for (const styleKey of styles) {
                const config = STYLE_BUILDER[styleKey];
                if (!config) continue;
                
                const isActive = state.selectedStyleTags.includes(styleKey);
                const sentiment = config.sentiment || 'neutral';
                const colors = SENTIMENT_COLORS[sentiment] || SENTIMENT_COLORS.neutral;
                const colorStyle = isActive 
                    ? `background: ${colors.bg}; border-color: ${colors.border}; color: ${colors.text};`
                    : '';
                
                html += `
                    <div class="style-studio-item ${isActive ? 'active' : ''}" data-style="${styleKey}" data-sentiment="${sentiment}" style="${colorStyle}">
                        <div class="style-check">${isActive ? '✓' : ''}</div>
                        <div class="style-info">
                            <div class="style-name">${config.label}</div>
                            <div class="style-desc">${config.description}</div>
                        </div>
                    </div>
                `;
            }
            
            html += '</div></div>';
        }

        elements.styleStudioList.innerHTML = html;
        updateStylePreview();
    }

    // Style impact heuristics for preview
    const STYLE_IMPACT_HEURISTICS = {
        // Tone impacts
        informal: { formality: -30, warmth: +20, complexity: -10 },
        formal: { formality: +35, warmth: -15, complexity: +10 },
        somber: { energy: -40, warmth: -10, seriousness: +30 },
        empathetic: { warmth: +35, connection: +25, formality: -10 },
        upbeat: { energy: +40, warmth: +15, positivity: +30 },
        humorous: { energy: +20, warmth: +10, formality: -25, engagement: +20 },
        kind: { warmth: +30, positivity: +20, formality: -5 },
        warm: { warmth: +35, connection: +20 },
        understanding: { warmth: +25, connection: +30, empathy: +25 },
        compassionate: { warmth: +40, empathy: +35, connection: +25 },
        reassuring: { confidence: +25, warmth: +20, calmness: +30 },
        encouraging: { energy: +25, positivity: +35, warmth: +20 },
        // Audience impacts
        accessible: { complexity: -30, clarity: +25, formality: -15 },
        technical: { complexity: +35, precision: +25, formality: +20 },
        // Purpose impacts
        persuasive: { energy: +15, confidence: +30, engagement: +20 },
        educational: { clarity: +30, structure: +25, complexity: +5 },
        storytelling: { engagement: +35, warmth: +15, flow: +25 },
        analytical: { precision: +30, complexity: +20, objectivity: +25 },
        // Format impacts
        concise: { brevity: +40, complexity: -15, directness: +30 },
        detailed: { depth: +35, thoroughness: +30, brevity: -25 }
    };

    function calculateStyleImpacts(styleTags) {
        const impacts = {};
        for (const style of styleTags) {
            const heuristics = STYLE_IMPACT_HEURISTICS[style];
            if (!heuristics) continue;
            
            for (const [metric, value] of Object.entries(heuristics)) {
                impacts[metric] = (impacts[metric] || 0) + value;
            }
        }
        
        // Clamp values to -100 to +100 range
        for (const key of Object.keys(impacts)) {
            impacts[key] = Math.max(-100, Math.min(100, impacts[key]));
        }
        return impacts;
    }

    function updateStylePreview() {
        if (!elements.stylePreviewSection || !elements.stylePreviewMetrics) return;
        
        if (state.selectedStyleTags.length === 0) {
            elements.stylePreviewSection.classList.add('hidden');
            return;
        }
        
        elements.stylePreviewSection.classList.remove('hidden');
        
        // Calculate pending impacts
        const pendingImpacts = calculateStyleImpacts(state.selectedStyleTags);
        
        // Calculate applied impacts (if any)
        const appliedImpacts = calculateStyleImpacts(state.appliedStyleTags || []);
        const hasApplied = state.appliedStyleTags && state.appliedStyleTags.length > 0;
        
        // Generate preview HTML
        const metricLabels = {
            formality: 'Formality',
            warmth: 'Warmth',
            complexity: 'Reading Level',
            energy: 'Energy',
            positivity: 'Positivity',
            confidence: 'Confidence',
            engagement: 'Engagement',
            clarity: 'Clarity',
            precision: 'Precision',
            seriousness: 'Seriousness',
            connection: 'Connection',
            empathy: 'Empathy',
            calmness: 'Calmness',
            structure: 'Structure',
            flow: 'Flow',
            objectivity: 'Objectivity',
            brevity: 'Brevity',
            depth: 'Depth',
            thoroughness: 'Thoroughness',
            directness: 'Directness'
        };
        
        // Combine all metrics from both pending and applied
        const allMetrics = new Set([...Object.keys(pendingImpacts), ...Object.keys(appliedImpacts)]);
        
        let html = '';
        
        if (hasApplied) {
            html += '<p class="style-diff-notice">Showing changes from current styles:</p>';
        }
        
        html += '<div class="style-impact-grid">';
        
        // Sort by absolute pending value or delta
        const sortedMetrics = [...allMetrics].sort((a, b) => {
            const deltaA = Math.abs((pendingImpacts[a] || 0) - (appliedImpacts[a] || 0));
            const deltaB = Math.abs((pendingImpacts[b] || 0) - (appliedImpacts[b] || 0));
            return deltaB - deltaA;
        });
        
        for (const metric of sortedMetrics) {
            const pending = pendingImpacts[metric] || 0;
            const applied = appliedImpacts[metric] || 0;
            const delta = pending - applied;
            const label = metricLabels[metric] || metric;
            
            if (hasApplied) {
                // Show diff mode
                if (delta === 0) continue; // Skip unchanged metrics
                
                const sign = delta > 0 ? '+' : '';
                const colorClass = delta > 0 ? 'impact-positive' : delta < 0 ? 'impact-negative' : 'impact-neutral';
                
                html += `
                    <div class="style-impact-row style-diff-row">
                        <span class="impact-label">${label}</span>
                        <div class="impact-change">
                            <span class="impact-old">${applied}%</span>
                            <span class="impact-arrow">→</span>
                            <span class="impact-new ${colorClass}">${pending}%</span>
                        </div>
                        <span class="impact-delta ${colorClass}">${sign}${delta}%</span>
                    </div>
                `;
            } else {
                // Show absolute mode
                const sign = pending > 0 ? '+' : '';
                const colorClass = pending > 0 ? 'impact-positive' : pending < 0 ? 'impact-negative' : 'impact-neutral';
                const barWidth = Math.abs(pending);
                
                html += `
                    <div class="style-impact-row">
                        <span class="impact-label">${label}</span>
                        <div class="impact-bar-container">
                            <div class="impact-bar ${colorClass}" style="width: ${barWidth}%;"></div>
                        </div>
                        <span class="impact-value ${colorClass}">${sign}${pending}%</span>
                    </div>
                `;
            }
        }
        
        if (hasApplied && sortedMetrics.filter(m => (pendingImpacts[m] || 0) !== (appliedImpacts[m] || 0)).length === 0) {
            html += '<p class="no-style-changes">No changes from current styles</p>';
        }
        
        html += '</div>';
        elements.stylePreviewMetrics.innerHTML = html;
    }

    function handleStyleStudioItemClick(e) {
        const item = e.target.closest('.style-studio-item');
        if (!item) return;

        const style = item.dataset.style;
        const idx = state.selectedStyleTags.indexOf(style);
        
        if (idx === -1) {
            state.selectedStyleTags.push(style);
        } else {
            state.selectedStyleTags.splice(idx, 1);
        }
        
        renderStyleStudioOptions();
    }

    function saveStylesAndContinue() {
        const newFeedback = elements.styleFeedback.value.trim();
        
        // Track feedback if it's new
        if (newFeedback && newFeedback !== state.styleFeedback) {
            addFeedbackToHistory(newFeedback);
        }
        
        state.styleFeedback = newFeedback;
        
        // Clear the feedback textarea since it's now saved
        elements.styleFeedback.value = '';
        
        // Re-render to show the saved feedback in history
        renderFeedbackHistory();
        updateStyleStudioButtons();
        updateViewFeedbackButton();
        
        // Don't close modal - user continues editing
    }

    function applyStyleStudio() {
        const newFeedback = elements.styleFeedback.value.trim();
        
        // Track feedback if it's new
        if (newFeedback && newFeedback !== state.styleFeedback) {
            addFeedbackToHistory(newFeedback);
        }
        
        state.styleFeedback = newFeedback;
        
        // Clear the feedback textarea since it's now saved
        elements.styleFeedback.value = '';
        state.styleFeedback = '';
        
        hideModal('style-studio-modal');
        updateStyleSuggestions();
        updateViewFeedbackButton();
    }

    function regenerateWithStyles() {
        const newFeedback = elements.styleFeedback.value.trim();
        
        // Track feedback if it's new
        if (newFeedback && newFeedback !== state.appliedStyleFeedback) {
            addFeedbackToHistory(newFeedback);
        }
        
        state.styleFeedback = newFeedback;
        // Store what's being applied for diff tracking
        state.appliedStyleTags = [...state.selectedStyleTags];
        state.appliedStyleFeedback = state.styleFeedback;
        
        // Clear the feedback textarea since it's now applied
        elements.styleFeedback.value = '';
        state.styleFeedback = '';
        
        hideModal('style-studio-modal');
        updateStyleSuggestions();
        updateViewFeedbackButton();
        generateContent();
    }
    
    function addFeedbackToHistory(feedback) {
        state.feedbackHistory.push({
            text: feedback,
            timestamp: Date.now(),
            appliedStyles: [...state.selectedStyleTags]
        });
    }
    
    function renderFeedbackHistory() {
        if (!elements.feedbackHistorySection || !elements.feedbackHistoryList) return;
        
        if (state.feedbackHistory.length === 0) {
            elements.feedbackHistorySection.classList.add('hidden');
            return;
        }
        
        elements.feedbackHistorySection.classList.remove('hidden');
        
        // Update count
        if (elements.feedbackCount) {
            elements.feedbackCount.textContent = `(${state.feedbackHistory.length})`;
        }
        
        let html = '';
        state.feedbackHistory.forEach((entry, idx) => {
            const timeAgo = getTimeAgo(entry.timestamp);
            const isLatest = idx === state.feedbackHistory.length - 1;
            const styleCount = entry.appliedStyles.length;
            const changeFromPrev = idx > 0 ? calculateFeedbackChange(idx) : null;
            
            html += `
                <div class="feedback-history-item ${isLatest ? 'latest' : ''}">
                    <div class="feedback-text">"${escapeHtml(entry.text)}"</div>
                    <div class="feedback-meta">
                        <span class="feedback-time">${timeAgo}</span>
                        ${styleCount > 0 ? `<span class="feedback-styles">${styleCount} style${styleCount !== 1 ? 's' : ''}</span>` : ''}
                        ${changeFromPrev !== null ? `<span class="feedback-change ${changeFromPrev >= 0 ? 'positive' : 'negative'}">${changeFromPrev >= 0 ? '+' : ''}${changeFromPrev}% impact</span>` : ''}
                    </div>
                </div>
            `;
        });
        
        elements.feedbackHistoryList.innerHTML = html;
    }
    
    function calculateFeedbackChange(index) {
        // Simple heuristic: calculate change based on style count and feedback length
        const current = state.feedbackHistory[index];
        const prev = state.feedbackHistory[index - 1];
        
        const currScore = current.appliedStyles.length * 10 + Math.min(current.text.length / 10, 30);
        const prevScore = prev.appliedStyles.length * 10 + Math.min(prev.text.length / 10, 30);
        
        return Math.round(((currScore - prevScore) / Math.max(prevScore, 1)) * 100);
    }
    
    function getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }
    
    // --- Revision History Functions ---
    
    function saveToRevisionHistory(content) {
        // Don't save if content is identical to most recent revision
        if (state.revisionHistory.length > 0 && state.revisionHistory[0].content === content) {
            return;
        }
        
        // Save current content to revision history
        const entry = {
            content: content,
            timestamp: Date.now(),
            styles: [...state.appliedStyleTags],
            prompt: elements.promptInput?.value || '',
            contentType: elements.contentCategory?.value || ''
        };
        
        // Add to beginning for most recent first
        state.revisionHistory.unshift(entry);
        
        // Limit to 20 revisions
        if (state.revisionHistory.length > 20) {
            state.revisionHistory.pop();
        }
        
        // Reset index since positions shifted
        state.currentRevisionIndex = -1;
        
        updateRevisionHistoryButton();
    }
    
    function updateRevisionHistoryButton() {
        const btn = elements.btnRevisionHistory;
        if (!btn) return;
        
        if (state.revisionHistory.length >= 1) {
            btn.classList.remove('hidden');
            btn.title = `${state.revisionHistory.length} version${state.revisionHistory.length !== 1 ? 's' : ''}`;
        } else {
            btn.classList.add('hidden');
        }
    }
    
    function openRevisionHistory() {
        if (state.revisionHistory.length === 0) return;
        
        renderRevisionHistoryList();
        showModal('revision-history-modal');
    }
    
    function renderRevisionHistoryList() {
        if (!elements.revisionHistoryList) return;
        
        // Determine which revision is currently being viewed
        const currentIdx = state.currentRevisionIndex >= 0 ? state.currentRevisionIndex : 0;
        
        let html = '';
        state.revisionHistory.forEach((entry, idx) => {
            const timeAgo = getTimeAgo(entry.timestamp);
            const preview = entry.content.substring(0, 100) + (entry.content.length > 100 ? '...' : '');
            const wordCount = entry.content.split(/\s+/).length;
            const styleLabels = entry.styles.map(s => STYLE_BUILDER[s]?.label || s).join(', ');
            const isCurrent = idx === currentIdx;
            const isLatest = idx === 0;
            
            html += `
                <div class="revision-item ${isCurrent ? 'current' : ''}" data-index="${idx}">
                    <div class="revision-header">
                        <span class="revision-time">${isLatest ? 'Latest' : timeAgo}${isCurrent ? ' (viewing)' : ''}</span>
                        <span class="revision-words">${wordCount} words</span>
                    </div>
                    <div class="revision-preview">${escapeHtml(preview)}</div>
                    ${styleLabels ? `<div class="revision-styles">${styleLabels}</div>` : ''}
                    ${!isCurrent ? '<button class="btn-small btn-restore">Restore</button>' : ''}
                </div>
            `;
        });
        
        elements.revisionHistoryList.innerHTML = html;
    }
    
    function handleRevisionSelect(index) {
        if (index < 0 || index >= state.revisionHistory.length) return;
        
        const currentContent = elements.generatedContent?.innerText || '';
        
        // Only save current content if:
        // 1. We're NOT already viewing a history item (currentRevisionIndex === -1), OR
        // 2. We ARE viewing history but made EDITS to it (content differs from that revision)
        if (state.currentRevisionIndex === -1) {
            // We're viewing fresh generated content - save it if different from history[0]
            if (currentContent && (state.revisionHistory.length === 0 || currentContent !== state.revisionHistory[0].content)) {
                saveToRevisionHistory(currentContent);
                // Index shifts up by 1 since we added to front
                index++;
            }
        } else if (state.currentRevisionIndex >= 0) {
            // We're already viewing a history item - only save if user edited it
            const viewingEntry = state.revisionHistory[state.currentRevisionIndex];
            if (viewingEntry && currentContent !== viewingEntry.content) {
                // User edited a history revision - save as new entry
                saveToRevisionHistory(currentContent);
                index++;
            }
        }
        
        // Restore selected revision (don't move it, just track the index)
        const entry = state.revisionHistory[index];
        if (!entry) {
            console.warn('[WriteMe] Invalid revision index:', index);
            hideModal('revision-history-modal');
            return;
        }
        
        elements.generatedContent.innerText = entry.content;
        
        // Update state
        state.originalGeneratedContent = entry.content;
        state.editedContent = '';
        state.hasUnsavedEdits = false;
        state.appliedStyleTags = [...entry.styles];
        state.selectedStyleTags = [...entry.styles];
        state.currentRevisionIndex = index; // Track which revision we're viewing
        
        updateEditIndicator();
        updateStyleSuggestions();
        updateRevisionHistoryButton();
        
        hideModal('revision-history-modal');
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function updateViewFeedbackButton() {
        if (!elements.btnViewFeedback) return;
        
        if (state.feedbackHistory.length > 0) {
            elements.btnViewFeedback.classList.remove('hidden');
            elements.btnViewFeedback.textContent = `View Feedback (${state.feedbackHistory.length})`;
        } else {
            elements.btnViewFeedback.classList.add('hidden');
        }
    }
    
    function openFeedbackModal() {
        if (!elements.feedbackModalList) return;
        
        let html = '';
        if (state.feedbackHistory.length === 0) {
            html = '<p class="no-feedback">No feedback recorded yet.</p>';
        } else {
            state.feedbackHistory.forEach((entry, idx) => {
                const timeAgo = getTimeAgo(entry.timestamp);
                const isLatest = idx === state.feedbackHistory.length - 1;
                const styleCount = entry.appliedStyles.length;
                const changeFromPrev = idx > 0 ? calculateFeedbackChange(idx) : null;
                
                html += `
                    <div class="feedback-modal-item ${isLatest ? 'latest' : ''}">
                        <div class="feedback-modal-text">"${escapeHtml(entry.text)}"</div>
                        <div class="feedback-modal-meta">
                            <span class="feedback-time">${timeAgo}</span>
                            ${styleCount > 0 ? `<span class="feedback-styles">${styleCount} style${styleCount !== 1 ? 's' : ''}</span>` : ''}
                            ${changeFromPrev !== null ? `<span class="feedback-change ${changeFromPrev >= 0 ? 'positive' : 'negative'}">${changeFromPrev >= 0 ? '+' : ''}${changeFromPrev}%</span>` : ''}
                        </div>
                    </div>
                `;
            });
        }
        
        elements.feedbackModalList.innerHTML = html;
        showModal('feedback-modal');
    }
    
    function updateStyleStudioButtons() {
        const hasFeedback = elements.styleFeedback.value.trim().length > 0;
        const hasGeneratedContent = !elements.outputSection?.classList.contains('hidden');
        
        if (hasGeneratedContent) {
            // Show regenerate button, hide apply
            elements.btnStyleStudioApply.classList.add('hidden');
            elements.btnStyleStudioRegenerate.classList.remove('hidden');
            
            // Update button text based on feedback
            if (hasFeedback) {
                elements.btnStyleStudioRegenerate.textContent = 'Regenerate with Feedback & Styles';
            } else {
                elements.btnStyleStudioRegenerate.textContent = 'Regenerate with Styles';
            }
        } else {
            // Show apply button, hide regenerate
            elements.btnStyleStudioApply.classList.remove('hidden');
            elements.btnStyleStudioRegenerate.classList.add('hidden');
            
            // Update button text
            elements.btnStyleStudioApply.textContent = hasFeedback ? 'Save Feedback & Styles' : 'Save Styles';
        }
    }

    function getStyleOverridePrompt() {
        if (state.selectedStyleTags.length === 0 && !state.styleFeedback && state.feedbackHistory.length === 0) return '';
        
        let prompt = '';
        
        if (state.selectedStyleTags.length > 0) {
            const overrides = state.selectedStyleTags
                .map(s => STYLE_BUILDER[s]?.description)
                .filter(Boolean);
            
            if (overrides.length > 0) {
                prompt = '\n\n## STYLE ADJUSTMENTS\n\n' + overrides.join('\n\n');
            }
        }
        
        // Include all feedback history for accumulated learning with strong emphasis
        if (state.feedbackHistory.length > 0) {
            prompt += '\n\n## CRITICAL: USER FEEDBACK REQUIREMENTS\n\n';
            prompt += '**IMPORTANT: The following feedback represents explicit user preferences. Follow each point precisely and literally. These are not suggestions - they are requirements that MUST be reflected in the output.**\n\n';
            prompt += 'Apply ALL of this guidance cumulatively, with each subsequent item building on previous ones:\n';
            state.feedbackHistory.forEach((entry, idx) => {
                prompt += `\n${idx + 1}. REQUIREMENT: "${entry.text}"`;
                if (entry.appliedStyles && entry.appliedStyles.length > 0) {
                    prompt += ` [Applied with: ${entry.appliedStyles.join(', ')}]`;
                }
            });
            prompt += '\n\n**Verify that EACH feedback item above is clearly addressed in your output before finalizing.**';
        }
        
        // Include user edits as strong guidance
        if (state.editedContent && state.originalGeneratedContent && state.editedContent !== state.originalGeneratedContent) {
            prompt += '\n\n## USER EDITS TO PREVIOUS OUTPUT\n\n';
            prompt += '**The user manually edited the previous output. Their edits indicate preferred phrasing and structure. Learn from these changes:**\n\n';
            const editAnalysis = analyzeUserEdits(state.originalGeneratedContent, state.editedContent);
            prompt += editAnalysis;
        }
        
        // Add current feedback if different from last history entry
        if (state.styleFeedback) {
            const lastHistoryFeedback = state.feedbackHistory.length > 0 
                ? state.feedbackHistory[state.feedbackHistory.length - 1].text 
                : '';
            
            if (state.styleFeedback !== lastHistoryFeedback) {
                prompt += '\n\n## IMMEDIATE STYLE GUIDANCE (HIGHEST PRIORITY)\n\n';
                prompt += '**Apply this guidance with the highest priority:** ' + state.styleFeedback;
            }
        }
        
        return prompt;
    }
    
    function analyzeUserEdits(original, edited) {
        const origWords = original.split(/\s+/).filter(w => w);
        const editWords = edited.split(/\s+/).filter(w => w);
        const origParagraphs = original.split(/\n\s*\n/).filter(p => p.trim());
        const editParagraphs = edited.split(/\n\s*\n/).filter(p => p.trim());
        
        let analysis = '';
        
        // Word count changes
        const wordDiff = editWords.length - origWords.length;
        if (wordDiff > 10) {
            analysis += `- User ADDED substantial content (${wordDiff} words). Consider including more detail in your response.\n`;
        } else if (wordDiff < -10) {
            analysis += `- User REMOVED content (${Math.abs(wordDiff)} words). Be more concise in your response.\n`;
        }
        
        // Paragraph changes
        if (editParagraphs.length > origParagraphs.length) {
            analysis += `- User restructured into MORE paragraphs (${origParagraphs.length} → ${editParagraphs.length}). Use shorter, more frequent paragraph breaks.\n`;
        } else if (editParagraphs.length < origParagraphs.length) {
            analysis += `- User CONDENSED paragraphs (${origParagraphs.length} → ${editParagraphs.length}). Use longer, more flowing paragraphs.\n`;
        }
        
        // Find specific phrases that were kept vs removed
        const origSentences = original.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const editSentences = edited.split(/[.!?]+/).filter(s => s.trim().length > 10);
        
        const keptSentences = origSentences.filter(s => edited.includes(s.trim().substring(0, 20)));
        const removedSentences = origSentences.filter(s => !edited.includes(s.trim().substring(0, 20)));
        
        if (removedSentences.length > 0 && removedSentences.length <= 3) {
            analysis += `- User REMOVED these types of phrases (AVOID similar phrasing):\n`;
            removedSentences.slice(0, 2).forEach(s => {
                analysis += `  "${s.trim().substring(0, 60)}..."\n`;
            });
        }
        
        if (!analysis) {
            analysis = '- User made minor edits. Maintain similar style but refine based on other feedback.\n';
        }
        
        return analysis;
    }

    // --- Output Collapse Behavior ---

    function handlePromptClearBehavior() {
        const promptEmpty = elements.promptInput.value.trim().length === 0;
        const hasOutput = !elements.outputSection?.classList.contains('hidden');
        
        if (promptEmpty && hasOutput) {
            // Collapse output when prompt cleared after generating
            collapseOutput();
            // Reset style sketch
            state.selectedStyleTags = [];
            state.styleFeedback = '';
            elements.styleBuilder?.classList.add('hidden');
        }
    }

    function collapseOutput() {
        elements.outputBody?.classList.add('collapsed');
        elements.btnToggleOutput?.classList.remove('hidden');
        elements.btnToggleOutput?.classList.add('collapsed');
    }

    function expandOutput() {
        elements.outputBody?.classList.remove('collapsed');
        elements.btnToggleOutput?.classList.remove('collapsed');
    }

    function toggleOutputCollapse() {
        if (elements.outputBody?.classList.contains('collapsed')) {
            expandOutput();
        } else {
            collapseOutput();
        }
    }

    // --- Profile File Upload ---

    function handleProfileFileUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result;
            if (typeof content === 'string') {
                elements.profileInput.value = content;
                loadProfile();
            }
        };
        reader.onerror = () => {
            UIRenderer.showError('Failed to read file. Please try again.');
        };
        reader.readAsText(file);
        
        // Reset file input so same file can be selected again
        e.target.value = '';
    }
})();
