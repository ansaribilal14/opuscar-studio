# task-6-main.md — Operator Master Directive #2 (verbatim, word-for-word)

> This file is the operator's directive, preserved exactly as given. All work is
> tracked as git issues referencing this document. Do not edit the text below.

---

Worked for 42s

Here is the repair directive I would give your coding agent. It targets the visual direction and storytelling of the main engine, not just another round of cosmetic changes.

# MASTER DIRECTIVE — OPUSCAR STUDIO VISUAL QUALITY RECOVERY & ENGAGEMENT UPGRADE

**Repository:** `https://github.com/ansaribilal14/opuscar-studio`
**Primary objective:** Restore the engaging, authentic, image-rich documentary quality of earlier Opuscar outputs while improving hooks, visual storytelling, scene composition, and pacing.

**This is a production-engine improvement task, not a request to redesign one video.** The renderer must produce better films consistently across future subjects without damaging the parts of the pipeline that already work.

## 1. Understand the regression before changing anything

Read `BRAIN.md`, `worklog.md`, `task-main.md`, the rendering architecture and benchmark documents, and all relevant source files.

Inspect the actual latest production output, especially the Zodiac v2 film:

`https://github.com/ansaribilal14/opuscar-studio/releases/tag/video-002-zodiac-v2.0.0`

Inspect its source scenes, image assets, timelines, treatments, rendering functions, music cues, sound effects, and available earlier renders or previews.

Compare earlier and current outputs wherever the actual assets are available. Identify the exact changes that improved the visual experience and those that made the result worse.

The recent engine v3 work includes photo framing, Ken Burns movement, photo-cut backdrops, ghost compositing, vector scenes, and archival treatments. Do not assume these features are inherently good or bad. Determine how they interact in the actual rendered frames.

Produce a concise regression report covering:

- Why the opening feels dull.
- Why the hook fails to establish curiosity or tension.
- Whether authentic images are too small, too heavily treated, obscured, or visually secondary.
- Whether decorative frames, labels, cards, textures, and overlays compete with the photograph.
- Whether camera movement is too slow, repetitive, or barely perceptible.
- Whether scenes repeat the same composition or transition pattern.
- Whether vector artwork is adding information or merely occupying screen space.
- Whether the soundtrack, sound effects, and image changes support the narrative.
- Which earlier visual behaviors must be preserved.

Do not infer that the problem is solved from a successful encode, passing luma scan, valid audio, or a few attractive still frames.

## 2. Restore the image-first visual philosophy

The authentic images previously used in our videos should feel like part of the scene—not like tiny photographs trapped inside layers of UI.

Establish the following visual hierarchy:

1. **Primary visual evidence:** authentic photographs, archival material, relevant real locations, documents, maps, and other sourced imagery.
2. **Editorial composition:** deliberate cropping, image-to-image transitions, camera movement, collages, split compositions, and contextual placement.
3. **Supporting graphics:** titles, dates, source labels, maps, annotations, timelines, and restrained evidence cards.
4. **Atmospheric styling:** grain, paper textures, color treatment, borders, tape, shadows, and other effects.

Supporting elements must never routinely overpower the primary visual evidence.

### Image composition rules

- Allow important authentic photographs to occupy most or all of the frame when that best serves the scene.
- Embed images naturally into full-screen compositions, cinematic collages, layered evidence boards, documentary layouts, or other scene-appropriate arrangements.
- Use close crops and detail shots to draw attention to meaningful evidence.
- Use multiple photographs together when their relationship communicates something important.
- Allow images to interact with maps, dates, documents, and annotations instead of automatically placing each image inside an isolated decorative card.
- Use framing, tape, borders, shadows, paper textures, and archival mats only when they strengthen the storytelling.
- Do not put a decorative frame around every photograph by default.
- Do not routinely shrink images to make room for unnecessary labels or oversized interface elements.
- Avoid applying heavy duotone, ghosting, opacity reduction, blur, grain, or dark overlays to every image.
- Preserve authentic image detail, contrast, legibility, and recognizable subject matter.
- Do not place important faces, evidence, text, or landmarks behind titles or decorative overlays.
- Make the source credit readable without turning the entire scene into a citation panel.
- Use full-bleed photography when appropriate; use designed compositions when they communicate more.
- Vary composition deliberately. A documentary should not look like the same template repeated 200 times.

