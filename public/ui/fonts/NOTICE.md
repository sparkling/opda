# Font licences and provenance

The live OPDA design system self-hosts its typography. Browser fallbacks and
current family roles are defined in `design-tokens.css`.

## Source Sans 3

- Use: interface text, controls and non-display headings, unchanged from the Google-hosted face.
- Files: variable WOFF2, upright weights 400–700; all seven provider script subsets retained.
- Source: Google Fonts `sourcesans3` v19, retrieved 2026-09-10 from the CSS2 API.
- Request: `family=Source+Sans+3:wght@400..700&display=swap`.
- Project: https://github.com/adobe-fonts/source-sans
- Copyright 2010–2020 Adobe; Reserved Font Name “Source”.
- Licence: SIL Open Font License 1.1; full notice in `SourceSans3-OFL.txt`.
- No font outlines or metadata were modified. Only hosting moved to the site.
- SHA-256 Latin: `ac057a5593cbe3df0d2585da5dd5f33b8efa84aa30550c710fe061b37fc5c54b`.
- SHA-256 Latin Extended: `ed3571ea9ff752f1c846f1c9ad2b0006de42f478a2db9163a74db0729a4eb281`.
- SHA-256 Cyrillic: `44aa5fb37c5aa2a2b44ceab9c077b42de47d50d47c0dcbefa2555082c38df8dd`.
- SHA-256 Cyrillic Extended: `ce21e07f81120c29845d627644a977b85027fc564b68e23349ea599402e55e96`.
- SHA-256 Greek: `5045881eda8b85134f65682ac27163c2b060d1aeed619e21498f98f5448239d1`.
- SHA-256 Greek Extended: `cd19f948c227b68e6feb8af39da356315dd47f8bd1406cc8bab78baf2c6ea85e`.
- SHA-256 Vietnamese: `7a9ba93945d3cd9e6c2ad459d242c2281b423dd305e3ccb9956279f12deddfd3`.

## DM Sans

- Use: retained legacy diagrams and explicit fallback references.
- Files: variable Latin and Latin Extended WOFF2, weights 400–700.
- Source: Google Fonts `dmsans` v17, retrieved 2026-08-16.
- Project: https://github.com/googlefonts/dm-fonts
- Copyright 2014 The DM Sans Project Authors.
- Licence: SIL Open Font License 1.1.
- SHA-256 Latin: `aa530716b0d351866af7dbfa3eee4120fb36f2d071baff8c234185141865c7ff`.
- SHA-256 Latin Extended: `0d0609aee778d21b40bda1d27b7e6b5b3cb1a3e96b90b8831c681aca097c2219`.

## Roboto Slab

- Use: display and campaign headings.
- Files: variable Latin and Latin Extended WOFF2, weights 600–700.
- Source: Google Fonts `robotoslab` v36, retrieved 2026-08-16.
- Project: https://github.com/googlefonts/robotoslab
- Licence: Apache License 2.0.
- SHA-256 Latin: `317b2dafcfcd18ae868e7cb3c5a33a323999bc4c3c400e237801efc2a3a74aac`.
- SHA-256 Latin Extended: `3c81cc23c315d97e91d07fa69b006cba1267592d0822165e6045dde0eb4e125e`.

## Roboto Mono

- Use: code, machine identifiers, sources, timestamps and tabular figures.
- Files: variable Latin and Latin Extended WOFF2, weights 400–700.
- Source: Google Fonts `robotomono` v31, retrieved 2026-08-16.
- Project: https://github.com/googlefonts/RobotoMono
- Copyright 2015 The Roboto Mono Project Authors.
- Licence: SIL Open Font License 1.1.
- SHA-256 Latin: `2ed6ac9efae6d21f51b2946176a0eef79a4043d643f9ac976e66d7fc4d57803a`.
- SHA-256 Latin Extended: `2cb74c78294bf69bb4c40e56d703014eecb0776df9a23418be836392fc7fdf89`.

## Atkinson Hyperlegible Next

- Use: authored reading copy and ledes; generated references retain their existing typography.
- Files: variable Latin and Latin Extended WOFF2, upright and italic, weights 400–700.
- Source: Google Fonts `atkinsonhyperlegiblenext` v7, retrieved 2026-09-05.
- Project: https://github.com/googlefonts/atkinson-hyperlegible-next
- Copyright 2020–2024 The Atkinson Hyperlegible Next Project Authors.
- Licence: SIL Open Font License 1.1.
- SHA-256 upright Latin: `1e4cea71d75ec427581d6259fc07148a2e60d60d16cabf4b4f5360487b3f9dc3`.
- SHA-256 upright Latin Extended: `ca1969afa9058a41ced4a08bd54f48835cfe79dc6ccf9050dca7da85c9e0a9d9`.
- SHA-256 italic Latin: `6e221fe2869a755fdce1ba6c3517f392c3a218d642e1d0207ed2826713db7263`.
- SHA-256 italic Latin Extended: `871436be3c2e0104442463df5eabe7eaef5e0172cb6715a720156ef76f70e1ff`.

## Historical files

Fraunces, Inter and JetBrains Mono remain in this directory only for source-history
comparison. They are not referenced by the replacement stylesheet. All three are
SIL OFL 1.1.
The next asset-pruning release may remove them after build-history requirements
are confirmed.

SIL OFL 1.1: https://openfontlicense.org/open-font-license-official-text/
Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
