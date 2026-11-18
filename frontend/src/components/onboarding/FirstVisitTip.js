"use client";
// RNF11 – Dica exibida na primeira visita a uma tela que tem tour.
import { FaLightbulb, FaTimes } from "react-icons/fa";
import styles from "./onboarding.module.css";

export default function FirstVisitTip({ tour, onStart, onLater, onHideAll }) {
  return (
    <aside className={styles.firstVisit} role="dialog" aria-labelledby="firstVisitTitle" aria-live="polite">
      <button type="button" className={styles.close} onClick={onLater} aria-label="Fechar dica">
        <FaTimes aria-hidden="true" />
      </button>
      <div className={styles.firstVisitHeader}>
        <FaLightbulb className={styles.bulb} aria-hidden="true" />
        <h2 id="firstVisitTitle" className={styles.firstVisitTitle}>
          Primeira vez em {tour.title}?
        </h2>
      </div>
      {tour.tip && <p className={styles.firstVisitText}>{tour.tip}</p>}
      <div className={styles.firstVisitActions}>
        <button type="button" className={styles.primarySmall} onClick={onStart}>
          Ver tour desta tela
        </button>
        <button type="button" className={styles.linkButton} onClick={onLater}>
          Agora não
        </button>
      </div>
      <button type="button" className={styles.hideAll} onClick={onHideAll}>
        Não mostrar mais dicas
      </button>
    </aside>
  );
}
