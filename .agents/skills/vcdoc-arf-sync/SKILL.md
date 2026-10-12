---
name: vcdoc-arf-sync
description: >
  How to sync Thai VC ARF content from vc-document into the vcdoc Docusaurus
  site. Covers the directory layout (docs/thai-vc-arf + docs/en/thai-vc-arf,
  which replaced the old docs/trust-guide) and the required HTML->MDX comment
  conversion. Use when importing/copying ARF markdown from vc-document, when a
  sync reintroduces raw HTML comments or a duplicate docs/th/thai-vc-arf/, or
  when the build fails with MDX "Unexpected character `!`" errors.
license: MIT
---

# vcdoc ARF sync & format conversion

The vcdoc site (this repo) publishes the Thai VC ARF. The canonical source of
truth is the `vc-document` repo. Content is copied from vc-document into this
repo, but vc-document's files are NOT Docusaurus-ready as-is: they use a
different directory layout and raw HTML comments. Both must be fixed on import.

## Directory layout

vcdoc is a SINGLE-locale site (`defaultLocale: 'th'`, `locales: ['th']`,
`routeBasePath: '/'`). Thai content lives FLAT at the docs root.

English is still SUPPORTED — but as a literal `docs/en/thai-vc-arf/` folder
served under `/en/`, not as a Docusaurus i18n locale. It holds a one-page
English summary (not a full translation), linked from the navbar
("VC stack (EN)" -> `/en/thai-vc-arf/minimal-interoperability-reference`).
Never delete `docs/en/` when working on the single-locale layout:

```
docs/
  thai-vc-arf/                   # Thai chapters (22 .md files + images/)
    _category_.json              # label + link.slug "/"  (homepage = Thai index)
    00-minimal-interoperability-reference.md
    ... (chapters 1-16)
    images/
  en/
    _category_.json
    thai-vc-arf/
      _category_.json
      00-minimal-interoperability-reference.md
```

vc-document uses a locale-prefixed layout (`docs/th/thai-vc-arf/` and
`docs/en/thai-vc-arf/`). The sync must STRIP the `th/` prefix for Thai content:

- `vc-document/th/thai-vc-arf/*`  ->  `docs/thai-vc-arf/*`   (drop the `th/`)
- `vc-document/en/thai-vc-arf/*`  ->  `docs/en/thai-vc-arf/*` (keep the `en/`)

### Directory rename: trust-guide -> thai-vc-arf

- The OLD content directory was `docs/trust-guide/` (the original Trust
  Framework manual). It is gone — replaced by `thai-vc-arf`.
- vc-document still versions the legacy trust-guide as
  `versioned_docs/version-2026-09/trust-guide/`. vcdoc does NOT use Docusaurus
  versioning — never copy `versioned_docs/`, `versioned_sidebars/`,
  `versions.json`, `i18n/`, or vc-document's `src/theme/` swizzles into vcdoc.

### Forbidden: the locale-prefixed duplicate

Do NOT create `docs/th/thai-vc-arf/`. vc-document keeps Thai under a `th/`
locale prefix; vcdoc does not. Copying that path as-is produces a duplicate of
every Thai file (the exact bloat this skill exists to prevent). The canonical
Thai path in THIS repo is `docs/thai-vc-arf/`.

## Format conversion (required for the build)

vc-document files use HTML comments; Docusaurus MDX cannot compile them, and
the build fails with:

```
MDX compilation failed ... Unexpected character `!` (U+0021) before name
```

Two changes are needed on import:

1. Convert top-level HTML comments `<!-- ... -->` to MDX comments `{/* ... */}`.
2. Add frontmatter to Thai `.md` files (the English file gets NO frontmatter):

```
---
description: "<H1 text> — Thai VC ARF 2.0 DRAFT 0"
---
```

The `description` is the file's first `# ` heading plus the suffix
` — Thai VC ARF 2.0 DRAFT 0`. Exception: `README.md` uses the fixed value
`Thai VC ARF — 2.0 DRAFT 0 — Thai VC ARF 2.0 DRAFT 0`.

### Comment conversion rules (must be exact)

Convert ONLY top-level comments. Comments do not nest; a `<!-- ... -->` that
appears INSIDE an outer comment is literal text and must stay as `<!-- ... -->`.

Do NOT touch:

- Mermaid sequence arrows `-->>` (they contain `-->` as a prefix substring).
- Flow text such as `P1 --> P2 --> P3`.
- Literal comment examples inside comments, e.g. the README bullet
  `` `<!-- pdf page N -->` ``.

Reference implementation (balanced, non-nested):

```python
def convert_comments(text):
    depth = 0
    out, i = [], 0
    while i < len(text):
        if text.startswith('<!--', i):
            out.append('{/*' if depth == 0 else '<!--')
            depth += 1
            i += 4
        elif text.startswith('-->', i):
            out.append('*/}' if depth == 1 else '-->')
            depth = max(0, depth - 1)
            i += 3
        else:
            out.append(text[i])
            i += 1
    assert depth == 0, 'unbalanced comments'
    return ''.join(out)
```

Then for Thai files: `'---\ndescription: "{desc}"\n---\n\n' + convert_comments(raw)`.
For the English file: `convert_comments(raw)` only (no frontmatter).

## Verification

After any sync or format change, confirm:

```
npm run build       # must exit 0
npm run typecheck   # must exit 0
```

- Homepage `/` must serve the Thai index titled "Thai VC ARF — 2.0 DRAFT 0".
- Thai docs must be at `/thai-vc-arf/...` (NOT `/th/thai-vc-arf/...`).
- Broken-link/anchors warnings are EXPECTED: the ARF markdown references
  vc-document-only files (`../research/*`, `../policy/*`, `../public-site/*`,
  `../../00-glossary.md`) that are not present here. The config intentionally
  uses `onBrokenLinks: 'warn'`.

## Known gotchas

- A prior sync did two things wrong: it copied content to BOTH
  `docs/th/thai-vc-arf/` and `docs/thai-vc-arf/`, AND it overwrote converted
  files with raw HTML-comment versions. Check for both after every sync.
- `grep -c '-->'` over-counts: mermaid `-->>` arrows contain `-->`. Use the
  balanced converter above, not a naive string replace.
