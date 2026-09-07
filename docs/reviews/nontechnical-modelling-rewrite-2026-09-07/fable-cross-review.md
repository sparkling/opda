# Fable 5.1 cross-review — round two

Local working review, not an adopted decision or implemented website. This is the native reviewer's response to the initial 26-task Astra proposals, before Astra's later 21-chapter consolidation. The final synthesis and corrections are recorded in [deliberation.md](deliberation.md).

**Position after reading Astra's curriculum and visual reviews.** I accept the twenty-six-chapter scale and most of the Explore split, and I withdraw three of my own round-one ideas. I hold against four rail gateways, against a word-count target, and against thin or catch-all chapters. My round-one count was wrong and is corrected below. Where the two proposals still differ, I say so.

## Grouping, count and the fate of the twenty-six outcomes

**(1) Revised grouping.** Three rail gateways, four intention links on the section landing as Astra now proposes, and twenty-six chapters. The exact count is six in Understand, twelve in Explore and eight in Contribute. With three gateway landings and the section landing, that is thirty pages. The total matches Astra's by coincidence, not agreement. I merge two of Astra's Explore chapters and one Understand pair, and I add a chapter Astra left unowned.

| Gateway | Chapters in previous/next order |
|---|---|
| Understand, six | Why meaning matters · What we are building · Reading a connected model, which owns the diagram key · Harbour Court, the anchor case · Domain communities and how the work proceeds · Benefits, costs and limits |
| Explore, twelve, flat rail, clustered on the gateway page | Things and identities · Parts, wholes and connections · People, organisations and roles · Amounts, measurements and values ‖ Events and change · Dates and periods · Claims and evidence · Missing, uncertain and conflicting ‖ Names, definitions, choices and taxonomies · Established contexts and connections · Rules and exceptions · Sensitivity, purpose and permission |
| Contribute, eight, reading first | Read a candidate page and compare a revision · Frame the question the model must answer · Review a definition · Review a diagram · Review choices and mappings · Test a rule · Bring evidence · Follow what happens to feedback |

Twelve flat items is at the edge of the rail's comfort. Nesting three clusters would add landing pages and break the section-count arithmetic in the navigation test, so the rail stays flat and the clusters appear only on the Explore gateway page.

**(2) The twenty-six outcomes.**

| Outcome | Decision | Reason |
|---|---|---|
| Taxonomies and facets | Group into names, definitions and choices | The same concept-layers figure teaches both. Alone it pads to length or duplicates. |
| Why domain communities, plus the unowned plain cycle | Group into one chapter | One argument: communities own meaning, so the work is resource-first candidate and challenge. Split, each half restates the other. |
| Quantities and measurements | Preserve, re-scoped as amounts, measurements and values | It teaches a claim with a method and an authority. A valuation, a price and an asking price are three claims with different makers. Not units or datatypes. |
| Benefits, costs and limits | Add | Astra concedes ownership. Nothing else carries the "Bad, because" consequences in ADR-0063. |
| Review choices and mappings | Preserve with a fence | Two tasks in one chapter. The mapping half stops at same, close or different meaning and who decides. The record contract stays technical. |
| Read a candidate page and compare a revision | Preserve with a fence | The review-and-releases page records no later revision. The comparison must be a labelled fictional pair. |
| The other twenty | Preserve | Each has a distinct reader question and a distinct Contribute task. |
| My transfer chapter and ten-act storyline | Drop | Astra's character-names critique is right. |

**Catch-all risks, named per chapter:**

- **Events and change** would absorb clocks, subdivision and workflow status. It owns only event, state, change to a thing and change to a description. Identity through change stays in things and identities. Clocks stay in dates and periods.
- **Claims and evidence** would absorb provenance, confidence and intake. It owns claim, maker, subject and support. Intake stays in bring evidence. Disagreement moves to missing, uncertain and conflicting.
- **Missing, uncertain and conflicting** would absorb "unknown" as a vocabulary value. That stays in names and choices.
- **Sensitivity, purpose and permission** would absorb the Trust Framework. It owns three distinctions and links the DBT pages.
- **Contexts and connections** would absorb mapping records. It owns where meaning lives and the map-or-separate decision.
- **Read a candidate page** would absorb lifecycle authority. That stays in the member guide's authority table.
- **Review a diagram** would restate the key. The key lives once, in Understand.

The guard is a chapter registry stating each chapter's one question, owned distinctions and not-here list, checked by a source test so no distinction has two owners.

## Held and withdrawn positions, and the corrections

**(3) Positions.**

