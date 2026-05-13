import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Calendar,
  Clock,
  Folder,
  Gift,
  Globe,
  Home,
  Image,
  Info,
  Languages,
  Link,
  Mail,
  Megaphone,
  Paperclip,
  PartyPopper,
  PenLine,
  Rss,
  Search,
  Sparkles,
  Wrench,
  AtSign,
  type LucideIcon,
} from "lucide-react";

// Brand icons kept on HugeIcons (Lucide has no equivalents)
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GithubIcon,
  XVariableIcon,
  WechatIcon,
} from "@hugeicons/core-free-icons";

// ── Lucide icon map ──────────────────────────────────────────────
const lucideIcons = {
  alert: AlertTriangle,
  arrowRight: ArrowRight,
  arrowUp: ArrowUp,
  paperclip: Paperclip,
  book: BookOpen,
  calendar: Calendar,
  clock: Clock,
  fireworks: PartyPopper,
  folder: Folder,
  gift: Gift,
  globe: Globe,
  home: Home,
  image: Image,
  info: Info,
  lang: Languages,
  link: Link,
  mail: Mail,
  megaphone: Megaphone,
  party: PartyPopper,
  pen: PenLine,
  rss: Rss,
  search: Search,
  sparkles: Sparkles,
  tools: Wrench,
  wrench: Wrench,
  "at-sign": AtSign,
} as const satisfies Record<string, LucideIcon>;

// ── HugeIcons brand icon map ─────────────────────────────────────
const hugeiconsMap = {
  github: GithubIcon,
  x: XVariableIcon,
  wechat: WechatIcon,
} as const;

type LucideIconName = keyof typeof lucideIcons;
type HugeIconName = keyof typeof hugeiconsMap;
export type IconName = LucideIconName | HugeIconName;

interface Props {
  name: IconName | string;
  className?: string;
  size?: number | string;
  strokeWidth?: number;
}

export default function Icon({
  name,
  className,
  size = 16,
  strokeWidth = 2,
}: Props) {
  // Brand icons → HugeIcons
  const hugeIcon = hugeiconsMap[name as HugeIconName];
  if (hugeIcon) {
    return (
      <HugeiconsIcon
        icon={hugeIcon}
        size={size}
        strokeWidth={strokeWidth}
        className={className}
        aria-hidden="true"
        focusable="false"
      />
    );
  }

  // Everything else → Lucide
  const LucideComp = lucideIcons[name as LucideIconName] ?? lucideIcons.link;
  return (
    <LucideComp
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
      focusable={false}
    />
  );
}
