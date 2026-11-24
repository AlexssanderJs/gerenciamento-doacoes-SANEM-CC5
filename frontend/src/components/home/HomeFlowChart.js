"use client";
// Dashboard da Home: itens recebidos (doações) x itens doados (retiradas) por período
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import apiService from "../../services/api";
import authService from "../../services/authService";
import styles from "./homeFlowChart.module.css";

const PERIODS = [
  { key: "7d", label: "7 dias", days: 7, group: "day" },
  { key: "30d", label: "30 dias", days: 30, group: "week" },
  { key: "6m", label: "6 meses", months: 6, group: "month" },
  { key: "12m", label: "12 meses", months: 12, group: "month" },
];

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const pad = (n) => String(n).padStart(2, "0");
const toIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Lê só "yyyy-MM-dd" para evitar deslocamento de fuso horário
function parseDate(value) {
  if (!value) return null;
  const [y, m, d] = String(value).slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

const sumItems = (record) =>
  (record.items || []).reduce((total, item) => total + (Number(item.quantity) || 0), 0);

// Monta os "baldes" (barras) do período escolhido
function buildBuckets(period) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = [];

  if (period.group === "day") {
    for (let i = period.days - 1; i >= 0; i--) {
      const start = new Date(today);
      start.setDate(today.getDate() - i);
      buckets.push({ start, end: new Date(start), label: `${pad(start.getDate())}/${pad(start.getMonth() + 1)}` });
    }
  } else if (period.group === "week") {
    const weeks = Math.ceil(period.days / 7);
    for (let i = weeks - 1; i >= 0; i--) {
      const end = new Date(today);
      end.setDate(today.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      buckets.push({ start, end, label: `${pad(start.getDate())}/${pad(start.getMonth() + 1)}` });
    }
  } else {
    for (let i = period.months - 1; i >= 0; i--) {
      const start = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      buckets.push({ start, end, label: MONTHS[start.getMonth()] });
    }
  }
  return buckets.map((b) => ({ ...b, received: 0, donated: 0 }));
}

function fill(buckets, records, dateField, targetField) {
  records.forEach((record) => {
    const date = parseDate(record[dateField]);
    if (!date) return;
    const bucket = buckets.find((b) => date >= b.start && date <= b.end);
    if (bucket) bucket[targetField] += sumItems(record);
  });
}

export default function HomeFlowChart() {
  const [periodKey, setPeriodKey] = useState("6m");
  const [donations, setDonations] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const period = PERIODS.find((p) => p.key === periodKey);

  useEffect(() => {
    if (!authService.isAuthenticated()) return;
    let cancelled = false;

    const buckets = buildBuckets(period);
    const filters = {
      startDate: toIso(buckets[0].start),
      endDate: toIso(buckets[buckets.length - 1].end),
    };

    setLoading(true);
    setError(false);
    Promise.all([apiService.getDonations(filters), apiService.getWithdrawals(filters)])
      .then(([d, w]) => {
        if (cancelled) return;
        setDonations(Array.isArray(d) ? d : []);
        setWithdrawals(Array.isArray(w) ? w : []);
      })
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [periodKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const data = useMemo(() => {
    const buckets = buildBuckets(period);
    fill(buckets, donations, "donationDate", "received");
    fill(buckets, withdrawals, "withdrawalDate", "donated");
    return buckets;
  }, [donations, withdrawals, period]);

  const totalReceived = data.reduce((s, b) => s + b.received, 0);
  const totalDonated = data.reduce((s, b) => s + b.donated, 0);
  const maxValue = Math.max(...data.map((b) => Math.max(b.received, b.donated)), 1);

  // Geometria do SVG
  const W = 560;
  const H = 240;
  const pad4 = { top: 22, right: 8, bottom: 28, left: 36 };
  const innerW = W - pad4.left - pad4.right;
  const innerH = H - pad4.top - pad4.bottom;
  const groupW = innerW / data.length;
  const barW = Math.min(18, (groupW - 6) / 2);
  const ticks = [0, 0.5, 1].map((f) => Math.round(maxValue * f));

  return (
    <section className={styles.card} aria-labelledby="homeFlowTitle">
      <div className={styles.header}>
        <h2 id="homeFlowTitle" className={styles.title}>Recebido × Doado</h2>
        <select
          className={styles.select}
          value={periodKey}
          onChange={(e) => setPeriodKey(e.target.value)}
          aria-label="Período do gráfico"
        >
          {PERIODS.map((p) => (
            <option key={p.key} value={p.key}>Últimos {p.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.stats}>
        <Link href="/relatorios/doacoes" className={`${styles.stat} ${styles.statReceived}`}>
          <span className={styles.statLabel}>Itens recebidos</span>
          <span className={styles.statValue}>{totalReceived}</span>
          <span className={styles.statLink}>Ver doações →</span>
        </Link>
        <Link href="/relatorios/retiradas" className={`${styles.stat} ${styles.statDonated}`}>
          <span className={styles.statLabel}>Itens doados</span>
          <span className={styles.statValue}>{totalDonated}</span>
          <span className={styles.statLink}>Ver retiradas →</span>
        </Link>
      </div>

      {error ? (
        <p className={styles.message}>Não foi possível carregar os dados.</p>
      ) : loading ? (
        <p className={styles.message}>Carregando...</p>
      ) : totalReceived === 0 && totalDonated === 0 ? (
        <p className={styles.message}>Nenhuma movimentação neste período.</p>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img"
          aria-label="Gráfico de itens recebidos e doados por período">
          {ticks.map((t) => {
            const y = pad4.top + innerH - (t / maxValue) * innerH;
            return (
              <g key={t}>
                <line x1={pad4.left} x2={W - pad4.right} y1={y} y2={y} className={styles.grid} />
                <text x={pad4.left - 6} y={y + 4} textAnchor="end" className={styles.axis}>{t}</text>
              </g>
            );
          })}
          {data.map((b, i) => {
            const cx = pad4.left + groupW * i + groupW / 2;
            const hR = (b.received / maxValue) * innerH;
            const hD = (b.donated / maxValue) * innerH;
            const base = pad4.top + innerH;
            return (
              <g key={i}>
                <rect x={cx - barW - 1} y={base - hR} width={barW} height={hR} rx="3" className={styles.barReceived}>
                  <title>{`${b.label} — recebido: ${b.received}`}</title>
                </rect>
                <rect x={cx + 1} y={base - hD} width={barW} height={hD} rx="3" className={styles.barDonated}>
                  <title>{`${b.label} — doado: ${b.donated}`}</title>
                </rect>
                {b.received > 0 && (
                  <text x={cx - barW / 2 - 1} y={base - hR - 5} textAnchor="middle" className={styles.valueReceived}>{b.received}</text>
                )}
                {b.donated > 0 && (
                  <text x={cx + barW / 2 + 1} y={base - hD - 5} textAnchor="middle" className={styles.valueDonated}>{b.donated}</text>
                )}
                <text x={cx} y={H - 8} textAnchor="middle" className={styles.axis}>{b.label}</text>
              </g>
            );
          })}
        </svg>
      )}

      <div className={styles.legend}>
        <span><i className={`${styles.dot} ${styles.dotReceived}`} /> Recebido (doações)</span>
        <span><i className={`${styles.dot} ${styles.dotDonated}`} /> Doado (retiradas)</span>
      </div>
    </section>
  );
}
