# AppLayout

## Propósito

Compone la página completa: skip link, ControlsBar, Sidebar, card de
contenido con NavTabs y el panel activo (AboutPage / ResumePage). Es el único
lugar que conecta **contenido** (`useCv`), **textos** (`useLocale`) y
**navegación** (`useHashTab`).

## Anatomía

Ver `foundations/layout.md` (estructura del documento y grilla por breakpoint).

```tsx
// Constante del módulo: orden e ids fijos de los tabs (nunca vacía)
const TAB_IDS = ["about", "resume"] as const;

// Dentro del componente
const { t } = useLocale();
const cv = useCv();
const [active, setActive] = useHashTab(TAB_IDS, "about");
const tabs = [
  { id: "about", label: t.nav.about },
  { id: "resume", label: t.nav.resume },
] as const;
const sidebarLabels: SidebarLabels = {
  region: t.sidebar.region,
  social: t.sidebar.social,
  showContacts: t.sidebar.showContacts,
  hideContacts: t.sidebar.hideContacts,
  downloadCv: t.sidebar.downloadCv,
  contact: t.contact,             // { email, phone, whatsapp, location }
};

return (
<>
  <AccentGradientDefs />
  <HexAvatarDefs />
  <a className={styles.skipLink} href="#main-panel" onClick={focusPanel}>{t.skipToContent}</a>
  <div className={styles.container}>
    <ControlsBar />
    <div className={styles.grid}>
      <Sidebar className={styles.aside} profile={cv.profile} contact={cv.contact} social={cv.social} labels={sidebarLabels} />
      <main className={styles.main}>
        <Box variant="outer" as="section" className={styles.contentCard}>
          <NavTabs items={tabs} activeId={active} onChange={setActive} panelId="main-panel" label={t.nav.label} />
          <div ref={panelRef} role="tabpanel" id="main-panel" aria-labelledby={getTabId(active)} tabIndex={0} className={styles.panel}>
            {active === "about" ? <AboutPage /> : <ResumePage />}
          </div>
          <div className={styles.printOnly} hidden>              {/* ver Impresión */}
            {active === "about" ? <ResumePage /> : <AboutPage />}
          </div>
        </Box>
      </main>
    </div>
  </div>
</>
);
```

- **Tabs (invariante):** la lista tiene siempre los 2 tabs de `TAB_IDS`, en
  ese orden; los labels salen de `t.nav`. Como nunca es vacía, el
  `aria-labelledby` del tabpanel siempre apunta a un tab existente (el caso
  "NavTabs con `items` vacío → `null`" solo aplica a NavTabs aislado).
- **Labels del Sidebar:** mapeo explícito de `t.sidebar.*` y `t.contact`
  (arriba). Todas las claves de UI de `foundations/i18n.md` quedan usadas.
- **Skip link sin tocar la URL:** `focusPanel` hace `event.preventDefault()`
  y `panelRef.current?.focus()`. El `href="#main-panel"` queda como respaldo
  sin JS. Así el hash conserva `#about` / `#resume` y el link compartible no
  se pierde.

## API

```ts
export interface AppLayoutProps {
  className?: string;
}
```

Requiere `ThemeProvider` y `LocaleProvider` por encima (los monta `main.tsx`).

## Páginas

`AboutPage` y `ResumePage` (en `src/pages/`) tienen spec propia:

- [specs/pages/AboutPage.md](../pages/AboutPage.md)
- [specs/pages/ResumePage.md](../pages/ResumePage.md)

AppLayout solo decide cuál renderizar en el tabpanel según el tab activo
(`useHashTab`, spec en [specs/hooks/useHashTab.md](../hooks/useHashTab.md)).

## Estilos

