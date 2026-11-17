"use client";
// RNF11 – Onboarding: tour guiado (plugin driver.js) + dicas iniciais.
//
// - 1º acesso à Home: janela de boas-vindas com dicas e convite para o tour geral.
// - 1º acesso às demais telas com tour: cartão discreto "Primeira vez aqui?".
// - Botão "Tour" no topo (MenuBar) reabre o tour da tela atual a qualquer momento.
// - Página de Ajuda lista todos os tours e permite reexibir as dicas.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import authService from "../../services/authService";
import { TOURS, tourForPath } from "./tours";
import { loadOnboarding, markTourSeen, resetOnboarding, updateOnboarding } from "./onboardingStorage";
import WelcomeModal from "./WelcomeModal";
import FirstVisitTip from "./FirstVisitTip";

const OnboardingContext = createContext(null);

const WAIT_FOR_PAGE_MS = 4000;

/** Espera até a tela carregar algum elemento do tour (dados vêm da API). */
function waitFor(check, timeout) {
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      if (check() || Date.now() - start >= timeout) return resolve();
      setTimeout(tick, 120);
    };
    tick();
  });
}

const exists = (selector) => {
  if (!selector) return true;
  const node = document.querySelector(selector);
  return !!node && node.getClientRects().length > 0;
};

export function OnboardingProvider({ children }) {
  const pathname = usePathname();
  const driverRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [tipTour, setTipTour] = useState(null);

  const startTour = useCallback(async (tourId) => {
    const tour = TOURS[tourId];
    if (!tour) return false;

    setTipTour(null);
    setShowWelcome(false);
    if (driverRef.current) driverRef.current.destroy();

    const { driver } = await import("driver.js");

    await waitFor(() => tour.steps.some((s) => s.element && exists(s.element)), WAIT_FOR_PAGE_MS);
    const steps = tour.steps.filter((s) => exists(s.element));
    if (steps.length === 0) return false;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const instance = driver({
      steps,
      showProgress: steps.length > 1,
      progressText: "{{current}} de {{total}}",
      nextBtnText: "Próximo",
      prevBtnText: "Voltar",
      doneBtnText: "Concluir",
      closeBtnLabel: "Fechar tour",
      popoverClass: "sanem-tour",
      animate: !reduceMotion,
      smoothScroll: !reduceMotion,
      allowClose: true,
      overlayOpacity: 0.55,
      stagePadding: 6,
      stageRadius: 8,
      skipMissingElement: true,
      onDestroyed: () => {
        markTourSeen(tourId);
        driverRef.current = null;
        setRunning(false);
      },
    });

    driverRef.current = instance;
    setRunning(true);
    instance.drive();
    return true;
  }, []);

  /** Tour da tela atual; nas telas sem tour próprio, mostra o tour geral. */
  const startTourForCurrentPage = useCallback(() => {
    const tour = tourForPath(pathname);
    return startTour(tour ? tour.id : "geral");
  }, [pathname, startTour]);

  const resetTips = useCallback(() => {
    resetOnboarding();
  }, []);

  // Decide o que mostrar a cada mudança de tela
  useEffect(() => {
    setTipTour(null);
    if (!authService.isAuthenticated()) {
      setShowWelcome(false);
      return;
    }

    const tour = tourForPath(pathname);
    const params = new URLSearchParams(window.location.search);

    // Link "Ver tour" da página de Ajuda: /estoque?tour=1
    if (params.get("tour") === "1") {
      params.delete("tour");
      const query = params.toString();
      window.history.replaceState(null, "", pathname + (query ? `?${query}` : ""));
      startTour(tour ? tour.id : "geral");
      return;
    }

    const state = loadOnboarding();
    if (pathname === "/home" && !state.welcomeSeen) {
      setShowWelcome(true);
      return;
    }
    if (tour && tour.id !== "geral" && !state.tipsHidden && !state.toursSeen[tour.id]) {
      setTipTour(tour);
    }
  }, [pathname, startTour]);

  // Fecha o tour se o usuário sair da tela no meio dele
  useEffect(() => () => driverRef.current?.destroy(), [pathname]);

  const handleWelcomeStart = () => {
    updateOnboarding({ welcomeSeen: true });
    startTour("geral");
  };

  const handleWelcomeSkip = () => {
    updateOnboarding({ welcomeSeen: true });
    setShowWelcome(false);
  };

  const handleTipStart = () => {
    if (tipTour) startTour(tipTour.id);
  };

  const handleTipLater = () => {
    if (tipTour) markTourSeen(tipTour.id);
    setTipTour(null);
  };

  const handleTipHideAll = () => {
    updateOnboarding({ tipsHidden: true });
    setTipTour(null);
  };

  const value = { startTour, startTourForCurrentPage, resetTips, running };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      {showWelcome && !running && (
        <WelcomeModal
          userName={authService.getUser?.()?.name}
          onStart={handleWelcomeStart}
          onSkip={handleWelcomeSkip}
        />
      )}
      {tipTour && !running && !showWelcome && (
        <FirstVisitTip
          tour={tipTour}
          onStart={handleTipStart}
          onLater={handleTipLater}
          onHideAll={handleTipHideAll}
        />
      )}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  // Fora do provider (ex.: testes isolados) os botões simplesmente não fazem nada
  return ctx || { startTour: async () => false, startTourForCurrentPage: async () => false, resetTips: () => {}, running: false };
}
