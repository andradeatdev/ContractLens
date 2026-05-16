### View Transition API Integration

The project implements modern navigation animations using the `View Transition API` in React.

#### Pattern:
- `DirectionalTransition`: A wrapper component that handles 'forward' and 'back' animation types.
- `navigateWithTransition`: A custom hook function that uses `startTransition` and `addTransitionType` to trigger the browser's view transition mechanism during route changes.