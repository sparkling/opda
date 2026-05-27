"""
Module __main__.

Realises:
- ADR-0008 §"CLI design" — enables `python -m opda_gen` invocation.
- ADR-0007 §"Architecture" — generator CLI entry point.
"""

from opda_gen.cli import main

if __name__ == "__main__":
    main()
