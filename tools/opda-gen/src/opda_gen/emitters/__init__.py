"""
Package opda_gen.emitters.

Realises:
- ADR-0007 §"Architecture" — emitter layer (one module per Council-ratified
  ontology layer).
- ADR-0008 §"Repository structure" — `emitters/` subpackage per layout.

Each emitter module is a stub at ADR-0008 status: the body raises
`NotImplementedError("realised in ADR-NNNN")` pointing at the ADR that
fills it in. ADR-0008 ships the interface only.
"""
