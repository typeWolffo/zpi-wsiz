# Testowanie aplikacji z React Router 7 w trybie SPA

Ten dokument zawiera informacje dotyczące testowania aplikacji zbudowanej z użyciem React Router 7 w trybie SPA (Single Page Application) przy użyciu Vitest.

## Konfiguracja testów

W projekcie skonfigurowano testy z wykorzystaniem następujących narzędzi:

- **Vitest** - wydajny framework do testów jednostkowych
- **Testing Library** - biblioteka pomocna przy testowaniu komponentów React
- **JSDOM** - środowisko symulujące przeglądarkę w Node.js

## Struktura plików testowych

- `vitest.config.ts` - konfiguracja Vitest
- `vitest.setup.ts` - globalne ustawienia dla testów, mockowanie API, etc.
- `app/utils/test-utils.tsx` - pomocnicze funkcje do testowania, m.in. renderowanie z React Router

## Uruchamianie testów

Aplikacja zawiera następujące skrypty testowe:

```bash
# Uruchomienie wszystkich testów
pnpm test

# Uruchomienie testów w trybie watch (przeładowanie przy zmianach)
pnpm test:watch

# Uruchomienie testów z interfejsem graficznym
pnpm test:ui

# Uruchomienie testów z generowaniem raportu pokrycia kodu
pnpm test:coverage
```

## Testowanie komponentów

Przykład prostego testu komponentu:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../Button";

describe("Button", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
```

## Testowanie z React Router 7

Do testowania komponentów korzystających z React Router 7 przygotowano specjalną funkcję `renderWithRouter` w pliku `app/utils/test-utils.tsx`. Funkcja ta renderuje komponenty z dostępem do API React Router.

```tsx
import { renderWithRouter, screen } from "../../utils/test-utils";

// Renderowanie komponentu z routerem
renderWithRouter(<YourComponent />, {
  routerOptions: {
    initialEntries: ["/initial-path"],
    // opcjonalnie można przekazać własne trasy
    routes: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
    ],
  },
});
```

Alternatywnie można użyć bezpośrednio RouterProvider:

```tsx
import { render } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router";

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
    ],
  },
];

const router = createMemoryRouter(routes, {
  initialEntries: ["/"],
});

render(<RouterProvider router={router} />);
```

## Testowanie nawigacji

Do testowania nawigacji między stronami można wykorzystać `userEvent` wraz z funkcją `waitFor`:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("navigates when link is clicked", async () => {
  const user = userEvent.setup();

  // Renderowanie komponentu z routerem
  // ...

  // Kliknięcie w link lub przycisk
  const link = screen.getByText("Przejdź do About");
  await user.click(link);

  // Sprawdzenie czy nastąpiła nawigacja
  await waitFor(() => {
    expect(screen.getByText("O nas")).toBeInTheDocument();
  });
});
```

## Mockowanie API React Router

W pliku `vitest.setup.ts` zdefiniowano mocki dla najczęściej używanych funkcji React Router, takich jak `useNavigate`, `useParams`, `useRouteError`. Możesz je dostosować według potrzeb swojej aplikacji.
