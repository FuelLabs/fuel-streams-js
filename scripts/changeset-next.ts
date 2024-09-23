import { writeFileSync } from 'node:fs';

const output = `---
"@fuels/streams": patch
---

incremental
`;
writeFileSync('.changeset/fuel-labs-ci.md', output);
