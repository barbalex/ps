import { useCallback } from 'react'
import { MenuItem as MenuItemComponent } from '@fluentui/react-components'
import { useNavigate } from '@tanstack/react-router'

export const MenuItem = ({ path, text }) => {
  const navigate = useNavigate()

  const onClick = useCallback(() => {
    // why do I need this timeout?
    setTimeout(() => navigate({ to: path }), 100)
  }, [navigate, path])

  return <MenuItemComponent onClick={onClick}>{text}</MenuItemComponent>
}
