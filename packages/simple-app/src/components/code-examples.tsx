import { useConnection } from '@/lib/stream/use-connection';
import { useDeliverPolicy } from '@/lib/stream/use-deliver-policy';
import {
  type Subscription,
  useSubscriptions,
} from '@/lib/stream/use-subscriptions';
import { DeliverPolicy, type FuelNetwork } from '@fuels/streams';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import v from 'voca';
import { useTheme } from './theme-provider';
import { CardContent } from './ui/card';

function getFuelExample(
  network: FuelNetwork,
  subscriptions: Subscription[],
  deliverPolicy: DeliverPolicy,
) {
  const subjectImports = new Set(subscriptions.map((sub) => sub.subjectClass));
  const subjectsInit = subscriptions
    .map((sub) => {
      const formattedFields = Object.entries(sub.selectedFields)
        .map(([key, value]) => `    ${v.camelCase(key)}: '${value}'`)
        .join(',\n');

      return Object.values(sub.selectedFields).some(Boolean)
        ? `  ${sub.subjectClass}.build({\n${formattedFields}\n  })`
        : `  ${sub.subjectClass}.build()`;
    })
    .join(',\n');

  return `import {
  Client,
  ${Array.from(subjectImports).join(',\n  ')},
  DeliverPolicy,
  FuelNetwork,
} from '@fuels/streams';

const subjects = [
${subjectsInit}
];

async function main() {
  const client = await Client.connect(FuelNetwork.${v.capitalize(network)});
  const stream = await client.subscribe(
    subjects,
    ${deliverPolicy.stringStatic()}
  );

  for await (const msg of stream) {
    console.log('Subject:', msg.subject);
    console.log('Payload:', msg.payload);
  }
}

main().catch(console.error);`;
}

function getExamples(
  network: FuelNetwork,
  subscriptions: Subscription[],
  deliverPolicy: DeliverPolicy = DeliverPolicy.new(),
) {
  return {
    fuel: getFuelExample(network, subscriptions, deliverPolicy),
  };
}

export function CodeExamples() {
  const { subscriptions } = useSubscriptions();
  const { isTheme } = useTheme();
  const { network } = useConnection();
  const { deliverPolicy } = useDeliverPolicy();
  const codeTheme = isTheme('dark') ? vs2015 : vs;
  const examples = getExamples(network, subscriptions, deliverPolicy);

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
