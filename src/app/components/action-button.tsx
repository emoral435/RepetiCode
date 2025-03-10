import React from 'react'
import Button from '@mui/material/Button'


interface ActionButton {
    text: string,
    variant: 'text' | 'contained' | 'outlined',
    onClick?: () => void,

}

const ActionButton = ({text, variant, onClick}: ActionButton) => {
  return (
    <Button variant={variant} onClick={onClick}>{text}</Button>
  )
}

export default ActionButton