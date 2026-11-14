/**
 * Centralized Loan Row Validation & Sanitization Engine
 * Enforces business rules across the 16 standard fields, protects against formula injection,
 * and maintains string precision for identifiers and PIN codes.
 */

export const STANDARD_COLUMNS = [
  "Borrower Name",
  "Customer Code",
  "Phone",
  "Alternate Phone",
  "Email",
  "Address",
  "City",
  "State",
  "Pincode",
  "Lender Name",
  "Loan Account No",
  "Loan Type",
  "Principal Amount",
  "Outstanding Amount",
  "DPD",
  "Priority"
];

export const VALID_LOAN_TYPES = [
  "Personal",
  "Auto",
  "Home",
  "Business",
  "Credit Card",
  "Gold",
  "Education"
];

export const VALID_PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export const loanValidationService = {
  STANDARD_COLUMNS,
  VALID_LOAN_TYPES,
  VALID_PRIORITIES,

  /**
   * Sanitizes text to prevent CSV/Excel Formula Injection (DDE injection)
   */
  sanitizeFormula(value, isNumeric = false) {
    if (value === null || value === undefined) return "";
    const str = String(value).trim();
    if (str === "") return "";

    // If field is strictly numeric and parses to a number, do not treat '-' as formula
    if (isNumeric) {
      if (!isNaN(parseFloat(str)) && isFinite(str)) {
        return str;
      }
    }

    // Check for formula trigger characters: '=', '+', '-', '@', tab, CR
    const formulaTriggers = ["=", "+", "-", "@", "\t", "\r"];
    if (formulaTriggers.includes(str[0])) {
      // Return safe text prefixed with single quote for exports or flagged
      return `'${str}`;
    }
    return str;
  },

  /**
   * Detects if a text value contains an unescaped dangerous spreadsheet formula
   */
  hasFormulaInjection(value, isNumeric = false) {
    if (value === null || value === undefined) return false;
    const str = String(value).trim();
    if (str === "") return false;

    // Numbers with minus sign are legitimate negative numbers, not formulas
    if (isNumeric && !isNaN(Number(str))) {
      return false;
    }

    // Danger triggers
    const triggers = ["=", "+", "-", "@"];
    return triggers.includes(str[0]);
  },

  /**
   * Maps raw spreadsheet row keys to canonical snake_case property names
   */
  normalizeHeaders(rawRow) {
    const normalized = {};
    const headerAliases = {
      // 1. Borrower Name
      "borrower name": "borrower_name",
      "borrower_name": "borrower_name",
      "customer name": "borrower_name",
      "customer_name": "borrower_name",
      "full name": "borrower_name",
      "full_name": "borrower_name",

      // 2. Customer Code
      "customer code": "customer_code",
      "customer_code": "customer_code",
      "borrower code": "customer_code",
      "cust code": "customer_code",
      "customer id": "customer_code",
      "customer_id": "customer_code",

      // 3. Phone
      "phone": "phone",
      "phone number": "phone",
      "phone_number": "phone",
      "mobile": "phone",
      "mobile number": "phone",
      "mobile_number": "phone",
      "customer mobile number": "phone",

      // 4. Alternate Phone
      "alternate phone": "alternate_phone",
      "alternate_phone": "alternate_phone",
      "alt phone": "alternate_phone",
      "secondary phone": "alternate_phone",

      // 5. Email
      "email": "email",
      "email address": "email",
      "email_address": "email",

      // 6. Address
      "address": "address",
      "customer address": "address",
      "current address": "address",
      "current_address": "address",

      // 7. City
      "city": "city",
      "town": "city",

      // 8. State
      "state": "state",
      "province": "state",

      // 9. Pincode
      "pincode": "pincode",
      "pin code": "pincode",
      "pin_code": "pincode",
      "zip": "pincode",
      "zip code": "pincode",
      "postal code": "pincode",

      // 10. Lender Name
      "lender name": "lender_name",
      "lender_name": "lender_name",
      "lender": "lender_name",
      "bank": "lender_name",
      "bank name": "lender_name",
      "bank / financial institution": "lender_name",
      "institution": "lender_name",

      // 11. Loan Account No
      "loan account no": "loan_account_no",
      "loan_account_no": "loan_account_no",
      "loan account number": "loan_account_no",
      "account no": "loan_account_no",
      "account number": "loan_account_no",
      "loan account": "loan_account_no",

      // 12. Loan Type
      "loan type": "loan_type",
      "loan_type": "loan_type",
      "type": "loan_type",

      // 13. Principal Amount
      "principal amount": "principal_amount",
      "principal_amount": "principal_amount",
      "principal": "principal_amount",
      "loan amount": "principal_amount",
      "total loan amount": "principal_amount",

      // 14. Outstanding Amount
      "outstanding amount": "outstanding_amount",
      "outstanding_amount": "outstanding_amount",
      "outstanding": "outstanding_amount",
      "due amount": "outstanding_amount",
      "balance": "outstanding_amount",

      // 15. DPD
      "dpd": "dpd",
      "days past due": "dpd",
      "days past due (dpd)": "dpd",
      "overdue days": "dpd",

      // 16. Priority
      "priority": "priority",
      "case priority": "priority"
    };

    for (const [key, val] of Object.entries(rawRow)) {
      const cleanKey = String(key).trim().toLowerCase();
      const mapped = headerAliases[cleanKey];
      if (mapped) {
        normalized[mapped] = val !== null && val !== undefined ? String(val).trim() : "";
      }
    }

    return normalized;
  },

  /**
   * Validates a single mapped row against all 16 standard business rules
   */
  validateRow(row, rowIndex) {
    const errors = [];
    const sanitized = {};

    // 1. Borrower Name (Required Text)
    if (!row.borrower_name || row.borrower_name.trim() === "") {
      errors.push("Borrower Name is required.");
    } else {
      if (this.hasFormulaInjection(row.borrower_name)) {
        errors.push("Borrower Name contains forbidden formula prefix characters.");
      }
      sanitized.borrower_name = row.borrower_name.trim();
    }

    // 2. Customer Code (Required String, preserved with leading zeros)
    if (!row.customer_code || row.customer_code.trim() === "") {
      errors.push("Customer Code is required.");
    } else {
      if (this.hasFormulaInjection(row.customer_code)) {
        errors.push("Customer Code contains forbidden formula prefix characters.");
      }
      sanitized.customer_code = String(row.customer_code).trim().toUpperCase();
    }

    // 3. Phone (Required Mobile, 10-digit Indian format)
    if (!row.phone || row.phone.trim() === "") {
      errors.push("Phone number is required.");
    } else {
      let cleanPhone = String(row.phone).replace(/\s+/g, "").replace(/-/g, "");
      if (cleanPhone.startsWith("+91")) cleanPhone = cleanPhone.slice(3);
      if (cleanPhone.startsWith("91") && cleanPhone.length === 12) cleanPhone = cleanPhone.slice(2);
      if (cleanPhone.startsWith("0") && cleanPhone.length === 11) cleanPhone = cleanPhone.slice(1);

      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        errors.push(`Invalid mobile number '${row.phone}'. Must be a 10-digit Indian mobile number.`);
      } else {
        sanitized.phone = `+91 ${cleanPhone}`;
      }
    }

    // 4. Alternate Phone (Optional Mobile)
    if (row.alternate_phone && row.alternate_phone.trim() !== "") {
      let cleanAlt = String(row.alternate_phone).replace(/\s+/g, "").replace(/-/g, "");
      if (cleanAlt.startsWith("+91")) cleanAlt = cleanAlt.slice(3);
      if (cleanAlt.startsWith("91") && cleanAlt.length === 12) cleanAlt = cleanAlt.slice(2);
      if (cleanAlt.startsWith("0") && cleanAlt.length === 11) cleanAlt = cleanAlt.slice(1);

      if (!/^[6-9]\d{9}$/.test(cleanAlt)) {
        errors.push(`Invalid alternate mobile number '${row.alternate_phone}'.`);
      } else {
        sanitized.alternate_phone = `+91 ${cleanAlt}`;
      }
    } else {
      sanitized.alternate_phone = null;
    }

    // 5. Email (Optional Email)
    if (row.email && row.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email.trim())) {
        errors.push(`Invalid email format '${row.email}'.`);
      } else {
        sanitized.email = row.email.trim().toLowerCase();
      }
    } else {
      sanitized.email = null;
    }

    // 6. Address (Optional Text)
    sanitized.address = row.address ? String(row.address).trim() : "";

    // 7. City (Required Text)
    if (!row.city || row.city.trim() === "") {
      errors.push("City is required.");
    } else {
      if (this.hasFormulaInjection(row.city)) {
        errors.push("City contains forbidden formula prefix characters.");
      }
      sanitized.city = row.city.trim();
    }

    // 8. State (Required Text)
    if (!row.state || row.state.trim() === "") {
      errors.push("State is required.");
    } else {
      if (this.hasFormulaInjection(row.state)) {
        errors.push("State contains forbidden formula prefix characters.");
      }
      sanitized.state = row.state.trim();
    }

    // 9. Pincode (Required 6-digit Indian PIN, preserved as string)
    if (!row.pincode || row.pincode.trim() === "") {
      errors.push("Pincode is required.");
    } else {
      const cleanPin = String(row.pincode).trim();
      if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
        errors.push(`Invalid Indian PIN code '${row.pincode}'. Must be exactly 6 digits starting with 1-9.`);
      } else {
        sanitized.pincode = cleanPin;
      }
    }

    // 10. Lender Name (Required Text)
    if (!row.lender_name || row.lender_name.trim() === "") {
      errors.push("Lender Name is required.");
    } else {
      if (this.hasFormulaInjection(row.lender_name)) {
        errors.push("Lender Name contains forbidden formula prefix characters.");
      }
      sanitized.lender_name = row.lender_name.trim();
    }

    // 11. Loan Account No (Required Unique String)
    if (!row.loan_account_no || row.loan_account_no.trim() === "") {
      errors.push("Loan Account Number is required.");
    } else {
      if (this.hasFormulaInjection(row.loan_account_no)) {
        errors.push("Loan Account No contains forbidden formula prefix characters.");
      }
      sanitized.loan_account_no = String(row.loan_account_no).trim().toUpperCase();
    }

    // 12. Loan Type (Allowed enum)
    if (!row.loan_type || row.loan_type.trim() === "") {
      sanitized.loan_type = "Personal";
    } else {
      const matched = VALID_LOAN_TYPES.find(
        t => t.toLowerCase() === row.loan_type.trim().toLowerCase()
      );
      if (!matched) {
        errors.push(`Invalid Loan Type '${row.loan_type}'. Allowed types: ${VALID_LOAN_TYPES.join(", ")}.`);
      } else {
        sanitized.loan_type = matched;
      }
    }

    // 13. Principal Amount (Required Non-negative Decimal)
    if (row.principal_amount === undefined || row.principal_amount === "") {
      errors.push("Principal Amount is required.");
    } else {
      const pAmt = parseFloat(String(row.principal_amount).replace(/,/g, ""));
      if (isNaN(pAmt) || pAmt < 0) {
        errors.push(`Invalid Principal Amount '${row.principal_amount}'. Must be a non-negative number.`);
      } else {
        sanitized.principal_amount = pAmt;
      }
    }

    // 14. Outstanding Amount (Required Non-negative Decimal)
    if (row.outstanding_amount === undefined || row.outstanding_amount === "") {
      // Default to principal amount if empty
      sanitized.outstanding_amount = sanitized.principal_amount || 0;
    } else {
      const oAmt = parseFloat(String(row.outstanding_amount).replace(/,/g, ""));
      if (isNaN(oAmt) || oAmt < 0) {
        errors.push(`Invalid Outstanding Amount '${row.outstanding_amount}'. Must be a non-negative number.`);
      } else {
        sanitized.outstanding_amount = oAmt;
      }
    }

    // 15. DPD (Non-negative Integer)
    if (row.dpd === undefined || row.dpd === "") {
      sanitized.dpd = 0;
    } else {
      const dpdVal = parseInt(String(row.dpd).replace(/,/g, ""), 10);
      if (isNaN(dpdVal) || dpdVal < 0) {
        errors.push(`Invalid DPD '${row.dpd}'. Must be a non-negative integer.`);
      } else {
        sanitized.dpd = dpdVal;
      }
    }

    // 16. Priority (CRITICAL, HIGH, MEDIUM, LOW)
    if (!row.priority || row.priority.trim() === "") {
      sanitized.priority = "MEDIUM";
    } else {
      const pUpper = row.priority.trim().toUpperCase();
      if (!VALID_PRIORITIES.includes(pUpper)) {
        errors.push(`Invalid Priority '${row.priority}'. Must be one of: ${VALID_PRIORITIES.join(", ")}.`);
      } else {
        sanitized.priority = pUpper;
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.map(e => `Row ${rowIndex}: ${e}`),
      sanitized
    };
  }
};

export default loanValidationService;

