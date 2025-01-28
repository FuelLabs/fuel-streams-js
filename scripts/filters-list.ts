import { readFileSync, writeFileSync } from 'node:fs';
import { subjectsDefinitions } from '../packages/fuel-streams/src/subjects-def';
import { getTsType } from '../packages/simple-app/src/lib/form/form-helpers';

// Format a single field entry
function formatField([key, field]: [
  string,
  { type: string; description: string },
]): string {
  return `- \`${key} (${getTsType(field.type)})\`\n\t- ${field.description}`;
}

// Format fields for a subject or variant
function formatFields(
  fields: Record<string, { type: string; description: string }>,
): string {
  return Object.entries(fields).map(formatField).join('\n');
}

// Generate section for a variant
function generateVariantSection(variant: {
  subject: string;
  fields: Record<string, any>;
}): string {
  const variantFields = formatFields(variant.fields);
  return `\n\n#### \`${variant.subject}\`\n\n${variantFields}`;
}

// Generate section for a main subject
function generateSubjectSection(subject: {
  entity: string;
  subject: string;
  fields: Record<string, any>;
  variants?: Record<string, any>;
}): string {
  let section = `### ${subject.entity}\n\n#### \`${subject.subject}\`\n\n${formatFields(subject.fields)}`;

  if (subject.variants) {
    const variantSections = Object.values(subject.variants)
      .map(generateVariantSection)
      .join('');
    section += variantSections;
  }

  return section;
}

function generateFiltersList(): string {
  const sections = Object.values(subjectsDefinitions).map(
    generateSubjectSection,
  );
  return sections.join('\n\n');
}

function updateReadme(): void {
  const readmePath = './README.md';
  const readme = readFileSync(readmePath, 'utf-8');
  const filtersList = generateFiltersList();

  const startMarker = '<!-- start filters list -->';
  const endMarker = '<!-- end filters list -->';

  const startIndex = readme.indexOf(startMarker);
  const endIndex = readme.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Could not find markers in README.md');
  }

  const newReadme = `${readme.substring(0, startIndex + startMarker.length)}

${filtersList}

${readme.substring(endIndex)}`;

  writeFileSync(readmePath, newReadme);
  console.log('README.md updated successfully');
}

updateReadme();
