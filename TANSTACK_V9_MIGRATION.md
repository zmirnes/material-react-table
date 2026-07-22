# Migracija na TanStack Table v9 (beta → stable) — puna migracija

> Status: **Faze 1-5 završene, typecheck potpuno čist (0 grešaka).** Faza 6 (puna verifikacija) djelimično urađena — pauzirana, nastavljamo na sljedećoj fazi/koraku (vidi "Otvoreni rizici" ispod za poznati bug koji treba riješiti kasnije).
> Rad se odvija na trenutnom branch-u i neće se spajati na `v3`/develop dok migracija ne bude potpuno završena i v9 ne izađe kao stable.

## Context

`material-react-table` je izgrađen direktno na TanStack Table v8.20.6. TanStack Table v9 (trenutno `9.0.0-beta.55`) donosi state management preko TanStack Store-a (granularni re-renderi kroz `table.Subscribe`/`table.atoms`), manju memorijsku potrošnju za velike/virtualizovane tabele, tree-shakable feature registraciju (`tableFeatures({...})`), bolju tip-sigurnost, i zvanične devtools. Cilj **nije samo** da biblioteka typecheck-uje i radi protiv v9 API-ja — cilj je **puna migracija**: iskoristiti nove pattern-e (state atoms/Subscribe, tree-shaking, devtools) tamo gdje stvarno donose vrijednost, ne samo mehanički prepisati stare pozive na nove nazive.

Bitan kontekst iz ranije analize ovog repoa: MRT je *već* sam izgradio svoj sistem za granularne re-rendere — tri "slice store-a" (`dragStore`, `hoverStore`, `uiStore` u `hooks/useMRT_TableInstance.ts`) preko `createSliceStore`/`useMRT_SliceValue`, koji efektivno rade ono što v9-ov `atoms`/`table.Subscribe` sada radi zvanično. Puna migracija treba iskoristiti priliku da se taj custom sloj **zamijeni** ili **uskladi** sa zvaničnim TanStack Store mehanizmom (manje custom koda za održavanje, React Compiler-safe po defaultu), a ne da se drži paralelno kao "nešto što smo mi izmislili".

## Ključna arhitekturna odluka: kurirani `tableFeatures()` / `tableOptions()`, ne `stockFeatures`

MRT već danas uslovno uključuje poznat, fiksan skup TanStack feature-a (core, expanded, faceted, filtered, grouped, paginated, sorted row model — vidi `hooks/useMRT_TableOptions.ts:237-259` — plus pinning, sizing/resizing, row selection). Zbog toga:

- Definisati **jedan interni, ne-exportovan** `tableFeatures({...})` objekat (`MRT_TableFeatures`) sa tačno tim feature-ima, i **kompozovati ga kroz `tableOptions()`** (zajedno sa default opcijama i row model factory-ima) na jednom mjestu — ovo je TanStack-ov zvanični način za "definiši jednom, koristi svuda", i prirodno odgovara MRT-ovoj potrebi da svaka `useMRT_TableInstance` instanca dijeli isti feature-set.
- **Ne koristiti puni `createTableHook`** za ovo — njegov `tableComponents`/`cellComponents`/`headerComponents` binding sloj bi se sudarao sa MRT-ovim već postojećim, mnogo razrađenijim sistemom column def-ova i cell renderer-a. `tableOptions()` daje istu korist (dijeljena, tipizirana konfiguracija) bez tog konflikta.
- Koristiti `typeof MRT_TableFeatures` kao **hardkodovani** `TFeatures` generic argument u `types.ts` (`Table<TData>` → `Table<MRT_Features, TData>`, itd.) — **NE** dodavati `TFeatures` kao novi generic na MRT-ove javne tipove (`MRT_ColumnDef<TData>` ostaje `MRT_ColumnDef<TData>`). Non-negotiable: nema breaking change za korisnike biblioteke zbog internog TanStack zahtjeva.
- `stockFeatures` se koristi **samo** kao privremeni alat za spike u Fazi 0, nikad trajno.
- Izlaganje `TFeatures` korisnicima (custom feature registracija preko MRT-a) je eksplicitno van scope-a ove migracije.

