import type { IconName } from '../types';

interface IconProps {
  name: IconName;
  color?: string;
  bg?: string;
  size?: number;
}

export default function Icon({ name, color = '#ffffff', bg = '#101214', size = 20 }: IconProps) {
  const s = size;
  const svgProps = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none' as const, style: { display: 'block' } };

  switch (name) {
    case 'home':
      return (
        <svg {...svgProps}>
          <path
            d="M4 11.5L12 4l8 7.5V20a1 1 0 01-1 1h-4.5a.5.5 0 01-.5-.5V15a2 2 0 00-4 0v5.5a.5.5 0 01-.5.5H5a1 1 0 01-1-1v-8.5z"
            fill={color}
          />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...svgProps}>
          <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke={color} strokeWidth="1.8" />
          <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="10" fill={color} />
          <path d="M12 7v10M7 12h10" stroke={bg} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...svgProps}>
          <rect x="4" y="12" width="4" height="8" rx="1" fill={color} />
          <rect x="10" y="7" width="4" height="13" rx="1" fill={color} />
          <rect x="16" y="3" width="4" height="17" rx="1" fill={color} />
        </svg>
      );
    case 'user':
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.8" />
          <path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'back':
      return (
        <svg {...svgProps}>
          <path d="M15 5l-7 7 7 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...svgProps}>
          <path d="M6 9a6 6 0 0112 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M9.5 17a2.5 2.5 0 005 0" stroke={color} strokeWidth="1.7" />
        </svg>
      );
    case 'filter':
      return (
        <svg {...svgProps}>
          <path d="M4 6h16M7 12h10M10 18h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'chevLeft':
      return (
        <svg {...svgProps}>
          <path d="M14.5 6l-6 6 6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case 'chevRight':
      return (
        <svg {...svgProps}>
          <path d="M9.5 6l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case 'chevDown':
      return (
        <svg {...svgProps}>
          <path d="M6 9.5l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case 'edit':
      return (
        <svg {...svgProps}>
          <path
            d="M4 20l1-4.2L15.5 5.3a1.5 1.5 0 012.1 0l1.1 1.1a1.5 1.5 0 010 2.1L8.2 19 4 20z"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      );
    case 'gear':
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.7" />
          <path
            d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5M18.4 18.4l-1.5-1.5M7.1 7.1L5.6 5.6"
            stroke={color}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'calendarSmall':
      return (
        <svg {...svgProps}>
          <rect x="4" y="5.5" width="16" height="14" rx="2" stroke={color} strokeWidth="1.6" />
          <path d="M4 9.5h16" stroke={color} strokeWidth="1.6" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.7" />
          <path d="M12 7.5V12l3 2" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case 'download':
      return (
        <svg {...svgProps}>
          <path d="M12 4v11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7.5 11l4.5 4.5 4.5-4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.5 18.5h15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'upload':
      return (
        <svg {...svgProps}>
          <path d="M12 15V4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7.5 8.5L12 4l4.5 4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.5 18.5h15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'x':
      return (
        <svg {...svgProps}>
          <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'check':
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="10" fill={color} />
          <path d="M7.5 12.5l3 3 6-6.5" stroke={bg} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case 'circle':
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="9.2" stroke={color} strokeWidth="1.6" />
        </svg>
      );
    case 'flame':
      return (
        <svg {...svgProps}>
          <path
            d="M12 2.5c1 3 4.5 4.5 4.5 9a4.5 4.5 0 01-9 0c0-1.2.4-2 1-2.8.2 1 1 1.6 1.6 1.2-.6-2 .3-3.6 1.3-4.4-.1 1 .3 1.6.9 2 .3-2.3-1-3.7-.3-5z"
            fill={color}
          />
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...svgProps}>
          <rect x="4" y="4" width="16" height="16" rx="4" fill={color} />
          <rect x="7" y="10" width="2.4" height="7" fill={bg} />
          <circle cx="8.2" cy="7.3" r="1.3" fill={bg} />
          <path
            d="M11.6 17v-7h2.3v1c.5-.7 1.3-1.2 2.4-1.2 1.9 0 2.7 1.3 2.7 3.2V17h-2.4v-3.6c0-.9-.3-1.5-1.1-1.5-.8 0-1.3.6-1.3 1.5V17h-2.6z"
            fill={bg}
          />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...svgProps}>
          <rect x="4" y="4" width="16" height="16" rx="4" fill={color} />
          <path d="M10 8.7l5.5 3.3-5.5 3.3z" fill={bg} />
        </svg>
      );
    case 'code':
      return (
        <svg {...svgProps}>
          <rect x="4" y="4" width="16" height="16" rx="4" fill={color} />
          <path
            d="M9.5 9l-2.7 3 2.7 3M14.5 9l2.7 3-2.7 3M13 8l-2 8"
            stroke={bg}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      );
    case 'dumbbell':
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="10" fill={color} />
          <path
            d="M6 12h12M6.5 9.5v5M8 10.3v3.4M16 9.5v5M17.5 10.3v3.4"
            stroke={bg}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'book':
      return (
        <svg {...svgProps}>
          <rect x="4" y="4" width="16" height="16" rx="4" fill={color} />
          <path
            d="M12 8.3c-1-.7-2.6-1-4-.7v7.8c1.4-.3 3 0 4 .7 1-.7 2.6-1 4-.7V7.6c-1.4-.3-3 0-4 .7z"
            stroke={bg}
            strokeWidth="1.3"
            strokeLinejoin="round"
            fill="none"
          />
          <path d="M12 8.3V16" stroke={bg} strokeWidth="1.3" />
        </svg>
      );
    case 'flower':
      return (
        <svg {...svgProps}>
          <rect x="4" y="4" width="16" height="16" rx="4" fill={color} />
          <circle cx="12" cy="12" r="1.6" fill={bg} />
          <circle cx="12" cy="8.3" r="2" fill={bg} />
          <circle cx="12" cy="15.7" r="2" fill={bg} />
          <circle cx="8.3" cy="12" r="2" fill={bg} />
          <circle cx="15.7" cy="12" r="2" fill={bg} />
        </svg>
      );
    default:
      return null;
  }
}
