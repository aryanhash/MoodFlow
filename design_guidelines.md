# Design Guidelines: Mood-Adaptive Daily Planner

## Design Approach
**Reference-Based Approach**: Inspired by Google Material Design 3 and modern wellness apps (Calm, Headspace), with emphasis on the Google Stitch reference provided. The design prioritizes emotional resonance through adaptive theming while maintaining clarity and usability for productivity features.

## Core Design Principles
1. **Adaptive Emotional Design**: Visual treatment responds to detected mood state
2. **Card-Based Architecture**: All content organized in distinct, elevated cards
3. **Breathing Room**: Generous spacing to reduce cognitive load
4. **Gentle Interactions**: Smooth, calming transitions throughout

## Typography System

**Font Families** (via Google Fonts):
- Primary: 'Inter' (400, 500, 600, 700) - UI elements, body text, buttons
- Accent: 'Space Grotesk' (500, 600) - Large headings, mood labels

**Hierarchy**:
- Hero/Page Titles: 3xl to 4xl, font-semibold, Space Grotesk
- Section Headers: xl to 2xl, font-semibold, Inter
- Card Titles: base to lg, font-medium, Inter
- Body Text: sm to base, font-normal, Inter
- Metadata/Labels: xs to sm, font-medium, Inter, reduced opacity
- Confidence Scores: xs, font-semibold, monospace feeling

## Layout System

**Spacing Scale**: Use Tailwind units of 2, 3, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Card padding: p-6 to p-8
- Section spacing: mb-8 to mb-12
- Grid gaps: gap-4 to gap-6
- Button padding: px-6 py-3

**Container Strategy**:
- Max-width: max-w-7xl for main content
- Cards: Constrained to max-w-sm for focused content, max-w-2xl for larger forms
- Full-width sections for immersive experiences (breathing, ambient sound)

**Grid Layouts**:
- Home Dashboard: 1-column on mobile, 2-column layout on md+
- Task Cards: Grid of 3 cards on lg+, 2 on md, 1 on mobile
- Meal Recommendations: 3-column grid for breakfast/lunch/dinner categories

## Component Library

### Cards
- Rounded corners: rounded-xl to rounded-2xl
- Elevated shadow: Use subtle shadow-lg for depth
- Background: Semi-transparent with backdrop-blur-sm for glassmorphic effect
- Border: 1px solid with low opacity for definition
- Hover state: Slight lift with increased shadow

### Mood Display Card (Home)
- Large emoji display (4xl to 6xl size)
- Mood label with gradient text effect
- Confidence percentage with progress arc visualization
- Timestamp of last detection

### Task Cards
- Compact design with title, duration estimate, difficulty indicator
- Checkbox for completion (large, rounded)
- Difficulty badges: pill-shaped, color-coded by intensity
- Subtle expand/collapse for task details

### Quick Action Buttons
- Primary: Solid background with white text, rounded-full, px-8 py-4
- Secondary: Outlined with transparent background
- Icon + label combination
- Grouped in 2x2 grid on mobile, horizontal row on desktop

### Meal Recommendation Cards
- Large food image at top (16:9 aspect ratio)
- Meal name as bold heading
- Reason tags as small pills below
- Two-button action row: "Order" (primary) and "Cook" (secondary)
- Healthy swap suggestion in smaller text with icon
- Category tabs: Breakfast, Lunch, Dinner with active state indicator

### Navigation
- Clean top bar with logo/brand on left, settings icon on right
- Bottom navigation for mobile with mood-colored active indicator
- No traditional menu - direct access to main 6 screens

### Forms & Inputs
- Text area for mood input: Large, rounded-lg, with placeholder guidance
- Toggle switches for privacy settings: Large, smooth animation
- Webcam consent modal: Center screen, blurred background, clear CTAs

### Breathing Exercise UI
- Circular breathing animation in center (pulsing circle)
- Phase labels: "Breathe in", "Hold", "Breathe out"
- Progress ring around circle
- Timer countdown
- Start/Pause button below

### Ambient Sound Player
- Waveform visualization (animated)
- Large play/pause toggle
- Sound selection dropdown
- Duration slider with time display

## Mood-Adaptive Color Themes

Dynamic color schemes that shift based on detected mood:

**Calm/Relaxed**: Soft blues and teals (sky-400 to blue-500 accents, slate backgrounds)
**Energized/Motivated**: Warm oranges and yellows (orange-400 to amber-500 accents)
**Stressed/Anxious**: Muted greens and lavenders (emerald-300 to purple-300 accents)
**Focused**: Deep purples and indigos (violet-500 to indigo-600 accents)
**Neutral**: Balanced grays with subtle teal (gray-500 with cyan-400 accents)

Implementation: CSS variables updated via JavaScript based on mood state, affecting:
- Card borders and accents
- Button primary colors
- Progress indicators
- Icon tints

## Images

### Hero Section (Home Dashboard)
- No traditional hero image; instead, use an abstract gradient background that shifts with mood
- Animated particle system or subtle mesh gradient as ambient backdrop
- Mood emoji as central focal point, not a photograph

### Meal Cards
- High-quality food photography for each meal recommendation
- Consistent aspect ratio: 16:9, rounded corners (rounded-t-xl)
- Subtle overlay gradient at bottom for text legibility
- 3 images per category (breakfast, lunch, dinner)

### Breathing/Ambient Screen
- Optional: Soft, abstract nature imagery (blurred forest, water, sky) as background
- Low opacity to not distract from breathing circle
- Could use procedurally generated gradient backgrounds instead

### Settings Screen
- Icon illustrations for privacy features (webcam, data, processing)
- No hero image needed

## Animations

Use sparingly and purposefully:
- Mood confidence score: Animated counting up on load
- Breathing circle: Smooth scale transform in/out (2-3s cycles)
- Card entrance: Subtle fade-in and translate-y on page load (stagger by 100ms)
- Task regeneration: Quick shuffle animation with blur
- Button interactions: Scale 0.98 on press
- NO scroll-triggered animations
- NO parallax effects

## Accessibility

- Minimum contrast ratio: 4.5:1 for all text
- Focus indicators: 2px solid ring with mood accent color
- Keyboard navigation for all interactive elements
- ARIA labels for mood confidence, breathing timer, sound player
- Webcam consent: Clear modal with keyboard accessible accept/decline
- Screen reader announcements for mood changes

## Mobile Responsiveness

- Mobile-first approach
- Stack cards vertically on mobile (< 768px)
- Bottom navigation bar for primary screens
- Larger touch targets: min 44x44px for all buttons
- Collapsible sections for meal details
- Horizontal scroll for meal categories on small screens