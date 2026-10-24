# Board Manager: project structure

The structure we want for `demo/board-manager/`, a prototype for larger data-driven apps. Decisions go here, dated;
files are moved to match them.

## Target structure

- Being replaced (2026-10-17): Organizations, Boards and Members are flat now, files by kind in the feature's folder
  (`<subject>-data.ts`, `-flows.tsx`, `-filters.ts`, `-table.tsx`, `-page.tsx`, …), without query keys, reads, a
  service or an index of their own where they only passed calls on; see the Board Manager's `CLAUDE.md`
  (Organizations). All four features are flat now (the meetings with the files of their parts, `agenda-…`,
  `document-…`); the target below is outdated, and this file is rewritten once the pattern is decided.

- Feature-based structure ("package by feature", like Bulletproof React): one folder per feature (the modules of the
  app's menu), each with its services and UI; plus `app/`, `domain/`, `infra/` and `shared/`.
  ```
  board-manager/
  ├── app/                    the shell and the wiring: App, routes, providers, the element (createBoardManagerClass),
  │                           css; creates the repositories (from infra/) and the services, and provides the services
  ├── domain/                 the shared kernel: pure TypeScript, imports nothing from outside
  │   ├── query.ts            Range, Sort, Paging, Page, TextMatch (later Filter): the vocabulary of the repositories
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
  │   │   ├── components/     what only this feature needs (e.g. a table and its mapping to the criteria)
  │   │   ├── flows/          the feature's flows, one hook per use case (board-flows.tsx)
  │   │   ├── filters/        its domain filters (board-filters.ts)
  │   │   └── index.ts        the only import path for other features
  │   ├── meetings/           components/ MeetingTable, Minutes
  │   ├── members/            components/ PersonTable
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
type Paging = { offset: number; limit: number }; // a window of the results (the File Center's; page and page size before)
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

## The data access (done 2026-10-16)

- The way (2026-10-16, the user's choice: one feature at a time, the boards first, then all at once ("go with all");
  paging in the repository with the domain's criteria, the File Center's way, proposed at about 70% over loading
  everything and filtering locally), in seven steps, all done:
  - Step 1: the query vocabulary and the repositories' interfaces in `domain/` (one file per entity: `Board…`,
    `Person…`, `Organization…`, `Membership` with `BoardMember` and `PersonMembership`, `Meeting…`, `Agenda…`,
    `MeetingDocument…`; each with its summary, criteria, sort keys and repository; `dates.ts`).
  - Step 2: the in-memory repositories in `infra/` (`<entity>-repository.ts` over the one store,
    `createInMemoryRepositories()` in its `index.ts`; the old fetch functions with the data table's types are gone).
  - Step 3: a service per feature, provided by a context from `app/` (`BoardService`, `MemberService`,
    `OrganizationService`, `MeetingService`; each over the repositories it needs, e.g. the boards' with the
    memberships, the meetings' with the agendas, documents and the report's data). The contexts are one line each (2026-10-16, the user's choice,
    proposed at about 70% over one context for all services, which would tie every feature to all the others):
    `createServiceContext<S>(name)` of `shared/lib/service-context.ts` gives the context and its hook.
  - Step 4: the rows in the features: a table maps its query to the criteria (`toCriteria` in its file, explicit: the
    domain keeps names of its own; criteria named like the filter keys, so no mapping, was proposed and dropped,
    2026-10-16, the user's decision). The wiring is one call (the same day, the user's choice, proposed at about 60%):
    `useFindSource(scope, SORT_KEYS, toCriteria, find, reload)` of `shared/lib/table-query.ts` (the sort, the
    paging, TanStack Query); a list of one record gives `find` as a closure (`service.findMembers(board.id, …)`). Mostly the domain's summaries are the
    rows; the meetings' `MeetingRow` adds the two look-only columns, the agenda's `AgendaRow` (`agenda.ts`) the number,
    the presenter and `recorded`. The agenda is one page: its rows, groups and search are made in the feature
    (`agendaPage`) from the repository's agenda.
  - Step 5: the reads through TanStack Query: the tables' pages (`useFindSource`, `use-query-source.ts`), the records
    and lists (`reads.ts` of each feature: `useBoard`, `usePerson`, `useOrganization`, `useMeeting`, `use…List`,
    `useAgenda`, `useBoardMembers`; `shared/lib/queries.ts`: `useRead`, `useRecord`, a missing record is `null` in the
    cache: TanStack Query takes no `undefined`). `useDb` and `useReloadOnChange` are gone.
  - Step 6: the flows call the service; every read loads again after a change. The services say so themselves
    (2026-10-16, the user's choice, proposed at about 65%; the flows called `changed()` of `shared/lib/use-changed.ts`
    before, the same day): each service lists its changing methods once (`withChanges(service, ['create', …],
    onChange)`, `shared/lib/with-changes.ts`: `onChange` after each has finished, not after a refused one), and the app
    gives `onChange` (`queryClient.invalidateQueries()`); the services know no TanStack Query. A new changing method of
    a service goes into its list. An "Edit"
    gets the record, not its id (no read before the dialog); the forms get their choices as props (`PersonForm`'s
    organizations, `OrganizationForm`'s others for the unique name, `MemberForm`'s `suggest`).
  - Step 7: only `app/` imports `infra/` (`app/board-manager-app.tsx`). The query client and the services are around
    everything, the dialogs' content too (`Services`). `AppError` moved to `shared/lib/app-error.ts` (the server throws
    it, the UI translates it).
  - A temporary bridge for a few hours the same day (the store's changes invalidated every read) is gone.
- The UI knows only the services, never a repository, not even its types (2026-10-16, the user's rule; a service may
  pass a repository's methods through). A function the UI is given has a named type in `domain/` (the user's choice,
  proposed at about 70% over `MemberService['suggest']` and the whole service): `SuggestPeople`, `SuggestOrganizations`,
  used by the repositories and by `personFilter`, `organizationFilter` and `MemberForm`.
- Features import each other's files directly (e.g. a table of the boards uses `personFilter` of the members); the
  app imports them through their `index.ts`.

## Not there yet

- `shared/forms.tsx`: the forms of every feature (each belongs to its feature).
- `shared/shared.tsx`: a catch-all. The person and organization filters moved out (2026-10-15, the user's choice,
  proposed at about 65%; weighed: one `shared/ui/tableFilters.tsx`, still domain in `shared/`), their two-line option
  to `shared/ui/suggestion.tsx` (no domain knowledge).
- `features/home/`: the home page, a feature without its own data (it reads the other features' lists).
- Checked with a script against the seed (the services' reads and changes), not yet in a browser.

## Decisions

- 2026-10-15 (the user's choice, proposed at about 70%; only the shared ones was weighed): a table filter of a domain
  concept lives in the feature that owns the concept, in its `<subject>-filters.ts`, however many tables use it; generic ones
  on plain fields (`textFilter()`, `dateRangeFilter()`) stay inline. One that needs texts or data is a function of
  them, not a hook (hooks for a few hours: `useRoleFilter()`, …): it is called in a table's `filtersOf`, outside the
  component. `members/` (`personFilter`, `roleFilter(t)`), `organizations/` (`organizationFilter`,
  `countryFilter(organizations)`), `boards/` (`boardFilter(boards)`), `meetings/` (`meetingStatusFilter(t)`,
  `minutesFilter(t)`, `documentTypeFilter`). The same rule in the other four apps (see the root's `CLAUDE.md`).
- 2026-10-16 (the user's decision; a folder for one file was proposed against, at about 60%): a feature's flows and
  filters are in folders of their own, `flows/` and `filters/`, even with one file; the boards feature first.
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
