import { useStreamData } from '@/lib/stream/use-stream-data';
import type { FuelNetwork } from '@fuels/streams';
import type { ModuleKeys } from '@fuels/streams/subjects-def';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import v from 'voca';
import { useDynamicForm } from '../lib/form';
import { useTheme } from './theme-provider';
import { CardContent } from './ui/card';

function getFuelExample(
  network: FuelNetwork,
  stream: string,
  subjectClass: string | null,
  selectedFields: Record<string, string>,
) {
  const baseClass = stream.replace('Stream', '');
  const subjectImport = subjectClass ?? `${baseClass}Subject`;
  const formattedFields = Object.entries(selectedFields)
    .map(([key, value]) => `  ${v.camelCase(key)}: '${value}'`)
    .join(',\n');

  const subjectInit = Object.values(selectedFields).some(Boolean)
    ? `const subject = ${subjectImport}.build({\n${formattedFields}\n});`
    : `const subject = ${subjectImport}.build();`;

  return `import {
  Client,
  ${subjectImport},
  DeliverPolicy
  FuelNetwork,
} from '@fuels/streams';

${subjectInit}

async function main() {
  const client = await Client.new(FuelNetwork.${v.capitalize(network)});
  const connection = await client.connect();
  const stream = await connection.subscribe(subject, DeliverPolicy.New);
  
  for await (const msg of stream) {
    console.log('Subject:', msg.subject);
    console.log('Payload:', msg.payload);
  }
}

main().catch(console.error);`;
}

function getExamples(
  network: FuelNetwork,
  selectedModule: ModuleKeys = 'blocks',
  subjectClass: string | null = 'BlocksSubject',
  selectedFields: Record<string, string> = {},
) {
  const stream = v.capitalize(`${selectedModule}Stream`);

  return {
    fuel: getFuelExample(network, stream, subjectClass, selectedFields),
  };
}

export function CodeExamples() {
  const { selectedModule, selectedFields, subjectClass } = useDynamicForm();
  const { isTheme } = useTheme();
  const { network } = useStreamData();
  const codeTheme = isTheme('dark') ? vs2015 : vs;
  const examples = getExamples(
    network,
    selectedModule ?? 'blocks',
    subjectClass,
    selectedFields ?? {},
  );

  return (
    <CardContent className="pt-6 text-sm">
      <SyntaxHighlighter
        lineNumberStyle={{
          opacity: 0.2,
          marginRight: '1em',
          textAlign: 'right',
        }}
        showLineNumbers
        language="typescript"
        style={codeTheme}
        customStyle={{ background: 'transparent' }}
      >
        {examples.fuel}
      </SyntaxHighlighter>
    </CardContent>
  );
}