- Contenedor, gutter, grilla, sticky: según `foundations/layout.md`.
- **Header del panel y CornerTab:**
  - **< lg**: la tab está en absoluto sobre la esquina y `.panel` tiene
    `padding-top: calc(var(--size-nav-tab-height) - var(--box-padding) + var(--space-4))`
    para que el `h1` quede debajo de la tab (fórmula única; A2 de diagnostics).
  - **≥ lg**: NavTabs usa `CornerTab placement="float"`: la tab flota a la
    derecha y el `h1` fluye a su izquierda con el ancho **real** de la tab
    (sin reservas fijas ni números mágicos). `.panel` vuelve a
    `padding-top: 0` en `@media (min-width: 992px)` (cambio de layout).
  - Para que el flujo funcione, `.panel` y el contenedor raíz de cada página
    **no** pueden ser flex/grid ni tener `overflow` distinto de `visible`
    (ver `specs/pages/*.md` → "Estilos y tokens").
- **Skip link:** visualmente oculto hasta recibir foco; con foco aparece
  arriba a la izquierda con fondo `--color-surface`, texto `--color-accent-text`,
  radio `--radius-8`, `--shadow-control`.
- Foco del tabpanel: anillo estándar (`--focus-ring-*`) solo con `:focus-visible`.

## Estados

| Estado | Efecto |
|---|---|
| Tab activo `about` / `resume` | el tabpanel renderiza AboutPage / ResumePage; el otro va a `.printOnly` |
| Skip link sin foco | visualmente oculto |
| Skip link con foco | visible arriba a la izquierda |
| Tabpanel con foco (teclado) | anillo estándar |

## Responsive

| Viewport | Layout |
|---|---|
| < lg | Una columna: ControlsBar, Sidebar, card de contenido. Tab en absoluto; `h1` debajo (padding-top de `.panel`). |
| lg (992–1199) | Una columna; tab flotante con el `h1` a su lado. |
| ≥ xl (1200) | Grilla sidebar 3/12 + contenido 9/12. Sidebar **sticky solo si el alto de la pantalla es ≥ 900px** (si no, scrollea con la página). Ver `foundations/layout.md`. |

## Impresión

- El panel inactivo se renderiza dentro de `.printOnly` con el atributo `hidden`
  (fuera del árbol de accesibilidad y no visible en pantalla).
- En `@media print`: `.printOnly[hidden] { display: block; }` y se aplican las
  reglas de `foundations/layout.md` (ocultar controles, tabs, carrusel → lista, etc.).

## Accesibilidad

- Landmarks: `header` (ControlsBar), `aside` (Sidebar), `main`.
- Un solo `h1` visible por vez (el del panel activo).
- Skip link apunta a `#main-panel`, es el primer elemento enfocable y mueve el foco al tabpanel sin cambiar el hash.
- `AccentGradientDefs` y `HexAvatarDefs` montados **una sola vez**.
- Al cambiar de idioma, `<html lang>` cambia (lo hace el provider) y todo el
  contenido se re-renderiza en el nuevo idioma sin recargar.

## Tests esperados (integración)

1. Renderiza los landmarks `banner`, `complementary` y `main`.
2. El tab inicial es `about` (sin hash) y el panel muestra el `h1` de About.
3. Con `location.hash = "#resume"` antes de montar, arranca en Resume.
4. Click en el tab Resume → el panel muestra el `h1` de Resume, `aria-labelledby` del panel = `tab-resume`, y `history.replaceState` fue llamado con `#resume`.
5. Cambiar el idioma a `es` → los tabs, títulos y contenido pasan al español (verificar un texto de `ui.es` y uno de `cv.es`).
6. Cambiar el tema → `data-theme="dark"` en `<html>`.
7. Existe exactamente un `linearGradient#accent-gradient`, un `clipPath#hex-avatar-outer` y un `clipPath#hex-avatar-inner` en el documento.
8. El primer elemento enfocable es el skip link con `href="#main-panel"`; al activarlo, el foco pasa al tabpanel y `location.hash` **no** cambia.
9. No hay ningún elemento con `id="about"` ni `id="resume"`.
10. `expectNoA11yViolations` sin violaciones en About y en Resume, en ambos idiomas.
