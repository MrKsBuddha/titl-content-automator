# Quick Setup Guide

## Before You Start

**You MUST customize this extension for your specific website.** Follow these steps carefully.

## Step 1: Find Your CSS Selectors

1. **Open your target website** in Chrome/Edge
2. **Right-click** the element you want to automate → **Inspect**
3. In DevTools, **right-click** the highlighted HTML → **Copy** → **Copy selector**
4. Paste this into your `content.js` configuration

### Elements You Need to Find:

#### A. Category Dropdown/Button
Find how "Biology" is selected:
- **Dropdown**: `<select>` with `<option value="biology">`
- **Button**: `<button data-category="biology">` or similar
- **Radio**: `<input type="radio" value="biology">`

#### B. Query Input Field
Find the textarea or input where users type questions:
- Usually: `<textarea name="query">` or `<input name="question">`

#### C. Confirm/Continue Button
Find the button that submits each step:
- Usually: `<button type="submit">` or button with text "Continue"

#### D. Success Message
Find the text that appears when the workflow is done:
- Look for exact text: "Ready to Publish" or your completion message

## Step 2: Update background.js

```javascript
// Line 8: Change this URL
const TARGET_URL = "https://your-actual-website.com/workflow-page";
```

## Step 3: Update content.js

```javascript
// Lines 11-26: Update these selectors
const SELECTORS = {
  categoryDropdown: 'YOUR_SELECTOR_HERE',
  queryInput: 'YOUR_SELECTOR_HERE',
  confirmButton: 'YOUR_SELECTOR_HERE',
  successIndicator: '*:contains("YOUR_SUCCESS_MESSAGE_HERE")'
};
```

### Example Configuration:

If your HTML looks like this:
```html
<select id="topic">
  <option value="biology">Biology</option>
</select>
<textarea id="question"></textarea>
<button class="btn-submit">Submit</button>
<div class="status">Ready to Publish</div>
```

Your selectors should be:
```javascript
const SELECTORS = {
  categoryDropdown: 'select#topic',
  categoryOption: 'option[value="biology"]',
  queryInput: 'textarea#question',
  confirmButton: 'button.btn-submit',
  successIndicator: '*:contains("Ready to Publish")'
};
```

## Step 4: Load Extension

1. Open Chrome/Edge
2. Go to `chrome://extensions/` or `edge://extensions/`
3. Enable **Developer mode** (toggle top-right)
4. Click **Load unpacked**
5. Select the `automation` folder
6. Extension is now installed!

## Step 5: Test on One Tab First

1. **Don't** click the extension icon yet
2. **Manually** open your target URL in one tab
3. Open DevTools (F12) → Console tab
4. **Now** click the extension icon
5. Watch the console for log messages
6. If errors appear, update your selectors and reload the extension

## Step 6: Add Icons (Optional)

Create three PNG files or the extension will show default icons:
- `icon16.png` (16×16 px)
- `icon48.png` (48×48 px)  
- `icon128.png` (128×128 px)

Place them in the `automation` folder.

## Common Selector Patterns

### Finding Category Selector
```javascript
// Dropdown
categoryDropdown: 'select[name="category"]'
categoryDropdown: 'select#categorySelect'

// Button
categoryButton: 'button[data-topic="biology"]'
categoryButton: 'button.topic-btn[value="biology"]'

// Radio
categoryRadio: 'input[type="radio"][value="biology"]'
categoryRadio: 'input[name="topic"][value="biology"]'
```

### Finding Query Input
```javascript
queryInput: 'textarea[name="query"]'
queryInput: 'textarea#question'
queryInput: 'input.query-field'
queryInput: 'textarea.question-input'
```

### Finding Confirm Button
```javascript
confirmButton: 'button[type="submit"]'
confirmButton: 'button.btn-primary'
confirmButton: 'button#continueBtn'
confirmButton: 'input[type="submit"]'
```

## Debugging Tips

### Enable Verbose Logging
The extension already logs everything to console. Open DevTools (F12) in each tab.

### Test Selectors in Console
Before updating the extension, test your selectors:
```javascript
// In the browser console
document.querySelector('YOUR_SELECTOR_HERE')
// Should return the element, not null
```

### Common Issues

**"Element not found"**
- Your selector is wrong or the element loads later
- Increase timeout: `TIMEOUTS.elementWait = 15000` (15 seconds)

**"Category not selecting"**
- Check the exact value needed: `biology`, `Biology`, or `bio`
- Verify the selector points to the right element

**"Automation stops mid-workflow"**
- Check the console for which step failed
- Verify the confirm button selector finds visible buttons
- Look for popups blocking the workflow

**"Ready to Publish not detected"**
- Verify the exact text (case-sensitive, check for extra spaces)
- Update `successIndicator` to match exactly

## Reloading After Changes

After editing files:
1. Go to `chrome://extensions/`
2. Find "Biology Workflow Automation"
3. Click the **Reload** icon (↻)
4. Test again

## You're Ready!

Once you've configured the selectors and tested on one tab:
1. Navigate to your website
2. Log in
3. Click the extension icon
4. Watch 10 tabs complete the workflow automatically!

Check the console in each tab to monitor progress.