## Faze rada

Svaka faza treba da ostavi granu u stanju koje se da typecheck-ovati prije prelaska na sljedeću. Faze 0-6 su "kompatibilnost", Faze 7-10 su "usvajanje novih pattern-a" i rade se tek kad je kompatibilnost stabilna.

### Faza 0 — Bump zavisnosti + spike provjera
- Bump `@tanstack/react-table` na `9.0.0-beta.55` (exact verzija, ne caret).
- Spike: da li slot u `tableFeatures({...})` može ostati uslovno `undefined` (kao danas `getSortedRowModel: enableSorting ? getSortedRowModel() : undefined`, `useMRT_TableOptions.ts:247-259`) ili v9 tip-level prerequisite check to sprječava. Određuje dizajn Faze 2.
- `pnpm --filter=material-react-table typecheck` + `test:run` za baseline.

### Faza 1 — Mehanička preimenovanja
- `sortingFn` → `sortFn` (18 pogodaka)
- Column pinning `left/right` → `start/end` (16 pogodaka)
- `enablePinning` → `enableColumnPinning`/`enableRowPinning` (2 pogotka)
- `onStateChange` uklanjanje (1 pogodak)
- `.getState()` → `table.state` (13 pogodaka) — **napomena:** ovo je i prilika da se odmah razmisli da li dati poziv treba `table.state` (puni default selector, V8-like) ili bi trebalo postati `table.Subscribe`/`table.atoms.X` poziv — obilježiti kandidate za Fazu 7, ali u ovoj fazi samo mehanički zamijeniti da build radi.
- `columnSizingInfo` → `columnResizing` (9 pogodaka, uklj. `_uiStore` slice)

### Faza 2 — Row model / `tableFeatures()` + `tableOptions()` registracija
Konvertovati uslovni spread row modela (`useMRT_TableOptions.ts:237-259`) i `useReactTable` poziv (`useMRT_TableInstance.ts:524`, postaje `useTable`) u `tableFeatures({...})` + `tableOptions({...})` registraciju, prema rezultatu Faze 0 spike-a. Ovdje se uvodi `MRT_TableFeatures`/`MRT_Features`.

### Faza 3 — Aggregation split
`aggregationFn`/`aggregatedCell`/`getAggregationValue`/`getIsAggregated` (27 pogodaka) → `rowAggregationFeature`, custom aggregation fn-ovi → `constructAggregationFn({aggregate, merge?})`, `getAggregationValue({rows, maxDepth})` potpis.

### Faza 4 — `types.ts` generic threading + `ColumnMeta` augmentacija
~6-7 wrapper tipova (`MRT_TableInstance`, `MRT_Column`, `MRT_Header`, `MRT_HeaderGroup`, `MRT_Row`, `MRT_Cell`, + `ColumnDef`/`AggregationFn`/`SortingFn`/`FilterFn`) provuku `MRT_Features` kao hardkodovani prvi generic. `declare module ColumnMeta` u `tanstack-table.ts` isto.

### Faza 5 — Fn registry migracija + tree-shaking
Prebaciti `MRT_SortingFns`/`MRT_AggregationFns`/`MRT_FilterFns` (`fns/*.ts`) na `tableFeatures()` `sortFns`/`filterFns`/`aggregationFns` slotove. **Novo u punoj migraciji:** gdje god je razumno, koristiti pojedinačne `filterFn_*`/`sortFn_*`/`aggregationFn_*` imenovane importe umjesto spread-a cijelog TanStack registry-ja (`fns/filterFns.ts` danas radi `{...filterFns, contains, ...}` — zamijeniti `filterFns` spread pojedinačnim `filterFn_*` importima za manji bundle), pošto MRT i dalje treba gotovo sve, ali precizni importi rade bolji tree-shaking i jasnije signaliziraju koje built-in fn-ove MRT stvarno koristi.

### Faza 6 — Kompatibilnost: puna verifikacija
`typecheck`, `test:run`, `pnpm storybook` manuelni prolaz (sorting/pinning/resizing/aggregation/grouping). Ovo je checkpoint prije prelaska na Faze 7-10.

