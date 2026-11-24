"use client";

import { useEffect, useState } from "react";
import MenuBar from "../components/menubar/menubar";
import Navigation from "../components/navegation/navegation";
import apiService from "../../services/api";
import authService from "../../services/authService";
import { useNotification } from "../../components/notifications/NotificationProvider";
import styles from "./solicitacoes.module.css";

const STATUSES = [
    { value: "OPEN", label: "Aberta" },
    { value: "IN_PROGRESS", label: "Em análise" },
    { value: "COMPLETED", label: "Concluída" },
    { value: "REJECTED", label: "Não atendida" },
];

const REQUEST_TYPES = {
    ACCESS: "Acesso e confirmação",
    CORRECTION: "Correção",
    DELETION: "Bloqueio ou eliminação",
    PORTABILITY: "Portabilidade",
    OBJECTION: "Oposição",
    OTHER: "Outra solicitação",
};

export default function PrivacyRequestsPage() {
    const { showNotification } = useNotification();
    const [requests, setRequests] = useState([]);
    const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 0, totalElements: 0 });
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [statusDrafts, setStatusDrafts] = useState({});
    const [responses, setResponses] = useState({});

    const loadRequests = async (page = 0) => {
        setLoading(true);
        try {
            const result = await apiService.getPrivacyRequests(page, 20);
            const content = result?.content || [];
            setRequests(content);
            setPageInfo({
                number: result?.number ?? page,
                totalPages: result?.totalPages ?? 0,
                totalElements: result?.totalElements ?? content.length,
            });
        } catch (error) {
            showNotification(error.message || "Não foi possível carregar as solicitações.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const user = authService.getUser();
        const role = (user?.role || "").toLowerCase();
        if (!role.includes("admin") && !role.includes("administrator")) {
            showNotification("Acesso restrito à administração.", "error");
            return;
        }
        loadRequests(0);
    }, []);

    const saveRequest = async (request) => {
        setSavingId(request.requestId);
        try {
            const updated = await apiService.updatePrivacyRequest(request.requestId, {
                status: statusDrafts[request.requestId] || request.status,
                responseMessage: responses[request.requestId] ?? request.responseMessage ?? "",
            });
            setRequests((current) => current.map((item) =>
                item.requestId === request.requestId ? updated : item
            ));
            showNotification("Solicitação atualizada.", "success");
        } catch (error) {
            showNotification(error.message || "Não foi possível atualizar a solicitação.", "error");
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className={styles.page}>
            <MenuBar />
            <Navigation />
            <main className={styles.content}>
                <header className={styles.header}>
                    <div>
                        <p className={styles.eyebrow}>ADMINISTRAÇÃO · PRIVACIDADE</p>
                        <h1>Solicitações LGPD</h1>
                        <p>Acompanhe pedidos dos titulares e registre a resposta do controlador.</p>
                    </div>
                    <button type="button" className={styles.refresh} onClick={() => loadRequests(pageInfo.number)} disabled={loading}>
                        Atualizar
                    </button>
                </header>

                <div className={styles.summary}>
                    <strong>{pageInfo.totalElements}</strong>
                    <span>solicitações registradas</span>
                </div>

                {loading ? (
                    <p className={styles.empty}>Carregando solicitações...</p>
                ) : requests.length === 0 ? (
                    <p className={styles.empty}>Nenhuma solicitação registrada.</p>
                ) : (
                    <div className={styles.list}>
                        {requests.map((request) => (
                            <article className={styles.card} key={request.requestId}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <span className={styles.type}>{REQUEST_TYPES[request.requestType] || request.requestType}</span>
                                        <h2>{request.requesterName} · {request.requesterEmail}</h2>
                                        <small>Solicitação #{request.requestId} · {new Date(request.createdAt).toLocaleString("pt-BR")}</small>
                                    </div>
                                    <span className={styles.status}>{STATUSES.find((item) => item.value === request.status)?.label || request.status}</span>
                                </div>
                                <p className={styles.description}>{request.description}</p>

                                <div className={styles.responseArea}>
                                    <label htmlFor={`status-${request.requestId}`}>Status</label>
                                    <select
                                        id={`status-${request.requestId}`}
                                        value={statusDrafts[request.requestId] || request.status}
                                        onChange={(event) => setStatusDrafts((current) => ({ ...current, [request.requestId]: event.target.value }))}
                                    >
                                        {STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                                    </select>
                                    <label htmlFor={`response-${request.requestId}`}>Resposta ao titular</label>
                                    <textarea
                                        id={`response-${request.requestId}`}
                                        value={responses[request.requestId] ?? request.responseMessage ?? ""}
                                        onChange={(event) => setResponses((current) => ({ ...current, [request.requestId]: event.target.value }))}
                                        maxLength={2000}
                                        rows={3}
                                        placeholder="Registre a resposta, justificativa ou providência adotada."
                                    />
                                    <button type="button" onClick={() => saveRequest(request)} disabled={savingId === request.requestId}>
                                        {savingId === request.requestId ? "Salvando..." : "Salvar andamento"}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                <div className={styles.pagination}>
                    <button type="button" onClick={() => loadRequests(pageInfo.number - 1)} disabled={loading || pageInfo.number <= 0}>Anterior</button>
                    <span>Página {pageInfo.totalPages === 0 ? 0 : pageInfo.number + 1} de {pageInfo.totalPages}</span>
                    <button type="button" onClick={() => loadRequests(pageInfo.number + 1)} disabled={loading || pageInfo.number >= pageInfo.totalPages - 1}>Próxima</button>
                </div>
                <p className={styles.note}>
                    O registro no sistema não substitui a análise jurídica e operacional do controlador.
                    Verifique a identidade do titular, a base legal aplicável, os prazos e as hipóteses legais
                    de conservação antes de concluir uma solicitação.
                </p>
            </main>
        </div>
    );
}
