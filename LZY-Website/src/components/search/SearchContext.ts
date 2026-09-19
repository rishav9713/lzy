import { createContext, useContext } from 'react';

export interface SearchControls {
  open: (query?: string) => void;
}

export const SearchContext = createContext<SearchControls>({ open: () => {} });

export function useSearch(): SearchControls {
  return useContext(SearchContext);
}
