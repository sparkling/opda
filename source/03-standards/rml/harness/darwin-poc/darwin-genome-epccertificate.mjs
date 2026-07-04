// Proof of concept: treat RML Turtle as a mutatable GENOME (not one of Darwin's
// fixed 7 agent-policy mutation surfaces — ADR-071 hard-blocks that), scored by
// our REAL, already-verified sound+completeness harness. Mirrors ruvector's
// MetaBioHacker pattern (docs/sonic-ct/OPTIMIZATION.md): "freeze the model,
// evolve the harness" via Darwin's generic mapLimit + paretoFront primitives,
// NOT the evolve() CLI's file-allowlisted variant-directory flow.
//
// Task: opda:EPCCertificate is a real, currently-unmapped schema-generated
// class. Three candidate TriplesMap genomes differ in (a) node-keying scheme
// and (b) whether they bind opda:disclosureDetail (the shape's own suggested
// carrier for the certificate's authority-reference IC component, sh:Info
// severity, EPCCertificateInternalStructureShape).
import { mapLimit, paretoFront } from '@metaharness/darwin';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = '/Users/henrik/source/opda/source/03-standards/rml';
const BASE_MAPPING = readFileSync(`${ROOT}/mapping/opda-pdtf.rml.ttl`, 'utf8');
const PY = '/Users/henrik/source/opda/tools/opda-gen/.venv/bin/python';
const VALIDATE_SHACL = `${ROOT}/harness/validate_shacl.sh`;
const SHAPES = '/Users/henrik/source/opda/public/ontology/artefacts/opda-shapes-merged.ttl';
const INSTANCE = `${ROOT}/testdata/01-conformant-full.json`;

// --- the genome: three candidate TriplesMap blocks for opda:EPCCertificate ---
const GENOMES = [
  {
    id: 'g0-certnum-key-no-disclosure',
    block: `
<#EPCCertificate_g0> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack.energyEfficiency.certificate" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/epc/{certificateNumber}" ;
                  rr:class opda:EPCCertificate ] .

<#PropertyEPCJoin_g0> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/property/{uprn}" ] ;
  rr:predicateObjectMap [ rr:predicate opda:hasEPCCertificate ;
      rr:objectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/epc/{energyEfficiency.certificate.certificateNumber}" ] ] .
`,
  },
  {
    id: 'g1-certnum-key-with-disclosure',
    block: `
<#EPCCertificate_g1> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack.energyEfficiency.certificate" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/epc/{certificateNumber}" ;
                  rr:class opda:EPCCertificate ] ;
  rr:predicateObjectMap [ rr:predicate opda:disclosureDetail ;
      rr:objectMap [ rml:reference "certificateNumber" ; rr:datatype xsd:string ] ] .

<#PropertyEPCJoin_g1> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/property/{uprn}" ] ;
  rr:predicateObjectMap [ rr:predicate opda:hasEPCCertificate ;
      rr:objectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/epc/{energyEfficiency.certificate.certificateNumber}" ] ] .
`,
  },
  {
    id: 'g2-uprn-key-with-disclosure',
    block: `
<#EPCCertificate_g2> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/epc/uprn-{uprn}" ;
                  rr:class opda:EPCCertificate ] ;
  rr:predicateObjectMap [ rr:predicate opda:disclosureDetail ;
      rr:objectMap [ rml:reference "energyEfficiency.certificate.certificateNumber" ; rr:datatype xsd:string ] ] .

<#PropertyEPCJoin_g2> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/property/{uprn}" ] ;
  rr:predicateObjectMap [ rr:predicate opda:hasEPCCertificate ;
      rr:objectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/epc/uprn-{uprn}" ] ] .
`,
  },
  {
    id: 'g3-certnum-key-disclosure-plus-wasGeneratedBy',
    block: `
<#EPCCertificate_g3> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack.energyEfficiency.certificate" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/epc/{certificateNumber}" ;
                  rr:class opda:EPCCertificate ] ;
  rr:predicateObjectMap [ rr:predicate opda:disclosureDetail ;
      rr:objectMap [ rml:reference "certificateNumber" ; rr:datatype xsd:string ] ] ;
  rr:predicateObjectMap [ rr:predicate prov:wasGeneratedBy ;
      rr:objectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/epc/{certificateNumber}/run" ] ] .

<#PropertyEPCJoin_g3> a rr:TriplesMap ;
  rml:logicalSource [ rml:source "INSTANCE.json" ; rml:referenceFormulation ql:JSONPath ;
                      rml:iterator "$.propertyPack" ] ;
  rr:subjectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/property/{uprn}" ] ;
  rr:predicateObjectMap [ rr:predicate opda:hasEPCCertificate ;
      rr:objectMap [ rr:template "https://opda.org.uk/pdtf/harness/data/epc/{energyEfficiency.certificate.certificateNumber}" ] ] .
`,
  },
];

function scoreGenome(genome) {
  const tmp = mkdtempSync(join(tmpdir(), 'darwin-genome-'));
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
      conforms = false;
    }
  }

  // IC-completeness proxy: does the EPCCertificate node carry opda:disclosureDetail
  // (the shape's own suggested carrier for the authority-reference IC component)?
  const nt = materialiseError ? '' : readFileSync(outPath, 'utf8');
  const hasEpcType = /#type>\s*<https:\/\/opda\.org\.uk\/pdtf\/EPCCertificate>/.test(nt);
  const hasDisclosureDetail = /<https:\/\/opda\.org\.uk\/pdtf\/disclosureDetail>/.test(nt);
  const hasHasEPCCertificateLink = /<https:\/\/opda\.org\.uk\/pdtf\/hasEPCCertificate>/.test(nt);

  return {
    id: genome.id,
    materialiseError,
    triples,
    conforms,
    violations: violations < 0 ? 99 : violations,
    hasEpcType,
    hasDisclosureDetail,
    hasHasEPCCertificateLink,
  };
}

const results = await mapLimit(GENOMES, 2, async (g) => scoreGenome(g));

console.log('=== Real, measured per-genome results ===');
for (const r of results) console.log(JSON.stringify(r));

// paretoFront: HIGHER = better on each axis.
// axis 1: SHACL soundness (0 violations -> 1, else 0)
// axis 2: emits a correctly-typed EPCCertificate node reachable via hasEPCCertificate
// axis 3: IC-completeness proxy (disclosureDetail bound)
const front = paretoFront(results, (r) => [
  r.conforms ? 1 : 0,
  (r.hasEpcType && r.hasHasEPCCertificateLink) ? 1 : 0,
  r.hasDisclosureDetail ? 1 : 0,
]);

console.log('\n=== Pareto front (non-dominated genomes) ===');
for (const r of front) console.log(r.id);
