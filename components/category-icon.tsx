'use client'

import { Tag } from 'lucide-react'
import { Icon as IconifyIcon } from '@iconify/react'
import { cn } from '@/lib/utils/utils'

interface CategoryIconProps {
  name: string | null | undefined
  color?: string | null
  size?: number
  className?: string
  /** background opacity 0-100, default 15 */
  bgOpacity?: number
  withBackground?: boolean
  fallback?: React.ReactNode
}

function hexToRgba(hex: string, alpha: number): string {
  const sanitized = hex.replace('#', '')
  const full = sanitized.length === 3
    ? sanitized.split('').map(c => c + c).join('')
    : sanitized
  const bigint = parseInt(full, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
}

function isIconifyName(name: string): boolean {
  return name.includes(':')
}

function normalizeLegacyIcon(name: string): string {
  // "ShoppingBag" -> "lucide:shopping-bag" , "Building2" -> "lucide:building-2"
  if (name.includes(':')) return name
  const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  return `lucide:${kebab}`
}

/**
 * Iconify-only renderer — Lucide bundle removed (was 1799 icons, ~400kb).
 * - Iconify: "lucide:shopping-bag" | "mdi:account-tie" | "tabler:building" -> Iconify CDN
 * - Legacy PascalCase "ShoppingBag" is normalized to "lucide:shopping-bag" for backward compat.
 */
export function CategoryIcon({
  name,
  color,
  size = 20,
  className,
  bgOpacity = 0.15,
  withBackground = true,
  fallback,
}: CategoryIconProps) {
  const safeColor = color && isValidHex(color) ? color : '#D4AF37'
  const bg = hexToRgba(safeColor, bgOpacity)

  if (name) {
    const iconName = isIconifyName(name) ? name : normalizeLegacyIcon(name)
    const iconNode = <IconifyIcon icon={iconName} width={size} height={size} style={{ color: safeColor }} aria-hidden />
    if (withBackground) {
      return (
        <span
          className={cn('inline-flex items-center justify-center rounded-xl shrink-0', className)}
          style={{ backgroundColor: bg, width: size * 2, height: size * 2 }}
          aria-hidden
        >
          {iconNode}
        </span>
      )
    }
    return <span className={cn('inline-flex items-center justify-center shrink-0', className)} aria-hidden>{iconNode}</span>
  }

  if (fallback) return <>{fallback}</>
  if (withBackground) {
    return (
      <span
        className={cn('inline-flex items-center justify-center rounded-xl shrink-0', className)}
        style={{ backgroundColor: bg, width: size * 2, height: size * 2 }}
        aria-hidden
      >
        <Tag size={size} style={{ color: safeColor }} />
      </span>
    )
  }
  return <Tag size={size} style={{ color: safeColor }} className={cn('shrink-0', className)} aria-hidden />
}

/** Helper for non-background inline usage */
export function CategoryIconInline(props: Omit<CategoryIconProps, 'withBackground'>) {
  return <CategoryIcon {...props} withBackground={false} />
}

export { hexToRgba, isValidHex }
