# Swipe to Delete in Lists

## Overview

List rows now support a swipe-to-delete gesture that provides intuitive deletion with visual feedback and confirmation.

## Features Implemented

### 1. Swipe Right to Reveal Delete Icon

- Users can swipe right on any row that has the `onDelete` prop
- A trash can icon (🗑️) appears behind the row as it's swiped
- The icon is initially white/grayscale for subtle visual feedback

### 2. Visual Feedback at 30% Threshold

- When the swipe exceeds 30% of the row width, the delete icon changes from white to red
- This provides clear visual feedback that the deletion threshold has been reached
- The color change signals to the user that releasing will trigger the next step

### 3. Confirm/Cancel Buttons

- When the swipe is released past the 30% threshold, two action buttons appear:
  - **Confirm button (✓)**: Red circular button to confirm deletion
  - **Cancel button (✕)**: Gray circular button to cancel the action
- The buttons are positioned in the left 30% of the row
- Clicking confirm triggers the `onDelete` callback
- Clicking cancel resets the row to its normal state

### 4. Smooth Animations

- The row slides smoothly during the swipe gesture
- If released before the 30% threshold, the row animates back to its original position
- All transitions use easing for a polished user experience

## Usage

To enable swipe-to-delete on a row, pass an `onDelete` callback function:

```tsx
<Row
  label="My Item"
  to="/path"
  onDelete={() => {
    // Handle deletion logic here
    deleteItem(itemId)
  }}
/>
```

Rows without the `onDelete` prop will continue to work normally without the swipe gesture.

## Technical Implementation

- Touch events (`onTouchStart`, `onTouchMove`, `onTouchEnd`) track swipe gestures
- State management handles swipe offset and confirmation mode
- CSS transforms provide smooth visual feedback
- The feature is fully self-contained within the Row component
