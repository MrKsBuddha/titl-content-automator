/**
 * Popup script for TeacherInTheLoop Automation
 * Handles content type, subject, and tab count selection
 */

// State management
let selectedType = 'activity';
let selectedSubject = 'biology';
let selectedTabCount = 10;

// DOM elements
const typeButtons = document.querySelectorAll('[data-type]');
const subjectButtons = document.querySelectorAll('[data-subject]');
const tabCountInput = document.getElementById('tabCount');
const quickBtns = document.querySelectorAll('.quick-btn');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusDiv = document.getElementById('status');

// ==================== INITIALIZATION ====================

/**
 * Check if automation is running when popup opens
 */
(async function initPopup() {
    // Check automation state from storage
    const result = await chrome.storage.session.get(['automation_running']);

    if (result.automation_running) {
        // Automation is running - show STOP button
        stopBtn.style.display = 'block';
        showStatus('Automation is running...', 'success');
        console.log('[Popup] Automation detected as running - showing STOP button');
    }
})();

// ==================== EVENT LISTENERS ====================

// Content type selection
typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedType = btn.getAttribute('data-type');
        console.log('Selected type:', selectedType);
    });
});

// Subject selection
subjectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        subjectButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedSubject = btn.getAttribute('data-subject');
        console.log('Selected subject:', selectedSubject);
    });
});

// Quick select buttons for tab count
quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const count = btn.getAttribute('data-count');
        tabCountInput.value = count;
        selectedTabCount = parseInt(count);

        // Update active state
        quickBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Tab count input validation
tabCountInput.addEventListener('input', () => {
    let value = parseInt(tabCountInput.value);

    if (value < 1 || isNaN(value)) {
        tabCountInput.value = 1;
        value = 1;
    } else if (value > 100) {
        tabCountInput.value = 100;
        value = 100;
    }

    selectedTabCount = value;

    // Update quick button active state
    quickBtns.forEach(btn => {
        if (btn.getAttribute('data-count') == value) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
});

// Start automation button
startBtn.addEventListener('click', async () => {
    const tabCount = parseInt(tabCountInput.value);

    // Validate
    if (isNaN(tabCount) || tabCount < 1 || tabCount > 100) {
        showStatus('Please enter a number between 1 and 100', 'error');
        return;
    }

    // Disable start button, show stop button
    startBtn.disabled = true;
    startBtn.textContent = '🚀 Opening tabs...';
    stopBtn.style.display = 'block';

    try {
        // Send configuration to background script
        const response = await chrome.runtime.sendMessage({
            type: 'START_AUTOMATION',
            config: {
                contentType: selectedType,
                subject: selectedSubject,
                tabCount: tabCount
            }
        });

        if (response && response.success) {
            const typeLabel = getTypeLabel(selectedType);
            const subjectLabel = getSubjectLabel(selectedSubject);
            showStatus(
                `✅ ${tabCount} ${typeLabel} tab${tabCount > 1 ? 's' : ''} opened for ${subjectLabel}!`,
                'success'
            );

            // Set automation running flag in storage
            await chrome.storage.session.set({ automation_running: true });

            // Re-enable start button
            startBtn.disabled = false;
            startBtn.textContent = '🚀 Start Automation';

            // Keep stop button visible
        } else {
            showStatus('Failed to open tabs. Please try again.', 'error');
            startBtn.disabled = false;
            startBtn.textContent = '🚀 Start Automation';
            stopBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('Error: ' + error.message, 'error');
        startBtn.disabled = false;
        startBtn.textContent = '🚀 Start Automation';
        stopBtn.style.display = 'none';
    }
});

// STOP automation button
stopBtn.addEventListener('click', async () => {
    stopBtn.disabled = true;
    stopBtn.textContent = '🛑 Stopping...';

    try {
        const response = await chrome.runtime.sendMessage({
            type: 'STOP_AUTOMATION'
        });

        if (response && response.success) {
            // Clear automation running flag
            await chrome.storage.session.set({ automation_running: false });

            showStatus('⛔ All automation stopped!', 'error');
            stopBtn.style.display = 'none';
            stopBtn.disabled = false;
            stopBtn.textContent = '🛑 STOP All Tabs';
        }
    } catch (error) {
        console.error('Error stopping:', error);
        stopBtn.disabled = false;
        stopBtn.textContent = '🛑 STOP All Tabs';
    }
});

// Allow Enter key to start
tabCountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        startBtn.click();
    }
});

// ==================== HELPER FUNCTIONS ====================

function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
}

function getTypeLabel(type) {
    const labels = {
        'activity': 'Activity',
        'lesson_plan': 'Lesson Plan',
        'full_lesson': 'Full Lesson'
    };
    return labels[type] || type;
}

function getSubjectLabel(subject) {
    const labels = {
        'math': 'Maths',
        'biology': 'Biology',
        'fashion': 'Fashion Design',
        'science': 'Science & Lab Technology'
    };
    return labels[subject] || subject;
}

console.log('[Popup] TeacherInTheLoop Automation ready');
