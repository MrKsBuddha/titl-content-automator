# 🎓 TeacherInTheLoop Automation - Complete Guide

## ✨ NEW Features!

Your extension now supports:
- ✅ **3 Content Types**: Activity, Lesson Plan, Full Lesson
- ✅ **3 Subjects**: Math, Biology, Fashion
- ✅ **Up to 100 tabs** at once
- ✅ **Subject-specific queries** (10 unique queries per subject)
- ✅ **Smart button detection** with multiple fallback strategies

## 🚀 Quick Start

### Step 1: Reload Extension
```
chrome://extensions/ → Click reload (↻)
```

### Step 2: Click Extension Icon
A beautiful popup will appear!

### Step 3: Choose Your Settings

#### 📋 Content Type
- **Activity** (📝) - Short learning activities
- **Lesson Plan** (📚) - Structured lesson plans  
- **Full Lesson** (🎯) - Complete lesson content

#### 🔬 Subject
- **Math** (➗) - Mathematics topics
- **Biology** (🧬) - Biology topics
- **Fashion** (👗) - Fashion design topics

#### 📊 Number of Tabs
- Enter 1-100 or use quick buttons (2, 5, 10, 20, 50)

### Step 4: Start Automation
Click **"🚀 START AUTOMATION"** and watch the magic!

## 📝 Available Queries

### Math Queries (10 unique):
1. How do you solve quadratic equations?
2. Explain derivatives in calculus
3. Properties of triangles in geometry
4. Calculate area and perimeter of circles
5. Pythagorean theorem and applications
6. Difference between mean, median, mode
7. Solve systems of linear equations
8. Concept of fractions and addition
9. Prime numbers and how to find them
10. Calculate probability in simple events

### Biology Queries (10 unique):
1. Main stages of cellular respiration
2. Process of photosynthesis in plants
3. DNA replication in eukaryotic cells
4. Role of mitochondria in energy production
5. Structure and function of cell membranes
6. How enzymes catalyze reactions
7. Prokaryotic vs eukaryotic cells
8. Protein synthesis from mRNA
9. Immune system pathogen destruction
10. Significance of ATP in metabolism

### Fashion Queries (10 unique):
1. Basic principles of fashion design
2. Choosing complementary colors
3. Different types of fabrics and uses
4. Key elements of sustainable fashion
5. Fashion evolution over past century
6. Fundamentals of pattern making
7. Creating a cohesive collection
8. Importance of textiles in design
9. Latest trends in contemporary fashion
10. Cultural influences on fashion

## 🔗 URL Mapping

The extension automatically uses the correct URL:

| Content Type | URL |
|-------------|-----|
| Activity | `?oer_type=activity` |
| Lesson Plan | `?oer_type=lesson_plan` |
| Full Lesson | `?oer_type=full_lesson` |

## 💡 Usage Examples

### Example 1: Test Run
```
Content Type: Activity
Subject: Biology
Tabs: 2
Result: 2 biology activities created
```

### Example 2: Math Lesson Plans
```
Content Type: Lesson Plan
Subject: Math
Tabs: 10
Result: 10 math lesson plans (all unique queries)
```

### Example 3: Fashion Full Lessons
```
Content Type: Full Lesson
Subject: Fashion
Tabs: 20
Result: 20 fashion lessons (queries cycle: 1-10, 1-10)
```

### Example 4: Maximum Automation
```
Content Type: Activity
Subject: Biology
Tabs: 100
Result: 100 biology activities (queries cycle 10 times)
```

## 🎯 Workflow Per Tab

Each tab goes through these steps automatically:

```
1. Opens target URL
   ↓
2. Waits for page load
   ↓
3. Selects subject (Math/Biology/Fashion)
   ↓
4. Enters unique query
   ↓
5. Clicks "Generate" button
   ↓
6. Waits for AI outline generation (up to 90s)
   ↓
7. Clicks "Proceed to Full Activity" (auto-detected)
   ↓
8. Waits for complete content (up to 90s)
   ↓
9. Clicks "Confirm & Save" (auto-detected)
   ↓
10. ✅ DONE!
```

**Time per tab**: ~60-120 seconds (mostly AI generation)

