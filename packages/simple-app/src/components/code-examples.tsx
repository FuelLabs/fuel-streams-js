import type { ModuleKeys } from '@fuels/streams/subjects-def';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import v from 'voca';
import { useDynamicForm } from '../lib/form';
import { useTheme } from './theme-provider';
import { CardContent } from './ui/card';

function getFuelExample(
  stream: string,
  subjectClass: string | null,
  selectedFields: Record<string, string>,
) {
  const baseClass = stream.replace('Stream', 'Subject');
  const subjectImport = subjectClass ?? baseClass;

  const formattedFields = Object.entries(selectedFields)
    .map(([key, value]) => `  ${v.camelCase(key)}: '${value}'`)
    .join(',\n');

  const subjectInit = Object.values(selectedFields).some(Boolean)
    ? `let subject = ${subjectImport}.build({\n${formattedFields}\n});`
    : `let subject = ${subjectImport}.build();`;

  return `import {
  Client,
  ClientOpts,
  ${stream},
  ${subjectImport}
} from '@fuels/streams';

${subjectInit}

async function main() {
  const opts = new ClientOpts();
  const client = await Client.connect(opts);
  const stream = await ${stream}.init(client);
  const subscription = await stream.subscribeWithSubject(subject);
  
  for await (const msg of subscription) {
    console.log('Received message:', msg.json());
  }
  
  await stream.flushAwait();
}

main().catch(console.error);`;
}

function getExamples(
  subject: string | null = 'blocks.>',
  selectedModule: ModuleKeys = 'blocks',
  subjectClass: string | null = 'BlocksSubject',
  selectedFields: Record<string, string> = {},
) {
  const stream = v.capitalize(`${selectedModule}Stream`);

  return {
    fuel: getFuelExample(stream, subjectClass, selectedFields),
    natsNode: `import { connect } from 'nats';

async function main() {
  const nc = await connect({
    servers: 'nats://stream-testnet.fuel.network:4222'
  });

  const sub = nc.subscribe('${subject}');
  console.log('Subscription created on', '${subject}');
  
  for await (const msg of sub) {
    const data = msg.json();
    console.log('Received:', data);
  }
}

main().catch(console.error);`,
    natsBrowser: `import { wsconnect } from 'nats';

async function main() {
  const nc = await connect({
    servers: 'wss://stream-testnet.fuel.network:4222'
  });

  const sub = nc.subscribe('${subject}');
  console.log('Subscription created on', '${subject}');
  
  for await (const msg of sub) {
    const data = msg.json();
    console.log('Received:', data);
  }
}

main().catch(console.error);`,

    natsCli: `# Install NATS CLI if you haven't already
# brew install nats-io/nats-tools/nats
# or download from https://github.com/nats-io/natscli/releases

# Subscribe to the stream
nats kv watch "fuel_${selectedModule}" "${subject}" \\
  --server=nats://stream-testnet.fuel.network:4222

# Both protocols nats:// or wss:// can be used here
nats kv watch "fuel_${selectedModule}" "${subject}" \\
  --server=wss://stream-testnet.fuel.network:8443`,
  };
}

export function CodeExamples() {
  const { subject, selectedModule, selectedFields, subjectClass } =
    useDynamicForm();
  const { isTheme } = useTheme();
  const codeTheme = isTheme('dark') ? vs2015 : vs;
  const examples = getExamples(
    subject,
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
