import { Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { SiteShell } from '@/components/layout/SiteShell';
import { PageLoading } from '@/components/PageLoading';
import { documentPages } from '@/content/docs';

import { DocPage, ExamplePage, NotFound, staticPages } from './routes';

export function App() {
  return (
    <SiteShell>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          {staticPages.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="/examples/:slug/" element={<ExamplePage />} />
          {documentPages.map((page) => (
            <Route key={page.route} path={page.route} element={<DocPage route={page.route} />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </SiteShell>
  );
}
