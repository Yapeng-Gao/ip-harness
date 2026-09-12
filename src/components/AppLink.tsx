import type { ReactNode, AnchorHTMLAttributes } from 'react'
import { Link, NavLink, type LinkProps, type NavLinkProps } from 'react-router-dom'
import { resolveAppHref } from '../lib/deepLinks'

type AppLinkProps = Omit<LinkProps, 'to'> & {
  to: string
  children?: ReactNode
}

/**
 * Cross-app aware Link：跨面渲染 <a href=APP_DEV_URLS…>，同面仍用 react-router Link。
 */
export function AppLink({ to, children, ...rest }: AppLinkProps) {
  const { href, external } = resolveAppHref(to)
  if (external) {
    const {
      replace: _r,
      state: _s,
      preventScrollReset: _p,
      relative: _rel,
      reloadDocument: _rd,
      viewTransition: _vt,
      ...anchorRest
    } = rest as LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>
    return (
      <a href={href} {...anchorRest}>
        {children}
      </a>
    )
  }
  return (
    <Link to={href} {...rest}>
      {children}
    </Link>
  )
}

type AppNavLinkProps = Omit<NavLinkProps, 'to'> & {
  to: string
}

/**
 * Cross-app aware NavLink：跨面用普通 <a>（永不 active），同面 NavLink。
 */
export function AppNavLink({ to, className, children, end, ...rest }: AppNavLinkProps) {
  const { href, external } = resolveAppHref(to)
  if (external) {
    const cls =
      typeof className === 'function'
        ? className({
            isActive: false,
            isPending: false,
            isTransitioning: false,
          })
        : className
    return (
      <a href={href} className={cls}>
        {typeof children === 'function'
          ? children({
              isActive: false,
              isPending: false,
              isTransitioning: false,
            })
          : children}
      </a>
    )
  }
  return (
    <NavLink to={href} end={end} className={className} {...rest}>
      {children}
    </NavLink>
  )
}
