// App provisorio de F1 (T11): renderiza un texto de `t` y el nombre de
// `useCv()` (spec.md → Anatomía); lo reemplaza el integrator en F4. Sin CSS
// propio: hereda la base tipográfica de src/styles/global.css (plan.md,
// decisión 8), así su test solo verifica contenido + axe.

import type { ReactNode } from "react";

import { useCv, useLocale } from "./providers/LocaleProvider";

export function App(): ReactNode {
  const { t } = useLocale();
  const cv = useCv();

  return (
    <div>
      <p>{t.about.title}</p>
      <p>{cv.profile.name}</p>
    </div>
  );
}
