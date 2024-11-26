import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { cva } from 'class-variance-authority';
import {
  ChevronsLeftRightEllipsis,
  Code,
  Database,
  Github,
} from 'lucide-react';
import { useStreamData } from '../lib/stream/use-stream-data';
import { ThemeToggle } from './theme-toggle';

const headerButton = cva('h-9 gap-2 text-sm font-medium transition-colors', {
  variants: {
    active: {
      true: 'bg-accent text-accent-foreground',
      false: 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
    },
  },
  defaultVariants: {
    active: false,
  },
});

export function Header() {
  const { network, changeNetwork, tab, changeTab, isConnecting } =
    useStreamData();

  return (
    <header className="border-b">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-10 flex-1">
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
          <svg
            viewBox="0 0 344 344"
            aria-label="Fuel Logo"
            width={24}
            height={24}
            className="text-[#00F58C] fill-current"
          >
            <path d="M22.8744 0C10.2181 0 0 10.218 0 22.8744V344H284.626C294.246 344 303.497 340.179 310.308 333.368L333.368 310.308C340.179 303.497 344 294.246 344 284.626V0H22.8744ZM224.608 44.231L112.718 156.121C109.956 158.882 106.182 160.447 102.27 160.447C96.5631 160.447 91.3157 157.134 88.8763 151.978L45.5194 60.3402C41.9756 52.8383 47.4525 44.231 55.7374 44.231H224.608ZM44.231 299.769V190.916C44.231 185.117 48.9257 180.422 54.7249 180.422H163.577L44.231 299.769ZM172.598 160.447H136.559L244.998 52.0097C249.968 47.0382 256.734 44.231 263.776 44.231H299.814L191.377 152.668C186.407 157.64 179.64 160.447 172.598 160.447Z" />
          </svg>
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeTab('data')}
              className={headerButton({ active: tab === 'data' })}
            >
              <Database size={16} />
              Data Stream
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeTab('code')}
              className={headerButton({ active: tab === 'code' })}
            >
              <Code size={16} />
              Code Examples
            </Button>
          </nav>
        </div>
        <Select
          value={network}
          onValueChange={changeNetwork}
          disabled={isConnecting}
        >
          <SelectTrigger className="h-9 gap-2 shadow-none">
            {isConnecting ? (
              <Spinner className="text-muted-foreground/50" />
            ) : (
              <ChevronsLeftRightEllipsis
                size={16}
                className="text-muted-foreground/50"
              />
            )}
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mainnet">Ignition Mainnet</SelectItem>
            <SelectItem value="testnet">Fuel Testnet</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 ml-6">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
            <a
              href="https://github.com/fuellabs/fuel-streams-js"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}