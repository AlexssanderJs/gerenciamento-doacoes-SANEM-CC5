// RNF11 – Guarda, por usuário e por navegador, o que já foi visto
// (boas-vindas, tours e dicas). Usa localStorage: não exige backend.
import authService from "../../services/authService";

const VERSION = "v1";

function userKey() {
  const user = authService.getUser?.();
  const id = user?.id ?? user?.login ?? user?.name ?? "anon";
  return `sanem:onboarding:${VERSION}:${id}`;
}

const EMPTY = { welcomeSeen: false, toursSeen: {}, tipsHidden: false };

export function loadOnboarding() {
  try {
    const raw = localStorage.getItem(userKey());
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

function save(state) {
  try {
    localStorage.setItem(userKey(), JSON.stringify(state));
  } catch {
    /* navegação privada ou armazenamento cheio: segue sem lembrar */
  }
}

export function updateOnboarding(patch) {
  const next = { ...loadOnboarding(), ...patch };
  save(next);
  return next;
}

export function markTourSeen(tourId) {
  const state = loadOnboarding();
  save({ ...state, toursSeen: { ...state.toursSeen, [tourId]: true } });
}

export function resetOnboarding() {
  save({ ...EMPTY });
}
