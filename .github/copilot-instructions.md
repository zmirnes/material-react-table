# Copilot Custom Instructions

## 🔒 PR & Workflow Rules (HIGHEST PRIORITY)

- **Before ANY AI changes, code review, or project work:**
  - Force the user to open a PR for the current branch FIRST.
  - If no PR is open, STOP and refuse to continue until the user confirms it.

- **PR File Limit:**
  - A single PR must not contain more than **10 changed files** (added + modified).
  - Only in extreme, well-justified cases: up to **12 files max**.
  - If the limit is exceeded, STOP immediately. Do NOT give any further instructions, suggestions, or code.
  - Instead, tell the user to break the task into smaller subtasks and reorganize.
  - This rule can NEVER be used as an excuse to reduce code quality, violate SOLID principles, or skip best practices.

- **Task Scope:**
  - Each task the AI executes must be **minimal and focused**.
  - Never implement multiple features or systems at once.
  - One task = one clearly defined, small piece of functionality.

---

## 💬 Comments & Naming

- **Comments:** All comments must be in **English**.
- Use **single-line comments** on every line that could confuse a reader during PR review.
- **Variable names** must precisely describe the intent — what you're trying to get, define, or do.
  - Prefer long, descriptive names over short, ambiguous ones.
  - A name should make the code self-documenting.

---

## 🏗️ Architecture & Code Quality

- **SOLID principles are mandatory.** Components must be simple and focused on a single responsibility.
- Files must be as short as possible — split logic into small, clearly named units.
- Apply **GoF Design Patterns**, adapted for React and functional JavaScript:
  - Focus on the *principle*, not a rigid OOP implementation.
  - Solve the problem through the pattern's intent, not its form.
- **Never use `any` types** in TypeScript.
- Minimize or completely eliminate **type casting (`as`)** — treat it as a last resort.

---

## 🧩 Modularity

- Break code into the smallest functional units with clear, descriptive names.
- **Extract all mappings** into separate constants or named functions.
- **Extract render logic inside `.map()`** into separate components or helper functions — never inline complex JSX in map callbacks.
- Each extracted piece must have a name that explains exactly what it does.

---

## 📱 Responsiveness

- **All generated UI code must be fully responsive** and adapted for multiple screen sizes/devices.
- No exceptions — even utility components must consider layout flexibility.
---

## 🧪 Testing Mindset

- Code must be **testable by design** — even if tests are not written immediately.
- Follow these rules to ensure testability:
  - Extract business logic into **pure functions** — no side effects, predictable output.
  - Components must receive data via **props or context** — never reach outside their scope.
  - Avoid logic directly inside event handlers — extract it into named, testable functions.
  - Side effects must be isolated inside `useEffect` or custom hooks, never scattered inline.
- When writing a function or component, ask: *"Can I test this in isolation?"* — if not, refactor first.

---

## ⚠️ Error Handling

- **Every feature must handle all three states: loading, error, and empty.**
  - Missing any of these states is considered an incomplete implementation.
- Never assume data exists — always guard against `null`, `undefined`, and unexpected shapes.
- API errors must be caught and communicated to the user — silent failures are forbidden.
- Use **typed error boundaries** where appropriate for component-level crash isolation.
- Error messages shown to users must be human-readable — never expose raw API errors or stack traces to the UI.

---

## ⚡ Performance

- **Never add `useMemo` or `useCallback` without a concrete, stated reason.**
  - Adding them "just in case" is forbidden — it adds complexity and can hurt performance.
  - Valid reasons: referential equality for deps arrays, expensive computations, child component re-render prevention with `React.memo`.
- Before memoizing, ask: *"Is there a measurable or obvious problem here?"* — if not, skip it.
- Avoid creating objects, arrays, or functions inline inside JSX when they will be passed as props to memoized children.
- **List rendering must always have stable, unique `key` props** — never use array index as key unless the list is static and will never be reordered.

---

## 🚫 No Magic Values

- **No hardcoded strings, numbers, URLs, or config values directly in components or functions.**
- Every magic value must be extracted into a **named constant** with a descriptive name that explains its purpose.
- Constants must be defined at the top of the file or in a dedicated `constants.ts` / `config.ts` file depending on scope.
- Examples of magic values that must always be extracted:
  - API endpoint URLs
  - Timeout durations
  - Limit/threshold numbers
  - UI label strings that are reused
  - Status strings or enum-like values

---

## 🔌 Separation of Concerns — Data Fetching

- **No `fetch`, `axios`, or any HTTP calls directly inside components.**
- Data fetching logic must always be separated into one of:
  - A **custom hook** (e.g. `useUserData`, `useProductList`)
  - A **service/API layer** (e.g. `userService.ts`, `api/products.ts`)
  - A **query file** if using React Query or similar
- Components are only responsible for **rendering** — they receive data, they do not fetch it.
- The custom hook or service is responsible for: fetching, error handling, loading state, and data transformation.
- Data transformation (mapping API response to UI model) must happen **outside the component**, never inside JSX.