**Critical rule:** An authentic photograph is not merely a background texture. It is evidence, atmosphere, and storytelling material. Treat it as the central visual when the narration depends on it.

## 3. Rebuild the opening and hook system

The first 5–15 seconds must earn the viewer's attention.

Do not automatically begin every video with a logo, a long title card, a slow establishing shot, or generic introductory narration.

Build the opening from the subject's strongest verified material and the narrative's most compelling unresolved question.

The hook should combine, where appropriate:

- A concrete, intriguing fact or contradiction.
- A compelling visual that immediately illustrates the subject.
- A short, purposeful narration line.
- Deliberate sound design and a musical cue that creates anticipation.
- A visual or narrative question that the documentary will answer.

Use an immediate, relevant image rather than an unrelated cinematic background. If the opening refers to a real event, person, place, document, or photograph, use that material whenever it is available and appropriate.

### Hook design requirements

Create several candidate hook structures during planning and select the strongest based on the actual evidence and available assets.

For example, a hook may begin with a close-up of an authentic document, cut to a significant real photograph, reveal a surprising contradiction, and then pose the central question. This is a structural example, not a template that every film must copy.

- Do not fabricate suspense or exaggerate facts.
- Do not use misleading imagery simply because it looks dramatic.
- Do not explain the entire premise before creating curiosity.
- Avoid generic phrases such as "What if everything you knew was wrong?" unless the evidence genuinely supports that framing.
- Avoid unnecessarily prolonged title animations and empty introductory beats.
- Make the first major visual change purposeful, not just a random transition.
- Introduce the title at the point where it adds impact rather than allowing branding to delay the story.
- Make the opening work even when watched on a phone with sound initially low or captions enabled.

Evaluate the opening as an independent short sequence. If it does not create immediate interest, redesign it before rendering the whole documentary.

## 4. Make scenes visually attentive to narration

Every scene must respond to what the narrator is saying at that exact moment.

Use the existing research, script, claim ledger, source manifest, narration blocks, and timeline as the basis for visual decisions.

For each narration block, generate a scene brief that specifies:

- The idea or claim being communicated.
- The strongest relevant authentic visual asset.
- The detail the viewer should notice.
- The intended composition and focal point.
- Whether the scene needs full-screen photography, a collage, a map, a document, a timeline, a vector illustration, or a deliberate visual pause.
- The camera movement or edit rhythm, if any.
- The transition into and out of the scene.
- The relevant source credit and any reconstruction disclosure.

Do not use a photograph simply because it is associated with the general topic. It should contribute to the specific narration or clearly serve a deliberate contextual purpose.

When a narration block introduces a new fact, location, person, date, document, or turning point, the visual treatment should acknowledge that change.

Use visual continuity when the narration develops one idea. Use a purposeful visual change when the story moves to a new idea.

Avoid:

- The same photograph held for too long without a narrative reason.
- Arbitrary cuts that do not correspond to the narration.
- Repeated generic portrait shots.
- Unrelated stock imagery.
- Repetitive map animations and decorative graphs that add no information.
- Random zooming intended to make static material appear dynamic.
- Reusing the same dramatic effect for every important statement.
- Long passages in which the visuals could be replaced by a blank screen without losing any information.

When a visual claim cannot be supported by available assets, source suitable material or use a clearly appropriate, accurately labeled explanatory graphic. Do not invent evidence to fill a visual gap.

## 5. Create a deliberate visual rhythm

A compelling documentary is not fast merely for the sake of being fast. It alternates between detail, discovery, explanation, atmosphere, and reflection.

Build a visual rhythm that follows the narrative:

