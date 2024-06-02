import { memo, useCallback } from 'react'
import { Button } from '@fluentui/react-components'
import { FaChevronLeft } from 'react-icons/fa'
import { useNavigate, useSearchParams } from 'react-router-dom'

export const FilterHeader = memo(({ title }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const onClickBack = useCallback(() => {
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [navigate, searchParams])

  return (
    <div className="filter-header">
      <h1>{title}</h1>
      <Button
        size="medium"
        icon={<FaChevronLeft />}
        onClick={onClickBack}
        title={`Back`}
      />
    </div>
  )
})
