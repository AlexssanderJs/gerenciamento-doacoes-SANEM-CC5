const ROLE_ALIASES = {
  administrator: "ADMINISTRATOR",
  administrador: "ADMINISTRATOR",
  admin: "ADMINISTRATOR",
  attendant: "ATTENDANT",
  atendente: "ATTENDANT",
  collaborator: "ATTENDANT",
  colaborador: "ATTENDANT",
  evaluator: "EVALUATOR",
  avaliador: "EVALUATOR",
};

export function normalizeRole(value) {
  if (!value) return "";
  return ROLE_ALIASES[value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase()] || "";
}

export function canAccessMenu(roleValue, key) {
  const role = normalizeRole(roleValue);
  if (role === "ADMINISTRATOR") return true;
  if (role === "ATTENDANT") {
    return !["users", "settings", "privacyRequests"].includes(key);
  }
  if (role === "EVALUATOR") {
    return ["home", "beneficiaries", "collectionPoints", "demands", "reports", "help"].includes(key);
  }
  return false;
}

export function canAccessPath(roleValue, pathname = "") {
  const role = normalizeRole(roleValue);
  if (!role) return false;
  if (role === "ADMINISTRATOR") return true;
  if (pathname === "/politica-privacidade" || pathname.startsWith("/perfil")) return true;

  const allowedPrefixes = role === "ATTENDANT"
    ? [
        "/home",
        "/estoque",
        "/doacao",
        "/retirada",
        "/cadastrodoador",
        "/cadastrobeneficiario",
        "/pontoscoleta",
        "/demandas",
        "/relatorios",
        "/ajuda",
      ]
    : role === "EVALUATOR"
      ? [
          "/home",
          "/cadastrobeneficiario/lista",
          "/pontoscoleta/lista",
          "/demandas",
          "/relatorios",
          "/ajuda",
        ]
      : [];

  return allowedPrefixes.some((prefix) =>
    pathname === prefix || pathname.startsWith(prefix + "/")
  );
}
