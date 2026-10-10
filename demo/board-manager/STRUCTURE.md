# Board Manager: project structure

The structure we want for `demo/board-manager/`, a prototype for larger data-driven apps. Decisions go here, dated;
files are moved to match them.

## Target structure

- Feature-based structure ("package by feature", like Bulletproof React): one folder per feature (the modules of the
  app's menu), each with its services and UI; plus `app/`, `domain/`, `infra/` and `shared/`.
  ```
  board-manager/
  ├── app/                    the shell and the wiring: App, routes, providers, BoardManagerDemo, BoardManagerElement,
  │                           css; creates the repositories (from infra/) and the services, and provides the services
  ├── domain/                 the shared kernel: pure TypeScript, imports nothing from outside
  │   ├── query.ts            Range, Sort, Paging, Page (later Filter): the vocabulary of the repositories
  │   ├── board.ts            per entity: the type, its constants, values, criteria, sort keys, repository interface
  │   ├── organization.ts
  │   ├── person.ts
  │   ├── membership.ts       (+ ROLES, Role)
  │   ├── meeting.ts          (+ MEETING_STATUSES, MeetingStatus)
  │   ├── agenda.ts
  │   ├── document.ts
  │   └── index.ts
  ├── features/
  │   ├── boards/
  │   │   ├── service.ts      what the UI calls; without logic just the repository (`(repo) => repo`)
  │   │   ├── pages/          BoardsPage, BoardPage
  │   │   ├── components/     what only this feature needs (e.g. a table and its mapping to the criteria; boardFlows)
  │   │   └── index.ts        the only import path for other features
  │   ├── meetings/           components/ MeetingsTable, Minutes; pdf/
  │   ├── members/            components/ PeopleTable
  │   ├── organizations/
  │   └── home/               the home page
  ├── infra/                  the implementations of the domain's interfaces; replaceable per subfolder
  │   └── in-memory/          store, seed, query engine, one repository per entity, the document upload transport
  │                           (later next to it: http/)
  └── shared/                 no domain knowledge: ui/ (AsyncSelect, NotFound), lib/ (useForm, i18n, colors, countries)
  ```

## Rules

- Imports go one way:
  - `app` → `features`, `infra`, `domain`, `shared`; nothing imports `app`.
  - `features` → `domain`, `shared`, and other features through their `index.ts` (never in a cycle).
  - `infra` → `domain`; only `app` imports `infra`.
  - `domain` imports nothing from outside (pure TypeScript: types, constants, pure rules, interfaces).
- An entity type used by several features lives in `domain/`, not in a feature (the shared kernel).
- The UI talks to services only, never to a repository or to `infra/`. A real backend means a new `infra/http/` and a
  change in `app/`; the features stay.
- A folder exists only when it has files: a small feature may have just `service.ts`, `pages/` and `index.ts`.

## Data access

- Domain first: the domain defines its entities and how they can be queried, without knowing any UI (no data table
  types). The UI adapts to the domain: a table maps the grid's state to the domain's criteria, and offers only the sorts
  and filters the domain supports.
- The chain: UI → service (feature) → repository (interface in `domain/`) → implementation (`infra/in-memory/` today,
  `infra/http/` later). `app/` chooses the implementations and hands the services to the UI (a React context).
- A data table's `source` is a role, not a layer: the table passes a service call in, with a small mapping.

### Example: `Product`

```ts
// domain/query.ts: generic building blocks of the repositories, no entity
type Range<T> = { from?: T; to?: T }; // both inclusive
type Sort<K extends string> = { key: K; direction: 'asc' | 'desc' };
type Paging = { page: number; pageSize: number }; // page: 0-based
type Page<T> = { items: readonly T[]; total: number };
```

```ts
// domain/product.ts
type ProductCategory = 'hardware' | 'software' | 'service';

type Product = {
  id: string;
  number: string; // e.g. 'P-10023', unique
  name: string;
  category: ProductCategory;
  price: number; // in cents
  active: boolean;
  created: string; // ISO date
};

// What may be changed: everything except the id and what the system sets.
type ProductValues = Omit<Product, 'id' | 'created'>;

// What products can be searched by.
type ProductCriteria = {
  text?: string; // number or name contains, ignoring case
  categories?: readonly ProductCategory[]; // one of
  price?: Range<number>;
  active?: boolean;
  created?: Range<string>;
};

type ProductSortKey = 'number' | 'name' | 'price' | 'created';

// What can be done with products: the data access, independent of where the data lives.
interface ProductRepository {
  find(
    criteria: ProductCriteria,
    sort: Sort<ProductSortKey> | undefined,
    paging: Paging,
    signal?: AbortSignal,
  ): Promise<Page<Product>>;
  get(id: string, signal?: AbortSignal): Promise<Product | undefined>;
  create(values: ProductValues): Promise<Product>;
  update(id: string, values: ProductValues): Promise<Product>;
  delete(ids: readonly string[]): Promise<void>;
}
```

- `Page.items`, not `rows`: rows are a grid term.
- A `ProductRow` (a product with computed columns for a table) is not domain; the feature builds it if a table needs
  one.
- Complex filtering (AND/OR) would be a domain decision: a generic, typed `Filter<ProductField>` in `domain/query.ts`,
  used by the criteria; never the grid's filter type.

## Open questions

- Phase 2 of the data access, one topic at a time: how TanStack Query is used (query keys, the data table's
  reload), repositories with domain criteria, row types in the features, services and wiring in `app/`.

## Not there yet

- Step 1 (2026-10-03) moved the files only (same code, new import paths). Still against the rules:
  - `infra/in-memory/` (phase 1 of the split, 2026-10-03: `db.ts` split into store, seed, query engine, lookups and
    one file per entity; the pure agenda rules and `normalizeWebsite()` moved to `domain/`): the UI still imports it
    directly (through its temporary `index.ts`), reads the store (`db`, `useDb`), and its fetch functions use the data
    table's types and return the row types. No repositories and services yet.
  - `shared/forms.tsx`: the forms of every feature (each belongs to its feature).
  - `shared/shared.tsx`: a catch-all; partly not shared (`useDb`, the person and organization filters know the domain).
  - No feature has an `index.ts` yet; features import each other's files directly.
  - `features/home/`: the home page, a feature without its own data.

## Decisions

- 2026-10-03: group by feature, with `app/` and `shared/` (not by layer).
- 2026-10-03: a feature-based structure (not Feature-Sliced Design); every feature has its own `api/`, UI and
  `index.ts`. (Its `api/` became `service.ts`, see the services decision below.)
- 2026-10-03: the entity types live in one central `domain/` (a shared kernel), one file per entity; not in the features
  (they link to each other and are used by several features), and not per bounded context as in full DDD. Named
  `domain/`, not `types/` (Bulletproof React) or `model/` (suggests state).
- 2026-10-03: the repository interfaces live in `domain/`, next to their entity (the domain defines its ports; the
  implementations, fake and later HTTP, live outside); not in the features.
- 2026-10-03: the UI talks to services only, never to a repository. A service without logic is the repository itself
  (`const productService = (repo: ProductRepository) => repo;`, no pass-through boilerplate); with logic, it spreads
  the repository and overrides or adds only what changes (`({ ...repo, delete: … })`).
- 2026-10-03: the implementations of the domain's interfaces (the in-memory repositories with store, seed and query
  engine; later HTTP; also e.g. file transfer, storage, auth) live in `infra/`, one subfolder per implementation
  (`infra/in-memory/`, later `infra/http/`). Only `app/` imports it (the wiring). Named `infra/` (short, common, e.g.
  ddd-forum), not `infrastructure/`, `data/`, `adapters/` (strictly also the UI) or `server/`.
- 2026-10-03: the generic query blocks (`Range`, `Sort`, `Paging`, `Page`) live in `domain/query.ts` (the vocabulary of
  the repositories), not in `shared/`: `domain/` stays free of outside imports.
- 2026-10-03: reads and changes in the UI go through TanStack Query (`@tanstack/react-query`): `useQuery` over the
  services, `useMutation` with `invalidateQueries` for changes, so every page showing changed data reloads. Not our own
  change events with a hook, and not a client store as a cache.
