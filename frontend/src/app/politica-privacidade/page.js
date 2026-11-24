"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import authService from "../../services/authService";
import apiService from "../../services/api";
import styles from "./page.module.css";

const REQUEST_TYPES = [
    { value: "ACCESS", label: "Acesso e confirmação de tratamento" },
    { value: "CORRECTION", label: "Correção de dados" },
    { value: "DELETION", label: "Bloqueio ou eliminação, quando aplicável" },
    { value: "PORTABILITY", label: "Portabilidade" },
    { value: "OBJECTION", label: "Oposição ao tratamento, quando aplicável" },
    { value: "OTHER", label: "Outra solicitação" },
];

const STATUS_LABELS = {
    OPEN: "Aberta",
    IN_PROGRESS: "Em análise",
    COMPLETED: "Concluída",
    REJECTED: "Não atendida",
};

const POLICY_VERSION = "SANEM-PRIVACY-1.1";

export default function PrivacyPolicyPage() {
    const router = useRouter();
    const [checked, setChecked] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [requestType, setRequestType] = useState("ACCESS");
    const [requestDescription, setRequestDescription] = useState("");
    const [requestSubmitting, setRequestSubmitting] = useState(false);
    const [requests, setRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);

    const loadRequests = async () => {
        setRequestsLoading(true);
        try {
            const data = await apiService.getMyPrivacyRequests();
            setRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erro ao carregar solicitações de privacidade:", err);
        } finally {
            setRequestsLoading(false);
        }
    };

    useEffect(() => {
        let active = true;
        const verifySession = async () => {
            const token = authService.getToken();
            if (!token || !(await authService.validateToken())) {
                router.replace("/");
                return;
            }
            if (!active) return;
            const user = authService.getUser();
            setAccepted(Boolean(user?.privacyConsent));
            setLoading(false);
            loadRequests();
        };
        verifySession();
        return () => { active = false; };
    }, [router]);

    const handleAccept = async () => {
        if (!checked) return;
        setSubmitting(true);
        setError("");
        setSuccess("");
        try {
            const response = await apiService.acceptPrivacyConsent();
            authService.updatePrivacyConsent(true, response?.version || POLICY_VERSION);
            router.replace("/home");
        } catch (err) {
            setError(err.message || "Não foi possível registrar o aceite. Tente novamente.");
            setSubmitting(false);
        }
    };

    const handleRevoke = async () => {
        setSubmitting(true);
        setError("");
        setSuccess("");
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

    const handleExport = async () => {
        setExporting(true);
        setError("");
        setSuccess("");
        try {
            const data = await apiService.getMyPrivacyData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "sanem-meus-dados-e-consentimentos.json";
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
            setSuccess("Exportação da conta e do histórico de consentimento iniciada.");
        } catch (err) {
            setError(err.message || "Não foi possível exportar os dados da conta.");
        } finally {
            setExporting(false);
        }
    };

    const handlePrivacyRequest = async (event) => {
        event.preventDefault();
        if (!requestDescription.trim()) {
            setError("Descreva a solicitação antes de enviar.");
            return;
        }
        setRequestSubmitting(true);
        setError("");
        setSuccess("");
        try {
            const request = await apiService.createPrivacyRequest({
                requestType,
                description: requestDescription.trim(),
            });
            setRequests((current) => [request, ...current]);
            setRequestDescription("");
            setSuccess("Solicitação registrada. A equipe responsável poderá acompanhar o pedido no painel administrativo.");
        } catch (err) {
            setError(err.message || "Não foi possível registrar sua solicitação.");
        } finally {
            setRequestSubmitting(false);
        }
    };

    if (loading) {
        return <main className={styles.page}><p>Verificando sessão...</p></main>;
    }

    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <p className={styles.eyebrow}>SANEM · PRIVACIDADE E PROTEÇÃO DE DADOS</p>
                <h1>Política de Privacidade</h1>
                <p className={styles.intro}>
                    Esta política descreve, em linguagem simples, como o SANEM trata dados pessoais
                    usados na gestão de doações, estoque, beneficiários e usuários.
                </p>

                <div className={styles.policy}>
                    <h2>1. Responsável pelo tratamento e contato</h2>
                    <p>
                        Antes de disponibilizar o sistema fora do ambiente acadêmico/desenvolvimento,
                        a organização responsável deve preencher e publicar: razão social/nome do controlador,
                        CNPJ quando aplicável, endereço e canal de contato do encarregado ou canal de privacidade.
                        Esses dados ainda dependem de confirmação da organização e não devem ser substituídos por dados fictícios.
                    </p>
                    <p><strong>Controlador:</strong> [PREENCHER NOME E IDENTIFICAÇÃO DA ORGANIZAÇÃO].</p>
                    <p><strong>Canal de privacidade:</strong> [PREENCHER E-MAIL OU CANAL OFICIAL].</p>

                    <h2>2. Dados tratados</h2>
                    <p>
                        Conforme a operação, podem ser tratados dados de identificação e contato de usuários,
                        doadores e beneficiários; dados cadastrais; informações de doações, itens e retiradas;
                        registros de autenticação; e dados técnicos de auditoria, como data/hora de ações,
                        endereço IP e agente do navegador nos eventos de consentimento.
                    </p>

                    <h2>3. Finalidades e bases legais</h2>
                    <p>
                        Os dados podem ser utilizados para autenticar usuários, registrar e acompanhar doações,
                        controlar estoque e retiradas, avaliar solicitações de beneficiários, gerar relatórios,
                        prevenir uso indevido e manter a integridade dos registros. O controlador deve documentar
                        a base legal aplicável a cada finalidade (por exemplo, execução de políticas públicas,
                        obrigação legal/regulatória, legítimo interesse quando cabível ou consentimento, conforme
                        o contexto). O aceite desta política não substitui essa análise nem torna o consentimento
                        a base legal automática para todas as operações.
                    </p>

                    <h2>4. Compartilhamento e retenção</h2>
                    <p>
                        A organização responsável deve identificar os operadores e destinatários que recebem dados,
                        as finalidades do compartilhamento, eventuais transferências internacionais e os prazos ou
                        critérios de retenção. Esses detalhes precisam ser preenchidos e aprovados pelo controlador
                        antes do uso operacional do sistema.
                    </p>

                    <h2>5. Segurança</h2>
                    <p>
                        O SANEM aplica autenticação, autorização por perfil, hashing de senhas com BCrypt,
                        segregação de acesso entre funções e registro de eventos de consentimento. A instância
                        de desenvolvimento continua usando HTTP local; o HTTPS será configurado no ambiente de
                        produção antes de disponibilizar o sistema publicamente. Nenhum dado real sensível deve
                        ser usado no ambiente de desenvolvimento sem autorização e medidas adequadas.
                    </p>

                    <h2>6. Direitos dos titulares</h2>
                    <p>
                        Conforme a legislação aplicável, o titular pode solicitar confirmação e acesso aos dados,
                        correção, informação sobre compartilhamento, portabilidade, oposição e bloqueio, anonimização
                        ou eliminação nos casos previstos em lei, além de revogar o consentimento quando essa for a
                        base legal utilizada. Algumas solicitações podem depender de análise e de obrigações legais
                        de conservação. Consulte também a orientação da
                        {" "}<a href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares" target="_blank" rel="noreferrer">ANPD sobre direitos dos titulares</a>.
                    </p>

                    <h2>7. Consentimento e versão da política</h2>
                    <p>
                        Quando o consentimento for solicitado como base legal, o SANEM registra a versão aceita,
                        data/hora, e eventos de aceite ou revogação. A versão atual desta política é
                        {" "}<strong>{POLICY_VERSION}</strong>. Alterações relevantes exigem nova ciência/aceite
                        no sistema. A revogação é registrada e encerra o acesso às funcionalidades protegidas
                        até que a situação seja tratada pela organização responsável.
                    </p>

                    <h2>8. Dúvidas e solicitações</h2>
                    <p>
                        Usuários autenticados podem exportar os dados básicos da própria conta e do histórico
                        de consentimento e registrar solicitações nesta página. Para dados de doadores ou
                        beneficiários e para titulares que não tenham conta de acesso, a organização deverá
                        disponibilizar o canal oficial indicado na seção 1.
                    </p>
                    <p className={styles.version}>Versão da política: {POLICY_VERSION}</p>
                </div>

                {error && <p className={styles.error} role="alert">{error}</p>}
                {success && <p className={styles.success} role="status">{success}</p>}

                {!accepted ? (
                    <>
                        <label className={styles.accept}>
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) => setChecked(event.target.checked)}
                            />
                            <span>Li e estou ciente da Política de Privacidade do SANEM.</span>
                        </label>
                        <div className={styles.actions}>
                            <button type="button" className={styles.secondary} onClick={handleDecline} disabled={submitting}>
                                Sair sem aceitar
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

                <section className={styles.privacyTools} aria-labelledby="privacy-tools-title">
                    <h2 id="privacy-tools-title">Seus dados e seus direitos</h2>
                    <p>
                        A exportação abaixo cobre os dados básicos da sua conta de usuário e o histórico
                        de consentimento. Ela não representa uma exportação completa dos dados de doadores
                        ou beneficiários mantidos pela organização.
                    </p>
                    <button type="button" className={styles.secondary} onClick={handleExport} disabled={exporting}>
                        {exporting ? "Preparando arquivo..." : "Exportar dados da minha conta"}
                    </button>

                    <form className={styles.privacyRequestForm} onSubmit={handlePrivacyRequest}>
                        <h3>Registrar solicitação ao responsável pelo tratamento</h3>
                        <label htmlFor="privacy-request-type">Tipo de solicitação</label>
                        <select id="privacy-request-type" value={requestType} onChange={(event) => setRequestType(event.target.value)}>
                            {REQUEST_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                        </select>
                        <label htmlFor="privacy-request-description">Detalhes</label>
                        <textarea
                            id="privacy-request-description"
                            value={requestDescription}
                            onChange={(event) => setRequestDescription(event.target.value)}
                            maxLength={2000}
                            rows={4}
                            placeholder="Descreva quais dados ou providências estão envolvidos (máximo de 2.000 caracteres)."
                            required
                        />
                        <button type="submit" className={styles.primary} disabled={requestSubmitting || !requestDescription.trim()}>
                            {requestSubmitting ? "Enviando..." : "Enviar solicitação"}
                        </button>
                    </form>

                    <div className={styles.requestHistory}>
                        <h3>Minhas solicitações</h3>
                        {requestsLoading ? (
                            <p>Carregando solicitações...</p>
                        ) : requests.length === 0 ? (
                            <p>Nenhuma solicitação registrada.</p>
                        ) : (
                            requests.map((request) => (
                                <article className={styles.requestCard} key={request.requestId}>
                                    <div className={styles.requestCardHeader}>
                                        <strong>{REQUEST_TYPES.find((type) => type.value === request.requestType)?.label || request.requestType}</strong>
                                        <span>{STATUS_LABELS[request.status] || request.status}</span>
                                    </div>
                                    <p>{request.description}</p>
                                    {request.responseMessage && <p><strong>Resposta:</strong> {request.responseMessage}</p>}
                                    <small>Aberta em {new Date(request.createdAt).toLocaleString("pt-BR")}</small>
                                </article>
                            ))
                        )}
                    </div>
                </section>
            </section>
        </main>
    );
}
