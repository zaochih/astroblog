import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  BookOpen01Icon,
  Calendar03Icon,
  Clock01Icon,
  Folder01Icon,
  GithubIcon,
  Globe02Icon,
  Home01Icon,
  Image01Icon,
  InformationCircleIcon,
  Link01Icon,
  Mail01Icon,
  PencilEdit01Icon,
  RssIcon,
  Search01Icon,
  XVariableIcon,
  WechatIcon,
  LanguageCircleIcon,
  MicrosoftIcon,
} from "@hugeicons/core-free-icons";

const icons = {
  alert: Alert02Icon,
  arrowRight: ArrowRight01Icon,
  arrowUp: ArrowUp01Icon,
  book: BookOpen01Icon,
  calendar: Calendar03Icon,
  clock: Clock01Icon,
  folder: Folder01Icon,
  github: GithubIcon,
  globe: Globe02Icon,
  home: Home01Icon,
  image: Image01Icon,
  info: InformationCircleIcon,
  link: Link01Icon,
  mail: Mail01Icon,
  pen: PencilEdit01Icon,
  rss: RssIcon,
  search: Search01Icon,
  x: XVariableIcon,
  wechat: WechatIcon,
  lang: LanguageCircleIcon,
  microsoft: MicrosoftIcon,
} as const;

export type HugeIconName = keyof typeof icons;

interface Props {
  name: HugeIconName | string;
  className?: string;
  size?: number | string;
  strokeWidth?: number;
}

export default function HugeIcon({
  name,
  className,
  size = 16,
  strokeWidth = 2,
}: Props) {
  const icon = icons[name as HugeIconName] ?? icons.link;

  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
      focusable="false"
    />
  );
}
