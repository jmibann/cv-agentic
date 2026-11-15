import type { ReactNode } from "react";

import { AppLayout } from "./components/AppLayout";

// The theme and locale providers are mounted above App, in main.tsx.
export function App(): ReactNode {
  return <AppLayout />;
}
