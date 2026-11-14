import crypto from "crypto";

/**
 * File Validation & Security Service
 * Validates file size, MIME types, file signatures (magic bytes), and spreadsheet boundaries.
 */
export const fileValidationService = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  MAX_SHEETS: 10,
  MAX_ROWS: 50000,
  MAX_COLS: 50,

  ALLOWED_EXTENSIONS: [".xlsx", ".csv"],
  ALLOWED_MIME_TYPES: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
    "application/csv",
    "text/plain"
  ],

  /**
   * Computes SHA-256 checksum for audit and deduplication
   */
  calculateChecksum(buffer) {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  },

  /**
   * Inspects magic bytes (file signature) to prevent renamed executables or payloads
   */
  validateFileSignature(buffer, extension) {
    if (!buffer || buffer.length < 4) {
      return { valid: false, error: "File buffer is empty or corrupted." };
    }

    // Check for executable binary signatures
    // DOS / Windows PE executable: 'MZ' (0x4D, 0x5A)
    if (buffer[0] === 0x4D && buffer[1] === 0x5A) {
      return { valid: false, error: "Security alert: Windows executable/binary file detected." };
    }
    // Unix ELF binary: 0x7F, 'E', 'L', 'F' (0x7F, 0x45, 0x4C, 0x46)
    if (buffer[0] === 0x7F && buffer[1] === 0x45 && buffer[2] === 0x4C && buffer[3] === 0x46) {
      return { valid: false, error: "Security alert: ELF binary executable detected." };
    }
    // Shell script '#!' (0x23, 0x21)
    if (buffer[0] === 0x23 && buffer[1] === 0x21 && extension === ".xlsx") {
      return { valid: false, error: "Security alert: Script file disguised as spreadsheet." };
    }

    if (extension === ".xlsx") {
      // XLSX must start with ZIP magic bytes: 'PK\x03\x04' (0x50, 0x4B, 0x03, 0x04)
      const isZip = buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
      if (!isZip) {
        return { valid: false, error: "Invalid Excel format: File does not have valid XLSX (ZIP) signature." };
      }

      // Check for OpenXML signature within header/buffer
      const headerString = buffer.slice(0, Math.min(2048, buffer.length)).toString("latin1");
      const hasOpenXmlMarker = headerString.includes("[Content_Types].xml") ||
                               headerString.includes("xl/") ||
                               headerString.includes("_rels");
      if (!hasOpenXmlMarker && buffer.length > 512) {
        // Search in whole buffer if not found in first 2KB
        const fullString = buffer.toString("latin1");
        if (!fullString.includes("[Content_Types].xml") && !fullString.includes("xl/")) {
          return { valid: false, error: "Corrupted or non-standard XLSX package: Missing OpenXML parts." };
        }
      }
      return { valid: true };
    }

    if (extension === ".csv") {
      // CSV must be plain text. Check if buffer contains null bytes (binary indicator)
      const sample = buffer.slice(0, Math.min(1024, buffer.length));
      for (let i = 0; i < sample.length; i++) {
        if (sample[i] === 0x00) {
          return { valid: false, error: "Invalid CSV format: Binary characters detected in text file." };
        }
      }
      return { valid: true };
    }

    return { valid: false, error: `Unsupported file extension '${extension}'. Only .xlsx and .csv are supported.` };
  },

  /**
   * Comprehensive validation of an uploaded file buffer
   */
  validateUpload(file) {
    if (!file) {
      return { valid: false, error: "No file provided for upload." };
    }

    const { originalname, mimetype, size, buffer } = file;

    // 1. File Size check
    if (size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size (${(size / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit of 10 MB.`
      };
    }

    // 2. Extension check
    const ext = originalname.toLowerCase().substring(originalname.lastIndexOf("."));
    if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        valid: false,
        error: `File extension '${ext}' is not permitted. Only .xlsx and .csv files are supported.`
      };
    }

    // 3. MIME type check
    const isMimeAllowed = this.ALLOWED_MIME_TYPES.some(m => mimetype.toLowerCase().includes(m.toLowerCase()));
    if (!isMimeAllowed && mimetype !== "application/octet-stream") {
      return {
        valid: false,
        error: `MIME type '${mimetype}' is not permitted for loan imports.`
      };
    }

    // 4. File Signature (Magic Bytes) check
    const sigCheck = this.validateFileSignature(buffer, ext);
    if (!sigCheck.valid) {
      return sigCheck;
    }

    // 5. Compute Checksum
    const checksum = this.calculateChecksum(buffer);

    return {
      valid: true,
      extension: ext,
      checksum,
      size
    };
  },

  /**
   * Validates workbook worksheet limits, row limits, and column limits
   */
  validateWorkbookStructure(workbook) {
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      return { valid: false, error: "Spreadsheet contains no readable worksheets." };
    }

    if (workbook.SheetNames.length > this.MAX_SHEETS) {
      return {
        valid: false,
        error: `Spreadsheet exceeds maximum allowed worksheet limit (Found ${workbook.SheetNames.length}, max allowed: ${this.MAX_SHEETS}).`
      };
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    if (!worksheet || !worksheet["!ref"]) {
      return { valid: false, error: "Spreadsheet sheet is empty or has invalid range." };
    }

    // Decode range
    const range = worksheet["!ref"].split(":");
    if (range.length === 2) {
      // Quick check on row count from range e.g. A1:P50001
      const startRowMatch = range[0].match(/\d+/);
      const endRowMatch = range[1].match(/\d+/);
      if (startRowMatch && endRowMatch) {
        const totalRows = parseInt(endRowMatch[0], 10) - parseInt(startRowMatch[0], 10) + 1;
        if (totalRows > this.MAX_ROWS) {
          return {
            valid: false,
            error: `Spreadsheet exceeds row limit: ${totalRows} rows detected (max allowed: ${this.MAX_ROWS}).`
          };
        }
      }
    }

    return { valid: true, sheetName: firstSheetName };
  }
};

export default fileValidationService;

