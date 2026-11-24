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
  return ROLE_ALIASES[value.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").trim().toLowerCase()] || "";
}

export function canAccessMenu(roleValue, key) {
  const role = normalizeRole(roleValue);
  if (role === "ADMINISTRATOR") return true;
  if (role === "ATTENDANT") {
    return !["users", "settings"].includes(key);
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

  if (role === "ATTENDANT") {
    return !pathname.startsWith("/usuarios") && !pathname.startsWith("/configuracoes");
  }

  if (role === "EVALUATOR") {
    const allowedPrefixes = [
      "/home",
      "/cadastrobeneficiario",
      "/pontoscoleta",
      "/demandas",
      "/relatorios",
      "/ajuda",
      "/perfil",
    ];
    return allowedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
  }

  return false;
}
