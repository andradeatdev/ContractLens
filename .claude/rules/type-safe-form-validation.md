### Type-safe Form Validation

Forms are managed using `react-hook-form` with `zod` for schema validation.

#### Benefits:
- **Shared Schemas**: Validation rules (e.g., `loginSchema`) serve as the single source of truth.
- **Type Inference**: Use `z.infer<typeof schema>` to automatically generate TypeScript types from validation rules.
- **Consistent UX**: Client-side validation prevents unnecessary API calls and provides immediate feedback.