### Faza 7 — Usvajanje `table.Subscribe`/`table.atoms` za MRT-ov registrovani state
Za state koji TanStack v9 sada nativno prati (sorting, pagination, columnFilters, grouping, columnOrder, rowSelection, itd. — MRT-ovih trenutnih 8 "pravih" `useState` polja iz `useMRT_TableInstance.ts`): identifikovati komponente koje danas čitaju `table.getState().X` (Faza 1 kandidati) ili primaju cijeli `table` prop samo da pročitaju jedan dio state-a (npr. toolbar, paginacija, selection count), i prevesti ih na `useSelector(table.atoms.X)` ili `table.Subscribe` gdje to realno smanjuje re-render površinu. Odlučiti default selector na `useTable(options, selector)` nivou — da li top-level `table` i dalje selektuje puni state (V8-like, sigurnije za ovu fazu) ili se svjesno suzuje uz eksplicitne `table.Subscribe` niže u stablu.

### Faza 8 — Uskladiti MRT-ove custom slice store-ove sa v9 external atoms
Evaluirati zamjenu MRT-ovog `createSliceStore`/`useMRT_SliceValue` (koji već radi `useSyncExternalStore` + selector za `dragStore`/`hoverStore`/`uiStore`) sa v9-ovim zvaničnim `useCreateAtom` + `atoms` option (external atoms iz `@tanstack/react-store`). Cilj: manje custom koda, isti ili bolji granularni re-render efekat, zvanično podržan put koji radi sa React Compilerom. Ovo je interna implementaciona izmjena — javni MRT API (npr. `table._uiStore`, `useMRT_SliceValue`) ostaje kompatibilan ili se svjesno i eksplicitno mijenja uz jasnu odluku (ne slučajno).

### Faza 9 — Devtools integracija
Dodati opcionalnu, dev-only integraciju sa `@tanstack/react-table-devtools` (`useTanStackTableDevtools`) — vjerovatno kroz novu MRT table opciju (npr. `enableDevtools` ili slično) koja mount-uje devtools panel kad je uključena, koristeći dev-only entry point da se ništa ne shipa u produkciju bez eksplicitnog opt-in-a.

### Faza 10 — Finalna verifikacija pune migracije
`typecheck`, `test:run`, `pnpm storybook` — potvrditi da su render-optimizacije iz Faza 7-8 stvarno smanjile re-rendere (React DevTools Profiler prije/poslije na jednoj većoj tabeli sa sortiranjem/paginacijom/selekcijom), i da devtools panel iz Faze 9 radi.

## Proces za praćenje budućih beta izdanja

1. Bump pinovane verzije; ponovo pokrenuti isti set grep komandi iz Faza 1/3/5 plus provjeru generic parametara na tanstack tipovima u odnosu na prethodnu betu.
2. Pročitati samo changelog napomenu te bete.
3. `typecheck` + `test:run`; popraviti samo ono što stvarno pukne.
4. Dopuniti ovaj fajl (sekcija "Log beta izdanja" ispod) — jedan fajl, ne novi po beti.

## Log beta izdanja