- **Opening:** immediate visual interest, strong contrast, and purposeful momentum.
- **Context:** establish people, places, and circumstances through meaningful images.
- **Evidence:** slow down when the viewer needs time to inspect a photograph, document, or detail.
- **Discovery:** use purposeful cuts, reveals, annotations, or changes in composition.
- **Tension:** use restrained movement, visual contrast, and sound where the subject justifies them.
- **Explanation:** simplify the frame when clarity matters more than spectacle.
- **Resolution:** create a satisfying visual and emotional landing rather than abruptly ending the sequence.

Implement varied, scene-aware timing rather than one universal duration for every photograph or transition.

Allow a photograph to breathe when it contains meaningful detail. Move on when it has fulfilled its purpose.

Vary movement across shots: some may be static, some may use a slow push, others a lateral move, a close crop, a hard cut, or a multi-image composition. Movement must guide attention rather than merely animate the frame.

Transitions should express a relationship between scenes. Do not add a transition to every cut just to make the edit appear sophisticated.

## 6. Upgrade the image acquisition and selection workflow

Keep the existing real-image sourcing and licensing workflow intact. Improve it rather than replacing it with generated filler.

Rank candidate assets according to:

- Relevance to the exact narration.
- Authenticity and provenance.
- Visual clarity and resolution.
- Composition and focal point.
- Historical or contextual accuracy.
- Diversity relative to images already used.
- License, usage eligibility, and attribution requirements.

Where useful, improve search queries with named entities, dates, locations, events, source organizations, and specific visual details.

Inspect actual downloaded images before approving them for a scene. A relevant title or search result is not enough.

Avoid repeatedly using the same handful of images when better source material exists. Conversely, do not reject a strong authentic photograph simply because it appears more than once; a deliberate return to the same image can reinforce a meaningful narrative connection.

Preserve source URLs, license metadata, attribution, access dates, and original asset files. Maintain the existing rule that generated reconstructions must never be misrepresented as authentic archival evidence.

## 7. Rebalance archival effects and graphics

Review the current photo treatment and compositing system at the source-code level.

In particular, audit the combined effect of:

- `photoPlate` positioning and scale.
- Ken Burns movement and per-photo motion configuration.
- `base()` ghost compositing.
- Photo-cut backdrops.
- Vector-scene foreground elements.
- Color grading, opacity, grain, blur, shadows, and vignette.
- Borders, tape, labels, title cards, and source credits.
- Camera movement and transitions.

Fix the combined composition, not just individual parameters.

If a photograph is already a visually strong full-frame asset, do not automatically add a frame, texture, ghost layer, and vector foreground on top of it.

If a scene needs an archival collage, make the collage intentional, legible, and visually balanced. If it needs a clear photograph, let the photograph dominate.

Create a small set of reusable visual composition modes—for example, full-bleed archival image, cinematic photo collage, evidence/document close-up, contextual map, restrained explanatory graphic, and atmospheric transition. Select modes based on the scene brief, not randomly.

Preserve the existing renderer and deterministic rendering contract. Make changes modular, testable, and reversible.

## 8. Improve sound and visual synchronization

Review the current act-cue score, SFX layer, and three-bus mix.

Sound must reinforce the visual and narrative beats, not compensate for weak visuals.

- Use a deliberate musical identity and dynamic arc.
- Align important sound accents with meaningful reveals or transitions.
- Avoid excessive whooshes, impacts, risers, ticks, and repetitive sound effects.
- Preserve clear narration and the established loudness standard.
- Use silence or reduced music when it makes an important statement more effective.
- Do not force a dramatic sound onto every photograph or sentence.
- Do not allow rhythmic cuts to become monotonous.
- Keep sound effects consistent with the documentary's tone and the evidence being shown.

A scene should remain visually understandable without relying on an exaggerated sound effect to make it feel important.

## 9. Implement an actual visual quality-control loop

Existing technical checks are necessary but insufficient. Add a separate visual editorial review.

For every proof render, generate a contact sheet or storyboard of representative frames covering:

