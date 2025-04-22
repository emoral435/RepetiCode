import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { MemoryRouter } from "react-router-dom";
import Login from '../rootPathComponents/login/Login';
import { initializeApp } from 'firebase/app';
import config from '../lib/firebaseconfig';

test('renders text correctly', async () => {
  initializeApp(config);
  const { getByText } = render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )

  await expect.element(getByText('Not Registered Yet?')).toBeInTheDocument();
  await expect.element(getByText("Register Now. It's free!")).toBeInTheDocument();
})