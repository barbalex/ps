import { useCallback } from 'react'
import {  useNavigate } from 'react-router-dom'

export const Row = ({ label, to }) => {
  const navigate = useNavigate()
  const onClick = useCallback(() => {
    navigate(to)
  }, [navigate, to])

  return (
    <div className="row" onClick={onClick}>
      {label}
    </div>
  )
}
