/**
 * PII Masking Service
 * Centralized, role-based sensitive data protection for borrower and customer PII.
 * Enforces strict compliance with data privacy standards and RBAC rules.
 */

/**
 * Mask standard Indian mobile phone number: 98XXXXXX10
 * Retains first 2 and last 2 digits, masks middle with 'X'
 */
export const maskPhone = (phone) => {
  if (!phone) return "";
  const clean = String(phone).trim();
  if (clean.length <= 4) return "X".repeat(clean.length);
  const first2 = clean.slice(0, 2);
  const last2 = clean.slice(-2);
  const middleX = "X".repeat(Math.max(1, clean.length - 4));
  return `${first2}${middleX}${last2}`;
};

/**
 * Mask alternate phone number: XXXXXXXXXX (all digits hidden)
 */
export const maskAlternatePhone = (phone) => {
  if (!phone) return null;
  const clean = String(phone).trim();
  return "X".repeat(clean.length > 0 ? clean.length : 10);
};

/**
 * Mask email address: g****@example.com
 * Shows first character of username + 4 asterisks + domain
 */
export const maskEmail = (email) => {
  if (!email) return null;
  const clean = String(email).trim();
  const atIndex = clean.indexOf("@");
  if (atIndex <= 0) return "****@example.com";
  const firstChar = clean[0];
  const domain = clean.slice(atIndex);
  return `${firstChar}****${domain}`;
};

/**
 * Mask pincode: XXXX10
 * Retains last 2 digits, masks first 4 digits with 'XXXX'
 */
export const maskPincode = (pincode) => {
  if (!pincode) return "";
  const clean = String(pincode).trim();
  if (clean.length <= 2) return `XXXX${clean}`;
  const last2 = clean.slice(-2);
  return `XXXX${last2}`;
};

/**
 * Mask physical address for roles without field visit clearance
 */
export const maskAddress = (address, city = "", state = "") => {
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  return "[Restricted Address]";
};

/**
 * Determine if a supervisor has authorized access to a case
 */
export const isSupervisorAuthorizedForCase = (supervisorUser, caseRecord) => {
  if (!supervisorUser || supervisorUser.role !== "SUPERVISOR") return false;
  if (!caseRecord) return true; // General view if no specific case context

  const supervisorId = supervisorUser.id || supervisorUser.userId;
  const supervisorEmpId = supervisorUser.employeeId || supervisorUser.employee_id;

  // 1. Direct assignment to this supervisor
  if (
    caseRecord.assigned_supervisor_id &&
    (caseRecord.assigned_supervisor_id === supervisorId || caseRecord.assigned_supervisor_id === supervisorEmpId)
  ) {
    return true;
  }

  // 2. Case assigned to an employee under supervisor's team
  if (Array.isArray(supervisorUser.teamMemberIds) && supervisorUser.teamMemberIds.includes(caseRecord.assigned_employee_id)) {
    return true;
  }

  // 3. Zone-based authority match
  if (supervisorUser.location_zone && caseRecord.location_zone && supervisorUser.location_zone === caseRecord.location_zone) {
    return true;
  }

  // 4. Default: If case is explicitly tagged with another supervisor, restrict
  if (caseRecord.assigned_supervisor_id && caseRecord.assigned_supervisor_id !== supervisorId) {
    return false;
  }

  // 5. If unassigned supervisor or part of supervisor's general department
  return true;
};

/**
 * Centralized Role-Based Customer PII Masking
 *
 * @param {Object} customer Customer record
 * @param {Object|string} user User object or role string
 * @param {Object} [caseRecord] Optional case record for object-level supervisor/agent scoping
 * @returns {Object} Customer object with appropriate fields masked
 */
