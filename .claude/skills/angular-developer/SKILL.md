---
name: angular-developer
description: Generates Angular code and provides architectural guidance. Trigger when creating projects, components, services, or HTTP communication, or for best practices on reactivity (signals, linkedSignal, resource, httpResource), forms, dependency injection, routing, SSR, accessibility (ARIA), animations, styling (component styles, Tailwind CSS), testing, naming conventions, or CLI tooling.
license: MIT
metadata:
  author: Copyright 2026 Google LLC
  version: '1.0'
---

# Angular Developer Guidelines

> **SupportFlow project conventions** (added locally — not part of the upstream `angular/skills` content below). This project is on Angular 22.1.0, so the version-gated guidance further down (Signal Forms, `httpResource`, Vitest) applies directly — no version-compatibility checking needed. A few things specific to this repo that the guidance below can't know:
>
> - **Two separate Angular workspaces, not one app**: `projects/agent` (agent + admin, port 4300) and `projects/customer` (customer portal + public CSAT page, port 4200) are different builds with different deploy targets. Only types are shared, via `projects/shared/src`, imported as `@supportflow/shared` — no shared services or components. New agent-facing work goes in `projects/agent`; new customer-facing work goes in `projects/customer`.
> - **Cross-app links must be a real `href`**, built from `AGENT_APP_URL`/`CUSTOMER_APP_URL` (also in `@supportflow/shared`) — never `routerLink` and never `window.location.origin`, since that resolves to whichever app's own origin rendered the link, not the other app's. This has been a real source of bugs (the CSAT link on the agent sidebar, the "sign in as agent"/"go to portal" switch links).
> - **Existing services use `@Injectable({ providedIn: 'root' })` + `HttpClient`/RxJS `Observable`**, not this skill's `@Service()` decorator or `resource()`/`httpResource()` (e.g. `TicketService` in `projects/agent/src/app/core/`) — match that pattern when extending an existing service; the newer idioms are fine for a genuinely new service if asked to modernize, but don't mix decorators or reactive styles within the same file. See `references/creating-services.md` and `references/di-fundamentals.md`.
> - **Forms are hand-rolled, not this skill's Signal Forms API**: existing forms (`agent-login`, `customer-login`) use per-field `signal()`s bound via `[ngModel]`/`(ngModelChange)` from `FormsModule` — no `FormGroup`, no `form()`. That's intentional for small 2-3 field forms; reach for the full Signal Forms API (`references/signal-forms.md`) only for a genuinely complex new form, not as a mandate to rewrite the existing ones.
> - **No `environments/` folder** — `API_BASE_URL`/`AGENT_APP_URL`/`CUSTOMER_APP_URL` are plain constants in `@supportflow/shared` (`api.config.ts`/`app-urls.ts`), not build-time environment files. Add new config values there, not via `ng generate environments`. See `references/environment-configuration.md`.
> - **No Angular Material/CDK and no E2E framework installed** — `references/component-harnesses.md`'s `MatButtonHarness` examples and `references/tailwind-css.md` don't apply until those packages are actually added; use `references/testing-fundamentals.md`'s direct fixture approach for component tests today.
> - **Auth is a functional `HttpClient` interceptor** (`core/auth.interceptor.ts`, wired via `provideHttpClient(withInterceptors([authInterceptor]))` in `app.config.ts`) attaching a Bearer JWT issued by the `supportflow-server` Django API — not session cookies. Do not add CSRF handling on the Angular side; there's no session to protect (see that repo's own security notes).
> - **Styling is plain SCSS** (`"style": "scss"` in `angular.json`) — no Tailwind is installed. Skip `references/tailwind-css.md` unless the user explicitly asks to add Tailwind; use `references/component-styling.md` instead.
> - Auth guards already exist (`core/auth.guard.ts` in both apps) as functional `CanActivate` guards, matching `references/route-guards.md` — no change needed there, just follow the existing pattern for new protected routes.
> - Full project context and workflow (branching, dev server commands) live in this repo's own `CLAUDE.md` — read that first for anything not covered here.

1. Always analyze the project's Angular version before providing guidance, as best practices and available features can vary significantly between versions. If creating a new project with Angular CLI, do not specify a version unless prompted by the user.

2. When generating code, follow Angular's style guide and best practices for maintainability and performance. Use the Angular CLI for scaffolding components, services, directives, pipes, and routes to ensure consistency.

