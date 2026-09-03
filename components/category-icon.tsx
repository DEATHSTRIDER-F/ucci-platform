'use client'

import * as LucideIcons from 'lucide-react'
import { Icon as IconifyIcon } from '@iconify/react'
import { cn } from '@/lib/utils/utils'

type IconName = keyof typeof LucideIcons

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

/**
 * Dynamically renders an icon by string name.
 * - Lucide PascalCase: "ShoppingBag" -> lucide-react
 * - Iconify: "lucide:shopping-bag" | "mdi:account-tie" | "tabler:building" -> Iconify CDN (200k+ icons)
 * Stores only `icon_name` + `icon_color` in DB.
 *
 * Usage:
 *   <CategoryIcon name="ShoppingBag" color="#3B82F6" size={20} withBackground />
 *   <CategoryIcon name="mdi:account-tie" color="#3B82F6" />
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

  // ─── Iconify path (contains :) ────────────────────────────────────────
  if (name && isIconifyName(name)) {
    const iconNode = <IconifyIcon icon={name} width={size} height={size} style={{ color: safeColor }} aria-hidden />
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

  // ─── Lucide path (PascalCase) ─────────────────────────────────────────
  const IconComponent = (name ? (LucideIcons[name as IconName] as unknown as LucideIcons.LucideIcon) : null) as LucideIcons.LucideIcon | null
  const isValidIcon = IconComponent !== null && (typeof IconComponent === 'object' || typeof IconComponent === 'function')

  if (!name || !IconComponent || !isValidIcon) {
    if (fallback) return <>{fallback}</>
    const FallbackIcon = LucideIcons.Tag
    if (withBackground) {
      return (
        <span
          className={cn('inline-flex items-center justify-center rounded-xl shrink-0', className)}
          style={{ backgroundColor: bg, width: size * 2, height: size * 2 }}
          aria-hidden
        >
          <FallbackIcon size={size} style={{ color: safeColor }} />
        </span>
      )
    }
    return <FallbackIcon size={size} style={{ color: safeColor }} className={cn('shrink-0', className)} aria-hidden />
  }

  if (withBackground) {
    return (
      <span
        className={cn('inline-flex items-center justify-center rounded-xl shrink-0', className)}
        style={{ backgroundColor: bg, width: size * 2, height: size * 2 }}
        aria-hidden
      >
        <IconComponent size={size} style={{ color: safeColor }} />
      </span>
    )
  }

  return <IconComponent size={size} style={{ color: safeColor }} className={cn('shrink-0', className)} aria-hidden />
}

/** Helper for non-background inline usage */
export function CategoryIconInline(props: Omit<CategoryIconProps, 'withBackground'>) {
  return <CategoryIcon {...props} withBackground={false} />
}

export { hexToRgba, isValidHex }