| Datum | Beta verzija | Šta je puklo / promijenjeno | Faza |
|---|---|---|---|
| 2026-07-22 | 9.0.0-beta.55 | Plan kreiran, migracija još nije počela | — |
| 2026-07-22 | 9.0.0-beta.55 | `sortingFn` → `sortFn` (column def + `MRT_SortingFn`), baseline typecheck 518 grešaka | Faza 1 (dio) |
| 2026-07-22 | 9.0.0-beta.55 | Kreiran `mrtTableFeatures.ts` (kurirani `MRT_TableFeatures`/`MRT_Features`), `TFeatures` provučen kroz sve wrapper tipove u `types.ts` + `ColumnMeta` u `tanstack-table.ts` + `fns/*.ts`/`column.utils.ts`/`MRT_TableBodyRowPinButton.tsx`. Typecheck 518→83 grešaka. | Faza 4 |
| 2026-07-22 | 9.0.0-beta.55 | `createRow`→`constructRow`, `get*RowModel` uklonjeni iz `useMRT_TableOptions.ts` (sad dolaze isključivo iz `features: MRT_TableFeatures` na `useTable()` pozivu), `table.getState()` bridge popravljen da čita `table.store.state` (rješava runtime pucanja "originalGetState is not a function" i "reading 'pinnedFilters'"/"reading 'length'" u Storybook-u). | Faza 2 |
| 2026-07-22 | 9.0.0-beta.55 | Column pinning `left/right`→`start/end` kompletno (src + stories) — ovo je bio pravi uzrok Storybook pucanja u `table_getHeaderGroups` (TanStack destrukturira `{start,end}`, MRT je i dalje gradio `{left,right}`). `columnSizingInfo`→`columnResizing` wiring (`onColumnResizingChange`/`table.setColumnResizing`), polje `columnSizingInfo` eksplicitno dodano na `MRT_TableState` (javno ime ostaje isto). Typecheck 26→15 grešaka. **Faza 1 potpuno završena.** | Faza 1 |
| 2026-07-22 | 9.0.0-beta.55 | `getPrePaginationRowModel`/`getPaginationRowModel` → `getPrePaginatedRowModel`/`getPaginatedRowModel` (types.ts, row.utils.ts, useMRT_Effects.ts) — v9 preimenovao ove dvije metode da prate isti adjective-oblik kao `getSortedRowModel`/`getFilteredRowModel`/itd. **Važna napomena:** `useTable()` poziv se kastuje sa `as MRT_TableInstance<TData>`, pa `tsc` NE hvata ovakve rename-ove metoda koje MRT sam redeklariše u svom tipu — ovo se vidi samo u runtime-u. Provjereni svi ostali `*RowModel` getter pozivi u src/ protiv stvarnog v9 API-ja (`table_get*` iz static-functions exporta) — ostali su ispravni. | Faza 2 |
| 2026-07-22 | 9.0.0-beta.55 | Aggregation: v9 `columnDef.aggregationFn` sad očekuje objekat `{aggregate, merge?}` (`AggregationFnDef`), ne callable. `column.utils.ts` sad rezolvira MRT-ov javni oblik (string ime, plain `(columnId, leafRows, childRows) => any` callable, ili niz oba) u pravi `AggregationFnDef` prije nego što stigne do `useTable()` — MRT-ov javni column-def API ostaje nepromijenjen. Niz od više aggregation imena (`aggregationFn: ['min','max']`) i dalje vraća niz rezultata (MRT-ova konvencija), ne TanStack-ov novi keyed-object oblik. `MRT_TableOptions.aggregationFns` tip proširen da prihvati i `AggregationFnDef` (v9 built-in) i `MRT_AggregationFn` (MRT custom). Potvrđeno da MRT nigdje sam ne zove `getAggregationFn(s)`/`getAggregationValue` — oslanja se na `cell.renderValue()`, pa nema skrivenih runtime zamki. Typecheck 15→9 grešaka. **Faza 3 završena.** | Faza 3 |
| 2026-07-22 | 9.0.0-beta.55 | Fn registry tree-shaking: `fns/sortingFns.ts`/`fns/filterFns.ts`/`fns/aggregationFns.ts` više ne spreadaju cijeli `sortFns`/`filterFns`/`aggregationFns` (v9 ih označava kao `@deprecated` u korist pojedinačnih `*Fn_*` importa) — sad importuju samo pojedinačna imena. Kod `filterFns` ovo je i stvarna ušteda: MRT svojim custom implementacijama prepisuje 7 od 18 built-in ključeva (`between`, `betweenInclusive`, `empty`, `endsWith`, `equals`, `notEmpty`, `startsWith`), pa se sad uvozi samo 11 built-in `filterFn_*` koji stvarno prežive (ranije se svih 18 uvlačilo u bundle uzalud). Kod `sortingFns`/`aggregationFns` nema promjene u skupu ključeva (MRT koristi sve), samo eksplicitniji importi. **Namjerno preskočeno:** registracija u `tableFeatures().sortFns/filterFns/aggregationFns` slotove — MRT nikad ne pušta string-key kroz do TanStack-a (uvijek sam rezolvira na pravu funkciju/objekat u `column.utils.ts` prije `useTable()`), pa bi ta registracija bila mrtva konfiguracija. Typecheck ostaje 9 grešaka (bez regresije). **Faza 5 završena.** | Faza 5 |

