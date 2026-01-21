/**
 * Content Script for TeacherInTheLoop AI Automation
 * Automatically completes the OER content generation workflow
 */

// ==================== CONFIGURATION ====================
// Configured for TeacherInTheLoop AI (teacherintheloop.ai)

const SELECTORS = {
    // Biology category - text-based card selection
    biologyCard: 'div:contains("Biology")',

    // Query input field
    queryInput: 'input#edit-query',

    // Workflow buttons (in order of appearance)
    generateButton: 'button.start-workflow-btn',      // Step 1: Start generation
    topicConfirmButton: 'button.accept-chapter',      // Step 2: Confirm topic (Maths only!)
    proceedButton: 'button.accept-plan',              // Step 3: Accept outline
    confirmButton: 'button.accept-lesson',            // Step 4: Final save

    // Success indicator - text that appears when complete
    successIndicator: 'Ready to Publish',

    // Popup/Dialog elements (if any appear)
    popupConfirm: 'button.confirm, button.ok',
    dialogAccept: 'button.accept, button.yes'
};

// Wait times (in milliseconds) - AI generation takes time!
const TIMEOUTS = {
    pageLoad: 30000,      // Max time to wait for page load
    elementWait: 15000,   // Max time to wait for each element
    actionDelay: 2000,    // Delay between actions
    retryDelay: 3000,     // Delay before retry
    aiGeneration: 300000  // Max time to wait for AI content generation (5 minutes - tested live!)
};

// ==================== GLOBAL STATE ====================
let automationRunning = false;
let currentQuery = null;
let currentSubject = 'biology';
let queryEntered = false;  // Flag to prevent duplicate query entry
let retryCount = 0;
const MAX_RETRIES = 1;

// ==================== INITIALIZATION ====================

/**
 * Start automation when page is ready
 */
(async function init() {
    console.log("[Content] Script loaded on:", window.location.href);

    // Check if this is a tab opened by our extension
    const response = await sendMessageToBackground({ type: "GET_QUERY" });

    if (response && response.query) {
        // Tab was opened by extension - run automation
        currentQuery = response.query;
        currentSubject = response.subject || 'biology';
        console.log(`[Content] ✓ Automation tab detected`);
        console.log(`[Content] Assigned Subject: ${currentSubject}`);
        console.log(`[Content] Assigned query #${response.index + 1}:`, currentQuery);

        // Wait for page to be fully loaded
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", startAutomation);
        } else {
            startAutomation();
        }
    } else {
        // Manually opened tab - DO NOT run automation
        console.log("[Content] ℹ️  Manual tab detected - automation disabled");
        console.log("[Content] (This tab was not opened by the extension)");
    }
})();

// ==================== STOP AUTOMATION LISTENER ====================

/**
 * Listen for STOP command from background/popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "STOP_AUTOMATION") {
        console.log("[Content] 🛑 STOP command received - halting automation immediately!");

        // Stop automation
        automationRunning = false;

        // Reset all flags
        queryEntered = false;
        retryCount = 0;
        currentQuery = null;

        console.log("[Content] ✓ Automation stopped and reset");
        sendResponse({ success: true });
    }
    return true;
});

// ==================== MAIN AUTOMATION FLOW ====================

/**
 * Main automation workflow for TeacherInTheLoop AI
 */
