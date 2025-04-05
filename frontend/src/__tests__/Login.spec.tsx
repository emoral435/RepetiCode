import { expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import Login from '../login/Login'

test('renders text correctly', async () => {
  const { getByText } = render(<Login  />)

  await expect.element(getByText('Login with Google')).toBeInTheDocument()
})