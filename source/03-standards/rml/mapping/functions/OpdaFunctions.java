/**
 * Java port of mapping/opda-udfs.py's scheme_member_iri, exposed to RMLMapper
 * via mapping/functions/functions.ttl (FnO description) + the `-f` CLI flag.
 *
 * MUST stay byte-for-byte in sync with opda_gen.emitters.vocabularies
 * ._slugify_for_uri and the Python UDF it was ported from: alnum/-/_/. kept,
 * apostrophes dropped, everything else (incl. spaces/parens) becomes a
 * hyphen, consecutive hyphens collapse, leading/trailing hyphens stripped.
 * Verified against "FTTC (Fibre to the Cabinet)" -> "FTTC-Fibre-to-the-Cabinet".
 */
public class OpdaFunctions {
    public static String schemeMemberIri(String value, String scheme) {
        if (value == null || scheme == null) {
            // Matches R2RML/RML term-map semantics: an absent optional
            // reference yields no triple, not an error.
            return null;
        }
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < value.length(); i++) {
            char ch = value.charAt(i);
            if (Character.isLetterOrDigit(ch) || ch == '-' || ch == '_' || ch == '.') {
                out.append(ch);
            } else if (ch == '\'') {
                // dropped, not replaced
            } else {
                out.append('-');
            }
        }

        StringBuilder collapsed = new StringBuilder();
        boolean prevHyphen = false;
        for (int i = 0; i < out.length(); i++) {
            char ch = out.charAt(i);
            if (ch == '-') {
                if (prevHyphen) continue;
                prevHyphen = true;
            } else {
                prevHyphen = false;
            }
            collapsed.append(ch);
        }

        String slug = collapsed.toString();
        int start = 0;
        int end = slug.length();
        while (start < end && slug.charAt(start) == '-') start++;
        while (end > start && slug.charAt(end - 1) == '-') end--;
        slug = slug.substring(start, end);

        return "https://opda.org.uk/pdtf/scheme/" + scheme + "/" + slug;
    }

    /**
     * Truncates an ISO-8601 dateTime string to its date portion, so it is a
     * lexically valid xsd:date (the ontology deliberately declares
     * rdfs:range xsd:date for opda:orderDate/expectedDeliveryDate/reportDate/
     * signedOn/soldDate — "Flat per §Q6a" — while the PDTF source carries
     * full dateTime precision). A value already date-only (10 chars, no time
     * separator) passes through unchanged.
     */
    public static String truncateToDate(String value) {
        if (value == null) {
            return null;
        }
        if (value.length() > 10 && value.charAt(4) == '-' && value.charAt(7) == '-') {
            return value.substring(0, 10);
        }
        return value;
    }
}
