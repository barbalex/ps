import { memo, useCallback } from 'react'
import { ToggleButton } from '@fluentui/react-components'
import { FaChevronLeft } from 'react-icons/fa'
import { MdFilterAlt, MdFilterAltOff } from 'react-icons/md'
import { useNavigate, useSearchParams } from 'react-router-dom'

type Props = {
  title: string
  backTo: 'list' | 'form'
}

export const FilterHeader = memo(
  ({ title = 'Filter', backTo = 'form' }: Props) => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const onClickBack = useCallback(() => {
      navigate({ pathname: '..', search: searchParams.toString() })
    }, [navigate, searchParams])

    return (
      <div className="filter-header">
        <h1>{title}</h1>
        <ToggleButton
          size="medium"
          icon={<MdFilterAlt />}
          onClick={onClickBack}
          title={`Leave Filter Form`}
          checked={true}
        />
      </div>
    )
  },
)