- **Four gateways.** Held against four rail gateways. Withdrawn against four intention links on the landing, which Astra now proposes and my landing recomposition already did. Withdrawal condition unchanged: Explore above twelve chapters after drafting, or reviewers arriving from Teams failing to find the candidate-page chapter under "Review and contribute".
- **Six illustrations versus three.** Withdrawn. Six dispersed illustrations give thirty pages a rhythm that three cannot. Two conditions held: they are task illustrations, not profession portraits, and none sits on the contexts chapter as a set of six, because six pictures beside six contexts would draw the equation the brief forbids. Each pair needs a manifest and the dimension test.
- **Harbour Court plus transfer.** Withdrawn: the ten-act extension and the standalone transfer chapter. Held: one worked finance task must exist in Explore, because Finance and Banking is the first group. The cast lives once, in the landing dossier, so dates and names cannot drift. A changed-feature transfer adds at most one new named element.
- **The 24–28k-word hypothesis.** Held against as a target. Word count is an output of the chapter contracts. The five-hundred-line file limit already caps chapters carrying specimens and practice unless those become components with data. Withdrawn if the figure is used only for authoring and review capacity and never reaches an author's brief.

**(4) Corrections.**

- **Count.** My inventory listed sixteen chapters, five, six and five, plus four landings. That is twenty pages, not fifteen or nineteen. Corrected above.
- **Contexts source.** Accepted, and it was my error of exactly the forbidden kind. The contexts chapter draws boundaries and definitions from ADR-0063 §1, ADR-0067 §2 and the register at `/development/property-pack/contexts`. That page names six bounded contexts, a deliberately small common boundary and a machine-proposed DBT Smart Data semantic context, and it says the last is not the external programme, a working-group decision or a property-domain context. The campaign register supplies only professional questions. Those appear in a separately labelled band with no one-to-one pairing, plus the sentence that a profession's question may find its semantic home in a context the profession does not name.
- **Resource specimen.** Accepted. The resource spread shows the resource definition "Inspection" with its meaning and identity question, and a separately labelled illustrative instance, the 12 August inspection of Flat 1. The relationship spread does the same: the definition "describes" and one instance sentence.
- **Fragments.** Accepted. An anchor on the new page cannot receive an old fragment. The story page keeps its retired ids on a short retained section that summarises the task and links the new chapter directly. The migration file handles paths only, so no entry is added. The enrichment test moves its scaffold assertions to the new page in the same commit.
- **Privacy figure.** Accepted. No automatic reuse. My own plain-register argument implies a redraw, because its uppercase mono labels read as technical notation. Redraw after checking the source page, keeping the three claims separate.
- **Council.** Accepted. ADR-0067 records that ODR-0104 was relocated to Builder ADR-0021 and that ODR-0001's voting machinery does not govern. I could not read Builder ADR-0021 from this worktree. My lenses were simulated analytical perspectives with no votes, which fits a non-voting protocol. Held objection with a withdrawal condition is the shared discipline. No real expert participated.

## Priority changes, pilots and checks

**(5) Three highest-priority changes to Astra's proposal.**

1. **Chapter contracts before prose.** A registry per chapter: one question, owned distinctions, not-here list, figure family, practice tasks and the glossary terms it may link. Navigation titles and a source test derive from it. At twenty-six chapters this is the only guard against drift between neighbours such as events and change against dates and periods.
2. **Redesign the specimens and own the missing chapters.** Three paired spreads with a definition on one side and a separately labelled instance on the other: glossary with dictionary, taxonomy with controlled vocabulary, resource with relationship. Each links the real candidate page type for "what a live page looks like" and copies nothing from it. Add benefits, costs and limits. Merge communities and cycle.
3. **Figures own the content track.** The connected-views figure currently sits in a half column of the comparison grid on the shared-meaning page, so Astra's readability point is grounded in source. New figures use a full-track container like the technical masters, in a plain register with at most six nodes and sentence-case edge labels. Each of the seven composition families declares its text-equivalent rule. The equivalent becomes visible below the container threshold and the drawing prints. The retired figure grammar hides in print and should carry no new work.

We also converge on practice: some tasks must end resolved. My pattern's reasoned answer, also-defensible and tempting-but-wrong already does that.

**(6) Pilot chapters and proportionate checks.** One per gateway, each carrying a different risk.

- **Understand: What we are building.** Risk: a second maintained model record. Checks: specimens use example.org identifiers and fictional labels, no candidate IRI appears, links resolve to existing route patterns, illustration geometry passes.
- **Explore: Established contexts and connections.** Risk: profession equals context. Checks: context names and definitions match the candidate context files, the profession band is separately labelled, no one-per-context pairing exists, the register link exists, and the DBT context is described as the register describes it.
- **Contribute: Read a candidate page and compare a revision.** Risk: claiming a live change view. Checks: retired anchors retained with a direct link, scaffold assertions moved, the version pin kept, the comparison labelled fictional, and nothing contradicting the review-and-releases current-state note.

Checks stay proportionate to prose. Extend the existing source tests to the registry. Keep the figure caption-and-equivalent test, the no-details-no-form test, the line limit and the glossary-anchor test. Build and link crawl run as today. Rendered checks wait for the OPDA Chrome binding: 320px reflow, 400% zoom, forced colours and print of one figure chapter. One domain reader works a pilot practice task and the hesitation is recorded in words, with no numbers and no recruited study, which remains a separate decision. Pilot three chapters before drafting the other twenty-three. If the contracts change after the pilots, revise the registry first.
