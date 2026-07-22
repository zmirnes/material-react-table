# Grupa A render-optimizacija: React.memo + atoms/uiStore (ne top-level selector)

> Status: **plan odobren, čeka se signal za početak implementacije (Faza 1).**
> Dio je Faze 7 TanStack v9 migracije — vidi `TANSTACK_V9_MIGRATION.md` u root-u repoa za širi kontekst.

## Context

U okviru Faze 7 TanStack v9 migracije, radimo na konvertovanju "Grupa A" toolbar komponenti (11 fajlova koje čitaju `table.getState().X` za jedno-dva polja) na granularnije, reaktivnije čitanje state-a. Tokom rada je otkriveno da naivna konverzija (samo zamijeniti `getState()` sa `table.Subscribe`/`useSelector(table.atoms.X)` unutar postojeće komponente) **ne bi ništa uštedjela** — jer `useMRT_TableInstance.ts` poziva `useTable({...})` bez drugog argumenta (selector-a), što znači puna pretplata na sve state (matching V8 ponašanje), pa se cijelo stablo od `MaterialReactTable` naniže već re-renderuje na svaku promjenu, bez obzira šta pojedina komponenta iznutra čita. `table.Subscribe`/`useSelector` sami po sebi ne zaustavljaju kaskadni re-render iz roditelja — samo garantuju tačnu vrijednost i nezavisnu pretplatu, ali `Subscribe`-ova render-prop funkcija se i dalje poziva svaki put kad se roditelj re-renderuje (potvrđeno čitanjem `Subscribe.js`/`useTable.js` iz `@tanstack/react-table` v9 izvora).

Korisnik je predložio alternativu: suziti selector na top-level `useTable()` pozivu (npr. na `() => null`) da se kaskada uopšte ne dešava. Ovo je analizirano i **odbačeno kao trenutni pravac** — vidi ispod.

Cilj ovog plana: definisati ISPRAVAN, bezbjedan način da se Grupa A komponente stvarno optimizuju, koristeći **već postojeći, dokazan pattern** iz baze koda (`memoMode` za redove/ćelije), umjesto da se izmisli novi rizičniji pristup.

## Zašto NE suziti top-level selector (sada)

- Bilo koji potrošač bilo gdje u stablu koji se danas oslanja na kaskadu (čita `table.getState().X` ili prima `table` prop očekujući svježe podatke na sljedećem renderu, a nije eksplicitno pretplaćen preko Subscribe/atoms/memo) bi **tiho počeo prikazivati zastarjele podatke** — ispravnosna regresija koju typecheck ne hvata, vidljiva tek u stvarnoj upotrebi.
- ~40 fajlova u `src/` čita `.getState()` danas (vidi "Faza 7 — scoping izvještaj" u `TANSTACK_V9_MIGRATION.md`) — sve-ili-ništa razmjera rizika.
- `useMRT_TableInstance.ts` ima SOPSTVENE `useState` pozive za `pagination`/`grouping`/`columnOrder` (mirror-ovane radi v8-stil kontrolisanog API-ja) — te promjene re-renderuju `useMRT_TableInstance` **bez obzira** na selector proslijeđen ugniježdenom `useTable()` pozivu, jer je to REACT-ov sopstveni re-render mehanizam, ne TanStack-ov. Stvarna korist suženog selector-a bi zato bila manja nego što izgleda, dok je rizik ogroman.
- Realan preduslov za ovo bi bio: KONVERTOVATI SVE potrošače u cijelom stablu prvo — praktično neizvodljivo postepeno.

**Odluka: suženje top-level selector-a se odgađa kao posebna, mnogo veća buduća inicijativa, van scope-a Grupe A.**

## Ispravan pristup: React.memo + atoms/uiStore na leaf nivou (isti pattern kao memoMode)

Baza koda već ima DOKAZAN mehanizam za ovo — `memoMode` (opt-in table opcija) omotava `MRT_TableBodyRow`/`MRT_TableBodyCell` u `React.memo` sa komparatorima koji **namjerno ignorišu `table` referencu**:
- `Memo_MRT_TableBodyRow = memo(Component, (prev,next) => prev.row===next.row && prev.staticRowIndex===next.staticRowIndex)`
- `Memo_MRT_TableBodyCell = memo(Component, (prev,next) => next.cell===prev.cell)`

Ovo je JEDINI postojeći mehanizam u bazi koda koji stvarno zaustavlja re-render zbog promjene `table` reference. Isti princip primjenjujemo na Grupu A:

