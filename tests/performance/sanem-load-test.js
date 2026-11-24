import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";

const BASE_URL = (__ENV.BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");
const TOKEN = __ENV.TOKEN;

const catalogDuration = new Trend("catalog_duration", true);
const collectionPointsDuration = new Trend("collection_points_duration", true);
const donationsDuration = new Trend("donations_duration", true);

export const options = {
  scenarios: {
    normal_load: {
      executor: "constant-vus",
      vus: Number(__ENV.VUS || 10),
      duration: __ENV.DURATION || "1m",
    },
  },
  thresholds: {
    catalog_duration: ["p(95)<2000", "max<2000"],
    collection_points_duration: ["p(95)<2000", "max<2000"],
    donations_duration: ["p(95)<2000", "max<2000"],
    http_req_failed: ["rate<0.01"],
  },
};

if (!TOKEN) {
  throw new Error("Defina TOKEN com um JWT de usuário ativo que tenha aceitado a versão vigente da política.");
}

const params = {
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/json",
  },
  tags: { test: "normal-load" },
};

export default function () {
  const catalog = http.get(`${BASE_URL}/item?page=0&size=50`, params);
  catalogDuration.add(catalog.timings.duration);
  check(catalog, { "catálogo de itens retorna HTTP 200": (r) => r.status === 200 });

  const collectionPoints = http.get(`${BASE_URL}/collection-point?page=0&size=50`, params);
  collectionPointsDuration.add(collectionPoints.timings.duration);
  check(collectionPoints, { "pontos de coleta retornam HTTP 200": (r) => r.status === 200 });

  const donations = http.get(`${BASE_URL}/donation/page?page=0&size=50&sort=donationDate,desc`, params);
  donationsDuration.add(donations.timings.duration);
  check(donations, { "histórico de doações retorna HTTP 200": (r) => r.status === 200 });

  sleep(1);
}
