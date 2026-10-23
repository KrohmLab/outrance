// Icônes au trait 24 px, épaisseur 1,75, reprises des artboards.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const InstagramIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" />
  </Icon>
);

export const FacebookIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" />
  </Icon>
);

export const SoundCloudIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 17h8a3.5 3.5 0 0 0 0-7h-.4A5 5 0 0 0 10 8.2" />
    <path d="M3 17v-3M5.5 17v-5M8 17v-7" />
  </Icon>
);

export const YouTubeIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
    <path d="M10 9.5v5l4.5-2.5z" />
  </Icon>
);

export const BurgerIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 8h16M4 16h16" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

export const PlayIcon = ({ size = 20, ...rest }: IconProps) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...rest}>
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
);

export const CalendarAddIcon = (p: IconProps) => (
  <Icon size={18} {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4M12 13v4M10 15h4" />
  </Icon>
);

export const CalendarIcon = (p: IconProps) => (
  <Icon size={22} {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Icon>
);

export const ClockIcon = (p: IconProps) => (
  <Icon size={22} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);

export const TicketIcon = (p: IconProps) => (
  <Icon size={22} {...p}>
    <path d="M4 8.5a2 2 0 0 0 0 4v3.5h16v-3.5a2 2 0 0 1 0-4V5H4z" />
    <path d="M14 5v11" strokeDasharray="2 2" />
  </Icon>
);

export const PinIcon = (p: IconProps) => (
  <Icon size={22} {...p}>
    <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </Icon>
);

export const NoMinorsIcon = (p: IconProps) => (
  <Icon size={22} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M6 6l12 12" />
  </Icon>
);

export const ShareIcon = (p: IconProps) => (
  <Icon size={18} {...p}>
    <circle cx="18" cy="5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="19" r="2.5" />
    <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
  </Icon>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Icon size={18} {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Icon>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Icon size={18} {...p}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
);

export const DocumentIcon = (p: IconProps) => (
  <Icon size={26} {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Icon>
);

export const CameraIcon = (p: IconProps) => (
  <Icon size={26} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="M8 5l1.5-2h5L16 5" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
);

export const AlertIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5v5.5M12 16.5v.01" />
  </Icon>
);

/** Ticket incliné (encoches latérales et ligne de découpe) : bouton billetterie compact du header. */
export const TicketTiltIcon = (p: IconProps) => (
  <Icon {...p}>
    <g transform="rotate(-20 12 12)">
      <path d="M3 7h18v3.2a1.8 1.8 0 0 0 0 3.6V17H3v-3.2a1.8 1.8 0 0 0 0-3.6z" />
      <path d="M15.5 7.8v1.6M15.5 11.2v1.6M15.5 14.6v1.6" />
    </g>
  </Icon>
);
