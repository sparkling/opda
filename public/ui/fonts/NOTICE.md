# Fonts — licenses and provenance

All three families ship under the **SIL Open Font License v1.1** (OFL), which
permits free use, modification, and redistribution including with derivative
works, on the condition that this notice is preserved. Full OFL text:
https://openfontlicense.org/open-font-license-official-text/

## Fraunces (display serif)

- Project: https://github.com/undercasetype/Fraunces
- Designer: Phaedra Charles, Flavia Zimbardi, Lasse Fister (Undercase Type)
- Copyright (c) 2020, The Fraunces Project Authors
- Variant shipped: latin subset, weights 400 / 600 / 700, regular + 400 italic

## Inter (sans body)

- Project: https://github.com/rsms/inter
- Designer: Rasmus Andersson
- Copyright (c) 2016, The Inter Project Authors
- Variant shipped: latin subset, weights 400 / 500 / 600 / 700

## JetBrains Mono (monospace)

- Project: https://github.com/JetBrains/JetBrainsMono
- Copyright (c) 2020, JetBrains s.r.o. with Reserved Font Name "JetBrains Mono"
- Variant shipped: latin subset, weights 400 / 700

## Why these three

DESIGN.md (Claude visual language) calls for slab/old-style serif display, a
humanist sans body, and a monospace for code. The brand fonts Anthropic uses
(Tiempos Headline, Copernicus, Styrene) are commercial Klim Type Foundry and
Berthold faces that cannot be redistributed. These three are free-to-ship
substitutes with the same general voice:

- Fraunces is a high-contrast slab-serif with optical sizing — closer to
  Tiempos in feel than Charter or PT Serif.
- Inter is the system-feeling humanist sans the live site already prefers in
  its CSS fallback chain.
- JetBrains Mono pairs cleanly with Inter and is the de-facto open monospace
  for developer docs.

## Files acquired via

`@fontsource/{fraunces,inter,jetbrains-mono}` published to npm, served by
jsDelivr CDN. The latin subset .woff2 files are the same files those packages
ship for production use. No modification.
