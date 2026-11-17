"use client";
// RNF11 – Dicas iniciais exibidas no primeiro acesso.
import { useEffect, useRef } from "react";
import { FaHandHoldingHeart, FaShoppingCart, FaBars, FaRoute } from "react-icons/fa";
import styles from "./onboarding.module.css";

const TIPS = [
  {
    icon: <FaBars aria-hidden="true" />,
    title: "Menu à esquerda",
    text: "Todas as áreas do sistema ficam no menu lateral.",
  },
  {
    icon: <FaHandHoldingHeart aria-hidden="true" />,
    title: "Chegou doação?",
    text: "Registre em Doações. O estoque aumenta sozinho.",
  },
  {
    icon: <FaShoppingCart aria-hidden="true" />,
    title: "Alguém veio buscar itens?",
    text: "Registre em Retirada. O sistema confere o limite do mês.",
  },
  {
    icon: <FaRoute aria-hidden="true" />,
    title: "Ficou com dúvida?",
    text: "Clique em \"Tour\" no topo da tela para ver o passo a passo.",
  },
];

export default function WelcomeModal({ userName, onStart, onSkip }) {
  const startRef = useRef(null);

  useEffect(() => {
    startRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onSkip();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onSkip]);

  const firstName = (userName || "").trim().split(" ")[0];

  return (
    <div className={styles.overlay} role="presentation">
      <div
        className={styles.welcome}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcomeTitle"
        aria-describedby="welcomeIntro"
      >
        <h2 id="welcomeTitle" className={styles.welcomeTitle}>
          {firstName ? `Olá, ${firstName}! Boas-vindas ao SANEM` : "Boas-vindas ao SANEM"}
        </h2>
        <p id="welcomeIntro" className={styles.welcomeIntro}>
          Quatro dicas para começar:
        </p>

        <ul className={styles.tips}>
          {TIPS.map((tip) => (
            <li key={tip.title} className={styles.tip}>
              <span className={styles.tipIcon}>{tip.icon}</span>
              <span>
                <strong className={styles.tipTitle}>{tip.title}</strong>
                <span className={styles.tipText}>{tip.text}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={onSkip}>
            Explorar sozinho
          </button>
          <button type="button" className={styles.primary} onClick={onStart} ref={startRef}>
            Fazer o tour guiado (1 min)
          </button>
        </div>
      </div>
    </div>
  );
}
