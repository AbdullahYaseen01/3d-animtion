const paths = {
  search: 'M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm5.3-2.2L21 21',
  bag: 'M5 8h14l-1 13H6L5 8Zm3.5 0V6.5a3.5 3.5 0 0 1 7 0V8',
  heart: 'M12 20.5s-7.5-4.6-7.5-10.1A4.2 4.2 0 0 1 12 7.8a4.2 4.2 0 0 1 7.5 2.6c0 5.5-7.5 10.1-7.5 10.1Z',
  menu: 'M3.5 7h17M3.5 12h17M3.5 17h17',
  close: 'M6 6l12 12M18 6 6 18',
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  chevron: 'm9 6 6 6-6 6',
  chevronDown: 'm6 9 6 6 6-6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  truck: 'M3 6.5h11v9H3zM14 10h4l3 3v2.5h-7M7 18.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Zm10 0a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z',
  return: 'M9 7 5 11l4 4M5 11h9.5a4.5 4.5 0 0 1 0 9H12',
  ruler: 'M3.5 15.5 15.5 3.5l5 5-12 12-5-5ZM7 12l2 2m1-5 2 2m1-5 2 2',
  mail: 'M3.5 6h17v12h-17zM3.5 6.5 12 13l8.5-6.5',
  alert: 'M12 8.5V13m0 3.2v.3M10.3 3.9 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  zoom: 'M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm5.3-2.2L21 21M10.5 7.5v6M7.5 10.5h6',
  pause: 'M8 5v14M16 5v14',
  play: 'M7 4.5v15l13-7.5-13-7.5Z',
  filter: 'M4 6h16M7 12h10M10 18h4',
  lock: 'M6 10.5h12v10H6zM8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7.5 8.5a7.5 7.5 0 0 1 15 0',
} as const

export type IconName = keyof typeof paths

export function Icon({ name, size = 22, className, filled = false }: { name: IconName; size?: number; className?: string; filled?: boolean }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  )
}
