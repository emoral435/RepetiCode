import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { MemoryRouter } from "react-router-dom";
import Login from '../login/Login';

test('renders text correctly', async () => {
  const { getByText } = render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )

  await expect.element(getByText('Not Registered Yet?')).toBeInTheDocument();
  await expect.element(getByText("Register Now. It's free!")).toBeInTheDocument();
})