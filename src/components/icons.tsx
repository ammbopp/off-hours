import type { SVGProps } from 'react'

// ไอคอนเส้น (stroke) เรียบง่ายชุดเดียวกันทั้งแอป แทนอิโมจิ — คุมเส้นหนา/มุมมนให้เข้ากันทุกจุด
type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base(props: IconProps) {
  const { size = 22, className, ...rest } = props
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: className ? `icon ${className}` : 'icon',
    ...rest,
  }
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3.5v-5a1.5 1.5 0 0 1 1.5-1.5v0A1.5 1.5 0 0 1 13.5 15v5H17a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}

export function BookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5.5C4 4.67 4.67 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5Z" />
      <path d="M20 5.5c0-.83-.67-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5Z" />
    </svg>
  )
}

export function ChatIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9l-4 4v-4H6.5A2.5 2.5 0 0 1 4 13.5Z" />
    </svg>
  )
}

export function QuestIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
      <path d="m8.5 12.5 1.8 1.8L15.5 10" />
    </svg>
  )
}

export function VocabIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 3.5h10.5A1.5 1.5 0 0 1 18 5v16l-6-3.2L6 21V5A1.5 1.5 0 0 1 7.5 3.5Z" />
    </svg>
  )
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1Z" />
    </svg>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H10.5a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9V10.5a1.7 1.7 0 0 0 1.6 1H20a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  )
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  )
}

export function SpeakerIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 9.5v5a1 1 0 0 0 1 1h3l4.5 3.5v-14L8 8.5H5a1 1 0 0 0-1 1Z" />
      <path d="M16.3 8.8a4.5 4.5 0 0 1 0 6.4" />
      <path d="M18.6 6.5a7.8 7.8 0 0 1 0 11" />
    </svg>
  )
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 5.5v13l11-6.5Z" strokeLinejoin="round" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function PauseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 5.5h3v13H7Zm7 0h3v13h-3Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function SendIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 12 20 4.5 15.5 19l-3.8-6.2Z" strokeLinejoin="round" />
      <path d="M11.7 12.8 20 4.5" />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  )
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function CompassIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m14.5 9.5-1.8 4.3-4.3 1.8 1.8-4.3Z" />
    </svg>
  )
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5 5 6v5.5c0 4.4 3 7.8 7 9 4-1.2 7-4.6 7-9V6Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </svg>
  )
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5 13.4 9l5.1 1.6-5.1 1.6L12 17.6l-1.4-5.4L5.5 10.6l5.1-1.6Z" fill="currentColor" stroke="none" />
      <path d="M19 15.5 19.6 17.6l2 .7-2 .7-.6 2.1-.6-2.1-2-.7 2-.7Z" fill="currentColor" stroke="none" />
    </svg>
  )
}
