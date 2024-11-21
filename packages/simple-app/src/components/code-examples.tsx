import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import v from 'voca';
import { type FormModuleType, useDynamicForm } from '../lib/form';
import { useTheme } from './theme-provider';
import { CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

function getFuelExample(
  stream: string,
  _subject: string,
  subjectClass: string | null,
) {
  const baseClass = stream.replace('Stream', 'Subject');
  const subjectImport = subjectClass ?? baseClass;
  return `import {
  Client,
  ClientOpts,
  ${stream},
  ${subjectImport}
} from '@fuels/streams';

let subject = ${subjectImport}.all();

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
  selectedModule: FormModuleType = 'blocks',
  subjectClass: string | null = 'BlocksSubject',
) {
  const stream = v.capitalize(`${selectedModule}Stream`);

  return {
    fuel: getFuelExample(stream, subject ?? '', subjectClass),
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
  const { subject, selectedModule, subjectClass } = useDynamicForm();
  const { isTheme } = useTheme();
  const examples = getExamples(
    subject,
    selectedModule ?? 'blocks',
    subjectClass,
  );
  const codeTheme = isTheme('dark') ? vs2015 : vs;

  return (
    <CardContent className="pt-6">
      <Tabs defaultValue="fuel" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="fuel">Fuels TS SDK</TabsTrigger>
          <TabsTrigger value="nats-node">NATS.js (Node)</TabsTrigger>
          <TabsTrigger value="nats-browser">NATS.js (Browser)</TabsTrigger>
          <TabsTrigger value="nats-cli">NATS CLI</TabsTrigger>
        </TabsList>
        <TabsContent value="fuel" className="text-sm">
          <SyntaxHighlighter
            language="typescript"
            style={codeTheme}
            customStyle={{ background: 'transparent' }}
          >
            {examples.fuel}
          </SyntaxHighlighter>
        </TabsContent>
        <TabsContent value="nats-node" className="text-sm">
          <SyntaxHighlighter
            language="typescript"
            style={codeTheme}
            customStyle={{ background: 'transparent' }}
          >
            {examples.natsNode}
          </SyntaxHighlighter>
        </TabsContent>
        <TabsContent value="nats-browser" className="text-sm">
          <SyntaxHighlighter
            language="typescript"
            style={codeTheme}
            customStyle={{ background: 'transparent' }}
          >
            {examples.natsBrowser}
          </SyntaxHighlighter>
        </TabsContent>
        <TabsContent value="nats-cli" className="text-sm">
          <SyntaxHighlighter
            language="bash"
            style={codeTheme}
            customStyle={{ background: 'transparent' }}
          >
            {examples.natsCli}
          </SyntaxHighlighter>
        </TabsContent>
      </Tabs>
    </CardContent>
  );
}
