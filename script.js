
import { check } from "k6";
import http from "k6/http";

export default function() {
  let res = http.get("http://localhost:3000/qa/questions/product_id=1");
  check(res, {
    "is status 200": (r) => r.status === 200
  });
};