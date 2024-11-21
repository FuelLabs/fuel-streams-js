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
  subject: string,
  subjectClass: string | null,
) {
  const baseClass = stream.replace('Stream', 'Subject');
  const subjectImport = subjectClass ?? baseClass;
  const imports = `import { Client, ClientOpts, ${stream}, ${subjectImport} } from '@fuels/streams';`;
  const subjectInitialization = `// You can use our Subject class
let subject = ${subjectImport}.all();
// Or pass the value directly as string
subject = "${subject}";`;
  return `${imports}

${subjectInitialization}

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
    natsNode: `import { connect, StringCodec } from 'nats';

async function main() {
  const nc = await connect({
    servers: 'nats://stream-testnet.fuel.network:4222'
  });

  const sub = nc.subscribe('${subject}');
  console.log('Subscription created on', '${subject}');
  
  for await (const msg of sub) {
    const data = StringCodec().decode(msg.data);
    console.log('Received:', data);
  }
}

main().catch(console.error);`,
    natsBrowser: `import { wsconnect, StringCodec } from 'nats';

async function main() {
  const nc = await connect({
    servers: 'ws://stream-testnet.fuel.network:4222'
  });

  const sub = nc.subscribe('${subject}');
  console.log('Subscription created on', '${subject}');
  
  for await (const msg of sub) {
    const data = StringCodec().decode(msg.data);
    console.log('Received:', data);
  }
}

main().catch(console.error);`,

    natsCli: `# Install NATS CLI if you haven't already
# brew install nats-io/nats-tools/nats
# or download from https://github.com/nats-io/natscli/releases

# Subscribe to the stream
nats kv watch "fuel_${selectedModule}" "${subject}" \\
  --server=nats://stream-testnet.fuel.network:4222`,

    websocket: `# Install websocat if you haven't already
# cargo install websocat

# Connect and subscribe to the KV store
websocat ws://stream-testnet.fuel.network:8080 --jsonrpc -n \\
  -H="Authorization: Basic $(echo -n 'default_user:' | base64)" \\
  -1 '{"type":"kv_watch","bucket":"fuel_${selectedModule}","key":"${subject}"}' \\
  --ping-interval 30`,
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
          <TabsTrigger value="websocket">Simple Websocket</TabsTrigger>
        </TabsList>
        <TabsContent value="fuel">
          <SyntaxHighlighter
            language="typescript"
            style={codeTheme}
            customStyle={{ background: 'transparent' }}
          >
            {examples.fuel}
          </SyntaxHighlighter>
        </TabsContent>
        <TabsContent value="nats-node">
          <SyntaxHighlighter
            language="typescript"
            style={codeTheme}
            customStyle={{ background: 'transparent' }}
          >
            {examples.natsNode}
          </SyntaxHighlighter>
        </TabsContent>
        <TabsContent value="nats-browser">
          <SyntaxHighlighter
            language="typescript"
            style={codeTheme}
            customStyle={{ background: 'transparent' }}
          >
            {examples.natsBrowser}
          </SyntaxHighlighter>
        </TabsContent>
        <TabsContent value="nats-cli">
          <SyntaxHighlighter
            language="bash"
            style={codeTheme}
            customStyle={{ background: 'transparent' }}
          >
            {examples.natsCli}
          </SyntaxHighlighter>
        </TabsContent>
        <TabsContent value="websocket">
          <SyntaxHighlighter
            language="bash"
            style={codeTheme}
            customStyle={{ background: 'transparent' }}
          >
            {examples.websocket}
          </SyntaxHighlighter>
        </TabsContent>
      </Tabs>
    </CardContent>
  );
}
