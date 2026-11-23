"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import authService from "../../services/authService";
import apiService from "../../services/api";
import styles from "./page.module.css";

export default function PrivacyPolicyPage() {
    const router = useRouter();
    const [checked, setChecked] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const verifySession = async () => {
            const token = authService.getToken();
            if (!token || !(await authService.validateToken())) {
                router.replace("/");
                return;
            }
            setAccepted(Boolean(authService.getUser()?.privacyConsent));
            setLoading(false);
        };
        verifySession();
    }, [router]);

    const handleAccept = async () => {
        if (!checked) return;
        setSubmitting(true);
        setError("");
        try {
            const response = await apiService.acceptPrivacyConsent();
            authService.updatePrivacyConsent(true, response?.version);
            router.replace("/home");
        } catch (err) {
            setError(err.message || "Não foi possível registrar o aceite. Tente novamente.");
            setSubmitting(false);
        }
    };

    const handleRevoke = async () => {
        setSubmitting(true);
        setError("");
        try {
            await apiService.revokePrivacyConsent();
            authService.updatePrivacyConsent(false);
            authService.logout();
        } catch (err) {
            setError(err.message || "Não foi possível revogar o consentimento.");
            setSubmitting(false);
        }
    };

    const handleDecline = () => authService.logout();

    if (loading) {
        return <main className={styles.page}><p>Verificando sessão...</p></main>;
    }

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <p className={styles.eyebrow}>SANEM · PRIVACIDADE</p>
                <h1>Política de Privacidade</h1>
                <p className={styles.intro}>
                    Antes de utilizar o sistema, leia as informações abaixo sobre o tratamento
                    de dados pessoais no contexto da gestão de doações.
                </p>

                <div className={styles.policy}>
                    <h2>Quais dados são tratados</h2>
                    <p>
                        O SANEM pode tratar dados de identificação e contato de usuários,
                        doadores e beneficiários, além de informações necessárias para
                        registrar doações, estoque, retiradas e operações administrativas.
                    </p>

                    <h2>Finalidade do tratamento</h2>
                    <p>
                        Os dados são utilizados para autenticar usuários, operar o sistema,
                        manter o histórico de doações e retiradas, administrar o estoque,
                        gerar relatórios e proteger a integridade dos registros.
                    </p>

                    <h2>Acesso e segurança</h2>
                    <p>
                        O acesso às funcionalidades é autenticado e restrito conforme as
                        permissões aplicáveis. O sistema mantém registros necessários à
                        operação e à segurança dos serviços.
                    </p>

                    <h2>Direitos do titular</h2>
                    <p>
                        Nos termos da LGPD, o titular pode solicitar informações sobre o
                        tratamento de seus dados, correção de dados incompletos ou
                        desatualizados e, quando aplicável, outras providências previstas
                        na legislação, por meio do canal responsável pela administração
                        do SANEM.
                    </p>

                    <p className={styles.version}>Versão da política: SANEM-PRIVACY-1.0</p>
                </div>

                {error && <p className={styles.error} role="alert">{error}</p>}

                {!accepted ? (
                    <>
                        <label className={styles.accept}>
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) => setChecked(event.target.checked)}
                            />
                            <span>
                                Li e concordo com a Política de Privacidade para utilizar o SANEM.
                            </span>
                        </label>
                        <div className={styles.actions}>
                            <button type="button" className={styles.secondary} onClick={handleDecline} disabled={submitting}>
                                Não concordo e sair
                            </button>
                            <button type="button" className={styles.primary} onClick={handleAccept} disabled={!checked || submitting}>
                                {submitting ? "Registrando..." : "Aceitar e continuar"}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={styles.actions}>
                        <button type="button" className={styles.secondary} onClick={() => router.replace("/home")}>
                            Voltar ao sistema
                        </button>
                        <button type="button" className={styles.danger} onClick={handleRevoke} disabled={submitting}>
                            {submitting ? "Processando..." : "Revogar consentimento e sair"}
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}