## Otvoreni rizici / za potvrditi tokom rada

- Ponašanje uslovno-`undefined` row-model slota pod `tableFeatures()` (Faza 0 spike — blokira Fazu 2).
- Da li `constructAggregationFn` potpis dalje mijenja prije stable-a.
- Da li potpuna zamjena custom slice store-ova (Faza 8) vrijedi rizika u odnosu na to da ostanu kako jesu (već rade dobro) — odluka se donosi nakon Faze 7 na osnovu stvarno izmjerenog dobitka.
- `TFeatures` se eksplicitno NE izlaže kao novi generic na MRT javnim tipovima — van scope-a.
- **Novo (nakon Faze 4):** `aggregationFns`/`filterFns`/`sortingFns` kao **per-instance table opcije** (npr. `<MaterialReactTable filterFns={{...}} .../>`, koristi se u par storyja) više ne postoje na v9 `TableOptions` tipu — v9 zahtijeva da se ti registry-ji definišu STATIČKI kroz `tableFeatures()` (dijeljeno za sve tabele koje koriste taj features-objekat), ne po instanci. Ovo je sudar MRT-ovog trenutnog javnog API-ja (custom filter/sort/aggregation fn po tabeli) sa v9-ovim static-registration modelom — treba odluka u Fazi 5 (npr. da li MRT održava sopstveni per-instance lookup sloj iznad tableFeatures-a).
- **NEREŠENO — poznati bug (otkriven u Fazi 6, Storybook manuelna provjera):** `Features/Server Table` → `Basic` story, nakon što se `loadConfig()`/`loadData()` (simulirani async delay) prvi put razriješe i `MaterialReactServerTableInstance` se prvi put montira, konzola baca `Cannot update a component (MaterialReactServerTableInstance) while rendering a different component (MaterialReactServerTableInstance)` sa stack-om koji počinje na `useMRT_TableInstance.ts:526` (poziv `useTable({...})`), praćeno "Uncaught" greškom — stranica djeluje kao da upadne u render loop. Radna hipoteza (nije empirijski potvrđena): `useTable()` (iz `@tanstack/react-table` v9) na SVAKI render sinhrono zove `table.setOptions(...)` → `table_syncExternalStateToBaseAtoms(table)`, koji iterira `table.options.state` i za svaki key gdje je `externalState !== baseAtom.get()` (REFERENCE provjera, ne deep-equal) odmah radi `baseAtom.set(...)` — ovo je sinhrona mutacija reaktivnog store-a **usred rendera**, što u kombinaciji sa React Strict Mode-om (Storybook ga vjerovatno koristi) može proizvesti upravo ovakvo upozorenje/pucanje ako se bilo koja vrijednost u `state` objektu (koji `useMRT_TableInstance.ts` i `MaterialReactServerTableInstance.tsx:199` grade iznova svaki render: `{showSkeletons: isLoading, ...tableState}`) pokaže kao "različita referenca" na neočekivan način. Nije jasno da li je specifično za Server Table flow (dvostruko upravljano stanje: MRT-ov interni `useState` + `useServerTableState`-ov sopstveni) ili opštiji v9 problem sa "state + onChange" kontrolisanim mustrom (dokumentacija eksplicitno preporučuje `atoms` opciju umjesto ovoga za v9 kod — Faza 7/8 bi ovo moglo riješiti usput). **Odgođeno po korisnikovom zahtjevu — riješiti prije nego se migracija proglasi gotovom, prije spajanja na `v3`.**
- `RowSelectionState` u v9 zahtijeva `Record<string, true>` (samo `true`, ne `boolean`) — pogađa par mjesta koja danas rade `Record<string, boolean>` (Faza 1/5 sitna stavka, novootkriveno).
- `AggregationFnDef` (v9) je objekat (`{aggregate, merge?}`), ne callable — MRT-ov `fns/aggregationFns.ts`/`column.utils.ts` i dalje tretiraju aggregation fn-ove kao callable (namjerno, privremeno, dok se ne uradi Faza 3).

