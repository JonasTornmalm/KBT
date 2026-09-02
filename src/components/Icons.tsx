import type { SVGProps } from 'react'

/**
 * Ikonerna ritas för hand i stället för att hämtas från ett paket: de blir
 * några få kilobyte, får samma mjuka streck som resten av gränssnittet, och
 * appen slipper ännu ett beroende att hålla uppdaterat.
 */
type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  )
}

export const HomeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 10.5 12 4l8 6.5" />
    <path d="M6 9.6V19a1 1 0 0 0 1 1h3.5v-4.5a1.5 1.5 0 0 1 3 0V20H17a1 1 0 0 0 1-1V9.6" />
  </Icon>
)

export const ProgramIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 4.5h9a3 3 0 0 1 3 3V20H8a2 2 0 0 1-2-2z" />
    <path d="M6 17.5h12" />
    <path d="M9.5 8.5h5M9.5 12h5" />
  </Icon>
)

export const ToolsIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9.5h16v8.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    <path d="M9 9.5V6.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3" />
    <path d="M4 13.5h16" />
  </Icon>
)

export const InsightsIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 19.5h16" />
    <path d="M5 15.5 10 10l3.5 3.5L19 7" />
    <path d="M15.5 7H19v3.5" />
  </Icon>
)

export const SettingsIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M18 6l-1.4 1.4M7.4 16.6 6 18M18 18l-1.4-1.4M7.4 7.4 6 6" />
  </Icon>
)

export const HeartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 19.5s-7-4.4-7-9a3.9 3.9 0 0 1 7-2.4A3.9 3.9 0 0 1 19 10.5c0 4.6-7 9-7 9z" />
  </Icon>
)

export const LockIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </Icon>
)

export const SparkIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4.5 13.6 9l4.4 1.6-4.4 1.6L12 16.6l-1.6-4.4L6 10.6 10.4 9z" />
    <path d="M18.5 16.5l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6z" />
  </Icon>
)

export const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h13M13 6.5 18.5 12 13 17.5" />
  </Icon>
)

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5.5 12.5 4 4 9-9" />
  </Icon>
)

export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5.5v13M5.5 12h13" />
  </Icon>
)

export const BreathIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="7.5" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)

export const LadderIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 3.5V20M16 3.5V20" />
    <path d="M8 7.5h8M8 12h8M8 16.5h8" />
  </Icon>
)

export const CloudIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7.5 17.5A3.5 3.5 0 0 1 7.9 10.6a4.6 4.6 0 0 1 8.8.9 3.2 3.2 0 0 1-.7 6z" />
  </Icon>
)

export const MoonIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" />
  </Icon>
)

export const CompassIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m14.8 9.2-1.4 4.2-4.2 1.4 1.4-4.2z" />
  </Icon>
)

export const ShieldIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5 19 6v6c0 4-3 7-7 8.5-4-1.5-7-4.5-7-8.5V6z" />
  </Icon>
)

export const NotebookIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 4.5h11a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2z" />
    <path d="M9.5 9h6M9.5 13h4" />
  </Icon>
)

export const FlaskIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 3.5h4M11 3.5v6L6.4 17a2 2 0 0 0 1.7 3h7.8a2 2 0 0 0 1.7-3L13 9.5v-6" />
    <path d="M8.4 14h7.2" />
  </Icon>
)

export const PuzzleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9.5 4.5h5v2.2a2 2 0 1 0 2.8 2.8h2.2v5h-2.2a2 2 0 1 0-2.8 2.8v2.2h-5v-2.2a2 2 0 1 1-2.8-2.8H4.5v-5h2.2a2 2 0 1 1 2.8-2.8z" />
  </Icon>
)

export const SunIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M21 12h-2M5 12H3M18.4 5.6 17 7M7 17l-1.4 1.4M18.4 18.4 17 17M7 7 5.6 5.6" />
  </Icon>
)

export const DownloadIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4v10M8 10.5l4 4 4-4" />
    <path d="M5 18.5h14" />
  </Icon>
)

export const UploadIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 14.5v-10M8 8l4-4 4 4" />
    <path d="M5 18.5h14" />
  </Icon>
)

export const TrashIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 7h15M9.5 7V5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7" />
    <path d="M6.5 7l.8 11.6a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
  </Icon>
)
