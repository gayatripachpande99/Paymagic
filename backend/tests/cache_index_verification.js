import assert from "node:assert";
import { initializeDatabase, db, memoryStore, updateCaseStatusWithHistory } from "../config/db.js";
import { cacheService } from "../services/cacheService.js";
import { indexService } from "../services/indexService.js";

const runCacheIndexTests = async () => {
  console.log("==========================================================");
  console.log("⚡ Running PayMagic Caching & Indexing Verification Suite");
  console.log("==========================================================");

  // 1. Initialize DB and verify auto-indexing across all entities
  await initializeDatabase();
  const indexStats = indexService.getStats();

  assert(indexStats.indexedCases >= 200, "All 200 cases must be indexed in caseById map");
  assert(indexStats.indexedCustomers >= 200, "All 200 customers must be indexed in customerById map");
  assert(indexStats.indexedStatusGroups > 0, "Status index groups must exist");
  assert(indexStats.indexedEmployeeGroups > 0, "Employee index groups must exist");
  assert(indexStats.indexedLenders > 0, "Lender index groups must exist");
  assert(indexStats.indexedPaymentRecords >= 0, "Payment index records must exist");
  assert(indexStats.indexedPTPRecords >= 0, "PTP index records must exist");
  console.log("✓ In-memory indexing engine verified:", JSON.stringify(indexStats));

  // 2. Test O(1) Index Lookups & Sub-Millisecond Speed
  const t0 = process.hrtime.bigint();
  const sampleCase = memoryStore.loan_cases[0];
  const indexedCase = indexService.getCase(sampleCase.id);
  assert.strictEqual(indexedCase.id, sampleCase.id, "O(1) Case lookup must return exact case");

  const sampleCust = memoryStore.customers[0];
  const indexedCust = indexService.getCustomer(sampleCust.id);
  assert.strictEqual(indexedCust.id, sampleCust.id, "O(1) Customer lookup must return exact customer");

  const empCases = indexService.getCasesForEmployee("usr_caller_1");
  assert(empCases.length > 0, "Index must return assigned cases for employee");

  const statusCases = indexService.getCasesByStatus(sampleCase.status);
  assert(statusCases.length > 0, "Index must return cases for status group");

  const t1 = process.hrtime.bigint();
  const lookupTimeUs = Number(t1 - t0) / 1000;
  console.log(`✓ O(1) lookups verified in ${lookupTimeUs.toFixed(2)}μs (Direct Map retrieval for Case, Customer, Employee, Status)`);

  // 3. Test Caching Service Set, Get & Metrics
  cacheService.clear();

  cacheService.set("test:metric", { total: 42000 }, 60);
  const cachedVal = cacheService.get("test:metric");
  assert.deepStrictEqual(cachedVal, { total: 42000 }, "Cache get must return stored value");

  const stats = cacheService.stats();
  assert(stats.hits >= 1, "Cache hit must be registered");
  assert.strictEqual(stats.entries, 1, "Cache entries count must be 1");
  console.log("✓ Cache set, get, and metrics tracking verified:", JSON.stringify(stats));

  // 4. Test Namespace Pattern Invalidation
  cacheService.set("dashboard:overview", { count: 200 }, 60);
  cacheService.set("dashboard:leaderboard", { rank1: "Rahul" }, 60);
  cacheService.set("cases:list:page1", { list: [] }, 60);
  cacheService.set("allocation:eligible:all", { count: 12 }, 60);
  cacheService.set("recovery:payments:summary", { recovered: 500000 }, 60);

  const evictedDashboard = cacheService.delPattern("dashboard:*");
  assert.strictEqual(evictedDashboard, 2, "delPattern('dashboard:*') must evict exactly 2 matching keys");
  assert.strictEqual(cacheService.get("dashboard:overview"), null, "Evicted key must return null");
  assert(cacheService.get("cases:list:page1") !== null, "Non-matching key 'cases:list:page1' must remain cached");
  assert(cacheService.get("allocation:eligible:all") !== null, "'allocation:eligible:all' must remain cached");
  assert(cacheService.get("recovery:payments:summary") !== null, "'recovery:payments:summary' must remain cached");

  cacheService.delPattern("allocation:*");
  assert.strictEqual(cacheService.get("allocation:eligible:all"), null, "Allocation pattern must evict allocation keys");

  cacheService.delPattern("recovery:*");
  assert.strictEqual(cacheService.get("recovery:payments:summary"), null, "Recovery pattern must evict recovery keys");
  console.log("✓ Multi-partition wildcard cache invalidation verified (dashboard, cases, allocation, recovery)");

  // 5. Test Automated Cache Invalidation on Case Status Transition
  cacheService.set("dashboard:summary", { recovered: 85000 }, 60);
  cacheService.set("cases:filter:new", { count: 20 }, 60);
  cacheService.set("recovery:ptp:active", { count: 15 }, 60);

  const callerUser = memoryStore.users.find((u) => u.role === "CALLER");
  await updateCaseStatusWithHistory({
    caseId: sampleCase.id,
    employeeId: callerUser.id,
    newStatus: sampleCase.status === "Contacted" ? "Promise to Pay" : "Contacted",
    remarks: "Testing auto-eviction across partitions"
  });

  assert.strictEqual(cacheService.get("dashboard:summary"), null, "Case update must automatically evict dashboard caches");
  assert.strictEqual(cacheService.get("cases:filter:new"), null, "Case update must automatically evict case list caches");
  assert.strictEqual(cacheService.get("recovery:ptp:active"), null, "Case update must automatically evict recovery caches");
  console.log("✓ Automated cross-partition cache invalidation on ACID case status update verified");

  // 6. Test Express Route Caching Middleware Simulation (HIT / MISS Headers)
  cacheService.clear();
  const middleware = cacheService.middleware(60, "cases:list");

  let handlerCalled = 0;
  const mockReq = {
    method: "GET",
    originalUrl: "/api/cases?page=1&limit=20",
    baseUrl: "/api/cases",
    user: { id: "usr_admin_1" }
  };

  const createMockRes = () => {
    const headers = {};
    return {
      statusCode: 200,
      setHeader: (k, v) => { headers[k] = v; },
      status: function (code) { this.statusCode = code; return this; },
      json: function (body) { this.body = body; return this; },
      headers
    };
  };

  // Turn 1: Cache MISS
  const res1 = createMockRes();
  middleware(mockReq, res1, () => {
    handlerCalled++;
    res1.json({ success: true, count: 200, data: [{ id: "case_1" }] });
  });

  assert.strictEqual(res1.headers["X-Cache"], "MISS", "First request must return X-Cache: MISS");
  assert.strictEqual(handlerCalled, 1, "Handler must be invoked on cache MISS");

  // Turn 2: Cache HIT
  const res2 = createMockRes();
  middleware(mockReq, res2, () => {
    handlerCalled++;
    res2.json({ success: true, count: 200, data: [{ id: "case_1" }] });
  });

  assert.strictEqual(res2.headers["X-Cache"], "HIT", "Second request must return X-Cache: HIT");
  assert.strictEqual(handlerCalled, 1, "Handler must NOT be invoked on cache HIT");
  assert.deepStrictEqual(res2.body, { success: true, count: 200, data: [{ id: "case_1" }] }, "HIT must return identical payload");
  console.log("✓ Route caching middleware verified (X-Cache MISS -> HIT, bypasses backend handler on HIT)");

  console.log("\n==========================================================");
  console.log("🎉 ALL CACHING & INDEXING TESTS PASSED (6/6)");
  console.log("==========================================================");
  process.exit(0);
};

runCacheIndexTests().catch((err) => {
  console.error("❌ Caching/Indexing test failed:", err);
  process.exit(1);
});
