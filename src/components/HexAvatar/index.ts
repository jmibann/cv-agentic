// Re-exports del módulo HexAvatar (plan.md → Archivos; nota de cierre de
// pieza en tasks.md → T4). La app importa desde acá. La superficie pública es
// la API de la spec (specs/primitives/HexAvatar/spec.md): `HexAvatar`,
// `HexAvatarDefs` —las defs compartidas que AppLayout monta una sola vez
// (RF-3; criterio Icon con AccentGradientDefs: ambos valores + el tipo)— y el
// tipo `HexAvatarProps`. No hay alias internos que excluir: la spec no
// exporta otros nombres.
export { HexAvatar, HexAvatarDefs } from "./HexAvatar";
export type { HexAvatarProps } from "./HexAvatar";
