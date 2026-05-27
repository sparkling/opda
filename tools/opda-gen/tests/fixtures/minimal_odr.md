---
status: accepted
date: 2026-05-27
kind: pattern
tags: [fixture, test, ufo, property]
scope: [pdtf-v3:fixture.exemplar]
council: session-fixture
supersedes: []
depends-on: [ODR-0004]
implements: []
---

# Fixture ODR — Property pattern minimal example

## Context

A minimal fixture ODR used by the ADR-0008 test suite to exercise the
`inputs/odr_corpus.py` parser. Not a real Council record. Mirrors the
shape (frontmatter + `## Rules` + `### Operational specifications`) of
ODR-0005 so the parser is tested against realistic structure.

## Decision

Adopt a one-class fixture pattern with a fake UFO Substance Kind commitment.

## Rules

1. **Fixture class.** `opda:FixtureProperty` is the fixture's sole minted
   class. It is UFO Substance Kind / DOLCE NonPhysicalEndurant.
2. **Single identity criterion.** IC = spatial-material continuity (mirrors
   ODR-0005 §Rules.2). Cited here so the A9 per-kind discipline output
   parser has a `kind: pattern` UFO line to extract.

### Operational specifications

The fixture commits no operational specifications beyond what `## Rules`
covers. This section exists so the parser's section-extraction logic is
exercised against both `## Rules` and `### Operational specifications`.

## Consequences

This ODR is a test fixture. Real Council records live in
`docs/ontology/odr/`.