1. Omotati svaku komponentu u `React.memo(Component, comparator)`, gdje `comparator` poredi SVE props OSIM `table` (npr. `enableRowSelection`, `localization`, stil props) — nikad ne poredi `table`.
2. Unutar komponente, zamijeniti `table.getState().X` čitanje sa nezavisnom pretplatom, po tipu polja:
   - **Pravi TanStack atomi** (`rowSelection`, `grouping`, `globalFilter`) → `useSelector(table.atoms.X, (s) => s)` iz `@tanstack/react-store` — **prvi put korišten pattern u bazi koda**, treba dodati `@tanstack/react-store` kao eksplicitnu zavisnost u `packages/material-react-table/package.json` (danas je samo tranzitivna).
   - **uiStore polja** (`filters`, `isLoading`, `isSaving` — upravo premješteno u uiStore ovu sesiju) → `useMRT_SliceValue(table._uiStore, (s) => s.X)` — već postojeći, dokazan pattern (20+ mjesta u bazi koda već ga koristi).

Ovo je bezbjedno jer je **potpuno kontejnerizovano po fajlu** — svaki fajl se konvertuje nezavisno, ne dijeli rizik sa ostalima, i ne dira top-level `useTable()` poziv.

**Važna napomena o vrijednosti:** ovo ne zaustavlja RODITELJA (npr. toolbar kontejner) da se re-renderuje — samo zaustavlja SKUP posao unutar konvertovane komponente (Object.values/filter računanje, lokalizacioni string rad, itd.) da se ne ponavlja nepotrebno.

## Svih 11 fajlova — tačno šta se mijenja u svakom

Provjereno čitanjem svakog fajla (props interfejs + trenutni `getState()` poziv):

| Fajl | Props (osim `table`) | `getState()` polje danas | Novi izvor | Memo komparator |
|---|---|---|---|---|
| `MRT_SelectionCountBadge.tsx` | — (samo `table`) | `rowSelection` (pravi atom) | `useSelector(table.atoms.rowSelection)` | `() => true` — nema drugih props-a, nikad se ne re-renderuje zbog props-a |
| `MRT_ToolbarAlertBanner.tsx` | `stackAlertBanner?`, `...AlertProps` | `grouping`, `rowSelection` (oba prava atoma) | `useSelector` za oba | uporediti `stackAlertBanner` + relevantne `AlertProps` |
| `MRT_LinearProgressBar.tsx` | `isTopToolbar`, `...LinearProgressProps` | `isSaving` (uiStore) — već koristi `useMRT_SliceValue` za `showProgressBars` | `useMRT_SliceValue(uiStore, s => s.isSaving)` | uporediti `isTopToolbar` + rest |
| `MRT_ToggleGlobalFilterButton.tsx` | `...IconButtonProps` | `globalFilter` (pravi atom) — već koristi `useMRT_SliceValue` za `showGlobalFilter` | `useSelector(table.atoms.globalFilter)` | uporediti rest `IconButtonProps` |
| `MRT_ToggleAdvancedFiltersButton.tsx` | `...ButtonProps` (bez `children`) | `filters` (uiStore, koristi se samo `.rules.length`) | `useMRT_SliceValue(uiStore, s => s.filters.rules.length)` | uporediti rest `ButtonProps` |
| `MRT_ExpandAllButton.tsx` | `...IconButtonProps` | `isLoading` (uiStore) — već koristi `useMRT_SliceValue` za `density` | `useMRT_SliceValue(uiStore, s => s.isLoading)` | uporediti rest `IconButtonProps` |
| `MRT_ToolbarDropZone.tsx` | `...BoxProps` | `grouping` (pravi atom) — već koristi `useMRT_SliceValue`/`dragStore`/`hoverStore` za 3 druga polja | `useSelector(table.atoms.grouping)` | uporediti rest `BoxProps` |
| `MRT_ActiveFilters.tsx` | — (samo `table`) | `filters` (uiStore, samo `.rules.length > 0`) | `useMRT_SliceValue(uiStore, s => s.filters.rules)` | `() => true` |
| `MRT_QuickFiltersBar.tsx` | — (samo `table`) | `filters` (uiStore, `.pinnedFilters`) | `useMRT_SliceValue(uiStore, s => s.filters.pinnedFilters)` | `() => true` |
| `MRT_ExportsToolbar.tsx` | `availableExports`, `exportState`, `onExportStateChange`, `loadExport` | `rowSelection` (pravi atom) | `useSelector(table.atoms.rowSelection)` | uporediti sva 4 props-a (napomena: `onExportStateChange`/`loadExport` moraju biti stabilni od roditelja — ako roditelj svaki put pravi novu funkciju, memo neće pomoći; provjeriti odvojeno, van scope-a ove izmjene) |
| `ToolbarActions.tsx` | — (samo `table`) | `rowSelection` (pravi atom) | `useSelector(table.atoms.rowSelection)` | `() => true` |

