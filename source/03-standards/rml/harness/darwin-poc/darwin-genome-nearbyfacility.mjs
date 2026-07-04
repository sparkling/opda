// Second Darwin genome trial — deliberate CONTRAST case to EPCCertificate.
// opda:NearbyFacility has NO SHACL shape at all (verified: zero matches for
// `sh:targetClass opda:NearbyFacility` in opda-shapes-merged.ttl), so there is
// no hard constraint to discriminate candidates on soundness. This tests
// whether paretoFront still adds value when the only real axis is coverage.
import { mapLimit, paretoFront } from '@metaharness/darwin';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = '/Users/henrik/source/opda/source/03-standards/rml';
const BASE_MAPPING = readFileSync(`${ROOT}/mapping/opda-pdtf.rml.ttl`, 'utf8');
const PY = '/Users/henrik/source/opda/tools/opda-gen/.venv/bin/python';
const VALIDATE_SHACL = `${ROOT}/harness/validate_shacl.sh`;
const INSTANCE = `${ROOT}/testdata/03-multi-participant.json`;

const GENOMES = [
  {
    id: 'g0-minimal-name-distance-only',
    fields: ['name', 'distanceInMiles'],
    block: `
<#NearbyFacility_Schools_g0> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack.nearbyFacilities.schools[*]" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/facility/school/{name}" ;
                  rr:class opda:NearbyFacility ] ;
  rr:predicateObjectMap [ rr:predicate opda:name ;
      rr:objectMap [ rml:reference "name" ; rr:datatype xsd:string ] ] ;
  rr:predicateObjectMap [ rr:predicate opda:distanceInMiles ;
      rr:objectMap [ rml:reference "distanceInMiles" ; rr:datatype xsd:decimal ] ] .
`,
  },
  {
    id: 'g1-full-coverage-schools-only',
    fields: ['name', 'distanceInMiles', 'ageRange', 'ofstedRating', 'pupils', 'religiousCharacter'],
    block: `
<#NearbyFacility_Schools_g1> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack.nearbyFacilities.schools[*]" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/facility/school/{name}" ;
                  rr:class opda:NearbyFacility ] ;
  rr:predicateObjectMap [ rr:predicate opda:name ;
      rr:objectMap [ rml:reference "name" ; rr:datatype xsd:string ] ] ;
  rr:predicateObjectMap [ rr:predicate opda:distanceInMiles ;
      rr:objectMap [ rml:reference "distanceInMiles" ; rr:datatype xsd:decimal ] ] ;
  rr:predicateObjectMap [ rr:predicate opda:ageRange ;
      rr:objectMap [ rml:reference "ageRange" ; rr:datatype xsd:string ] ] ;
  rr:predicateObjectMap [ rr:predicate opda:ofstedRating ;
      rr:objectMap [ rml:reference "ofstedRating" ; rr:datatype xsd:string ] ] ;
  rr:predicateObjectMap [ rr:predicate opda:pupils ;
      rr:objectMap [ rml:reference "pupils" ; rr:datatype xsd:integer ] ] ;
  rr:predicateObjectMap [ rr:predicate opda:religiousCharacter ;
      rr:objectMap [ rml:reference "religiousCharacter" ; rr:datatype xsd:string ] ] .
`,
  },
  {
    id: 'g2-full-coverage-all-three-subarrays',
    fields: ['name', 'distanceInMiles', 'ageRange', 'ofstedRating', 'pupils', 'religiousCharacter', 'transportType', 'typeOfHealthCare', 'specialties'],
    block: `
<#NearbyFacility_Schools_g2> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack.nearbyFacilities.schools[*]" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/facility/school/{name}" ;
                  rr:class opda:NearbyFacility ] ;
  rr:predicateObjectMap [ rr:predicate opda:name ;
      rr:objectMap [ rml:reference "name" ; rr:datatype xsd:string ] ] ;
  rr:predicateObjectMap [ rr:predicate opda:distanceInMiles ;
      rr:objectMap [ rml:reference "distanceInMiles" ; rr:datatype xsd:decimal ] ] ;
  rr:predicateObjectMap [ rr:predicate opda:ageRange ;
      rr:objectMap [ rml:reference "ageRange" ; rr:datatype xsd:string ] ] ;
  rr:predicateObjectMap [ rr:predicate opda:ofstedRating ;
      rr:objectMap [ rml:reference "ofstedRating" ; rr:datatype xsd:string ] ] ;
  rr:predicateObjectMap [ rr:predicate opda:pupils ;
      rr:objectMap [ rml:reference "pupils" ; rr:datatype xsd:integer ] ] ;
  rr:predicateObjectMap [ rr:predicate opda:religiousCharacter ;
      rr:objectMap [ rml:reference "religiousCharacter" ; rr:datatype xsd:string ] ] .

<#NearbyFacility_Transport_g2> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack.nearbyFacilities.transport[*]" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/facility/transport/{name}" ;
                  rr:class opda:NearbyFacility ] ;
  rr:predicateObjectMap [ rr:predicate opda:name ;
      rr:objectMap [ rml:reference "name" ; rr:datatype xsd:string ] ] ;
  rr:predicateObjectMap [ rr:predicate opda:distanceInMiles ;
      rr:objectMap [ rml:reference "distanceInMiles" ; rr:datatype xsd:decimal ] ] ;
  rr:predicateObjectMap [ rr:predicate opda:transportType ;
      rr:objectMap [ rml:reference "transportType" ; rr:datatype xsd:string ] ] .

<#NearbyFacility_HealthCare_g2> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack.nearbyFacilities.healthCare[*]" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/facility/healthcare/{name}" ;
                  rr:class opda:NearbyFacility ] ;
  rr:predicateObjectMap [ rr:predicate opda:name ;
      rr:objectMap [ rml:reference "name" ; rr:datatype xsd:string ] ] ;
  rr:predicateObjectMap [ rr:predicate opda:distanceInMiles ;
      rr:objectMap [ rml:reference "distanceInMiles" ; rr:datatype xsd:decimal ] ] ;
  rr:predicateObjectMap [ rr:predicate opda:typeOfHealthCare ;
      rr:objectMap [ rml:reference "typeOfHealthCare" ; rr:datatype xsd:string ] ] ;
  rr:predicateObjectMap [ rr:predicate opda:specialties ;
      rr:objectMap [ rml:reference "specialties" ; rr:datatype xsd:string ] ] .
`,
  },
];

