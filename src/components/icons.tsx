import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const IconGota = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 2.7c-2.9 3.6-6 7.3-6 11a6 6 0 0 0 12 0c0-3.7-3.1-7.4-6-11Z" />
  </svg>
)

export const IconSeringa = (p: P) => (
  <svg {...base} {...p}>
    <path d="m18 2 4 4M17 7l3-3M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0l-.6-.6a2.4 2.4 0 0 1 0-3.4L15 5M9 11l4 4M5 19l-3 3M14 4l6 6" />
  </svg>
)

export const IconPrato = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2M6 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
)

export const IconCorrida = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="13" cy="4" r="2" />
    <path d="m4 22 4-7 3 3 1-6M7 11l3-3 4 1 3 3h3M13 12l3 3-2 5" />
  </svg>
)

export const IconNota = (p: P) => (
  <svg {...base} {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6M8 13h8M8 17h5" />
  </svg>
)

export const IconCasa = (p: P) => (
  <svg {...base} {...p}>
    <path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2Z" />
  </svg>
)

export const IconMais = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconAjustes = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
  </svg>
)

export const IconLixo = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
)

export const IconAlerta = (p: P) => (
  <svg {...base} {...p}>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
)