3. Once you finish generating code, run `ng build` to ensure there are no build errors. If there are errors, analyze the error messages and fix them before proceeding. Do not skip this step, as it is critical for ensuring the generated code is correct and functional.

## Creating New Projects

If no guidelines are provided by the user, here are some default rules to follow when creating a new Angular project:

1. Use the latest stable version of Angular unless the user specifies otherwise.
2. Use Signal Forms for form management in new projects (stable in Angular v22 and newer) [Find out more](references/signal-forms.md).

**Execution Rules for `ng new`:**
When asked to create a new Angular project, you must determine the correct execution command by following these strict steps:

**Step 1: Check for an explicit user version.**

- **IF** the user requests a specific version (e.g., Angular 15), bypass local installations and strictly use `npx`.
- **Command:** `npx @angular/cli@<requested_version> new <project-name>`

**Step 2: Check for an existing Angular installation.**

- **IF** no specific version is requested, run `ng version` in the terminal to check if the Angular CLI is already installed on the system.
- **IF** the command succeeds and returns an installed version, use the local/global installation directly.
- **Command:** `ng new <project-name>`

**Step 3: Fallback to Latest.**

- **IF** no specific version is requested AND the `ng version` command fails (indicating no Angular installation exists), you must use `npx` to fetch the latest version.
- **Command:** `npx @angular/cli@latest new <project-name>`

## Components

When working with Angular components, consult the following references based on the task:

- **Fundamentals**: Anatomy, metadata, core concepts, self-closing tags, and template control flow (@if, @for, @switch). Read [components.md](references/components.md)
- **Inputs**: Signal-based inputs, transforms, and model inputs. Read [inputs.md](references/inputs.md)
- **Outputs**: Signal-based outputs and custom event best practices. Read [outputs.md](references/outputs.md)
- **Host Elements**: Host bindings and attribute injection. Read [host-elements.md](references/host-elements.md)
- **Naming Conventions**: Modern Angular v20+ naming style ("Intent over Role") for files, components, services, directives, pipes, and models. Read [naming-conventions.md](references/naming-conventions.md)

If you require deeper documentation not found in the references above, read the documentation at `https://angular.dev/guide/components`.

## Reactivity and Data Management

When managing state and data reactivity, use Angular Signals and consult the following references:

- **Signals Overview**: Core signal concepts (`signal`, `computed`), reactive contexts, and `untracked`. Read [signals-overview.md](references/signals-overview.md)
- **Dependent State (`linkedSignal`)**: Creating writable state linked to source signals. Read [linked-signal.md](references/linked-signal.md)
- **Async Reactivity (`resource`)**: Fetching asynchronous data directly into signal state. Read [resource.md](references/resource.md)
- **Side Effects (`effect`)**: Logging, third-party DOM manipulation (`afterRenderEffect`), and when NOT to use effects. Read [effects.md](references/effects.md)

## HTTP Communication

When communicating with backend services, use Angular HTTP APIs and consult the following reference:

- **HTTP Client and Resources**: `provideHttpClient`, `HttpClient`, interceptors, and `httpResource`. Read [http-client.md](references/http-client.md)

## Forms

In most cases for new apps, **prefer signal forms**. When making a forms decision, analyze the project and consider the following guidelines:

- If the application is using v22 or newer and this is a new form, **prefer Signal Forms**.
- For older applications or when working with existing forms, use the appropriate form type that matches the applications current form strategy.

- **Signal Forms**: Use signals for form state management. Read [signal-forms.md](references/signal-forms.md)
- **Template-driven forms**: Use for simple forms. Read [template-driven-forms.md](references/template-driven-forms.md)
- **Reactive forms**: Use for complex forms. Read [reactive-forms.md](references/reactive-forms.md)

## Dependency Injection

When implementing dependency injection in Angular, follow these guidelines:

- **Fundamentals**: Overview of Dependency Injection, services, and the `inject()` function. Read [di-fundamentals.md](references/di-fundamentals.md)
- **Creating and Using Services**: Creating services, the `providedIn: 'root'` option, and injecting into components or other services. Read [creating-services.md](references/creating-services.md)
- **Defining Dependency Providers**: Automatic vs manual provision, `InjectionToken`, `useClass`, `useValue`, `useFactory`, and scopes. Read [defining-providers.md](references/defining-providers.md)
- **Injection Context**: Where `inject()` is allowed, `runInInjectionContext`, and `assertInInjectionContext`. Read [injection-context.md](references/injection-context.md)
- **Hierarchical Injectors**: The `EnvironmentInjector` vs `ElementInjector`, resolution rules, modifiers (`optional`, `skipSelf`), and `providers` vs `viewProviders`. Read [hierarchical-injectors.md](references/hierarchical-injectors.md)