## 📊 Tab Limits

| Tabs | Queries Used | Cycle Pattern |
|------|-------------|---------------|
| 1-10 | All unique | 1-10 |
| 11-20 | Cycles once | 1-10, 1-10 |
| 21-30 | Cycles twice | 1-10, 1-10, 1-10 |
| 100 | Cycles 10 times | 10 full cycles |

## 🎨 Popup UI Features

### Visual Design
- **Purple gradient header** with emoji icons
- **Button-based selection** for easy clicking
- **Active state highlighting** - selected options glow purple
- **Quick-select numbers** for common tab counts
- **Real-time validation** - can't enter invalid numbers

### Smart Features
- **Auto-close on success** - popup closes after 2 seconds
- **Visual feedback** - success/error messages
- **Keyboard support** - press Enter to start
- **Responsive design** - looks great at 380px width

## 🔧 Technical Details

### Button Detection Strategies
The extension uses **4 strategies** to find buttons:

1. **Exact text match** - "Proceed to Full Activity"
2. **CSS selector** - `button.accept-plan`
3. **Partial keyword match** - "proceed", "full activity"
4. **Class-based search** - looks for primary/orange buttons

### Subject Detection
- Searches for exact subject name (e.g., "Math")
- Falls back to case-insensitive search
- Throws clear error if subject not found

### Error Handling
- **Automatic retry** - retries once on failure
- **Detailed logging** - see everything in console (F12)
- **Graceful degradation** - uses fallbacks when possible

## 🐛 Troubleshooting

### Issue: Popup doesn't show new options
**Fix**: Reload extension at `chrome://extensions/`

### Issue: Subject not found
**Fix**: Check that Math/Biology/Fashion cards exist on the page

### Issue: Wrong queries for subject
**Fix**: Verify subject selection in popup before clicking start

### Issue: Tabs don't open
**Fix**: Make sure you're logged into teacherintheloop.ai

### Issue: Automation stops at Proceed button
**Fix**: Check console (F12) for detailed button detection logs

## 📈 Performance Tips

### For Testing
- Start with **1-2 tabs** to verify everything works
- Watch console logs to see progress
- Test each subject before scaling up

### For Production
- Use **10 tabs** for all unique queries per subject
- Use **20-50 tabs** for moderate batches
- Use **100 tabs** only when you need maximum throughput

### For Best Results
- Ensure stable internet connection
- Don't close tabs until "Ready to Publish" appears
- Keep browser window open during automation

## 🎓 Subject-Specific Tips

### Math
- Queries cover algebra, geometry, calculus, statistics
- Great for middle school to high school level
- Topics are fundamental and widely applicable

### Biology
- Queries cover cell biology and molecular processes
- Suitable for high school and intro college level
- Focus on core biological concepts

### Fashion
- Queries cover design, textiles, and trends
- Good for fashion design and textile courses
- Includes both practical and theoretical aspects

## 🚀 Advanced Usage

### Mixing Content Types
Run the extension multiple times with different settings:

1. **First run**: 10 Activities for Biology
2. **Second run**: 10 Lesson Plans for Math
3. **Third run**: 10 Full Lessons for Fashion

### Batch Processing
For 100 pieces of content:
- **Option A**: 100 tabs at once (fastest, but resource-intensive)
- **Option B**: 4 runs of 25 tabs (more manageable)
- **Option C**: 10 runs of 10 tabs (safest, all unique queries)

## ✅ Checklist Before Running

- [ ] Logged into teacherintheloop.ai
- [ ] Extension reloaded after updates
- [ ] Content type selected (Activity/Lesson/Full Lesson)
- [ ] Subject selected (Math/Biology/Fashion)
- [ ] Tab count chosen (1-100)
- [ ] DevTools open to monitor progress (F12)

## 🎉 You're Ready!

The extension is now a **powerful multi-subject automation tool** that can:
- Generate content across 3 different types
- Handle 3 different subjects with unique queries
- Process up to 100 tabs simultaneously
- Automatically click through entire workflows
- Provide detailed logging and error handling

**Start small, scale big!** 🚀

Questions? Check the console logs (F12) - they tell you everything!
