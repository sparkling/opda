"""SUPERSEDED (ADR-0057 Amendments): the harness migrated from morph-kgc to
RMLMapper (Java) as its execution engine — `harness/run_mapping.py` no longer
imports this module. Kept, unimported, for the bug-investigation history
below (RMLMapper does not exhibit this bug; it has its own dependency-free
JSON reader). Safe to delete once that history is no longer needed.

Runtime patch for a confirmed morph-kgc 2.10.0 bug (not an OPDA data or
mapping issue) in `morph_kgc.data_source.data_file._read_json`.

THE BUG (verified empirically — see docs/adr/ADR-0057's Amendments for the
full investigation): `_read_json`'s final row-filtering step is

    json_df.dropna(axis=0, how='any', inplace=True)

with NO `subset=` — meaning it drops any row with a NaN in *any* column of
the fully-flattened dataframe, not just the columns this TriplesMap actually
references. Since `pd.json_normalize` flattens an array of heterogeneous
JSON objects (e.g. `participants[]`, where a Seller has `sellersCapacity`
but a Buyer doesn't, or a Person legal-owner has `firstName`/`lastName` but
an Organisation one has `organisationName` instead) into the UNION of every
item's columns, essentially every real-world array of non-identical items
produces at least one NaN per row somewhere in that union — so this
unscoped dropna silently discards every row, even when the columns this
specific TriplesMap actually needs are fully populated.

This is not a modelling defect and not something source pre-processing
should paper over: OPDA's ontology correctly asserts relationships like
`opda:hasParticipant` (Transaction -> each real participant) that the
source JSON plainly supports (a human, or any imperative reader, can
trivially pair a transaction's participants with its own transactionId).
The failure is purely in this one over-eager pandas call inside morph-kgc's
own JSON reader — confirmed by removing it and reproducing the exact
correct output (3/3 expected triples) with no other change.

The fix: scope the dropna to only the references this rule actually reads,
matching the SAME columns already used to backfill missing references two
lines above in the original function. Applied via monkeypatch (not a fork
or vendored copy) so `pip install -U morph-kgc` naturally picks up a real
upstream fix once/if one ships, without this file silently going stale.

Import this module (`import morph_kgc_patch`) BEFORE calling
`morph_kgc.materialize()` anywhere in this harness.
"""
from __future__ import annotations

import json

import pandas as pd
from jsonpath import JSONPath

import morph_kgc.data_source.data_file as _data_file
from morph_kgc.utils import normalize_hierarchical_data

_original_read_json = _data_file._read_json


def _patched_read_json(rml_rule, references):
    if rml_rule["logical_source_value"].startswith("http"):
        import urllib.request

        with urllib.request.urlopen(rml_rule["logical_source_value"]) as json_url:
            json_data = json.loads(json_url.read().decode())
    else:
        with open(rml_rule["logical_source_value"], encoding="utf-8") as json_file:
            json_data = json.load(json_file)

    jsonpath_expression = rml_rule["iterator"] + ".("
    for reference in references:
        jsonpath_expression += reference.split(".")[0] + ","
    jsonpath_expression = jsonpath_expression[:-1] + ")"

    jsonpath_result = JSONPath(jsonpath_expression).parse(json_data)
    json_df = pd.json_normalize(
        [obj for obj in normalize_hierarchical_data(jsonpath_result) if None not in obj.values()]
    )

    missing_references_in_df = list(set(references).difference(set(json_df.columns)))
    json_df[missing_references_in_df] = None
    # THE FIX (only change from morph-kgc 2.10.0's original): scope dropna to
    # the references this rule actually needs, not every flattened column.
    json_df.dropna(axis=0, how="any", subset=list(references), inplace=True)

    return json_df


_data_file._read_json = _patched_read_json
