import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cardStyles } from '@/styles/card-styles';
import { StreamForm } from './stream-form';

export function StreamConfiguration() {
  return (
    <Card className={cardStyles({ type: 'config' })}>
      <CardHeader layout="row" className="h-[79px] border-b mb-4">
        <div>
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
          <svg
            viewBox="0 0 344 344"
            aria-label="Fuel Logo"
            width={30}
            height={30}
          >
            <rect x="25" y="37" width="292" height="284" fill="black" />
            <path
              d="M22.8744 0C10.2181 0 0 10.218 0 22.8744V344H284.626C294.246 344 303.497 340.179 310.308 333.368L333.368 310.308C340.179 303.497 344 294.246 344 284.626V0H22.8744ZM224.608 44.231L112.718 156.121C109.956 158.882 106.182 160.447 102.27 160.447C96.5631 160.447 91.3157 157.134 88.8763 151.978L45.5194 60.3402C41.9756 52.8383 47.4525 44.231 55.7374 44.231H224.608ZM44.231 299.769V190.916C44.231 185.117 48.9257 180.422 54.7249 180.422H163.577L44.231 299.769ZM172.598 160.447H136.559L244.998 52.0097C249.968 47.0382 256.734 44.231 263.776 44.231H299.814L191.377 152.668C186.407 157.64 179.64 160.447 172.598 160.447Z"
              fill="#00F58C"
            />
          </svg>
        </div>
        <div>
          <CardTitle className="mb-1">Stream Configuration</CardTitle>
          <CardDescription>
            Configure your stream settings and parameters below
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <StreamForm />
      </CardContent>
    </Card>
  );
}
