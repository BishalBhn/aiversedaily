"use strict";
/** Shared helpers for the serverless API endpoints. */
const crypto = require("crypto");

/** Constant-time string compare (avoids leaking the password via timing). */
function timingSafeEqual(a, b) {
  const ab = Buffer.from(String(a == null ? "" : a));
  const bb = Buffer.from(String(b == null ? "" : b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/** Parse a JSON request body whether Vercel pre-parsed it or not. */
function readBody(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  if (typeof req.body === "string" && req.body) {
    try { return Promise.resolve(JSON.parse(req.body)); } catch (e) { return Promise.reject(new SyntaxError("Invalid JSON")); }
  }
  return new Promise(function (resolve, reject) {
    let raw = "";
    req.on("data", function (c) {
      raw += c;
      if (raw.length > 3_000_000) { reject(new Error("Payload too large")); req.destroy(); }
    });
    req.on("end", function () {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(new SyntaxError("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}

module.exports = { timingSafeEqual, readBody };
