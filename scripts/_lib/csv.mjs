import fs from 'node:fs';

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function readCsv(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const [headers, ...rows] = parseCsv(fs.readFileSync(filePath, 'utf8'));
  return rows
    .filter((row) => row.some((field) => field.length))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));
}

export function csvField(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}
