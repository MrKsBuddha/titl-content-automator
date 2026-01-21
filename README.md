# Biology Workflow Automation Extension

A Chrome/Edge Manifest V3 extension that automates biology query submission workflows across multiple tabs.

## Features

- ✅ Opens 10 tabs simultaneously with configurable target URL
- ✅ Automatically selects "Biology" category (handles dropdowns, buttons, radio inputs)
- ✅ Inserts unique biology queries in each tab
- ✅ Clicks through workflow steps automatically
- ✅ Handles popups and confirmation dialogs
- ✅ Robust element detection with MutationObserver + polling
- ✅ Automatic retry on failure (1 retry attempt)
- ✅ Stops when "Ready to Publish" is detected
- ✅ Vanilla JavaScript - no external dependencies

## Installation

1. **Download/Clone** this extension folder to your computer

2. **Open Chrome/Edge**:
   - Navigate to `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
   - Enable **Developer mode** (toggle in top-right corner)

3. **Load the extension**:
   - Click **"Load unpacked"**
   - Select the folder containing this extension
   - The extension will appear in your extensions list

4. **Pin the extension** (optional but recommended):
   - Click the puzzle icon in the toolbar
   - Find "Biology Workflow Automation"
   - Click the pin icon to keep it visible

## Configuration

Before using the extension, you **MUST** configure it for your target website:

### 1. Update Target URL

Edit `background.js`:

```javascript
const TARGET_URL = "https://example.com/your-workflow-page";
```

Replace with the actual URL where the workflow begins.

### 2. Update CSS Selectors

Edit `content.js` and update the `SELECTORS` object to match your website's HTML:

```javascript
const SELECTORS = {
  // Category selection - choose the pattern that matches your site
  categoryDropdown: 'select[name="category"]',      // For <select> dropdowns
  categoryOption: 'option[value="biology"]',        // Dropdown option
  categoryButton: 'button[data-category="biology"]', // Button-based selection
  categoryRadio: 'input[type="radio"][value="biology"]', // Radio button
  
  // Query input field - update with your input field's selector
  queryInput: 'textarea[name="query"]',
  
  // Continue/Confirm buttons - the script tries these in order
  confirmButton: 'button[type="submit"]',
  
  // Success indicator - text that appears when done
  successIndicator: '*:contains("Ready to Publish")',
  
  // Popup/Dialog buttons to auto-click
  popupConfirm: 'button.confirm',
  dialogAccept: 'button.accept'
};
```

**How to find selectors:**
1. Right-click the element on your website → "Inspect"
2. In DevTools, right-click the highlighted HTML → Copy → Copy selector
3. Paste the selector into the appropriate field above

### 3. Customize Biology Queries (Optional)

Edit `background.js` to modify the 10 queries:

```javascript
const BIOLOGY_QUERIES = [
  "Your custom query 1",
  "Your custom query 2",
  // ... add 10 total queries
];
```

### 4. Adjust Timeouts (Optional)

Edit `content.js` if elements load slowly on your site:

```javascript
const TIMEOUTS = {
  pageLoad: 30000,      // Max time to wait for page load
  elementWait: 10000,   // Max time to wait for each element
  actionDelay: 1000,    // Delay between actions
  retryDelay: 2000      // Delay before retry
};
```

## Usage

1. **Navigate to your website** and **log in** (the extension does NOT handle login)

2. **Click the extension icon** in the toolbar

3. **Watch the automation**:
   - 10 new tabs will open automatically
   - Each tab will complete the workflow independently
   - Check the browser console (F12) in each tab to see progress logs

4. **Monitor progress** via console logs:
   - `[Background]` - Tab creation and management
   - `[Content]` - Automation steps in each tab

## Console Logs

The extension provides detailed logging:

```
[Background] Extension icon clicked - Starting automation
[Background] Opened tab 1/10 - ID: 1234
[Content] Assigned query #1: What are the main stages of cellular respiration?
[Content] ✓ Page loaded
[Content] ✓ Category selected
[Content] ✓ Query entered
[Content] Clicking step 1 button: Continue
[Content] ✓ Found 'Ready to Publish' - Workflow complete!
[Content] ✅ Automation completed successfully!
```

## Troubleshooting

### Extension doesn't start
- Check that you clicked the extension icon (not just opened a tab)
- Ensure Developer mode is enabled
- Try reloading the extension

### Elements not found
- Open DevTools (F12) and check console for specific errors
- Verify your CSS selectors in `content.js` match the actual page elements
- Increase `TIMEOUTS.elementWait` if elements load slowly

### Automation stops mid-workflow
- Check console for error messages
- Verify the "Ready to Publish" text matches exactly (case-sensitive)
- Ensure popups aren't blocking the workflow - update popup selectors

### Category not selecting
- Verify the category value is exactly "biology" (check HTML)
- Try all three selection methods (dropdown, button, radio) in your config
- Check if the category requires additional actions (e.g., a "Select" button)

### Queries not unique
- Verify `BIOLOGY_QUERIES` array has 10 different queries
- Check browser console to see which query was assigned

## File Structure

```
automation/
├── manifest.json       # Extension configuration (Manifest V3)
├── background.js       # Service worker - opens tabs, manages queries
├── content.js          # Automation logic - runs in each tab
├── README.md          # This file
└── icon*.png          # Extension icons (you need to add these)
```

## Adding Icons

The extension requires icon files. Create simple icons or download free ones:

1. Create/download three PNG files:
   - `icon16.png` (16×16 pixels)
   - `icon48.png` (48×48 pixels)
   - `icon128.png` (128×128 pixels)

2. Place them in the extension folder

3. Or remove icon references from `manifest.json` if you don't want icons

## Technical Details

- **Manifest Version**: V3 (latest Chrome/Edge standard)
- **Permissions**: 
  - `tabs` - Open and manage tabs
  - `scripting` - Inject scripts
  - `storage` - Store query assignments
  - `activeTab` - Access current tab
  - `<all_urls>` - Run on any website
- **Element Detection**: MutationObserver + polling for reliability
- **Retry Logic**: 1 automatic retry per tab on failure
- **Browser Support**: Chrome 88+, Edge 88+

## Limitations

- Does NOT handle login/authentication
- Requires manual selector configuration
- Maximum 20 workflow steps per tab (safety limit)
- Works only on websites the user is already logged into

## Security Notes

- Extension has broad permissions (`<all_urls>`) - only install if you trust the code
- Review `background.js` and `content.js` before loading
- Extension runs only when you click the icon - not automatically

## Support

For issues or questions:
1. Check browser console (F12) for error messages
2. Verify all selectors match your target website
3. Test on a single tab first before running all 10

## License

Free to use and modify for personal or commercial projects.
