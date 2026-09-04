export type HeaderIconRole = 'a' | 'b' | 'c' | 'band';

export interface HeaderIconShape {
  readonly element: 'path' | 'rect';
  readonly role: HeaderIconRole;
  readonly paint?: 'fill' | 'stroke';
  readonly d?: string;
  readonly x?: string;
  readonly y?: string;
  readonly width?: string;
  readonly height?: string;
  readonly fillRule?: 'evenodd';
  readonly strokeWidth?: string;
  readonly strokeLinecap?: 'square';
}

export interface HeaderIcon {
  readonly id: string;
  readonly number: string;
  readonly name: string;
  readonly viewBox: string;
  /** Width occupied by the artwork inside the SVG viewBox. */
  readonly visibleWidth: number;
  /** Bottom edge occupied by the artwork in viewBox coordinates. */
  readonly visibleBottom: number;
  readonly shapes: readonly HeaderIconShape[];
}

export const DEFAULT_HEADER_ICON = 'party-wall' as const;

// Complete numbered archive from the local Fable identity report. Geometry is
// centralised so the masthead, picker and previews cannot drift apart.
export const HEADER_ICONS: readonly HeaderIcon[] = [
  { id: 'twin-frames', number: '01', name: 'Direction A · twin frames', viewBox: '0 0 16 16', visibleWidth: 16, visibleBottom: 16, shapes: [
    { element: 'path', role: 'a', fillRule: 'evenodd', d: 'M0 0h9v9H0Zm2 2v5h5V2Z' },
    { element: 'path', role: 'a', fillRule: 'evenodd', d: 'M7 7h9v9H7Zm2 2v5h5V9Z' },
    { element: 'path', role: 'b', d: 'M5 5h6v6H5Z' },
  ] },
  { id: 'open-frame', number: '02', name: 'Direction B · open frame', viewBox: '0 0 16 16', visibleWidth: 16, visibleBottom: 16, shapes: [
    { element: 'path', role: 'a', d: 'M0 0h11v2H2v12h12V5h2v11H0Z' },
    { element: 'path', role: 'b', d: 'M6 6h6v6H6Z' },
  ] },
  { id: 'common-boundary', number: '03', name: 'Common Boundary', viewBox: '0 0 64 64', visibleWidth: 56, visibleBottom: 58, shapes: [
    { element: 'path', role: 'a', d: 'M4 6h28v8H12v20H4z' },
    { element: 'path', role: 'b', d: 'M60 58H32v-8h20V30h8z' },
    { element: 'path', role: 'c', d: 'M23 23h18v18H23z' },
  ] },
  { id: 'evidence-relay-first', number: '04', name: 'Evidence Relay (first drawing)', viewBox: '0 0 64 64', visibleWidth: 56, visibleBottom: 57, shapes: [
    { element: 'path', role: 'a', d: 'M4 7h13l20 20h23v10H33L13 17H4z' },
    { element: 'path', role: 'b', d: 'M4 27h24l10 10H4z' },
    { element: 'path', role: 'c', d: 'M4 47h9l20-20h27v10H37L17 57H4z' },
  ] },
  { id: 'consent-aperture-first', number: '05', name: 'Consent Aperture (first drawing)', viewBox: '0 0 64 64', visibleWidth: 52, visibleBottom: 58, shapes: [
    { element: 'path', role: 'a', d: 'M10 6h44L42 22H22zM54 58H10l12-16h20z' },
    { element: 'path', role: 'b', d: 'M58 10v44L42 42V22z' },
    { element: 'path', role: 'c', d: 'M6 54V10l16 12v20z' },
  ] },
  { id: 'semantic-weave-first', number: '06', name: 'Semantic Weave (first drawing)', viewBox: '0 0 64 64', visibleWidth: 56, visibleBottom: 60, shapes: [
    { element: 'path', role: 'a', d: 'M6 4h12v20H6zm0 36h12v20H6z' },
    { element: 'path', role: 'b', d: 'M26 4h12v20H26zm0 36h12v20H26z' },
    { element: 'path', role: 'c', d: 'M46 4h12v20H46zm0 36h12v20H46z' },
    { element: 'path', role: 'band', d: 'M4 24h56v16H4z' },
    { element: 'path', role: 'a', d: 'M6 24h12v16H6z' },
    { element: 'path', role: 'c', d: 'M46 24h12v16H46z' },
  ] },
  { id: 'parcel-register', number: '07', name: 'Parcel Register', viewBox: '0 0 64 64', visibleWidth: 56, visibleBottom: 60, shapes: [
    { element: 'path', role: 'a', d: 'M4 4h25l-3 23H4zM30 32h30v28H35z' },
    { element: 'path', role: 'b', d: 'M33 4h27v23H30z' },
    { element: 'path', role: 'c', d: 'M4 31h21l5 29H4z' },
  ] },
  { id: 'common-threshold', number: '08', name: 'Common Threshold', viewBox: '0 0 64 64', visibleWidth: 52, visibleBottom: 56, shapes: [
    { element: 'path', role: 'a', d: 'M6 8h24v9H15v30h15v9H6Z' },
    { element: 'path', role: 'b', d: 'M58 8H34v9h15v30H34v9h24Z' },
    { element: 'rect', role: 'c', x: '28', y: '27', width: '8', height: '10' },
  ] },
  { id: 'evidence-relay-second', number: '09', name: 'Evidence Relay (second drawing)', viewBox: '0 0 64 64', visibleWidth: 52, visibleBottom: 56, shapes: [
    { element: 'path', role: 'a', d: 'M6 8h13l19 18h20v9H34L16 17H6Z' },
    { element: 'path', role: 'b', d: 'M6 27h29v9H6Z' },
    { element: 'path', role: 'c', d: 'M6 47h10l18-17h24v9H38L20 56H6Z' },
  ] },
  { id: 'consent-aperture-second', number: '10', name: 'Consent Aperture (second drawing)', viewBox: '0 0 64 64', visibleWidth: 52, visibleBottom: 58, shapes: [
    { element: 'path', role: 'a', d: 'M6 6h23v9H15v14H6Z' },
    { element: 'path', role: 'b', d: 'M35 6h23v23h-9V15H35Z' },
    { element: 'path', role: 'b', d: 'M6 35h9v14h14v9H6Z' },
    { element: 'path', role: 'a', d: 'M49 35h9v23H35v-9h14Z' },
    { element: 'rect', role: 'c', x: '28', y: '28', width: '8', height: '8' },
  ] },
  { id: 'semantic-weave-second', number: '11', name: 'Semantic Weave (second drawing)', viewBox: '0 0 64 64', visibleWidth: 56, visibleBottom: 52, shapes: [
    { element: 'path', role: 'a', paint: 'stroke', d: 'M8 16h16c8 0 8 32 16 32h16', strokeWidth: '8', strokeLinecap: 'square' },
    { element: 'path', role: 'b', paint: 'stroke', d: 'M8 48h16c8 0 8-32 16-32h16', strokeWidth: '8', strokeLinecap: 'square' },
    { element: 'path', role: 'c', d: 'M28 28h8v8h-8Z' },
  ] },
  { id: 'sixfold-register', number: '12', name: 'Sixfold Register', viewBox: '0 0 64 64', visibleWidth: 52, visibleBottom: 60, shapes: [
    { element: 'path', role: 'a', d: 'M6 12h9v40H6Z' }, { element: 'path', role: 'b', d: 'M18 7h9v45h-9Z' },
    { element: 'path', role: 'c', d: 'M30 17h9v35h-9Z' }, { element: 'path', role: 'a', d: 'M42 10h9v42h-9Z' },
    { element: 'path', role: 'b', d: 'M54 22h4v30h-4Z' }, { element: 'path', role: 'c', d: 'M6 56h52v4H6Z' },
  ] },
  { id: 'party-wall', number: '13', name: 'Party Wall', viewBox: '0 0 16 16', visibleWidth: 16, visibleBottom: 16, shapes: [
    { element: 'path', role: 'a', d: 'M0 0h7v7H5v9H0Z' }, { element: 'path', role: 'b', d: 'M9 0h7v16H7V9h2Z' },
  ] },
  { id: 'root-of-title', number: '14', name: 'Root of Title', viewBox: '0 0 16 16', visibleWidth: 16, visibleBottom: 16, shapes: [
    { element: 'path', role: 'a', d: 'M0 12h4v4H0Z' }, { element: 'path', role: 'b', d: 'M4 13h4v2H4ZM6 8h2v7H6ZM6 8h6v2H6ZM10 6h2v4h-2Z' },
    { element: 'path', role: 'c', fillRule: 'evenodd', d: 'M10 0h6v6h-6Zm2 2v2h2V2Z' },
  ] },
  { id: 'quarter-turn', number: '15', name: 'Quarter Turn', viewBox: '0 0 16 16', visibleWidth: 16, visibleBottom: 16, shapes: [
    { element: 'path', role: 'a', d: 'M0 0h11v4H0ZM5 12h11v4H5Z' }, { element: 'path', role: 'b', d: 'M12 0h4v11h-4ZM0 5h4v11H0Z' },
    { element: 'path', role: 'c', d: 'M6 6h4v4H6Z' },
  ] },
  { id: 'aperture-first', number: '16', name: 'Aperture (first drawing)', viewBox: '0 0 16 16', visibleWidth: 16, visibleBottom: 12, shapes: [
    { element: 'path', role: 'a', d: 'M0 3h9v2H2v5h7v2H0Z' }, { element: 'path', role: 'b', d: 'M11 5h5v5h-5Z' },
  ] },
  { id: 'datum', number: '17', name: 'Datum', viewBox: '0 0 16 16', visibleWidth: 16, visibleBottom: 15, shapes: [
    { element: 'path', role: 'a', d: 'M0 7h16v2H0Z' }, { element: 'path', role: 'b', d: 'M8 9L14 15H2Z' },
    { element: 'path', role: 'c', d: 'M10 2h5v5h-5Z' },
  ] },
  { id: 'aperture-second', number: '18', name: 'Aperture (second drawing)', viewBox: '0 0 16 16', visibleWidth: 16, visibleBottom: 16, shapes: [
    { element: 'path', role: 'a', d: 'M0 2h9v3H3v8h6v3H0Z' }, { element: 'path', role: 'b', d: 'M11 6h5v5h-5Z' },
  ] },
  { id: 'threshold-dual-theme', number: '19', name: 'Threshold (dual-theme)', viewBox: '0 0 16 16', visibleWidth: 16, visibleBottom: 16, shapes: [
    { element: 'path', role: 'a', d: 'M0 0h6v4H3v8h3v4H0Z' }, { element: 'path', role: 'a', d: 'M10 0h6v16h-6v-4h3V4h-3Z' },
    { element: 'path', role: 'b', d: 'M5 5h6v6H5Z' }, { element: 'path', role: 'c', d: 'M6.5 6.5h3v3h-3Z' },
  ] },
  { id: 'party-wall-altered', number: '20', name: 'Party Wall (altered)', viewBox: '0 0 16 16', visibleWidth: 16, visibleBottom: 16, shapes: [
    { element: 'path', role: 'a', d: 'M0 3h9V0h7v16H0Z' }, { element: 'path', role: 'c', d: 'M7 5h2v9H7Z' },
  ] },
  { id: 'root-of-title-altered', number: '21', name: 'Root of Title (altered)', viewBox: '0 0 16 16', visibleWidth: 16, visibleBottom: 16, shapes: [
    { element: 'path', role: 'a', d: 'M6 0h10v10H9v6H0v-3h6Z' }, { element: 'path', role: 'c', d: 'M9 3h4v4H9Z' },
  ] },
  { id: 'quarter-turn-altered', number: '22', name: 'Quarter Turn (altered)', viewBox: '0 0 16 16', visibleWidth: 16, visibleBottom: 16, shapes: [
    { element: 'path', role: 'a', d: 'M0 0h10v5H0ZM11 0h5v10h-5ZM6 11h10v5H6ZM0 6h5v10H0Z' }, { element: 'path', role: 'c', d: 'M5 5h6v6H5Z' },
  ] },
  { id: 'aperture-altered', number: '23', name: 'Aperture (altered)', viewBox: '0 0 16 16', visibleWidth: 16, visibleBottom: 16, shapes: [
    { element: 'path', role: 'a', d: 'M0 0h16v5h-6v6h6v5H0Z' }, { element: 'path', role: 'c', d: 'M4 6h4v4H4Z' },
  ] },
  { id: 'datum-altered', number: '24', name: 'Datum (altered)', viewBox: '0 0 16 16', visibleWidth: 16, visibleBottom: 16, shapes: [
    { element: 'path', role: 'a', d: 'M4 0h8v9h4v3h-3l-5 4-5-4H0V9h4Z' }, { element: 'path', role: 'c', d: 'M6 3h4v4H6Z' },
  ] },
] as const;

export const HEADER_ICON_IDS = HEADER_ICONS.map(({ id }) => id);
export type HeaderIconId = (typeof HEADER_ICONS)[number]['id'];
