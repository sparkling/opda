// Third Darwin genome trial (ADR-0058): opda:Survey. Unlike NearbyFacility
// (no shape at all), Survey DOES carry a hard SHACL shape —
// SurveyIdentityKeyShape, sh:minCount 1 on prov:wasGeneratedBy, sh:Violation —
// making this structurally closer to the EPCCertificate trial than the
// NearbyFacility one. SurveyInternalStructureShape additionally suggests
// (sh:Info, non-blocking) prov:wasAttributedTo / prov:generatedAtTime /
// opda:disclosureDetail for the IC's issuing-authority/date/reference triad.
//
// Real-vocabulary constraint discovered before authoring candidates: unlike
// RiskAssessment (~6 real dedicated datatype properties) or NearbyFacility
// (a handful of school/transport/healthcare fields), opda:Survey's real PDTF
// v3 schema (propertyPack.surveys[], RICS Level 2 survey) has NO existing
// OPDA datatype property covering its rich substructure (outside/inside/
// services/grounds/legalIssues/risks/propertyValuation all real, but
// unmapped to any opda: term) except opda:constructionType (already flat on
// Property, M18, rdfs:domain opda:Property specifically — NOT shared) and
// opda:reportDate (rdfs:domain opda:Search, but its OWN comment + dct:source
// already say "ONE shared property reused across search and survey reports"
// and cite propertyPack.surveys[].misc.reportDate directly). Inventing new
// datatype properties for the rich RICS substructure is out of scope for
// this gap-closing task (bind only what's real/already-modelled). So the
// genuine candidate axis here is IC-minimal vs IC-plus-the-one-real-shared-
// literal, not a rich field-count contrast like the NearbyFacility trial.
//
// Node keying: misc.reportDate is a genuine per-item field reachable within
// the surveys[*] iterator itself (like Search's productCode, RoomDimension's
// roomName, PlanningPermission's refNumber) — no ambient {uprn} synthesis
// needed (unlike M20a/M24a's parent-container case, which had no per-item
// field at all).
import { mapLimit, paretoFront } from '@metaharness/darwin';
import { readFileSync, writeFileSync, mkdtempSync, cpSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = '/Users/henrik/source/opda/source/03-standards/rml';
const BASE_MAPPING = readFileSync(`${ROOT}/mapping/opda-pdtf.rml.ttl`, 'utf8');
const PY = '/Users/henrik/source/opda/tools/opda-gen/.venv/bin/python';
const VALIDATE_SHACL = `${ROOT}/harness/validate_shacl.sh`;
const INSTANCE = '/private/tmp/claude-501/-Users-henrik-source-opda/34598ed4-b768-4af6-b91d-8d9aea452614/scratchpad/survey-scratch-instance.json';

const GENOMES = [
  {
    id: 'g0-minimal-ic-only',
    fields: ['prov:wasGeneratedBy', 'prov:generatedAtTime'],
    block: `
<#Survey_g0> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack.surveys[*]" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/survey/{misc.reportDate}" ;
                  rr:class opda:Survey ] ;
  rr:predicateObjectMap [ rr:predicate prov:wasGeneratedBy ;
      rr:objectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/survey/{misc.reportDate}/run" ] ] ;
  rr:predicateObjectMap [ rr:predicate prov:generatedAtTime ;
      rr:objectMap [ rml:reference "misc.reportDate" ; rr:datatype xsd:dateTime ] ] .

<#SurveyRunActivity_g0> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack.surveys[*]" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/survey/{misc.reportDate}/run" ;
                  rr:class prov:Activity ] .

<#PropertySurveyJoin_g0> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/property/{uprn}" ] ;
  rr:predicateObjectMap [ rr:predicate opda:hasSurvey ;
      rr:objectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/survey/{surveys[*].misc.reportDate}" ] ] .
`,
  },
  {
    id: 'g1-plus-reportDate-literal',
    fields: ['prov:wasGeneratedBy', 'prov:generatedAtTime', 'opda:reportDate'],
    block: `
<#Survey_g1> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack.surveys[*]" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/survey/{misc.reportDate}" ;
                  rr:class opda:Survey ] ;
  rr:predicateObjectMap [ rr:predicate prov:wasGeneratedBy ;
      rr:objectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/survey/{misc.reportDate}/run" ] ] ;
  rr:predicateObjectMap [ rr:predicate prov:generatedAtTime ;
      rr:objectMap [ rml:reference "misc.reportDate" ; rr:datatype xsd:dateTime ] ] ;
  rr:predicateObjectMap [ rr:predicate opda:reportDate ;
      rr:objectMap [ rr:datatype xsd:date ;
        fnml:functionValue [
          rr:predicateObjectMap [ rr:predicate fno:executes ; rr:objectMap [ rr:constant <urn:opda:truncate_to_date> ] ] ;
          rr:predicateObjectMap [ rr:predicate <urn:opda:param:datetime> ; rr:objectMap [ rml:reference "misc.reportDate" ] ] ] ] ] .

<#SurveyRunActivity_g1> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack.surveys[*]" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/survey/{misc.reportDate}/run" ;
                  rr:class prov:Activity ] .

<#PropertySurveyJoin_g1> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/property/{uprn}" ] ;
  rr:predicateObjectMap [ rr:predicate opda:hasSurvey ;
      rr:objectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/survey/{surveys[*].misc.reportDate}" ] ] .
`,
  },
];

function scoreGenome(genome) {
  const tmp = mkdtempSync(join(tmpdir(), 'darwin-survey-'));
  const mappingPath = join(tmp, 'candidate.rml.ttl');
  const outPath = join(tmp, 'out.nt');
  writeFileSync(mappingPath, BASE_MAPPING + '\n' + genome.block);
  // run_mapping.py resolves `mapping/functions/functions.ttl` relative to the
  // MAPPING FILE'S OWN directory (not cwd) — a real gotcha discovered running
  // this trial: the base mapping already contains M18's constructionType FNML
  // call (urn:opda:scheme_member_iri) unconditionally, so without the sibling
  // functions/ dir alongside the candidate copy, RMLMapper fails ALL genomes
  // identically with "Function not found", regardless of genome quality — a
  // false, uninformative signal, the same failure MODE (if not cause) ADR-0058
  // already hardened validate_shacl.sh's JAVA_HOME discovery against.
  cpSync(`${ROOT}/mapping/functions`, join(tmp, 'functions'), { recursive: true });

  let triples = 0, materialiseError = null;
  try {
    const stdout = execFileSync(PY, [
      `${ROOT}/harness/run_mapping.py`, '--mapping', mappingPath,
      '--data', INSTANCE, '--out', outPath,
    ], { encoding: 'utf8', timeout: 60_000 });
    const m = stdout.match(/materialised (\d+) triples/);
    triples = m ? Number(m[1]) : 0;
  } catch (e) {
    materialiseError = String(e.stdout || e.message || e).slice(0, 500);
  }

  let violations = -1, conforms = false;
  if (!materialiseError) {
    try {
      execFileSync('bash', [VALIDATE_SHACL, outPath], { encoding: 'utf8', timeout: 60_000 });
      conforms = true; violations = 0;
    } catch (e) {
      const out = String(e.stdout || '');
      violations = (out.match(/sh:resultSeverity\s+sh:Violation/g) || []).length;
    }
  }

  const nt = materialiseError ? '' : readFileSync(outPath, 'utf8');
  const surveyNodeCount = (nt.match(/#type>\s*<https:\/\/opda\.org\.uk\/pdtf\/Survey>/g) || []).length;
  const hasJoinLink = (nt.match(/<https:\/\/opda\.org\.uk\/pdtf\/hasSurvey>/g) || []).length;
  const hasWasGeneratedBy = /ns#wasGeneratedBy>/.test(nt);
  const hasGeneratedAtTime = /ns#generatedAtTime>/.test(nt);
  const hasReportDate = /<https:\/\/opda\.org\.uk\/pdtf\/reportDate>/.test(nt);

  return {
    id: genome.id,
    materialiseError,
    triples,
    conforms,
    violations: violations < 0 ? 99 : violations,
    surveyNodeCount,
    hasJoinLink,
    hasWasGeneratedBy,
    hasGeneratedAtTime,
    hasReportDate,
    fieldCount: genome.fields.length,
  };
}

const results = await mapLimit(GENOMES, 2, async (g) => scoreGenome(g));

console.log('=== Real, measured per-genome results ===');
for (const r of results) console.log(JSON.stringify(r));

// paretoFront: HIGHER = better on each axis.
// axis 1: SHACL soundness (0 violations -> 1, else 0) — the hard-shape
//   discriminator (SurveyIdentityKeyShape's minCount 1 wasGeneratedBy).
// axis 2: correctly typed + joined (2 survey nodes minted, both reachable
//   via opda:hasSurvey from the Property).
// axis 3: field richness (coverage of the real, already-modelled vocabulary).
const front = paretoFront(results, (r) => [
  r.conforms ? 1 : 0,
  (r.surveyNodeCount === 2 && r.hasJoinLink === 2) ? 1 : 0,
  r.fieldCount,
]);

console.log('\n=== Pareto front (non-dominated genomes) ===');
for (const r of front) console.log(r.id);