## Faza 7 — scoping izvještaj (bez izmjena koda)

`grep` za `getState()`/`getState,` (destrukturirano ili direktno) kroz `src/` (bez testova) pogađa **~40 fajlova**. Puna konverzija svih na `table.Subscribe`/`useSelector(table.atoms.X)` bi bio veliki, rizičan refactor — ovo je popis sa procjenom dobiti/rizika po grupi, da se odluka o implementaciji može donijeti kasnije bez ponovnog istraživanja.

### Grupa A — mali, izolovani toolbar/status widgeti (najveća dobit, najmanji rizik)
Ovo su tačno komponente iz TanStack primjera u dokumentaciji ("row selection changes should not have to re-render your pagination controls"). Svaka čita 1 malo polje, renderuje se JEDNOM (ne po redu/ćeliji), i lako se izoluje u `table.Subscribe` bez dodirivanja ičega drugog:
- `components/toolbar/MRT_SelectionCountBadge.tsx` → `rowSelection`
- `components/toolbar/MRT_ToolbarAlertBanner.tsx` → `grouping`, `rowSelection`
- `components/toolbar/MRT_LinearProgressBar.tsx` → `isSaving`
- `components/buttons/MRT_ToggleGlobalFilterButton.tsx` → `globalFilter`
- `components/buttons/MRT_ToggleAdvancedFiltersButton.tsx` → `filters`
- `components/buttons/MRT_ExpandAllButton.tsx` → `isLoading`
- `components/toolbar/MRT_ToolbarDropZone.tsx` → `grouping`
- `components/toolbar/MRT_ActiveFilters.tsx` → `filters`
- `components/toolbar/MRT_QuickFiltersBar.tsx` → `filters`
- `components/toolbar/MRT_ExportsToolbar.tsx` → `rowSelection`
- `components/actions/ToolbarActions.tsx` → `rowSelection`

### Grupa B — srednji widgeti, i dalje jednom po tabeli, ali osjetljiviji na tajming (typing, paginacija)
- `components/inputs/MRT_GlobalFilterTextField.tsx` → `globalFilter` (re-render na svaki taster tokom kucanja — realan kandidat)
- `components/toolbar/MRT_TablePagination.tsx` → paginacija (dokumentacijski "flagship" primjer za `table.Subscribe`)
- `components/table/MRT_Table.tsx` → `columnSizing`, `columnVisibility`, `density`
- `components/table/MRT_TableContainer.tsx` → `creatingRow`, `isLoading`, `showLoadingOverlay`

### Grupa C — meniji/modali (rijetko otvoreni, niska prioritet uprkos "izolovanosti")
- `components/modals/MRT_EditRowModal.tsx`, `components/inputs/MRT_SelectAllMenu.tsx`, `components/menus/MRT_FilterOptionMenu.tsx`, `components/menus/MRT_ColumnActionMenu.tsx`, `components/menus/MRT_ShowHideColumnsMenu.tsx`, `components/buttons/MRT_EditActionButtons.tsx` — dobit zanemarljiva jer se ionako renderuju rijetko/na zahtjev.

### Grupa D — per-row / per-cell komponente (najveći teorijski dobitak, najveći rizik)
Ovo je mjesto gdje bi granularni re-render najviše značio (množe se sa brojem vidljivih redova/ćelija), ali:
- Već postoji `memoMode`-gated memoizacija (`Memo_MRT_TableBodyRow`/`Memo_MRT_TableBodyCell`, vidi raniju analizu u ovoj konverzaciji) čiji komparatori namjerno ignorišu `table` referencu — svaka promjena ovdje mora se uskladiti sa tim postojećim mehanizmom, ne raditi mimo njega.
- Zahtijeva vizuelno testiranje (Storybook) da se potvrdi da editing/selection/pinning i dalje rade ispravno — nije sigurno za "slijepu" konverziju.

