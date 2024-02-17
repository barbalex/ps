import { FieldForm } from '../../routes/field/Form'

const containerStyle = {
  padding: '0px -10px',
  paddingLeft: '-10px',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(103, 216, 101, 0.1)',
}

const titleRowStyle = {
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  padding: '5px 10px',
  backgroundColor: 'rgba(103, 216, 101, 0.2)',
}
const titleStyle = {
  margin: 0,
  fontSize: 'medium',
  // lineHeight: 32,
}

export const FieldFormInForm = ({ field_id }) => {
  return (
    <div style={containerStyle}>
      <div style={titleRowStyle}>
        <h2 style={titleStyle}>Editing Field</h2>
      </div>
      <FieldForm field_id={field_id} isInForm={true} />
    </div>
  )
}
