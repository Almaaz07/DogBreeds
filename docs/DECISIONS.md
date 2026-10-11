# Technical Decisions & Rationale

## 1. State Management: Redux Toolkit (RTK)

### Context & Alternatives
Options considered: **Redux Toolkit (RTK)**, **Zustand**, **Jotai**, and **Context + useReducer**.

### Rationale
- **Predictable Unidirectional Data Flow:** Redux Toolkit standardizes state mutations via immutable reducers powered by Immer, eliminating mutation bugs.
- **Async Thunk Pipeline:** `createAsyncThunk` handles loading, success, and error lifecycles (`pending`, `fulfilled`, `rejected`) in an explicit, deterministic flow for pagination, offline sync, and storage persistence.
- **Normalized Slices:** The `breedsSlice` cleanly partitions domain records (`breedsById`, `groupsById`) from volatile UI filter states.
- **Developer Experience & Tooling:** Industry standard architecture that scales cleanly with enterprise React Native codebases.

---

## 2. Local Persistence: SQLite Database

### Context & Alternatives
Options considered: **SQLite** (`react-native-sqlite-storage`), **AsyncStorage**, and **WatermelonDB**.

### Rationale
- **Fine-Grained Row Operations & Low RAM Footprint:** Unlike key-value stores that require serializing/deserializing entire JSON blobs into JavaScript heap memory on every write, SQLite uses native C/C++ engine storage with indexed tables (`breeds`, `breed_groups`, `favorites`, `app_metadata`, `image_cache`).
- **Targeted Batch & Single-Row Updates:** When fetching next pages or toggling single favorites, SQLite updates specific rows (`INSERT OR REPLACE` / `DELETE`) rather than rewriting large JSON structures to disk.
- **Image Cache & Index Management:** Image access logs and eviction thresholds are managed through indexed SQLite queries, minimizing garbage collection pressure.

---

## 3. Row Complexity & 60fps Scrolling Trade-Offs

### Problem Statement
Each of the 283 breed rows in the explorer is significantly heavier than a standard tabular row. Each item carries:
- 11 numeric traits + temperament strings
- Physical measurements (life span, weight, height ranges for both male and female)
- Origin metadata and kennel club recognitions
- Up to 9 image objects with multiple URL variants and attribution fields

### Architectural Trade-Off
Instead of rendering all nested metrics directly in list cards, we partitioned the view hierarchy:
1. **List Level (`BreedCard`):** Displays derived size badge, primary thumbnail (`thumb` variant), life span, and top 3 temperament tags. The card is wrapped in `React.memo` with a pure layout.
2. **Detail Level (`BreedDetailScreen`):** Loads full trait meters, complete physical statistics, historical origins, and full-resolution swipeable galleries across 3 segmented tabs.
3. **Virtualized Rendering:** Using `FlatList` with `windowSize={7}`, `maxToRenderPerBatch={10}`, `initialNumToRender={10}`, and `removeClippedSubviews={true}` preserves a steady 60fps frame rate without frame dropping during fast scrolls.

---

## 4. Tiered Image Caching & Memory Constraints

### Strategy
Each dog breed contains up to 9 images with thumbnail, medium, and large variants. To keep memory usage strictly under 150MB:
- **List Thumbnails:** Exclusively requests the `thumb` variant (~30KB), keeping the entire list rendering budget under 9MB of image cache.
- **Detail Screen Header:** Requests the `medium` variant (~150KB).
- **Gallery & Full Screen Viewer:** Loads `large` variants (~450KB) on demand.
- **LRU Eviction:** The `ImageCacheManager` maintains an access index with a 50MB disk limit and evicts the oldest items when exceeding the threshold.

---

## 5. Offline Sync Strategy & Network Resilience

- **Cold Start:** App reads from local SQLite database immediately; UI renders cached state without waiting for network responses.
- **Background Refresh:** Once initialized, NetInfo verifies reachability and checks for upstream updates via Redux async thunks.
- **Exponential Backoff:** Transient network drops retry up to 3 times with exponential backoff (600ms, 1200ms, 2400ms).
- **Graceful Error Handling:** If network sync fails, existing cached data remains visible while an `ErrorBanner` informs the user of sync status with a manual retry option.
