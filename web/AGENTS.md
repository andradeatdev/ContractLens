<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UI/UX & Writing Standards

### Writing Style (Portuguese)
- **Sentence case only:** Do not capitalize every word in buttons, titles, or labels. 
  - ✅ "Salvar alterações"
  - ❌ "Salvar Alterações"
- **Professional clarity:** Avoid "vibecoding" language or overly trendy terms. Be direct and helpful.
- **Consistency:** Use the same terminology for the same actions across the entire app.

### UX Principles
- **User-Centric:** Focus on the user's intent, not just aesthetic "flair". Always put yourself in the user's shoes before making a technical or design decision.
- **Empathy-Driven Design:** Demonstrate that you have considered the user's perspective (accessibility, cognitive load, ease of use) when proposing or implementing changes.
- **Elite-Standard Aesthetics:** ALWAYS avoid "vibecoding" design (excessive paddings, unprofessional rounding, over-the-top animations). Instead, prefer a professional, austere, and high-precision aesthetic inspired by elite platforms like Vercel, Stripe, GitHub, or Linear.
- **Decision Support (Mandatory):** When asked to implement or refactor a feature, ALWAYS provide 2-4 distinct implementation ideas/approaches with their pros and cons BEFORE execution. Wait for the user to decide on the best path.
- **Visual Stability:** Avoid layout shifts when states change (e.g., active filters, loading indicators). Use absolute positioning or placeholders if necessary.
- **Interaction Feedback:** All interactive elements must have clear `cursor-pointer`, and buttons should have `hover`, `active`, and `disabled` states.
- **Iconography:** Icons must support the text, not replace it in critical actions. Use `lucide-react`.

