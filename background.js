/**
 * Background Service Worker for TeacherInTheLoop Automation
 * Handles multi-subject, multi-content-type automation
 */

// ==================== CONFIGURATION ====================

// URL mapping for different content types
const CONTENT_URLS = {
    activity: "https://teacherintheloop.ai/generate-oer-content?oer_type=activity",
    lesson_plan: "https://teacherintheloop.ai/generate-oer-content?oer_type=lesson_plan",
    full_lesson: "https://teacherintheloop.ai/generate-oer-content?oer_type=full_lesson"
};

// Subject-specific queries
const SUBJECT_QUERIES = {
    math: [
        // Real Numbers (5)
        "What is the Euclid's Division Lemma?",
        "State the Fundamental Theorem of Arithmetic.",
        "Why is 2 a prime number?",
        "Can the HCF of two numbers be greater than their LCM?",
        "Find the HCF of 306 and 657 using Euclid's algorithm.",

        // Polynomials (5)
        "What is the degree of a polynomial?",
        "How many zeroes can a quadratic polynomial have?",
        "What is the relation between zeroes and coefficients of a quadratic polynomial?",
        "What does the graph of a linear polynomial look like?",
        "How do you find the zeroes of a polynomial graphically?",

        // Pair of Linear Equations in Two Variables (5)
        "What is the general form of a pair of linear equations?",
        "How many solutions can a pair of linear equations have?",
        "What does a pair of inconsistent equations mean?",
        "Name the three methods to solve linear equations.",
        "When do two lines coincide?",

        // Quadratic Equations (5)
        "What is a quadratic equation?",
        "Write the standard form of a quadratic equation.",
        "What is the discriminant of a quadratic equation?",
        "What does a discriminant tell about the nature of roots?",
        "When are the roots of a quadratic equation real and equal?",

        // Arithmetic Progressions (5)
        "What is an arithmetic progression?",
        "Write the general form of an AP.",
        "What is the nth term of an AP?",
        "Write the formula for the sum of first n terms of an AP.",
        "Can an AP have a common difference of zero?",

        // Triangles (5)
        "State the Basic Proportionality Theorem.",
        "If two triangles are similar, what is the ratio of their areas?",
        "Are all congruent triangles similar?",
        "Write the condition for similarity of triangles.",
        "What is the Pythagoras theorem?",

        // Coordinate Geometry (5)
        "Write the distance formula.",
        "What is the section formula?",
        "What is the mid-point formula?",
        "Can the area of a triangle be zero?",
        "What does zero area of a triangle indicate?",

        // Trigonometry (5)
        "What are trigonometric ratios?",
        "Write the value of sin 30°.",
        "State any one trigonometric identity.",
        "What is the value of tan 45°?",
        "Why is sin²θ + cos²θ = 1?",

        // Circles (5)
        "What is a tangent to a circle?",
        "How many tangents can be drawn from a point outside a circle?",
        "Are the tangents drawn from an external point equal?",
        "What is the radius at the point of contact of a tangent?",
        "Can a tangent intersect a circle at two points?",

        // Areas Related to Circles (5)
        "Write the formula for the area of a circle.",
        "What is a sector of a circle?",
        "What is the formula for the length of an arc?",
        "What is the area of a semicircle?",
        "What is a segment of a circle?"
    ],
    biology: [
        "What are the main stages of cellular respiration?",
        "Explain the process of photosynthesis in plants",
        "How does DNA replication occur in eukaryotic cells?",
        "What is the role of mitochondria in energy production?",
        "Describe the structure and function of cell membranes",
        "How do enzymes catalyze biochemical reactions?",
        "What are the differences between prokaryotic and eukaryotic cells?",
        "Explain the process of protein synthesis from mRNA",
        "How does the immune system recognize and destroy pathogens?",
        "What is the significance of ATP in cellular metabolism?"
    ],
    fashion: [
        "What are the basic principles of fashion design?",
        "How do you choose colors that complement each other in fashion?",
        "Explain the different types of fabrics and their uses",
        "What are the key elements of sustainable fashion?",
        "How has fashion evolved over the past century?",
        "What are the fundamentals of pattern making and draping?",
        "How do fashion designers create a cohesive collection?",
        "Explain the importance of textiles in fashion design",
        "What are the latest trends in contemporary fashion?",
        "How do cultural influences shape fashion design?"
    ],
    science: [
        "What are the basic laboratory safety rules and why are they important?",
        "Explain the proper use and care of a microscope in the laboratory",
        "How do you prepare a wet mount slide for microscopic observation?",
        "What is the difference between an observation and an inference in science?",
        "Describe the steps of the scientific method with an example",
        "How do you properly measure volume using a graduated cylinder?",
        "What safety precautions should be taken when handling chemicals?",
        "Explain the purpose of a control group in an experiment",
        "How do you correctly use a Bunsen burner in the laboratory?",
        "What is the importance of accurate measurement in scientific experiments?"
    ]
};

