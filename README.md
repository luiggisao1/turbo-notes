## Turbo Notes
A note-taking web application built with Next.js, Radix UI, and Tailwind CSS, featuring user authentication and category-based organization.


## Project Summary
- The structure and decisions are intended to make the project:
  - Easy to reason about (clear separation of concerns)
  - Easy to test (thin API client, small components)
  - Accessible and maintainable (Radix primitives, testing library)
  - Fast to iterate on (Tailwind for styling and AI assistance for scaffolding)
- Overall, the development process and design choices aimed to create a robust, user-friendly note-taking application that can be easily extended and maintained over time.


## Development process

The implementation followed a clear, iterative process that emphasized authentication and data integrity first, then UI composition, and finally test coverage:

1. Authentication UI and backend connection
   - First, I built the authentication screens and flows (login and signup) to ensure users could sign in and the app could manage sessions. This included pages and forms in `app/login/page.tsx` and `app/signup/page.tsx`, auth-related actions in `app/actions/auth.ts`, and shared auth helpers in `app/lib/auth.tsx`.
   - Rationale: Getting auth right early guarantees the rest of the app can be developed against realistic authenticated states and simplifies testing protected routes.

2. Notes UI components
   - After the auth surface was in place, I implemented the core note-taking features: the note editor, note cards, and category sidebar (`app/_components/NoteEditor.tsx`, `app/_components/NoteCard.tsx`, `app/_components/CategorySidebar.tsx`).
   - Rationale: With authentication and backend connectivity available, I could focus on building components that rely on real data shapes and API calls, keeping UI and domain logic separate and easier to validate.

3. Unit tests (AI-assisted scaffolding + human review)
   - Finally, I added unit tests for components and helpers under `__tests__/` using Vitest + Testing Library. Many test skeletons were generated with AI assistance to speed coverage, then reviewed and adjusted by hand to match actual component APIs and behavior.
   - Rationale: Writing tests after the UI and domain code allows tests to reflect actual behavior rather than speculative interfaces. The AI-assisted approach accelerated scaffolding while maintaining a human-in-the-loop review to ensure correctness.

This sequence (auth → core UI → tests) helped ensure that components were developed against real data and auth contexts, and that tests could validate meaningful user flows rather than mock-first assumptions.

## Key design and technical decisions.

- Next.js App Router
  - Leveraged the App Router for its file-based routing, server components, and built-in data fetching capabilities. This allowed for a clean separation of server and client logic, improving performance and maintainability.
- Radix UI Primitives
  - Used Radix UI for accessible, unstyled components that could be easily customized with Tailwind CSS. This ensured a consistent and accessible user experience while allowing for rapid styling.
- Tailwind CSS
  - Chose Tailwind CSS for utility-first styling, enabling quick prototyping and consistent design without writing custom CSS. This sped up the development process and made it easier to maintain styles.
- API Client Abstraction
  - Created a thin API client layer to abstract away direct fetch calls, making it easier to swap out or modify backend interactions without affecting component logic.
- Testing with Vitest and Testing Library
  - Selected Vitest for its speed and compatibility with Vite, along with Testing Library for its user-centric testing approach. This combination facilitated writing meaningful tests that focus on user interactions and component behavior.

## AI tools used and how I used them
- Utilized AI tools to assist with scaffolding test cases and generating boilerplate code. This helped speed up the development process while ensuring that the core logic and final implementations were reviewed and refined by human developers.
- Employed AI for brainstorming solutions to complex problems, such as state management and component composition, while ensuring that final decisions were made based on best practices and project requirements.
- Used AI to generate documentation and comments, ensuring clarity and consistency throughout the codebase.
- Used AI to generate commit messages that accurately reflected the changes made, improving version control clarity.
