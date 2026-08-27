# Modern web design prompt dictionary

Updated: 27 August 2026

This reference provides a practical vocabulary for directing the design and implementation of a state-of-the-art website. It separates visual art direction from layout, typography, motion, three-dimensional rendering and implementation techniques.

As of August 2026, the strongest websites are moving away from generic "AI aesthetic" pages towards recognisable art direction: proprietary effects, expressive typography, guided scrolling, spatial interfaces, deliberate colour systems and selective 3D. Webflow's current trend review highlights custom visual systems, art combined with advanced UI, dynamic text, guided scrolling and infinite-canvas compositions; recent Framer releases similarly emphasise interactive and video shaders.

Sources:

- [Webflow: eight web design trends to watch in 2026](https://webflow.com/blog/web-design-trends-2026)
- [Framer design tooling](https://www.framer.com/design/)

There is no finite list of every web style, but the following is a comprehensive working dictionary for prompting designers and AI tools.

## Major visual styles

| Term | What it communicates |
|---|---|
| Swiss / International Style | Strict grid, sans-serif typography, clarity and generous whitespace |
| Editorial / magazine | Dramatic typography, columns, pull quotes and art-directed composition |
| Luxury minimalism | Restrained palette, enormous whitespace, elegant serif and slow motion |
| Neo-brutalism | Heavy borders, loud colours, hard shadows and blunt typography |
| Raw web brutalism | Intentionally austere HTML-like presentation, system fonts and exposed structure |
| Expressive maximalism | Layered images, oversized type, saturated colour and deliberate visual density |
| Chromatic maximalism | A coherent multi-colour system rather than one accent colour |
| Retro-futurism | Historic visions of the future: chrome, grids, analogue controls and optimistic technology |
| Y2K digital | Metallic surfaces, bubble typography, translucent UI and early-internet references |
| Cyberpunk | Neon, dark environments, terminals, glitching and technological dystopia |
| Solarpunk | Bright natural light, ecology, organic forms and optimistic technology |
| Synthwave / vaporwave | Neon gradients, sunset palettes, grids and 1980s computer imagery |
| Neo-noir cinematic | Deep blacks, spotlighting, grain and dramatic image transitions |
| Bauhaus-inspired | Primary geometry, strong structure, asymmetry and functional colour |
| Constructivist | Diagonal compositions, declarative typography and poster-like visual tension |
| Memphis | Playful geometric patterns, clashing colour and postmodern humour |
| Organic modernism | Biomorphic forms, natural textures and softened geometry |
| Biophilic design | Nature-derived colours, materials, photography and movement |
| Handmade digital | Hand-drawn marks, imperfect lines, collage and sophisticated interaction |
| Scrapbook / analogue collage | Torn paper, tape, photocopy grain, annotations and overlapping media |
| ASCII / terminal aesthetic | Monospace type, text-generated imagery and computational character |
| Pixel-art web | Low-resolution graphics, sprite animation and game-like interaction |
| Dithered digital | Limited palettes, halftoning and intentionally compressed imagery |
| Generative identity | Brand visuals produced procedurally from rules, data or shaders |
| Data-driven aesthetic | Diagrams, nodes, coordinates and live data become the visual language |
| Spatial computing aesthetic | Floating layered interfaces arranged in depth |
| Game-like interface | Progress, exploration, controllable scenes and environmental storytelling |
| Museum / digital exhibition | Curated objects, restrained labels and room-like navigation |
| UI as art object | Product screens presented like paintings, sculptures or exhibits |
| Monochrome editorial | Black, white and typography carry nearly the entire identity |
| Material-rich minimalism | Simple composition elevated by grain, paper, glass, metal or light |

Terms such as glassmorphism, neumorphism, claymorphism and bento layout remain usable, but they are treatments rather than complete art directions. A purple gradient with glass cards now tends to look like an unedited AI default.

## Layout and composition

- **Full-bleed composition** — media reaches the viewport edges.
- **Broken grid** — selected elements deliberately escape the underlying grid.
- **Asymmetric editorial grid** — unequal columns with controlled visual balance.
- **Modular grid** — consistent rectangular units.
- **Bento grid** — varied tile sizes arranged within a modular system.
- **Split-screen hero** — copy and visual occupy separate halves.
- **Cardless layout** — hierarchy comes from spacing, rules and typography rather than containers.
- **Layered z-space** — foreground, midground and background elements visibly overlap.
- **Viewport composition** — every screenful is treated like an art-directed frame.
- **Horizontal gallery** — projects travel laterally, usually from vertical scroll input.
- **Sticky narrative** — one region remains fixed while related content changes.
- **Scrollytelling** — scrolling advances a narrative, visualisation or scene.
- **Guided scrolling** — progress cues and transitions explain where the visitor is.
- **Infinite canvas** — an open field of nodes, images or objects that can be explored.
- **Spatial navigation** — movement occurs through an environment rather than down a document.
- **Masonry layout** — variable-height items pack together.
- **Editorial index** — dense catalogue with numbers, metadata and strong typographic hierarchy.
- **Art-directed sections** — each section has a distinct composition within one coherent system.
- **Intentional negative space** — empty areas actively frame content.
- **Controlled density** — information-rich but systematically aligned.

## Typography

- **Kinetic typography** — type moves as part of the communication.
- **Typography-led design** — type is the primary visual material.
- **Display typography** — expressive large type intended for short statements.
- **Editorial scale** — dramatic contrast between display and body sizes.
- **Variable font animation** — weight, width, slant or optical size changes continuously.
- **Fluid typography** — font size scales responsively, commonly with `clamp()`.
- **Split-text reveal** — lines, words or characters animate independently.
- **Mask reveal** — text appears through a clipping region.
- **Text on path** — type follows a circle, curve or 3D trajectory.
- **Outlined / stroked type** — glyph contours rather than solid fills.
- **Condensed grotesk** — narrow, forceful sans-serif display type.
- **Humanist sans** — warmer, more readable sans-serif.
- **High-contrast serif** — elegant editorial or luxury character.
- **Monospaced annotation** — technical metadata, coordinates and labels.
- **Typographic texture** — repeated or layered type becomes image-like.
- **Marquee** — continuously travelling text.
- **Responsive line breaking** — controlled heading wraps across viewport sizes.
- **Optical sizing** — letterforms adapt to their rendered size.

Prompting "kinetic typography" alone often produces noisy animation. Add the purpose, for example: "Use motion only to emphasise key words and preserve reading order."

## Motion and interaction

- **Microinteraction** — small response to hover, focus, click or completion.
- **Motion choreography** — coordinated sequencing across elements.
- **Staggered reveal** — elements enter with small timing offsets.
- **Scroll-triggered animation** — animation starts at a defined scroll position.
- **Scroll-scrubbed animation** — animation progress follows scroll progress.
- **Pinned sequence** — a scene stays fixed while its internal state advances.
- **Parallax depth** — layers move at different rates to suggest depth.
- **Inertial motion** — movement eases after input stops.
- **Spring physics** — motion behaves according to tension and damping.
- **Magnetic interaction** — controls subtly move towards the pointer.
- **Cursor-reactive field** — particles, distortion or lighting respond to pointer position.
- **Object picking** — selecting a 3D object through raycasting.
- **Drag physics** — objects retain momentum or collide after dragging.
- **Morph transition** — one shape, image or layout transforms into another.
- **FLIP animation** — smoothly animates between layout states.
- **Shared-element transition** — an object persists visually between pages or views.
- **View Transition** — browser-native page or state transition.
- **Page-transition curtain** — a visual layer conceals navigation loading.
- **Hover distortion** — shader, displacement or image warping on hover.
- **Progressive disclosure** — details appear only when relevant.
- **Guided wayfinding** — progress bars, chapter markers and section indices.
- **Motion restraint** — a few expressive moments rather than perpetual motion.

GSAP's terminology is particularly useful in prompts: **timeline**, **trigger**, **scrub**, **pin**, **snap**, **stagger** and **scroll velocity**.

Source: [GSAP ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).

## Three.js, WebGL and WebGPU

Use **Three.js**, not "3js", when prompting.

### Scene types

- Interactive 3D hero
- Persistent WebGL background
- DOM-over-canvas composition
- 3D product configurator
- Procedural environment
- Interactive data landscape
- Particle field
- Point cloud
- Gaussian splat scene
- Virtual exhibition
- Camera-driven narrative

### Geometry and materials

- **GLTF / GLB model** — standard compressed 3D scene format.
- **Procedural geometry** — geometry created by code.
- **Instanced geometry** — many copies rendered efficiently.
- **PBR material** — physically based material response.
- **HDRI / image-based lighting** — environment image supplies realistic light.
- **Iridescent material** — colour changes with viewing angle.
- **Holographic material**
- **Transmission / refraction**
- **Subsurface scattering**
- **Displacement mapping**
- **Normal mapping**
- **Signed-distance field**
- **Raymarching**
- **Metaballs**
- **Noise field** — Perlin, Simplex, Curl or Voronoi noise.
- **Fluid simulation**
- **Cloth simulation**
- **Soft-body physics**

### Camera and scene movement

- **Camera dolly** — camera moves towards or away from a subject.
- **Orbit**
- **Truck / pedestal**
- **Camera path**
- **Scroll-linked camera**
- **Depth parallax**
- **Focal transition**
- **Object-to-camera transition**
- **Seamless 3D-to-DOM handoff**

### Shaders and post-processing

- **Vertex shader** — changes geometry positions.
- **Fragment shader** — controls pixel appearance.
- **TSL** — Three.js Shading Language.
- **Bloom**
- **Depth of field**
- **Ambient occlusion**
- **Screen-space reflections**
- **Motion blur**
- **Chromatic aberration**
- **RGB shift**
- **Film grain**
- **Vignette**
- **Halftone**
- **Dithering**
- **Pixelation**
- **Scanlines**
- **Colour grading / LUT**
- **Fresnel glow**
- **Caustics**
- **Volumetric light**
- **Fog / atmospheric depth**

Three.js now positions `WebGPURenderer` as its next-generation renderer, with WebGL 2 fallback, node materials and TSL. Its documentation still describes it as experimental, so a production prompt should request capability detection and a fallback.

Sources:

- [Three.js WebGPU guide](https://threejs.org/manual/en/webgpurenderer)
- [Three.js post-processing](https://threejs.org/manual/en/webgpu-postprocessing.html)

If the site uses React, useful terms include **React Three Fiber**, **Drei**, **react-three-postprocessing**, **demand rendering**, **adaptive DPR**, **LOD**, **Suspense asset loading** and **performance regression**. React Three Fiber is a React renderer for Three.js and exposes the full Three.js object catalogue.

Sources:

- [React Three Fiber introduction](https://r3f.docs.pmnd.rs/)
- [React Three Fiber performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)

## Surface and image treatments

- Mesh gradient
- Aurora gradient
- Liquid gradient
- Conic gradient
- Animated shader gradient
- Frosted glass
- Backdrop blur
- Film grain
- Paper grain
- Halftone
- Risograph texture
- Duotone
- Solarisation
- Colour burn
- Multiply blending
- Displacement distortion
- Refractive distortion
- Pixel sorting
- Datamoshing
- Glitch
- CRT treatment
- Chrome / liquid metal
- Soft luminous bloom
- Hard flash photography
- Cut-out collage
- Cinematic colour grade

## Quality words for prompts

These describe the desired result rather than a particular effect:

- Bespoke
- Ownable
- Art-directed
- Concept-led
- Editorial
- Tactile
- Spatial
- Cinematic
- Restrained
- Precise
- Composed
- Rhythmic
- Material-aware
- Content-led
- Brand-specific
- High-contrast
- Responsive
- Accessible
- Progressively enhanced
- Performance-budgeted
- Motion-safe

Avoid vague phrases such as "make it premium", "make it modern" or "make it Awwwards". Describe the actual visual logic.

## Prompt structure

Use this sequence:

> Create a [site type] for [audience and objective].  
> Art direction: [primary style] combined with [secondary influence].  
> Visual concept: [one memorable metaphor connected to the subject].  
> Composition: [grid and layout terms].  
> Typography: [font character, scale and treatment].  
> Colour and material: [palette and surface terms].  
> Hero: [3D or visual behaviour].  
> Motion: [specific interaction vocabulary and timing character].  
> Content hierarchy: [what must be understood first].  
> Technical approach: [Three.js, React Three Fiber, GSAP or another approach].  
> Constraints: [performance, accessibility, mobile and fallback requirements].  
> Avoid: [generic patterns and unwanted effects].

## Example prompt

> Create an art-directed digital knowledge environment for a property-data standards organisation. Combine Swiss editorial structure with a restrained spatial-computing aesthetic. Use an infinite node canvas as the core metaphor: property concepts appear as connected semantic objects, with precise typographic labels and evidence trails. Use a dark ink, off-white and amber system, not generic purple gradients. The hero should contain a lightweight Three.js point-and-line model that responds subtly to the pointer and transitions cleanly into DOM content. Use guided scrolling, restrained kinetic typography and short staggered reveals; no scroll hijacking or decorative parallax. Keep all meaningful content in semantic HTML. Provide a static fallback, adaptive pixel ratio, lazy-loaded assets, keyboard access and a complete reduced-motion mode.

The crucial rule is: **choose one visual concept, one dominant art direction and two or three interaction signatures**. A page containing every fashionable effect will look like a technology demonstration; a state-of-the-art site feels like every effect belongs to the same idea.

For motion-heavy work, request a reduced-motion composition rather than merely "disable animations"; large panning and scaling can cause vestibular discomfort. Also require explicit Core Web Vitals targets so visual ambition does not conceal poor loading or interaction performance.

Sources:

- [MDN: `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- [Web Vitals](https://web.dev/articles/vitals)
