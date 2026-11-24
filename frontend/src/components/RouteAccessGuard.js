"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import authService from "../services/authService";
import { canAccessPath } from "../utils/permissions";

const PUBLIC_ROUTES = [
  /^\/$/,
  /^\/esqueci-minha-senha(?:\/|$)/,
  /^\/redefinir-senha(?:\/|$)/,
];

export default function RouteAccessGuard({ children }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const isPublicRoute = PUBLIC_ROUTES.some((route) => route.test(pathname));
  const [checking, setChecking] = useState(!isPublicRoute);

  useEffect(() => {
    let active = true;

    if (isPublicRoute) {
      setChecking(false);
      return () => { active = false; };
    }

    setChecking(true);
    const validateAccess = async () => {
      try {
        const token = authService.getToken();
        if (!token || !(await authService.validateToken())) {
          router.replace("/");
          return;
        }

        const user = authService.getUser();
        if (pathname !== "/politica-privacidade" && user?.privacyConsent !== true) {
          router.replace("/politica-privacidade");
          return;
        }

        if (pathname !== "/politica-privacidade" && !canAccessPath(user?.role, pathname)) {
          router.replace("/home");
          return;
        }

        if (active) setChecking(false);
      } catch (error) {
        console.error("Falha ao validar acesso à rota:", error);
        router.replace("/");
      }
    };

    validateAccess();
    return () => { active = false; };
  }, [pathname, router, isPublicRoute]);

  if (checking) {
    return (
      <div role="status" aria-live="polite" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        Verificando acesso...
      </div>
    );
  }

  return children;
}
