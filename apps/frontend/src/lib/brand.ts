export const brand = {
  appName: "Banexcoin.shop",
  authLabel: "Acceso interno",
  consoleDescriptor: "BanexReintegra",
  consoleTagline: "Operaciones de cashback QR",
  consoleTitle: "Banexcoin.shop Console",
  description:
    "Consola interna para validar, calcular, aprobar y exportar reintegros de pagos QR de Banexcoin.shop.",
  landingUrl: "/",
  shortName: "Banexcoin",
} as const;

export const brandMetadata = {
  applicationName: brand.consoleTitle,
  description: brand.description,
  title: {
    default: brand.consoleTitle,
    template: `%s | ${brand.appName}`,
  },
} as const;