## Pipes

When formatting values in templates, creating custom pipes, or reusing pipe-like logic in TypeScript, consult the following reference. Prefer pipes in templates; outside templates, avoid injecting pipe classes just to call `transform()`.

- **Pipes**: Built-in pipe imports, custom pipe naming and implementation, pure vs impure pipes, and TypeScript reuse patterns using standalone formatting functions or extracted plain functions. Read [pipes.md](references/pipes.md)

## Angular Aria

When building accessible custom components for any of the following patterns: Accordion, Listbox, Combobox, Menu, Tabs, Toolbar, Tree, Grid, consult the following reference:

- **Angular Aria Components**: Building headless, accessible components (Accordion, Listbox, Combobox, Menu, Tabs, Toolbar, Tree, Grid) and styling ARIA attributes. Read [angular-aria.md](references/angular-aria.md)

## Routing

When implementing navigation in Angular, consult the following references:

- **Define Routes**: URL paths, static vs dynamic segments, wildcards, and redirects. Read [define-routes.md](references/define-routes.md)
- **Route Loading Strategies**: Eager vs lazy loading, and context-aware loading. Read [loading-strategies.md](references/loading-strategies.md)
- **Show Routes with Outlets**: Using `<router-outlet>`, nested outlets, and named outlets. Read [show-routes-with-outlets.md](references/show-routes-with-outlets.md)
- **Navigate to Routes**: Declarative navigation with `RouterLink` and programmatic navigation with `Router`. Read [navigate-to-routes.md](references/navigate-to-routes.md)
- **Control Route Access with Guards**: Implementing `CanActivate`, `CanMatch`, and other guards for security. Read [route-guards.md](references/route-guards.md)
- **Data Resolvers**: Pre-fetching data before route activation with `ResolveFn`. Read [data-resolvers.md](references/data-resolvers.md)
- **Router Lifecycle and Events**: Chronological order of navigation events and debugging. Read [router-lifecycle.md](references/router-lifecycle.md)
- **Rendering Strategies**: CSR, SSG (Prerendering), and SSR with hydration. Read [rendering-strategies.md](references/rendering-strategies.md)
- **Route Transition Animations**: Enabling and customizing the View Transitions API. Read [route-animations.md](references/route-animations.md)

If you require deeper documentation or more context, visit the [official Angular Routing guide](https://angular.dev/guide/routing).

## Styling and Animations

When implementing styling and animations in Angular, consult the following references:

- **Using Tailwind CSS with Angular**: Integrating Tailwind CSS into Angular projects. Read [tailwind-css.md](references/tailwind-css.md)
- **Angular Animations**: Using native CSS (recommended) or the legacy DSL for dynamic effects. Read [angular-animations.md](references/angular-animations.md)
- **Styling components**: Best practices for component styles and encapsulation. Read [component-styling.md](references/component-styling.md)

## Testing

When writing or updating tests, consult the following references based on the task:

- **Fundamentals**: Best practices for unit testing (Vitest), async patterns, and `TestBed`. Read [testing-fundamentals.md](references/testing-fundamentals.md)
- **Component Harnesses**: Standard patterns for robust component interaction. Read [component-harnesses.md](references/component-harnesses.md)
- **Router Testing**: Using `RouterTestingHarness` for reliable navigation tests. Read [router-testing.md](references/router-testing.md)
- **End-to-End (E2E) Testing**: Setting up and running E2E tests. Read [e2e-testing.md](references/e2e-testing.md)

## Tooling

When working with Angular tooling, consult the following references:

- **Angular CLI**: Creating applications, generating code (components, routes, services), serving, and building. Read [cli.md](references/cli.md)
- **Code Modernization**: Automatically refactoring to modern standards using migrations. Read [migrations.md](references/migrations.md)
- **Angular MCP Server**: Available tools, configuration, and experimental features. Read [mcp.md](references/mcp.md)
- **Environment Configuration**: Strategies for build-time and runtime configuration. Read [environment-configuration.md](references/environment-configuration.md)