function scoreGenome(genome) {
  const tmp = mkdtempSync(join(tmpdir(), 'darwin-nf-'));
  const mappingPath = join(tmp, 'candidate.rml.ttl');
  const outPath = join(tmp, 'out.nt');
  writeFileSync(mappingPath, BASE_MAPPING + '\n' + genome.block);

  let triples = 0, materialiseError = null;
  try {
    const stdout = execFileSync(PY, [
      `${ROOT}/harness/run_mapping.py`, '--mapping', mappingPath,
      '--data', INSTANCE, '--out', outPath,
    ], { encoding: 'utf8', timeout: 30_000 });
    const m = stdout.match(/materialised (\d+) triples/);
    triples = m ? Number(m[1]) : 0;
  } catch (e) {
    materialiseError = String(e.message || e).slice(0, 300);
  }

  let violations = -1, conforms = false;
  if (!materialiseError) {
    try {
      execFileSync('bash', [VALIDATE_SHACL, outPath], { encoding: 'utf8', timeout: 30_000 });
      conforms = true; violations = 0;
    } catch (e) {
      const out = String(e.stdout || '');
      violations = (out.match(/sh:resultSeverity\s+sh:Violation/g) || []).length;
    }
  }
  const nt = materialiseError ? '' : readFileSync(outPath, 'utf8');
  const nfNodeCount = (nt.match(/#type>\s*<https:\/\/opda\.org\.uk\/pdtf\/NearbyFacility>/g) || []).length;

  return { id: genome.id, materialiseError, triples, conforms, violations: violations < 0 ? 99 : violations, nfNodeCount, fieldCount: genome.fields.length };
}

const results = await mapLimit(GENOMES, 2, async (g) => scoreGenome(g));
console.log('=== Real, measured per-genome results ===');
for (const r of results) console.log(JSON.stringify(r));

// objectives, HIGHER = better: soundness, node count (coverage of sub-arrays), field richness
const front = paretoFront(results, (r) => [r.conforms ? 1 : 0, r.nfNodeCount, r.fieldCount]);
console.log('\n=== Pareto front (non-dominated genomes) ===');
for (const r of front) console.log(r.id);
