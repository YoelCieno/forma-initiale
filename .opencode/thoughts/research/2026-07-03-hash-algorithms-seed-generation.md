# Hash Algorithms & Seed Generation — Living Reference

## Purpose
Reference for algorithm selection + implementation semantics in forma-initiale. Update this file when shipping any new algorithm. Source of truth for decisions, not just hashes.

## Repo context (evidence)
- `packages/infra/src/adapters/get-product-image.adapter.ts` — djb2-variant hash of productId → loremflickr `?seed=` (committed `git:950bfae`). This is the real-world instance that triggered this doc.
- Purpose: deterministic, stable image URL per product (same product → same seed → same image). `?random=` gives new image each request (no persistence). Original motivation documented in commit `950bfae` and plan `.opencode/plans/core-foundation/phase-3/3.5-integration-plus-pipeline.md` ("stable image URL caching — deterministic seed per product").

## djb2 family
- Canonical (Bernstein 1991): seed 5381, `hash = hash*33 + c` per char/byte.
- Our variant: seed 0, `hash = (hash << 5) + charCodeAt(i)` (= hash*32), `>>> 0` mask (git:950bfae).
- JS bitwise: `<<`/`+` are Int32; overflow → negative. `>>> 0` = unsigned 32-bit → non-negative seed, required for URL/query-param consumers.
- `charCodeAt` = UTF-16 code unit, not byte. Fine for ASCII IDs, differs for non-ASCII.
- Uses: tiny deterministic strings, seed generation, no adversarial input. NOT collision-free (any 32-bit hash collides eventually) — use "collision-resistant" wording.
- KISS: djb2 or FNV-1a enough for seeds; crypto (SHA/MD5) overkill unless adversarial or security-sensitive.

## FNV-1a (recommended upgrade path for reusable seed helpers)
- Offset basis 0x811c9dc5, prime 0x01000193: `hash = offset; hash ^= byte; hash *= prime`.
- Better distribution than djb2 for short strings; standard; ~same cost. Default pick for a future `hashStringToSeed(seed)` helper in packages/infra.
- Needs same `>>> 0` masking for non-negative JS output.

## CRC32
- Good distribution + error-detection strength; heavier than FNV/djb2. Overkill for seed generation; useful when collision-resistance genuinely matters.

## Cryptographic (SHA/MD5)
- Only when input adversarial (user-controlled, collision attacks matter) or security context. Too slow + unnecessary for deterministic seeds.
- Note: even crypto hashes need truncation to fit URL/seed spaces; still not "collision-free" in truncated space.

## Selection matrix (decision shortcut)
| Need | Pick |
|---|---|
| Deterministic tiny-string seed | djb2 (or FNV-1a) |
| Better distribution, reusable helper | FNV-1a |
| Collision-resistance matters | CRC32 |
| Adversarial/security input | SHA-2 family (truncated) |

## Implementation rules (apply to any shipped algorithm)
1. Verify against canonical spec before adopting (seed/offset/prime constants).
2. Document deviations intentionally — variant constants are fine if named + commented.
3. JS bitwise: know Int32 vs Uint32 (`>>> 0`); match consumer's domain (non-negative for URLs).
4. Character encoding: state bytes vs UTF-16 units in the comment.
5. Claim "collision-resistant", never "collision-free", for non-crypto 32-bit hashes.
6. Comments must reflect actual implementation.
7. SINE — minimal fit, no over-engineering.

## Log (append each time you ship an algorithm)
- 2026-08-07: djb2-variant reviewed (get-product-image.adapter.ts). Lesson encoded. FNV-1a noted as default upgrade for reusable seed helpers. — `git:950bfae`, review by conductor agent.