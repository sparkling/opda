# LODE — Live OWL Documentation Environment

**Status in this bake-off: REPRESENTED VIA WIDOCO (not stood up standalone).**

LODE (Live OWL Documentation Environment, Peroni et al.) is an XSLT-driven
**web service** that documents an OWL ontology from a **dereferenceable URL**:

```
https://essepuntato.it/lode/<ENCODED-ONTOLOGY-URL>
```

It has no batch/CLI mode and no local-file mode — it fetches the ontology over
HTTP, transforms it server-side, and returns a single HTML page. There is also
a downloadable Java servlet (`LODE.war`) you can run in Tomcat, but it still
expects an HTTP-resolvable ontology IRI.

## Why it is not run standalone here

1. **No hosted, dereferenceable ontology URL yet.** The OPDA TBox
   (`opda-merged.ttl`) is a local file. `https://opda.org.uk/pdtf/` (the
   `owl:versionIRI` base) does not currently serve the Turtle as
   content-negotiated RDF, so the LODE service has nothing to dereference. The
   per-ADR-0041 hosting model (B2: localhost + link-out) means we deliberately
   do **not** stand up the LODE servlet for this run.
2. **LODE is embedded in Widoco.** Widoco's term-by-term cross-reference
   section *is* a bundled, updated LODE renderer (Widoco reuses the LODE
   transform internally). So the LODE rendering is already produced — see
   [`../widoco/doc/index-en.html`](../widoco/doc/index-en.html). That is the
   LODE baseline for the bake-off comparison.

## How to get a genuine standalone LODE rendering (once the TTL is hosted)

When `https://opda.org.uk/pdtf/...` (or any public URL) serves the merged TBox
as `text/turtle` / `application/rdf+xml` via content negotiation, the LODE
rendering is one URL away — no install:

```
https://essepuntato.it/lode/owlapi/https://opda.org.uk/pdtf/opda-merged.ttl
```

(The `/owlapi/` path segment makes LODE parse with the OWL API, which handles
Turtle and imports; drop it for the plain XSLT path on RDF/XML.)

## Role in the M6 rubric

LODE is the **comparison baseline** (ADR-0041 §Amendments — "the DA's own
tool, kept as the comparison baseline"). Its coverage equals Widoco's embedded
cross-reference: OWL classes/properties **Full**, SKOS **Partial** (concepts
appear as referenced individuals, not a browsable scheme view), SHACL **None**,
and all OPDA-specific layers (profiles, exemplars, three-graph, governance,
known-issues) **None**. It is single-page and not themeable beyond its fixed
XSLT stylesheet, so its integration cost as a standalone surface is high for no
gain over Widoco. Scored as such in `../COMPARISON.md`.
