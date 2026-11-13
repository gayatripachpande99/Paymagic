import assert from "node:assert";
import { initializeDatabase, db, memoryStore, updateCaseStatusWithHistory } from "../config/db.js";
import { cacheService } from "../services/cacheService.js";
import { indexService } from "../services/indexService.js";

const runCacheIndexTests = async () => {
  console.log("==========================================================");
  console.log("⚡ Running PayMagic Caching & Indexing Verification Suite");
  console.log("==========================================================");

  // 1. Initialize DB and verify auto-indexing
  await initializeDatabase();
  const indexStats = indexService.getStats();

  assert(indexStats.indexedCases >= 200, "All 200 cases must be indexed in caseById map");
  assert(indexStats.indexedCustomers >= 200, "All 200 customers must be indexed in customerById map");
  assert(indexStats.indexedStatusGroups > 0, "Status index groups must exist");
  assert(indexStats.indexedEmployeeGroups > 0, "Employee index groups must exist");
  console.log("✓ In-memory indexing engine verified:", JSON.stringify(indexStats));

  // 2. Test O(1) Index Lookups
  const sampleCase = memoryStore.loan_cases[0];
  const indexedCase = indexService.getCase(sampleCase.id);
  assert.strictEqual(indexedCase.id, sampleCase.id, "O(1) Case lookup must return exact case");

  const sampleCust = memoryStore.customers[0];
  const indexedCust = indexService.getCustomer(sampleCust.id);
  assert.strictEqual(indexedCust.id, sampleCust.id, "O(1) Customer lookup must return exact customer");

  const empCases = indexService.getCasesForEmployee("usr_caller_1");
  assert(empCases.length > 0, "Index must return assigned cases for employee");
  console.log(`✓ O(1) lookups verified (Direct Map retrieval for Case, Customer, Employee worklists)`);

  // 3. Test Caching Service
  cacheService.clear();

  // Test set & get
  cacheService.set("test:metric", { total: 42000 }, 60);
  const cachedVal = cacheService.get("test:metric");
  assert.deepStrictEqual(cachedVal, { total: 42000 }, "Cache get must return stored value");

  // Test cache stats
  const stats = cacheService.stats();
  assert(stats.hits >= 1, "Cache hit must be registered");
  assert.strictEqual(stats.entries, 1, "Cache entries count must be 1");
  console.log("✓ Cache set, get, and metrics tracking verified:", JSON.stringify(stats));

  // 4. Test Pattern Invalidation
  cacheService.set("dashboard:overview", { count: 200 }, 60);
  cacheService.set("dashboard:leaderboard", { rank1: "Rahul" }, 60);
  cacheService.set("cases:list:page1", { list: [] }, 60);

  const evicted = cacheService.delPattern("dashboard:*");
  assert.strictEqual(evicted, 2, "delPattern('dashboard:*') must evict exactly 2 matching keys");
  assert.strictEqual(cacheService.get("dashboard:overview"), null, "Evicted key must return null");
  assert(cacheService.get("cases:list:page1") !== null, "Non-matching key 'cases:list:page1' must remain cached");
  console.log("✓ Wildcard cache pattern invalidation verified (delPattern)");

  // 5. Test Automated Cache Invalidation on Case Status Transition
  cacheService.set("dashboard:summary", { recovered: 85000 }, 60);
  cacheService.set("cases:filter:new", { count: 20 }, 60);

  const callerUser = memoryStore.users.find((u) => u.role === "CALLER");
  await updateCaseStatusWithHistory({
    caseId: sampleCase.id,
    employeeId: callerUser.id,
    newStatus: sampleCase.status === "Contacted" ? "Promise to Pay" : "Contacted",
    remarks: "Testing auto-eviction"
  });

  assert.strictEqual(cacheService.get("dashboard:summary"), null, "Case update must automatically evict dashboard caches");
  assert.strictEqual(cacheService.get("cases:filter:new"), null, "Case update must automatically evict case list caches");
  console.log("✓ Automated cache invalidation on ACID case status update verified");

  console.log("\n==========================================================");
  console.log("🎉 ALL CACHING & INDEXING TESTS PASSED (5/5)");
  console.log("==========================================================");
  process.exit(0);
};

runCacheIndexTests().catch((err) => {
  console.error("❌ Caching/Indexing test failed:", err);
  process.exit(1);
});