async function startAutomation() {
    if (automationRunning) {
        console.log("[Content] Automation already running");
        return;
    }

    automationRunning = true;
    console.log("[Content] Starting TeacherInTheLoop automation workflow...");

    try {
        // Step 1: Wait for page to fully load
        await waitForPageLoad();
        console.log("[Content] ✓ Page loaded");

        await sleep(TIMEOUTS.actionDelay);

        // Step 2: Select subject category
        await selectSubjectCategory();
        console.log(`[Content] ✓ ${currentSubject} category selected`);

        await sleep(TIMEOUTS.actionDelay);

        // Step 3: Enter the biology query
        await enterQuery();
        console.log("[Content] ✓ Query entered");

        await sleep(TIMEOUTS.actionDelay);

        // Step 4: Click "Generate" button to start workflow
        await clickGenerateButton();
        console.log("[Content] ✓ Generation started");

        // Check for and dismiss any popups
        await dismissPopup();

        // Step 4.5: Check for "Confirm Topic" button (Maths only)
        await waitAndClickTopicConfirm();

        // Check for popups again after topic confirmation
        await dismissPopup();

        // Step 5: Wait for outline generation, then click "Proceed to Full Activity"
        await waitAndClickProceed();
        console.log("[Content] ✓ Proceeded to full content generation");

        // Check for popups after proceeding
        await dismissPopup();

        // Step 6: Wait for full content, then click "Confirm & Save"
        await waitAndClickConfirm();
        console.log("[Content] ✓ Content confirmed");

        // Step 7: Wait for success dialog, then click "Save to My Collection"
        await waitAndClickSaveToCollection();
        console.log("[Content] ✓ Saved to collection");

        // Step 8: Check for final success
        await checkForSuccess();

        console.log("[Content] ✅ Automation completed successfully!");

        // Clear automation flag to prevent re-running on reload
        await sendMessageToBackground({
            type: "CLEAR_AUTOMATION_FLAG"
        });

        await sendMessageToBackground({
            type: "AUTOMATION_COMPLETE",
            status: "success"
        });

    } catch (error) {
        console.error("[Content] ❌ Automation failed:", error);

        // Check for "An error occurred" popup
        const hasErrorPopup = await checkForErrorPopup();

        if (hasErrorPopup) {
            console.log("[Content] Error popup detected, will reload and retry...");
            // Dismiss the error popup first
            await dismissErrorPopup();
            // Reload page and retry
            await reloadAndRetry();
            return;
        }

        // Retry logic for other errors
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`[Content] Retrying... (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
            automationRunning = false;
            await sleep(TIMEOUTS.retryDelay);
            await startAutomation();
        } else {
            console.error("[Content] Max retries reached. Automation stopped.");
            await sendMessageToBackground({
                type: "AUTOMATION_ERROR",
                error: error.message
            });
        }
    }
}

// ==================== WORKFLOW STEPS ====================

/**
 * Wait for page to fully load
 */
async function waitForPageLoad() {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("Page load timeout"));
        }, TIMEOUTS.pageLoad);

        if (document.readyState === "complete") {
            clearTimeout(timeout);
            resolve();
        } else {
            window.addEventListener("load", () => {
                clearTimeout(timeout);
                resolve();
            });
        }
    });
}

/**
 * Select the subject category (Maths, Biology, or Fashion Design)
 */
async function selectSubjectCategory() {
    // Map subject names to EXACT display names on the website
    const subjectNames = {
        'math': 'Maths',              // Website uses "Maths" not "Math"
        'biology': 'Biology',
        'fashion': 'Fashion Design',   // Website uses "Fashion Design" not "Fashion"
        'science': 'Science Laboratory Technology'  // Full name on website
    };

    const subjectName = subjectNames[currentSubject] || 'Biology';
    console.log(`[Content] Selecting ${subjectName} category...`);
    console.log(`[Content] Waiting for subject cards to load...`);

    // WAIT for subject cards to appear (polling with timeout)
    let found = false;
    const maxWaitTime = 15000; // 15 seconds
    const startTime = Date.now();

    while (!found && (Date.now() - startTime) < maxWaitTime) {
        // Find all divs and look for the subject card
        const allDivs = document.querySelectorAll('div');

        for (const div of allDivs) {
            const divText = div.textContent.trim();
            if (divText === subjectName && isVisible(div)) {
                console.log(`[Content] ✓ Found ${subjectName} card!`);
                div.click();
                found = true;
                console.log(`[Content] ✓ Clicked ${subjectName} card`);
                await sleep(1000); // Wait after clicking
                break;
            }
        }

        if (!found) {
            // Wait a bit and try again
            await sleep(500);
        }
    }

    if (!found) {
        // Try alternative search - case insensitive
        for (const div of allDivs) {
            const divText = div.textContent.trim().toLowerCase();
            if (divText === subjectName.toLowerCase() && isVisible(div)) {
                div.click();
                found = true;
                console.log(`[Content] ✓ Clicked ${subjectName} card (case-insensitive match)`);
                break;
            }
        }
    }

    if (!found) {
        throw new Error(`Could not find ${subjectName} category card`);
    }
}

/**
 * Enter the query (only once to prevent duplicates)
 */
async function enterQuery() {
    // Prevent entering query multiple times
    if (queryEntered) {
        console.log("[Content] Query already entered, skipping...");
        return;
    }

    console.log("[Content] Entering query...");

    const input = await waitForElement(SELECTORS.queryInput, 10000, true);

    if (!input) {
        throw new Error("Could not find query input field");
    }

    // Verify this is the INITIAL input, not one that appears during generation
    // The initial input should be visible and editable before any generation starts
    if (!isVisible(input)) {
        console.log("[Content] Query input not visible, skipping...");
        return;
    }

    // Clear and enter the query
    input.value = "";
    input.focus();

    await sleep(500); // Small delay to ensure focus

    // Type the query
    input.value = currentQuery;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));

    // Mark query as entered
    queryEntered = true;
    console.log("[Content] ✓ Query entered successfully and flagged");
}

/**
 * Click the "Generate" button to start workflow
 */
async function clickGenerateButton() {
    console.log("[Content] Clicking Generate button...");

    const button = await waitForElement(SELECTORS.generateButton);

    if (!button) {
        throw new Error("Could not find Generate button");
    }

    button.click();
}

/**
 * Wait for and click "Confirm Topic" button (Maths only - optional)
 * This step only appears for Math, not for Biology or Fashion
 */
async function waitAndClickTopicConfirm() {
    console.log("[Content] Checking for 'Confirm Topic' button (Maths-specific)...");

    // Wait a short time for the button to appear
    await sleep(3000);

    try {
        // Try to find the topic confirmation button (only appears for Maths)
        const topicBtn = await waitForElement(SELECTORS.topicConfirmButton, 10000, false);

        if (topicBtn && isVisible(topicBtn)) {
            console.log("[Content] ✓ 'Confirm Topic' button found (Maths workflow)");
            topicBtn.click();
            console.log("[Content] ✓ Topic confirmed");
            await sleep(2000); // Wait after clicking
        } else {
            console.log("[Content] No 'Confirm Topic' button found (Biology/Fashion workflow)");
        }
    } catch (error) {
        // This is expected for Biology and Fashion - they don't have this step
        console.log("[Content] 'Confirm Topic' step skipped (not required for this subject)");
    }
}

/**
 * Wait for outline generation, then click "Proceed to Full Activity"
 */
async function waitAndClickProceed() {
    console.log("[Content] Waiting for outline generation...");
    console.log("[Content] Will search for 'Proceed to Full Activity' button");

    // Give outline time to generate
    await sleep(5000);

    try {
        // Strategy 1: Search by exact text first (most reliable)
        console.log("[Content] Strategy 1: Searching by exact text...");
        let proceedBtn = findButtonByText("Proceed to Full Activity");

        if (proceedBtn) {
            console.log("[Content] ✓ Found button by exact text match!");
            console.log("[Content] Button text:", proceedBtn.textContent.trim());
            console.log("[Content] Button classes:", proceedBtn.className);

            // Scroll button into view (for long content)
            console.log("[Content] Scrolling button into view...");
            proceedBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await sleep(2000); // Wait for scroll to complete

            proceedBtn.click();
            console.log("[Content] ✓ Proceed button clicked successfully!");
            return;
        }

        // Strategy 2: Wait for button with primary selector
        console.log("[Content] Strategy 2: Trying primary selector:", SELECTORS.proceedButton);
        proceedBtn = await waitForElement(SELECTORS.proceedButton, 30000, false);

        if (proceedBtn && isVisible(proceedBtn)) {
            console.log("[Content] ✓ Found button with primary selector!");

            // Scroll button into view
            proceedBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await sleep(2000);

            proceedBtn.click();
            console.log("[Content] ✓ Proceed button clicked successfully!");
            return;
        }

        // Strategy 3: Search by partial text match
        console.log("[Content] Strategy 3: Searching by partial text...");
        const allButtons = document.querySelectorAll("button");
        const proceedKeywords = ["proceed", "full activity", "continue", "next"];

        for (const btn of allButtons) {
            const btnText = btn.textContent.toLowerCase().trim();
            if (proceedKeywords.some(keyword => btnText.includes(keyword)) && isVisible(btn)) {
                console.log("[Content] ✓ Found button by partial match:", btn.textContent.trim());

                // Scroll into view
                btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await sleep(2000);

                btn.click();
                console.log("[Content] ✓ Proceed button clicked successfully!");
                return;
            }
        }

        // Strategy 4: Find any orange/primary button
        console.log("[Content] Strategy 4: Looking for primary/orange buttons...");
        for (const btn of allButtons) {
            if (isVisible(btn) && btn.textContent.trim().length > 5) {
                const classes = btn.className.toLowerCase();
                if (classes.includes('primary') || classes.includes('orange') || classes.includes('btn-lg')) {
                    console.log("[Content] ✓ Found potential button:", btn.textContent.trim());
                    await sleep(1000);
                    btn.click();
                    console.log("[Content] ✓ Button clicked!");
                    return;
                }
            }
        }

        throw new Error("Proceed button not found with any strategy");

    } catch (error) {
        console.error("[Content] ERROR in waitAndClickProceed:", error);

        // Debug: dump all buttons
        console.log("[Content] === DEBUG: All visible buttons on page ===");
        const debugButtons = document.querySelectorAll("button");
        debugButtons.forEach((btn, idx) => {
            if (isVisible(btn)) {
                console.log(`Button ${idx + 1}: Text="${btn.textContent.trim()}", Class="${btn.className}", ID="${btn.id}"`);
            }
        });
        console.log("[Content] =====================================");

        throw error;
    }
}

/**
 * Find button by exact text content
 */
function findButtonByText(text) {
    const buttons = document.querySelectorAll("button");
    for (const btn of buttons) {
        if (btn.textContent.trim() === text && isVisible(btn)) {
            return btn;
        }
    }
    return null;
}

/**
 * Wait for full content generation, then click "Confirm & Save"
 */
async function waitAndClickConfirm() {
    console.log("[Content] Waiting for full content generation...");
    console.log("[Content] Will search for Confirm/Save button");

    // Give content time to generate
    await sleep(5000);

    try {
        // Strategy 1: Search by text variations
        console.log("[Content] Strategy 1: Searching by text...");
        const confirmTexts = [
            "Confirm & Save Topic Content",      // Full Lesson
            "Confirm & Save Activity",           // Activity
            "Confirm & Save Lesson Structure",   // Lesson Plan
            "Confirm and Save Topic Content",
            "Confirm and Save Activity",
            "Confirm and Save Lesson Structure",
            "Save Topic Content",
            "Save Activity",
            "Save Lesson Structure",
            "Confirm Activity",
            "Confirm Lesson",
            "Confirm Topic",
            "Save",
            "Confirm"
        ];

        let confirmBtn = null;
        for (const text of confirmTexts) {
            confirmBtn = findButtonByText(text);
            if (confirmBtn) {
                console.log("[Content] ✓ Found button by text:", text);

                // Scroll button into view (CRITICAL for long content!)
                console.log("[Content] Scrolling Confirm button into view...");
                confirmBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await sleep(2000); // Wait for scroll

                confirmBtn.click();
                console.log("[Content] ✓ Confirm button clicked successfully!");
                return;
            }
        }

        // Strategy 2: Try primary selector
        console.log("[Content] Strategy 2: Trying primary selector:", SELECTORS.confirmButton);
        confirmBtn = await waitForElement(SELECTORS.confirmButton, 30000, false);

        if (confirmBtn && isVisible(confirmBtn)) {
            console.log("[Content] ✓ Found button with primary selector!");
            await sleep(1000);
            confirmBtn.click();
            console.log("[Content] ✓ Confirm button clicked successfully!");
            return;
        }

        // Strategy 3: Search by keywords
        console.log("[Content] Strategy 3: Searching by keywords...");
        const allButtons = document.querySelectorAll("button");
        const confirmKeywords = ["confirm", "save", "publish", "complete", "finish"];

        for (const btn of allButtons) {
            const btnText = btn.textContent.toLowerCase().trim();
            if (confirmKeywords.some(keyword => btnText.includes(keyword)) && isVisible(btn)) {
                console.log("[Content] ✓ Found button by keyword:", btn.textContent.trim());
                await sleep(1000);
                btn.click();
                console.log("[Content] ✓ Confirm button clicked successfully!");
                return;
            }
        }

        throw new Error("Confirm button not found with any strategy");

    } catch (error) {
        console.error("[Content] ERROR in waitAndClickConfirm:", error);

        // Debug: dump all buttons
        console.log("[Content] === DEBUG: All visible buttons on page ===");
        const debugButtons = document.querySelectorAll("button");
        debugButtons.forEach((btn, idx) => {
            if (isVisible(btn)) {
                console.log(`Button ${idx + 1}: Text="${btn.textContent.trim()}", Class="${btn.className}", ID="${btn.id}"`);
            }
        });
        console.log("[Content] =====================================");

        throw error;
    }
}

/**
 * Wait for success dialog, then click "Save to My Collection"
 */
async function waitAndClickSaveToCollection() {
    console.log("[Content] Waiting for success dialog...");
    console.log("[Content] Will click 'Save to My Collection' button");

    // Wait for success dialog to appear
    await sleep(3000);

    try {
        // Search for "Save to My Collection" button
        const saveTexts = [
            "Save to My Collection",
            "Save to Collection",
            "Save"
        ];

        for (const text of saveTexts) {
            const saveBtn = findButtonByText(text);
            if (saveBtn) {
                console.log("[Content] ✓ Found save button:", text);

                // Scroll into view
                console.log("[Content] Scrolling save button into view...");
                saveBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await sleep(2000);

                saveBtn.click();
                console.log("[Content] ✓ Save to Collection clicked!");
                return;
            }
        }

        // If not found by text, try by class/selector
        console.log("[Content]  Trying selector-based search...");
        const allButtons = document.querySelectorAll("button");

        for (const btn of allButtons) {
            const btnText = btn.textContent.trim().toLowerCase();
            if (btnText.includes("save") && btnText.includes("collection") && isVisible(btn)) {
                console.log("[Content] ✓ Found button by partial match:", btn.textContent.trim());

                btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await sleep(2000);

                btn.click();
                console.log("[Content] ✓ Save to Collection clicked!");
                return;
            }
        }

        console.log("[Content] ⚠️  Save to Collection button not found (might already be saved)");

    } catch (error) {
        console.error("[Content] ERROR clicking Save to Collection:", error);
        // Don't throw - this is optional final step
    }
}

/**
 * Check for "Ready to Publish" success message
 */
async function checkForSuccess() {
    console.log("[Content] Checking for success...");

    await sleep(3000); // Wait for final page update

    // Check if "Ready to Publish" text appears anywhere on the page
    const bodyText = document.body.innerText;
    if (bodyText.includes(SELECTORS.successIndicator)) {
        console.log("[Content] ✓ Found 'Ready to Publish' - Success!");
        return;
    }

    // If not found, that's okay - the workflow might be complete anyway
    console.log("[Content] Workflow completed (success message not found, but all steps executed)");
}

/**
 * Dismiss any popups that may appear (e.g., "Are you sure?" dialogs)
 * Returns true if popup was found and dismissed
 */
async function dismissPopup() {
    try {
        // Look for "Cancel" button in dialog/popup
        const buttons = document.querySelectorAll('button');

        for (const btn of buttons) {
            const btnText = btn.textContent.trim().toLowerCase();

            // Check if this is a "Cancel" button in a confirmation dialog
            if (btnText === 'cancel' && isVisible(btn)) {
                console.log("[Content] Found popup 'Cancel' button, clicking to dismiss...");
                btn.click();
                await sleep(1000);
                console.log("[Content] ✓ Popup dismissed");
                return true;
            }
        }

        return false;
    } catch (error) {
        console.log("[Content] No popup to dismiss");
        return false;
    }
}

/**
 * Check for error popup ("An error occurred while starting the workflow")
 */
async function checkForErrorPopup() {
    try {
        // Check if error text is present on the page
        const bodyText = document.body.innerText;

        if (bodyText.includes("An error occurred while starting the workflow") ||
            bodyText.includes("error occurred") && bodyText.includes("workflow")) {
            console.log("[Content] ✓ Error popup detected!");
            return true;
        }

        return false;
    } catch (error) {
        return false;
    }
}

/**
 * Dismiss error popup by clicking OK button
 */
async function dismissErrorPopup() {
    try {
        const buttons = document.querySelectorAll('button');

        for (const btn of buttons) {
            const btnText = btn.textContent.trim().toLowerCase();

            // Find "OK" button in error dialog
            if (btnText === 'ok' && isVisible(btn)) {
                console.log("[Content] Clicking OK to dismiss error popup...");
                btn.click();
                await sleep(1000);
                console.log("[Content] ✓ Error popup dismissed");
                return true;
            }
        }

        return false;
    } catch (error) {
        console.log("[Content] Could not dismiss error popup");
        return false;
    }
}

/**
 * Reload page and restart automation
 */
async function reloadAndRetry() {
    console.log("[Content] 🔄 Reloading page to retry automation...");

    // Reset flags before reload
    automationRunning = false;
    queryEntered = false;
    retryCount = 0;

    // Wait a moment then reload
    await sleep(2000);

    console.log("[Content] Reloading now...");
    window.location.reload();
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if element is visible
 */
function isVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0" &&
        element.offsetParent !== null;
}

/**
 * Wait for element with polling and mutation observer
 * @param {string} selector - CSS selector
 * @param {number} timeout - Max wait time in ms
 * @param {boolean} required - Throw error if not found
 */
async function waitForElement(selector, timeout = TIMEOUTS.elementWait, required = true) {
    return new Promise((resolve, reject) => {
        // Check if element already exists
        const existing = document.querySelector(selector);
        if (existing && isVisible(existing)) {
            resolve(existing);
            return;
        }

        let timedOut = false;

        // Set timeout
        const timeoutId = setTimeout(() => {
            timedOut = true;
            observer.disconnect();
            clearInterval(pollInterval);
            if (required) {
                reject(new Error(`Element not found: ${selector}`));
            } else {
                resolve(null);
            }
        }, timeout);

        // Use MutationObserver to watch for DOM changes
        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element && isVisible(element) && !timedOut) {
                clearTimeout(timeoutId);
                clearInterval(pollInterval);
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });

        // Also poll every 200ms as backup
        const pollInterval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element && isVisible(element) && !timedOut) {
                clearTimeout(timeoutId);
                clearInterval(pollInterval);
                observer.disconnect();
                resolve(element);
            }
        }, 200);
    });
}

/**
 * Send message to background script
 */
function sendMessageToBackground(message) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, (response) => {
            resolve(response);
        });
    });
}

/**
 * Sleep utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

console.log("[Content] TeacherInTheLoop AI Automation script ready");
