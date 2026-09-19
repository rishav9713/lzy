import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { App } from '@/App';
import { CopyButton } from '@/components/code/CopyButton';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { allRoutes, preloadRoute } from '@/routes';

async function renderAt(path: string) {
  await preloadRoute(path);
  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );
  });
  return result;
}

describe('every page', () => {
  it.each(allRoutes())('%s renders with one main heading', async (route) => {
    await renderAt(route);
    const main = screen.getByRole('main');
    await waitFor(() => expect(within(main).getAllByRole('heading', { level: 1 })).toHaveLength(1));
  });
});

describe('a missing page', () => {
  it('shows the 404 page', async () => {
    await renderAt('/no-such-page/');
    expect(
      await screen.findByRole('heading', { level: 1, name: /code path does not exist/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return home/i })).toBeInTheDocument();
  });
});

describe('navigation', () => {
  it('marks the current section', async () => {
    await renderAt('/docs/functions/');
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Docs' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Examples' })).not.toHaveAttribute('aria-current');
  });

  it('marks the current page in the documentation sidebar', async () => {
    await renderAt('/docs/functions/');
    const sidebar = screen.getByRole('navigation', { name: 'Documentation' });
    expect(within(sidebar).getByRole('link', { name: 'Functions' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('offers previous and next pages', async () => {
    await renderAt('/docs/functions/');
    const pager = screen.getByRole('navigation', { name: /previous and next/i });
    expect(within(pager).getByText('Loops')).toBeInTheDocument();
    expect(within(pager).getByText('Lists')).toBeInTheDocument();
  });
});

describe('the mobile menu', () => {
  it('opens, and closes with Escape', async () => {
    const user = userEvent.setup();
    await renderAt('/');
    const open = screen.getByRole('button', { name: 'Open menu' });
    expect(open).toHaveAttribute('aria-expanded', 'false');
    await user.click(open);
    const menu = screen.getByRole('dialog', { name: 'Menu' });
    expect(within(menu).getByRole('link', { name: /examples/i })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument();
    expect(open).toHaveFocus();
  });

  it('keeps Tab inside the open menu', async () => {
    const user = userEvent.setup();
    await renderAt('/');
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    const menu = screen.getByRole('dialog', { name: 'Menu' });
    for (let step = 0; step < 20; step += 1) {
      await user.tab();
      expect(menu).toContainElement(document.activeElement as HTMLElement);
    }
  });
});

describe('the documentation drawer', () => {
  it('opens, keeps focus inside, and returns it on close', async () => {
    const user = userEvent.setup();
    await renderAt('/docs/functions/');
    const open = screen.getByRole('button', { name: /documentation menu/i });
    await user.click(open);
    const drawer = screen.getByRole('dialog', { name: 'Documentation menu' });
    await user.tab();
    expect(drawer).toContainElement(document.activeElement as HTMLElement);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Documentation menu' })).not.toBeInTheDocument();
    expect(open).toHaveFocus();
  });
});

describe('search', () => {
  it('opens with Ctrl+K, finds a built-in and goes to it', async () => {
    const user = userEvent.setup();
    await renderAt('/');
    await user.keyboard('{Control>}k{/Control}');
    const input = await screen.findByRole('combobox', { name: /search documentation/i });
    await user.type(input, 'append');
    const results = await screen.findByRole('listbox', { name: /search results/i });
    await waitFor(() => expect(within(results).getAllByRole('option').length).toBeGreaterThan(0));
    expect(within(results).getAllByRole('option')[0]).toHaveTextContent('append()');
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('dialog', { name: /search/i })).not.toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Built-in functions' }),
    ).toBeInTheDocument();
  });

  it('closes with Escape', async () => {
    const user = userEvent.setup();
    await renderAt('/');
    await user.click(screen.getAllByRole('button', { name: /search documentation/i })[0]!);
    expect(await screen.findByRole('dialog', { name: /search/i })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: /search/i })).not.toBeInTheDocument();
  });
});

describe('the theme toggle', () => {
  it('switches theme and remembers the choice', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem('lzy-theme')).toBe('light');
    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('lzy-theme')).toBe('dark');
  });
});

describe('copying code', () => {
  it('puts the code on the clipboard and says so', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<CopyButton text={'say "Hello World"'} label="LZY" />);
    await user.click(screen.getByRole('button', { name: 'Copy LZY' }));
    expect(writeText).toHaveBeenCalledWith('say "Hello World"');
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('copies a code block in a rendered document', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    await renderAt('/docs/hello-world/');
    const buttons = document.querySelectorAll<HTMLButtonElement>('.prose button[data-copy]');
    expect(buttons.length).toBeGreaterThan(0);
    await user.click(buttons[0]!);
    expect(writeText).toHaveBeenCalledWith('say "Hello World"');
  });
});
