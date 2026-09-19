import './styles/index.css';

import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { App } from './App';
import { preloadRoute } from './routes';

const container = document.getElementById('root');
if (!container) throw new Error('The page has no #root element');

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

const app = (
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Built pages arrive already rendered, so React only attaches to them. It
// loads this page's code first, so the first render matches the HTML without
// waiting. The development server sends an empty page, rendered from scratch.
const path = window.location.pathname.slice(basename === '/' ? 0 : basename.length) || '/';
await preloadRoute(path).catch(() => undefined);

if (container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
