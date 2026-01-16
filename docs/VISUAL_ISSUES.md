# Visual & Layout Issues to Fix

**Status:** Documented for future session
**Priority:** Medium (functionality works, but polish needed)

---

## 🎨 Issues Observed in Playwright Screenshots

### Layout Issues

1. **Left Sidebar Cards**
   - Cards appear cramped vertically
   - Cost numbers ($68,265) and per-square-foot ($76/sf) could have better spacing
   - Lock icon positioning might be too tight against content
   - Green selected border is working but could be more prominent

2. **Middle Section Room Editor**
   - Header area with room name and type dropdown feels cluttered
   - Cost summary cards (Room cost / Cost per sf) might benefit from better visual hierarchy
   - Slider labels and values could have clearer alignment
   - Component cards (Floors, Walls) have inconsistent padding

3. **Right Sidebar**
   - Export to PDF button is very dark (almost black) - doesn't match the green theme
   - Total project cost card header spacing could be improved
   - Budget section with progress bar needs visual polish
   - Input controls (Target Students, Tuition, etc.) look cramped

4. **Help Card ("How to use this dashboard")**
   - Keyboard shortcuts section has adequate spacing but could be more visually distinct
   - Key badges (Esc, Cmd/Ctrl+S) are functional but styling could be improved

### Typography Issues

5. **Font Size Inconsistencies**
   - Section headers (DEMOLITION, INTERIOR SPACES) are tiny
   - Cost numbers could be more prominent in sidebar cards
   - Room type labels in cards are hard to read

6. **Font Weight**
   - Not enough contrast between regular and bold text
   - Some headings don't feel like headings

### Color & Contrast Issues

7. **Color Scheme**
   - Export button (black) clashes with green header theme
   - Budget progress bar green might not match header green
   - Cost numbers in sidebar could use more contrast
   - Muted grays make some text hard to read

8. **Visual Hierarchy**
   - Hard to quickly scan left sidebar for room costs
   - Selected room border is subtle (works but could be stronger)
   - Not enough whitespace between sections

### Spacing Issues

9. **Inconsistent Padding**
   - Left sidebar cards have tight internal padding
   - Middle editor sections have varying amounts of spacing
   - Right sidebar elements feel cramped together

10. **Border Radius Inconsistency**
    - Some elements use rounded-2xl, others rounded-3xl
    - Not clear which should be which
    - Creates visual inconsistency

### Interaction Issues

11. **Hover States**
    - Not visually obvious which elements are clickable
    - Room cards could have more prominent hover effect
    - Add button hover state is subtle

12. **Focus States**
    - Focus outlines work but could be more visible
    - Not using a consistent focus ring style

### Component-Specific Issues

13. **Slider Components**
    - Slider tracks could be more prominent
    - Current value indicator could be clearer
    - Labels (As-Is, Refresh, etc.) are tiny

14. **Input Fields**
    - Target Students, Tuition inputs look generic
    - Could use more visual polish
    - +/- buttons are small and hard to tap on mobile

15. **Empty State**
    - Empty state text works but could be more inviting
    - Could use an icon or illustration
    - Call-to-action could be more prominent

---

## 📊 Severity Classification

### High Priority (Affects Usability)
- Export button color (black doesn't fit theme)
- Font sizes in left sidebar too small
- Slider labels hard to read
- Input field touch targets on mobile

### Medium Priority (Polish)
- Inconsistent padding and spacing
- Visual hierarchy could be stronger
- Border radius inconsistency
- Hover states could be more obvious

### Low Priority (Nice to Have)
- Empty state could be more inviting
- Focus states could be more prominent
- Typography scale needs refinement
- Color palette needs unification

---

## 🎯 Recommendations for Future Session

### Quick Wins (30 min)
1. Change Export button from black to emerald-500 (match header)
2. Increase font sizes in left sidebar cards (costs should be more prominent)
3. Increase padding in left sidebar cards (give more breathing room)
4. Make section headers (DEMOLITION, etc.) more prominent

### Medium Effort (1-2 hours)
1. Standardize spacing system (use consistent padding/margin scale)
2. Improve slider component styling (larger labels, clearer tracks)
3. Add stronger hover effects to clickable elements
4. Unify border radius across all cards and components
5. Improve visual hierarchy with typography scale

### Larger Refactor (3+ hours)
1. Create consistent design system with:
   - Typography scale (text-xs, text-sm, text-base, etc.)
   - Spacing scale (p-2, p-3, p-4, etc.)
   - Color palette with semantic names
   - Component variants (primary, secondary, etc.)
2. Redesign right sidebar for better information density
3. Improve mobile layout beyond just hiding sidebar
4. Add micro-interactions and animations for delight

---

## ✅ What IS Working Well

Despite layout issues, these are solid:
- 3-column structure is correct
- Color coding by room type (orange/green/blue) is good
- Keyboard shortcuts are clearly documented
- Lock/unlock icons are clear
- Selected state is visible (green border)
- PDF export functionality works
- Mobile dropdown appears when needed
- ARIA labels and accessibility

---

## 📝 Notes

- **Functionality is 100% working** - all features tested and verified
- **This is purely visual/UX polish** - not breaking bugs
- **Good foundation to build on** - architecture is sound
- **Future session can focus entirely on visual refinement** without worrying about functionality

The dashboard is **functionally production-ready** but could benefit from a dedicated visual design pass to match the quality of the functionality.