Napomena: 5 fajla (`MRT_ToolbarAlertBanner`, `MRT_LinearProgressBar`, `MRT_ToggleGlobalFilterButton`, `MRT_ExpandAllButton`, `MRT_ToolbarDropZone`) VEĆ djelimično koriste `useMRT_SliceValue` za DRUGA polja (density, showProgressBars, showGlobalFilter, showToolbarDropZone, draggingColumn, hoveredColumn) — memo trenutno ne postoji ni na jednom od njih, pa je taj postojeći slice-read danas efektivno beskoristan (komponenta se ionako re-renderuje iz kaskade). Dodavanjem memo-a, ti postojeći read-ovi POSTAJU korisni.

## Redoslijed rada

**Faza 1 (dokazati pattern, niži rizik):** 4 fajla koja VEĆ djelimično koriste `useMRT_SliceValue` za neka polja (density, showAlertBanner, itd.) ali i dalje čitaju ključno polje preko `getState()`:
- `components/toolbar/MRT_ToolbarAlertBanner.tsx` (grouping, rowSelection)
- `components/toolbar/MRT_LinearProgressBar.tsx` (isSaving)
- `components/buttons/MRT_ExpandAllButton.tsx` (isLoading)
- `components/toolbar/MRT_ToolbarDropZone.tsx` (grouping)

Nakon ovih 4: **profilisati sa React DevTools Profiler-om** (prije/poslije snimak re-render broja na tabeli sa row selection/grouping promjenama) da se pattern empirijski potvrdi prije nastavka — ništa od ovoga još nije mjereno, samo izvedeno iz izvornog koda.

**Faza 2 (ostatak Grupe A, nakon potvrde):**
- `components/toolbar/MRT_SelectionCountBadge.tsx` (rowSelection)
- `components/buttons/MRT_ToggleGlobalFilterButton.tsx` (globalFilter)
- `components/buttons/MRT_ToggleAdvancedFiltersButton.tsx` (filters)
- `components/toolbar/MRT_ActiveFilters.tsx` (filters)
- `components/toolbar/MRT_QuickFiltersBar.tsx` (filters)
- `components/toolbar/MRT_ExportsToolbar.tsx` (rowSelection)
- `components/actions/ToolbarActions.tsx` (rowSelection)

## Otvoreni rizici za provjeriti tokom rada

- Empirijski potvrditi profiler-om da se re-renderi stvarno smanjuju (ništa nije mjereno, samo rezonovano iz izvornog koda).
- Provjeriti da `shallow` compare u `@tanstack/react-store`-u ispravno radi za oblik vrijednosti koje ovdje koristimo (primitivni/niz/objekat).
- Provjeriti da komparator ne promaši ažuriranje kad se atom vrijednost duboko mutira umjesto zamijeni (malo vjerovatno kod TanStack atoma, ali provjeriti).

## Kritični fajlovi

- `packages/material-react-table/src/hooks/useMRT_SliceValue.ts` (postojeći pattern za uiStore)
- `packages/material-react-table/src/components/body/MRT_TableBodyRow.tsx` (referentni memo comparator pattern)
- `packages/material-react-table/src/components/toolbar/MRT_ToolbarAlertBanner.tsx`, `MRT_LinearProgressBar.tsx`, `MRT_ToolbarDropZone.tsx`, `components/buttons/MRT_ExpandAllButton.tsx` (Faza 1)
- `packages/material-react-table/package.json` (dodati `@tanstack/react-store` kao eksplicitnu zavisnost)

## Verifikacija

- Nakon Faze 1: `pnpm --filter=material-react-table typecheck`, `pnpm storybook` manuelna provjera (selection badge, grouping toolbar, loading spinner, expand-all dugme), i React DevTools Profiler prije/poslije poređenje.
- Nakon Faze 2: isto + potvrda da ništa iz Grupe A ne prikazuje zastarjele podatke.

Prva stvar za implementaciju nakon odobrenja: **Faza 1, počevši sa `MRT_ToolbarAlertBanner.tsx`.**