// ==================== EVENT LISTENERS ====================

/**
 * Listen for messages from popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "START_AUTOMATION") {
        // Start automation with user-selected configuration
        const config = message.config;
        console.log("[Background] Starting automation with config:", config);

        startAutomation(
            config.contentType,
            config.subject,
            config.tabCount
        );

        sendResponse({ success: true });
        return true;
    }

    if (message.type === "GET_QUERY") {
        // Content script is requesting its assigned query and subject
        const tabId = sender.tab.id;

        chrome.storage.session.get([
            `tab_${tabId}_query_index`,
            `tab_${tabId}_subject`,
            `tab_${tabId}_automation_enabled`  // Check if this tab should run automation
        ], (result) => {
            const queryIndex = result[`tab_${tabId}_query_index`];
            const subject = result[`tab_${tabId}_subject`];
            const automationEnabled = result[`tab_${tabId}_automation_enabled`];

            // Only provide query if this tab was opened by the extension
            if (automationEnabled && queryIndex !== undefined && subject && SUBJECT_QUERIES[subject]) {
                const queries = SUBJECT_QUERIES[subject];
                sendResponse({
                    query: queries[queryIndex] || queries[0],
                    index: queryIndex,
                    subject: subject
                });
            } else {
                // No automation for manually opened tabs
                sendResponse({
                    query: null,
                    index: -1,
                    subject: null
                });
            }
        });

        return true; // Keep message channel open for async response
    }

    if (message.type === "AUTOMATION_COMPLETE") {
        console.log(`[Background] Tab ${sender.tab.id} completed automation:`, message.status);
    }

    if (message.type === "AUTOMATION_ERROR") {
        console.error(`[Background] Tab ${sender.tab.id} encountered error:`, message.error);
    }

    if (message.type === "STOP_AUTOMATION") {
        console.log("[Background] 🛑 STOP command received - halting all automation");

        // Send STOP message to ALL tabs
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { type: "STOP_AUTOMATION" }).catch(() => {
                    // Ignore errors for tabs that don't have content script
                });
            });
        });

        // Clear all automation flags from storage
        chrome.storage.session.clear();

        // Also clear the global automation running flag
        chrome.storage.session.set({ automation_running: false });

        sendResponse({ success: true });
        return true;
    }

    if (message.type === "CLEAR_AUTOMATION_FLAG") {
        // Clear automation flag for this specific tab
        const tabId = sender.tab.id;
        chrome.storage.session.remove([
            `tab_${tabId}_automation_enabled`,
            `tab_${tabId}_query_index`,
            `tab_${tabId}_subject`
        ]);
        console.log(`[Background] Cleared automation flag for tab ${tabId}`);
        sendResponse({ success: true });
        return true;
    }
});

/**
 * Main automation function - opens tabs with specified config
 */
async function startAutomation(contentType, subject, tabCount) {
    console.log(`[Background] Opening ${tabCount} tabs`);
    console.log(`[Background] Content Type: ${contentType}`);
    console.log(`[Background] Subject: ${subject}`);

    const targetUrl = CONTENT_URLS[contentType] || CONTENT_URLS.activity;
    const queries = SUBJECT_QUERIES[subject] || SUBJECT_QUERIES.biology;

    try {
        // Open tabs sequentially
        for (let i = 0; i < tabCount; i++) {
            // RANDOM query selection - different every time!
            const queryIndex = Math.floor(Math.random() * queries.length);

            // Create a new tab
            const newTab = await chrome.tabs.create({
                url: targetUrl,
                active: false
            });

            console.log(`[Background] Tab ${i + 1}/${tabCount} - ID: ${newTab.id} - Random Query #${queryIndex + 1}: ${queries[queryIndex].substring(0, 50)}...`);

            // Store the query index, subject, AND automation flag for this tab
            await chrome.storage.session.set({
                [`tab_${newTab.id}_query_index`]: queryIndex,
                [`tab_${newTab.id}_subject`]: subject,
                [`tab_${newTab.id}_automation_enabled`]: true  // Mark as automation tab
            });

            // Small delay to avoid overwhelming browser
            await sleep(200);
        }

        console.log("[Background] ✅ All tabs opened successfully");

    } catch (error) {
        console.error("[Background] ❌ Error opening tabs:", error);
    }
}

/**
 * Helper function to pause execution
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

console.log("[Background] TeacherInTheLoop Automation service worker loaded");
