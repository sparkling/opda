# RML-FNML user-defined function(s) for this mapping (morph-kgc engine).
#
# ADR-0057 established the per-value-filter pattern (JSONPath `[?(...)]`
# array filtering + rr:constant scheme-member IRI) for enum-to-SKOS
# bindings, but that pattern structurally cannot work when the enum field
# sits in a single, always-present JSON object rather than an array —
# `[?(...)]` filter brackets only apply to arrays (confirmed empirically;
# see ADR-0057's Amendments section). For that class of property, this
# single generic UDF constructs the scheme-member concept IRI directly.
#
# `scheme_member_iri` replicates opda_gen.emitters.vocabularies.
# _slugify_for_uri EXACTLY (same character-by-character rules: alnum/-/_/.
# kept, apostrophes dropped, everything else incl. spaces/parens becomes a
# hyphen, consecutive hyphens collapse, leading/trailing hyphens stripped) —
# this MUST stay in sync with that function; if the emitter's slugify rules
# ever change, update both. Verified against real scheme members, e.g.
# "FTTC (Fibre to the Cabinet)" -> ".../scheme/broadbandConnectionType/
# FTTC-Fibre-to-the-Cabinet" (exact match, parens included as a case the
# naive "replace spaces only" version gets wrong).
#
# `@udf(...)`'s keyword arguments map RML rml:parameterMap constants to this
# function's Python parameter names — see the morph-kgc RML-FNML docs.
@udf(
    fun_id="urn:opda:scheme_member_iri",
    value="urn:opda:param:value",
    scheme="urn:opda:param:scheme",
)
def scheme_member_iri(value, scheme):
    out_chars = []
    for ch in value:
        if ch.isalnum() or ch in "-_.":
            out_chars.append(ch)
        elif ch == "'":
            continue
        elif ch == " ":
            out_chars.append("-")
        else:
            out_chars.append("-")
    collapsed = []
    prev_hyphen = False
    for ch in out_chars:
        if ch == "-":
            if prev_hyphen:
                continue
            prev_hyphen = True
        else:
            prev_hyphen = False
        collapsed.append(ch)
    slug = "".join(collapsed).strip("-")
    return f"https://opda.org.uk/pdtf/scheme/{scheme}/{slug}"
