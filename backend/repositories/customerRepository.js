import { v4 as uuidv4 } from "uuid";
import db, { memoryStore } from "../config/db.js";

/**
 * Customer Repository
 * Handles persistent borrower/customer records with role-based PII masking.
 */
export const customerRepository = {
  /**
   * Find customer by ID
   */
  async findById(customerId, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query("SELECT * FROM customers WHERE id = $1", [customerId]);
      return res.rows[0] || null;
    }
    return db.indexService.getCustomer(customerId) || memoryStore.customers.find(c => c.id === customerId) || null;
  },

  /**
   * Find customer by customer code
   */
  async findByCode(customerCode, client = null) {
    if (db.isPgActive()) {
      const q = client || db.getPool();
      const res = await q.query("SELECT * FROM customers WHERE customer_code = $1", [customerCode]);
      return res.rows[0] || null;
    }
    return memoryStore.customers.find(c => c.customer_code === customerCode) || null;
  },

  /**
   * Find or create a customer record (Idempotent for loan uploads)
   */
  async findOrCreate(custData, client = null) {
    const code = custData.customer_code || `CUST-${uuidv4().slice(0, 8).toUpperCase()}`;

    if (db.isPgActive()) {
      const q = client || db.getPool();
      const existing = await q.query("SELECT * FROM customers WHERE customer_code = $1", [code]);
      if (existing.rows.length > 0) {
        return existing.rows[0];
      }

      const id = custData.id || `cust_${uuidv4()}`;
      const rawPhone = custData.phone_raw || custData.phone || "";
      const maskedPhone = custData.phone_masked || (rawPhone ? `${rawPhone.slice(0, 7)}****${rawPhone.slice(-2)}` : "");

      const insertRes = await q.query(
        `INSERT INTO customers (
          id, customer_code, full_name, phone_masked, phone_raw, alternate_phone,
          email, current_address, city, state, pincode, credit_score
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          id,
          code,
          custData.full_name,
          maskedPhone,
          rawPhone,
          custData.alternate_phone || null,
          custData.email || null,
          custData.current_address || "",
          custData.city || "",
          custData.state || "",
          custData.pincode || "",
          custData.credit_score || 650
        ]
      );
      return insertRes.rows[0];
    }

    // In-memory relational fallback
    let existing = memoryStore.customers.find(c => c.customer_code === code);
    if (!existing) {
      const id = custData.id || `cust_${uuidv4()}`;
      const rawPhone = custData.phone_raw || custData.phone || "";
      const maskedPhone = custData.phone_masked || (rawPhone ? `${rawPhone.slice(0, 7)}****${rawPhone.slice(-2)}` : "");

      existing = {
        id,
        customer_code: code,
        full_name: custData.full_name,
        phone_masked: maskedPhone,
        phone_raw: rawPhone,
        alternate_phone: custData.alternate_phone || null,
        email: custData.email || null,
        current_address: custData.current_address || "",
        city: custData.city || "",
        state: custData.state || "",
        pincode: custData.pincode || "",
        credit_score: custData.credit_score || 650,
        created_at: new Date().toISOString()
      };
      memoryStore.customers.push(existing);
      db.indexService.rebuild(memoryStore);
    }
    return existing;
  },

  /**
   * Apply role-based PII masking
   */
  maskCustomer(customer, userRole) {
    if (!customer) return null;
    const canViewRaw = ["ADMIN", "SUPER_ADMIN", "SUPERVISOR"].includes(userRole);

    return {
      id: customer.id,
      customer_code: customer.customer_code,
      full_name: customer.full_name,
      phone: canViewRaw ? (customer.phone_raw || customer.phone_masked) : customer.phone_masked,
      phone_masked: customer.phone_masked,
      alternate_phone: canViewRaw ? customer.alternate_phone : (customer.alternate_phone ? "******" + customer.alternate_phone.slice(-4) : null),
      email: canViewRaw ? customer.email : (customer.email ? customer.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") : null),
      current_address: canViewRaw ? customer.current_address : (customer.current_address ? `${customer.city}, ${customer.state}` : ""),
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      credit_score: customer.credit_score
    };
  }
};

export default customerRepository;
