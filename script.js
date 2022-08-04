
import { check } from "k6";
import http from "k6/http";
import { Counter } from 'k6/metrics';

export const requests = new Counter('http_reqs')

export const options = {
  vus: 100,
  duration: '30s'
}

let url = "http://localhost:3000/qa/questions/111";

export default function() {
  let res = http.get(url);
  check(res, {
    "is status 200": (r) => r.status === 200,
    'transaction time < 200ms': r => r.timings.duration < 200,
    'transaction time < 500ms': r => r.timings.duration < 500,
    'transaction time < 1000ms': r => r.timings.duration < 1000,
    'transaction time < 2000ms': r => r.timings.duration < 2000
  });
};