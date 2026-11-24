"use client";
import React from "react";
import styles from "./privacy.module.css";

export const LEGAL_BASIS_OPTIONS = [
  { value: "CONSENT", label: "Consentimento do titular" },
  { value: "LEGAL_OBLIGATION", label: "Obrigação legal ou regulatória" },
  { value: "PUBLIC_POLICY", label: "Execução de políticas públicas / assistência social" },
  { value: "LEGITIMATE_INTEREST", label: "Legítimo interesse" },
];

export const DEFAULT_PRIVACY = {
  legalBasis: "CONSENT",
  privacyPurpose: "",
  privacyConsent: false,
};

/** Retorna mensagem de erro quando a base legal exige consentimento e ele não foi marcado. */
export function validatePrivacy({ legalBasis, privacyConsent }) {
  if (!legalBasis) return "Informe a base legal do tratamento de dados.";
  if (legalBasis === "CONSENT" && !privacyConsent) {
    return "É necessário registrar o consentimento do titular dos dados.";
  }
  return "";
}

/**
 * Campos de LGPD (RNF04) para cadastro de doadores e beneficiários.
 * `value` e `onChange` seguem o formato { legalBasis, privacyPurpose, privacyConsent }.
 */
export default function PrivacyConsentFields({ value, onChange, subject = "titular", disabled = false }) {
  const update = (patch) => onChange({ ...value, ...patch });

  return (
    <fieldset className={styles.fieldset} disabled={disabled}>
      <legend>Proteção de dados (LGPD)</legend>

      <label htmlFor="legalBasis"><b>Base legal do tratamento*</b></label>
      <select
        id="legalBasis"
        value={value.legalBasis || ""}
        onChange={(e) => update({ legalBasis: e.target.value })}
        required
      >
        {LEGAL_BASIS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>

      <label htmlFor="privacyPurpose"><b>Finalidade do tratamento</b></label>
      <input
        id="privacyPurpose"
        type="text"
        maxLength={255}
        value={value.privacyPurpose || ""}
        onChange={(e) => update({ privacyPurpose: e.target.value })}
        placeholder="Ex.: registrar doações e emitir comprovantes"
      />

      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={Boolean(value.privacyConsent)}
          onChange={(e) => update({ privacyConsent: e.target.checked })}
        />
        <span>
          O {subject} foi informado sobre o tratamento dos seus dados pessoais e
          {value.legalBasis === "CONSENT" ? " consentiu com ele (obrigatório)." : " ciente da política de privacidade."}
        </span>
      </label>
    </fieldset>
  );
}
