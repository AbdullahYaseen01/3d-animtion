import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'
import './Dialog.css'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  /** Visually hide the title while keeping it as the accessible name. */
  hideTitle?: boolean
  variant?: 'drawer-right' | 'drawer-left' | 'modal' | 'sheet'
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/**
 * Native <dialog> wrapper: showModal() provides focus containment, inert
 * background and Escape handling. Focus returns to the opener on close.
 */
export function Dialog({ open, onClose, title, hideTitle, variant = 'modal', children, footer, className }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const opener = useRef<Element | null>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      opener.current = document.activeElement
      dialog.showModal()
      document.body.classList.add('is-locked')
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const handleClose = () => {
      document.body.classList.remove('is-locked')
      const el = opener.current as HTMLElement | null
      const active = document.activeElement
      const focusUnclaimed = !active || active === document.body || dialog.contains(active)
      if (el && document.contains(el) && focusUnclaimed) el.focus({ preventScroll: true })
      onClose()
    }
    const handleCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }
    dialog.addEventListener('close', handleClose)
    dialog.addEventListener('cancel', handleCancel)
    return () => {
      dialog.removeEventListener('close', handleClose)
      dialog.removeEventListener('cancel', handleCancel)
    }
  }, [onClose])

  useEffect(() => () => document.body.classList.remove('is-locked'), [])

  return (
    <dialog
      ref={ref}
      className={`dialog dialog--${variant} ${className ?? ''}`}
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      <div className="dialog__panel">
        <header className="dialog__header">
          <h2 id={titleId} className={hideTitle ? 'visually-hidden' : 'dialog__title'}>
            {title}
          </h2>
          <button type="button" className="icon-btn dialog__close" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </header>
        <div className="dialog__body">{open ? children : null}</div>
        {footer && open ? <footer className="dialog__footer">{footer}</footer> : null}
      </div>
    </dialog>
  )
}
