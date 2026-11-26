import { Outlet, useLocation } from '@tanstack/react-router'
import { Section } from '../../components/shared/Section.tsx'
import { usePlaceNavData } from '../../modules/usePlaceNavData.ts'
import styles from './WithFiles.module.css'

export const MapChildSections = (
  params: Parameters<typeof usePlaceNavData>[0],
) => {
  const { navData } = usePlaceNavData(params)
  const { pathname } = useLocation()
  return navData.navs.map(({ id, label }) => {
    // The parent form, users and files already have their own UI.
    if (['place', 'users', 'files'].includes(id)) return null
    const url = `${navData.ownUrl}/${id}`
    const open = pathname === url || pathname.startsWith(`${url}/`)
    return (
      <Section
        key={id}
        title={label}
        listUrl={url}
        parentUrl={`${navData.ownUrl}/place`}
        isOpen={open}
        titleClassName={styles.sectionTitle}
        childrenClassName={styles.sectionChildren}
      >
        {open && <Outlet />}
      </Section>
    )
  })
}