Fajlovi: `components/body/MRT_TableBodyRow.tsx` (`rowPinning`), `components/body/MRT_TableBodyCell.tsx` (`creatingRow`, `isLoading`, `showSkeletons`), `components/body/MRT_TableBodyCellValue.tsx` (`globalFilter`, `globalFilterFn`), `components/head/MRT_TableHeadCell.tsx` (`grouping`), `components/head/MRT_TableHeadCellSortLabel.tsx` (`isLoading`, `showSkeletons`, `sorting`), `components/head/MRT_TableHeadCellGrabHandle.tsx` (`columnOrder`), `components/inputs/MRT_SelectCheckbox.tsx` (`isLoading`), `components/inputs/MRT_EditCellTextField.tsx` (`creatingRow`), `components/buttons/MRT_ToggleRowActionMenuButton.tsx` (`creatingRow`), `components/body/MRT_TableDetailPanel.tsx` (`isLoading`), `utils/style.utils.ts` (`columnPinning.start/end` — poziva se PO ćeliji za pinning stilove, potencijalno vrijedno ali je plain funkcija ne komponenta).

### Grupa E — hookovi/utili gdje "Subscribe" nije prirodan fit
Ovo NISU render boundary-ji nego funkcije/hookovi pozvani iz drugog koda — konverzija bi značila redizajn poziva, ne samo `<table.Subscribe>` wrap:
- `hooks/useMRT_Rows.ts` — čita 6 polja (`creatingRow, expanded, globalFilter, pagination, rowPinning, sorting`) kao `useMemo` deps za centralni `rows` niz — **ovo je već ispravno dizajnirano** (legitimno zavisi od svih tih polja), nije over-subscribing, niska prioritet za promjenu.
- `hooks/useMRT_Effects.ts` — sam pokreće re-render preko internog `useReducer`, arhitekturno drugačiji slučaj.
- `hooks/useMRT_ColumnVirtualizer.ts`, `hooks/useMRT_RowVirtualizer.ts` — feed virtuelizaciju, promjena ovdje utiče na recalculation timing.
- `components/advanced-filters/useMRT_AdvancedFiltersDraft.ts`, `utils/row.utils.ts` (`getMRT_Rows`, `handleRowSelectionClick`, itd.) — utility funkcije pozvane sa raznih mjesta, ne samostalni render boundary.
- `utils/actions/createExportAction.tsx` → `activeExports` (5x) — export flow, niska učestalost.

### Isključeno iz scope-a
- `components/MaterialReactServerTableInstance.tsx:236` — `tableInstance.getState()` se poziva UNUTAR `loadData()` async callback-a, ne u render putanji — čisto čitanje trenutnog stanja za fetch poziv, nema veze sa re-renderima.

### Preporuka za kad se bude implementiralo
Početi sa **Grupom A** (11 fajlova, nizak rizik, jasna dobit, direktno prati dokumentacijski primjer) kao prvi manji PR da se dokaže pattern i izmjeri stvarni efekat (React DevTools Profiler prije/poslije), prije razmatranja Grupe B/D.

## Kritični fajlovi

- `packages/material-react-table/src/hooks/useMRT_TableInstance.ts`
- `packages/material-react-table/src/hooks/useMRT_TableOptions.ts`
- `packages/material-react-table/src/utils/mrtStore.ts`, `hooks/useMRT_SliceValue.ts` (Faza 8)
- `packages/material-react-table/src/types.ts`
- `packages/material-react-table/src/tanstack-table.ts`
- `packages/material-react-table/src/fns/sortingFns.ts`, `fns/aggregationFns.ts`, `fns/filterFns.ts`
- `packages/material-react-table/package.json`
- `packages/material-react-table/src/tests/**` (regresija, npr. `tests/hooks/useServerTableState/sorting.test.ts`)

## Verifikacija

Nakon svake faze: `typecheck` + `test:run`.
Nakon Faza 2, 3, 6, 10 dodatno: `pnpm storybook` manuelna provjera.
Nakon Faze 7-8 dodatno: React DevTools Profiler prije/poslije poređenje na tabeli sa sortiranjem/paginacijom/selekcijom da se potvrdi stvarni render-optimizacioni dobitak.

Prva faza koja se implementira nakon odobrenja plana: **Faza 0** (bump + spike + baseline).