export const maskCustomerByRole = (customer, user, caseRecord = null) => {
  if (!customer) return null;

  const role = typeof user === "string" ? user : user?.role || "CALLER";
  const userObj = typeof user === "object" && user !== null ? user : { role };

  const rawPhone = customer.phone_raw || customer.phone || "";
  const alternatePhone = customer.alternate_phone || null;
  const email = customer.email || customer.customer_email || null;
  const address = customer.current_address || customer.address || "";
  const city = customer.city || customer.customer_city || "";
  const state = customer.state || customer.customer_state || "";
  const pincode = customer.pincode || customer.customer_pincode || "";

  // 1. SUPER_ADMIN & ADMIN: Full, unmasked access
  if (["SUPER_ADMIN", "ADMIN"].includes(role)) {
    return {
      id: customer.id,
      customer_code: customer.customer_code,
      full_name: customer.full_name || customer.customer_name || "",
      phone: rawPhone || maskPhone(rawPhone),
      phone_raw: rawPhone,
      phone_masked: maskPhone(rawPhone),
      alternate_phone: alternatePhone,
      email: email,
      current_address: address,
      address: address,
      city: city,
      state: state,
      pincode: pincode,
      credit_score: customer.credit_score || null
    };
  }

  // 2. SUPERVISOR: Full access only within authorized scope; masked otherwise
  if (role === "SUPERVISOR") {
    const isAuthorized = isSupervisorAuthorizedForCase(userObj, caseRecord);

    if (isAuthorized) {
      return {
        id: customer.id,
        customer_code: customer.customer_code,
        full_name: customer.full_name || customer.customer_name || "",
        phone: rawPhone || maskPhone(rawPhone),
        phone_raw: rawPhone,
        phone_masked: maskPhone(rawPhone),
        alternate_phone: alternatePhone,
        email: email,
        current_address: address,
        address: address,
        city: city,
        state: state,
        pincode: pincode,
        credit_score: customer.credit_score || null
      };
    }

    // Outside authorized scope -> Masked
    return {
      id: customer.id,
      customer_code: customer.customer_code,
      full_name: customer.full_name || customer.customer_name || "",
      phone: maskPhone(rawPhone),
      phone_raw: maskPhone(rawPhone),
      phone_masked: maskPhone(rawPhone),
      alternate_phone: maskAlternatePhone(alternatePhone),
      email: maskEmail(email),
      current_address: maskAddress(address, city, state),
      address: maskAddress(address, city, state),
      city: city,
      state: state,
      pincode: maskPincode(pincode),
      credit_score: null
    };
  }

  // 3. CALLER: Authorized for calling (if canDial: true, primary raw phone accessible; otherwise masked phone)
  if (role === "CALLER") {
    const canCall = userObj.canDial === true;
    const phoneVal = canCall ? rawPhone : (customer.phone_masked || maskPhone(rawPhone));
    return {
      id: customer.id,
      customer_code: customer.customer_code,
      full_name: customer.full_name || customer.customer_name || "",
      phone: phoneVal,
      phone_raw: canCall ? rawPhone : (customer.phone_masked || maskPhone(rawPhone)),
      phone_masked: customer.phone_masked || maskPhone(rawPhone),
      alternate_phone: maskAlternatePhone(alternatePhone),
      email: maskEmail(email),
      current_address: maskAddress(address, city, state),
      address: maskAddress(address, city, state),
      city: city,
      state: state,
      pincode: maskPincode(pincode),
      credit_score: null
    };
  }

  // 4. FIELD_AGENT: Authorized for on-site visit (full physical address & pincode; phone masked)
  if (role === "FIELD_AGENT") {
    return {
      id: customer.id,
      customer_code: customer.customer_code,
      full_name: customer.full_name || customer.customer_name || "",
      phone: maskPhone(rawPhone),
      phone_raw: maskPhone(rawPhone),
      phone_masked: maskPhone(rawPhone),
      alternate_phone: maskAlternatePhone(alternatePhone),
      email: maskEmail(email),
      current_address: address,
      address: address,
      city: city,
      state: state,
      pincode: pincode,
      credit_score: null
    };
  }

  // 5. Default / Fallback: Everything masked
  return {
    id: customer.id,
    customer_code: customer.customer_code,
    full_name: customer.full_name || customer.customer_name || "",
    phone: maskPhone(rawPhone),
    phone_raw: maskPhone(rawPhone),
    phone_masked: maskPhone(rawPhone),
    alternate_phone: maskAlternatePhone(alternatePhone),
    email: maskEmail(email),
    current_address: maskAddress(address, city, state),
    address: maskAddress(address, city, state),
    city: city,
    state: state,
    pincode: maskPincode(pincode),
    credit_score: null
  };
};

export default {
  maskPhone,
  maskAlternatePhone,
  maskEmail,
  maskPincode,
  maskAddress,
  isSupervisorAuthorizedForCase,
  maskCustomerByRole
};