- The first 15 seconds, sampled densely enough to assess the hook.
- Every scene boundary and major visual transition.
- Every major claim or evidence reveal.
- Several representative points in the middle.
- The final minute and conclusion.

Inspect the actual encoded output as well as the source render. Source frames can look correct while the final composition is cropped, obscured, or otherwise degraded.

Assess:

1. Does the opening create curiosity immediately?
2. Is the main photograph or visual evidence large enough and clearly visible?
3. Can the viewer identify the intended subject of each shot?
4. Does every major scene add information, context, emotion, or narrative progression?
5. Are titles and annotations readable without overpowering the image?
6. Are movement and transitions varied for a reason?
7. Does the sequence avoid long stretches of repetitive composition?
8. Do the images match the narration?
9. Does the ending deliver a meaningful resolution?
10. Would a viewer understand the film's visual story if they watched without audio?

Add measurable technical checks where possible, but do not pretend that a numerical score can fully evaluate engagement.

Produce a review report identifying weak frames and scenes, the cause, the correction, and the result after re-rendering.

## 10. Benchmark the upgrade before a full rebuild

Do not immediately rerender every film or redesign the whole engine.

Choose a representative sequence from the current Zodiac v2 documentary containing a strong opening or evidence-driven narrative beat.

Create a controlled comparison:

- **Baseline:** the existing rendered sequence.
- **Candidate A:** improved hook and scene order.
- **Candidate B:** image-first composition with reduced decorative treatment.
- **Candidate C:** the strongest combined treatment, only if the first two experiments justify it.

Use the same narration and factual content for the comparison. Keep the authentic image assets and source credits consistent where practical, so the comparison isolates the editorial and rendering changes.

Inspect the actual frames and encoded previews. Compare visual clarity, image prominence, narrative relevance, pacing, and opening impact. Choose the best version based on evidence from the output, not the complexity of the implementation.

After selecting the strongest approach, implement it as reusable engine behavior and verify that it does not regress other scene types.

Then rerender the complete benchmark film only after the proof sequence passes editorial and technical review.

## 11. Preserve what already works

Do not:

- Replace the production renderer just to pursue a new engine.
- Remove the authentic image pipeline.
- Replace real archival material with generated images.
- Change documentary topics or invent a new content strategy.
- Break the existing narration, source ledger, credits, audio mixing, subtitle generation, deterministic rendering, or release workflow.
- Delete useful original assets or overwrite previous releases.
- Treat more effects, more cuts, more images, or more code as proof of better quality.

Retain working components and make the smallest set of changes that produces a demonstrably better viewer experience.

If an existing feature is responsible for the regression, repair or disable it selectively rather than removing unrelated functionality.

## 12. Git workflow and completion criteria

Follow the repository's established Git and worklog protocol.

1. Record the visual regression and implementation plan.
2. Break the work into concrete tasks with GitHub issues where appropriate.
3. Preserve the baseline and identify the affected files.
4. Implement the focused changes.
5. Run the existing regression suite and add tests for any new behavior.
6. Generate and review the proof render.
7. Document what improved and what still needs attention.
8. Update `worklog.md` with actual results.
9. Commit and push using the authorized repository environment.
10. Publish a new version only after the resulting video has been inspected.

Do not claim that a visual review passed if only a render command or automated metric succeeded.

### Final deliverables

- Root-cause report identifying the exact source of the visual regression.
- A clear before/after comparison of the hook and representative scenes.
- The corrected reusable rendering and scene-composition behavior.
- An actual proof video and reviewed contact sheet.
- Regression tests and updated documentation.
- A new full render and release only after the proof demonstrates a meaningful improvement.

**Definition of success:** The viewer sees authentic, relevant images presented with cinematic intention; the opening creates immediate curiosity; every scene contributes to the story; graphics enhance rather than suffocate the imagery; and the finished documentary feels alive, deliberate, and worth continuing to watch.

Do not optimize for how impressive the code looks. Optimize for what the viewer actually sees and feels.
