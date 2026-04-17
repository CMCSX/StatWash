import XLSX from "xlsx";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "sample-templates");
mkdirSync(outDir, { recursive: true });

const templates = {
  "Account_Status_BEL_Template.xlsx": {
    columns: ["Account Number", "Account Name", "Account Status", "Balance", "Due Date", "Last Payment Date", "Contact Number", "Email", "Region", "Remarks"],
    rows: [
      ["ACC-10001", "Juan Dela Cruz", "ACTIVE", 15250.75, "2024-06-15", "2024-05-20", "09171234567", "juan.delacruz@email.com", "NCR", "Regular payer"],
      ["ACC-10002", "Maria Santos", "ACTIVE", 8430.00, "2024-06-20", "2024-06-01", "09181234567", "maria.santos@email.com", "REGION IV", "Good standing"],
      ["ACC-10003", "Pedro Reyes", "DELINQUENT", 42100.50, "2024-05-01", "2024-02-15", "09191234567", "pedro.reyes@email.com", "REGION III", "Needs follow-up"],
      ["ACC-10004", "Ana Garcia", "ACTIVE", 3200.00, "2024-07-10", "2024-06-10", "09201234567", "ana.garcia@email.com", "NCR", ""],
      ["ACC-10005", "Carlos Tan", "CLOSED", 0, "2024-04-01", "2024-04-01", "09211234567", "carlos.tan@email.com", "REGION VII", "Fully paid"],
      ["ACC-10006", "Rosa Lim", "ACTIVE", 11000.25, "2024-06-30", "2024-06-05", "09221234567", "rosa.lim@email.com", "REGION VI", ""],
      ["ACC-10007", "Jose Mendoza", "DELINQUENT", 67500.00, "2024-03-15", "2024-01-10", "09231234567", "jose.mendoza@email.com", "REGION V", "Legal action pending"],
      ["ACC-10008", "Elena Cruz", "ACTIVE", 5600.00, "2024-07-01", "2024-06-15", "09241234567", "elena.cruz@email.com", "NCR", ""],
      ["ACC-10009", "Roberto Aquino", "SUSPENDED", 28900.00, "2024-05-20", "2024-03-01", "09251234567", "roberto.aquino@email.com", "REGION II", "Under review"],
      ["ACC-10010", "Lisa Fernandez", "ACTIVE", 7800.50, "2024-06-25", "2024-06-12", "09261234567", "lisa.fernandez@email.com", "REGION I", "Good history"],
    ],
  },
  "ADA_Penalty_Template.xlsx": {
    columns: ["Reference Number", "Account Number", "Account Name", "Penalty Type", "Penalty Amount", "Violation Date", "Due Date", "Status", "Remarks"],
    rows: [
      ["PEN-2024-0001", "ACC-10003", "Pedro Reyes", "LATE PAYMENT", 1500.00, "2024-05-01", "2024-06-01", "PENDING", "30-day overdue penalty"],
      ["PEN-2024-0002", "ACC-10007", "Jose Mendoza", "NON-COMPLIANCE", 5000.00, "2024-03-15", "2024-04-15", "PENDING", "Failed to submit documents"],
      ["PEN-2024-0003", "ACC-10009", "Roberto Aquino", "LATE PAYMENT", 2250.00, "2024-04-20", "2024-05-20", "RESOLVED", "Paid in full"],
      ["PEN-2024-0004", "ACC-10003", "Pedro Reyes", "DISHONORED CHECK", 3000.00, "2024-04-10", "2024-05-10", "PENDING", "Check bounced"],
      ["PEN-2024-0005", "ACC-10007", "Jose Mendoza", "LATE PAYMENT", 1500.00, "2024-02-15", "2024-03-15", "ESCALATED", "Referred to legal"],
      ["PEN-2024-0006", "ACC-10001", "Juan Dela Cruz", "LATE PAYMENT", 750.00, "2024-05-15", "2024-06-15", "WAIVED", "First offense waiver"],
      ["PEN-2024-0007", "ACC-10006", "Rosa Lim", "NON-COMPLIANCE", 2000.00, "2024-05-30", "2024-06-30", "PENDING", "Missing KYC documents"],
      ["PEN-2024-0008", "ACC-10009", "Roberto Aquino", "BREACH OF CONTRACT", 10000.00, "2024-03-01", "2024-04-01", "UNDER REVIEW", "Contract violation"],
    ],
  },
  "BSP_Attestation_Template.xlsx": {
    columns: ["Reference Number", "Account Number", "Account Name", "Attestation Date", "Compliance Status", "Attested By", "Department", "Remarks"],
    rows: [
      ["ATT-2024-001", "ACC-10001", "Juan Dela Cruz", "2024-06-01", "COMPLIANT", "Maria Reyes", "COMPLIANCE", "All documents verified"],
      ["ATT-2024-002", "ACC-10002", "Maria Santos", "2024-06-01", "COMPLIANT", "Maria Reyes", "COMPLIANCE", ""],
      ["ATT-2024-003", "ACC-10003", "Pedro Reyes", "2024-06-01", "NON-COMPLIANT", "Jose Garcia", "COMPLIANCE", "Missing AML documents"],
      ["ATT-2024-004", "ACC-10004", "Ana Garcia", "2024-06-02", "COMPLIANT", "Maria Reyes", "COMPLIANCE", ""],
      ["ATT-2024-005", "ACC-10005", "Carlos Tan", "2024-06-02", "COMPLIANT", "Jose Garcia", "AUDIT", "Account closed - final attestation"],
      ["ATT-2024-006", "ACC-10006", "Rosa Lim", "2024-06-03", "PENDING REVIEW", "Elena Cruz", "COMPLIANCE", "Awaiting additional docs"],
      ["ATT-2024-007", "ACC-10007", "Jose Mendoza", "2024-06-03", "NON-COMPLIANT", "Elena Cruz", "LEGAL", "Referred for legal review"],
      ["ATT-2024-008", "ACC-10008", "Elena Cruz", "2024-06-04", "COMPLIANT", "Maria Reyes", "COMPLIANCE", ""],
      ["ATT-2024-009", "ACC-10009", "Roberto Aquino", "2024-06-04", "UNDER REVIEW", "Jose Garcia", "RISK", "Flagged for enhanced due diligence"],
      ["ATT-2024-010", "ACC-10010", "Lisa Fernandez", "2024-06-05", "COMPLIANT", "Maria Reyes", "COMPLIANCE", "Good standing"],
    ],
  },
  "PTP_Report_BEL_Template.xlsx": {
    columns: ["Account Number", "Account Name", "PTP Date", "PTP Amount", "Agent Name", "Contact Number", "Status", "Follow Up Date", "Remarks"],
    rows: [
      ["ACC-10003", "Pedro Reyes", "2024-06-10", 10000.00, "Agent Lopez", "09171234567", "KEPT", "2024-06-25", "Paid on time"],
      ["ACC-10007", "Jose Mendoza", "2024-06-05", 15000.00, "Agent Santos", "09231234567", "BROKEN", "2024-06-12", "Did not pay on promised date"],
      ["ACC-10009", "Roberto Aquino", "2024-06-15", 5000.00, "Agent Lopez", "09251234567", "PENDING", "2024-06-20", "Awaiting confirmation"],
      ["ACC-10003", "Pedro Reyes", "2024-06-20", 10000.00, "Agent Reyes", "09171234567", "PENDING", "2024-06-25", "Second PTP after first broken"],
      ["ACC-10001", "Juan Dela Cruz", "2024-06-12", 8000.00, "Agent Santos", "09171234567", "KEPT", "2024-06-30", "Partial payment"],
      ["ACC-10006", "Rosa Lim", "2024-06-18", 5500.00, "Agent Garcia", "09221234567", "PENDING", "2024-06-25", ""],
      ["ACC-10007", "Jose Mendoza", "2024-06-20", 20000.00, "Agent Lopez", "09231234567", "PENDING", "2024-07-01", "Restructured payment plan"],
      ["ACC-10002", "Maria Santos", "2024-06-08", 4300.00, "Agent Reyes", "09181234567", "KEPT", "2024-06-30", "Full payment received"],
    ],
  },
  "PTP_Inventory_BEL_Template.xlsx": {
    columns: ["Account Number", "Account Name", "PTP Date", "PTP Amount", "Paid Amount", "Balance", "Status", "Disposition", "Agent Name", "Remarks"],
    rows: [
      ["ACC-10003", "Pedro Reyes", "2024-06-10", 10000.00, 10000.00, 32100.50, "KEPT", "PAID", "Agent Lopez", "Full PTP amount paid"],
      ["ACC-10007", "Jose Mendoza", "2024-06-05", 15000.00, 0, 67500.00, "BROKEN", "UNPAID", "Agent Santos", "No payment received"],
      ["ACC-10009", "Roberto Aquino", "2024-06-15", 5000.00, 3000.00, 25900.00, "PARTIAL", "PARTIAL PAYMENT", "Agent Lopez", "Paid 3000 of 5000"],
      ["ACC-10001", "Juan Dela Cruz", "2024-06-12", 8000.00, 8000.00, 7250.75, "KEPT", "PAID", "Agent Santos", "On schedule"],
      ["ACC-10006", "Rosa Lim", "2024-06-18", 5500.00, 5500.00, 5500.25, "KEPT", "PAID", "Agent Garcia", ""],
      ["ACC-10003", "Pedro Reyes", "2024-06-20", 10000.00, 0, 32100.50, "PENDING", "AWAITING", "Agent Reyes", "Second PTP"],
      ["ACC-10007", "Jose Mendoza", "2024-06-20", 20000.00, 0, 67500.00, "PENDING", "RESTRUCTURED", "Agent Lopez", "New payment plan"],
      ["ACC-10002", "Maria Santos", "2024-06-08", 4300.00, 4300.00, 4130.00, "KEPT", "PAID", "Agent Reyes", "Ahead of schedule"],
    ],
  },
  "Cards_Attendance_Template.xlsx": {
    columns: ["Employee ID", "Employee Name", "Date", "Time In", "Time Out", "Hours Worked", "Status", "Department", "Remarks"],
    rows: [
      ["EMP-001", "Agent Lopez", "2024-06-01", "08:00", "17:00", 8, "PRESENT", "COLLECTIONS", ""],
      ["EMP-002", "Agent Santos", "2024-06-01", "08:15", "17:00", 7.75, "PRESENT", "COLLECTIONS", "Late 15 mins"],
      ["EMP-003", "Agent Reyes", "2024-06-01", "08:00", "17:30", 8.5, "PRESENT", "COLLECTIONS", "Overtime approved"],
      ["EMP-004", "Agent Garcia", "2024-06-01", "", "", 0, "ABSENT", "FIELD OPS", "Sick leave filed"],
      ["EMP-005", "Agent Cruz", "2024-06-01", "08:00", "12:00", 4, "HALF DAY", "COMPLIANCE", "PM leave"],
      ["EMP-001", "Agent Lopez", "2024-06-02", "07:55", "17:00", 8, "PRESENT", "COLLECTIONS", ""],
      ["EMP-002", "Agent Santos", "2024-06-02", "08:00", "17:00", 8, "PRESENT", "COLLECTIONS", ""],
      ["EMP-003", "Agent Reyes", "2024-06-02", "", "", 0, "ABSENT", "COLLECTIONS", "Emergency leave"],
      ["EMP-004", "Agent Garcia", "2024-06-02", "08:00", "17:00", 8, "PRESENT", "FIELD OPS", ""],
      ["EMP-005", "Agent Cruz", "2024-06-02", "08:30", "17:30", 8, "PRESENT", "COMPLIANCE", ""],
    ],
  },
  "Field_Visit_Report_BEL_Template.xlsx": {
    columns: ["Account Number", "Account Name", "Visit Date", "Visit Time", "Field Agent", "Address", "Findings", "Disposition", "Status", "Next Action Date", "Remarks"],
    rows: [
      ["ACC-10003", "Pedro Reyes", "2024-06-10", "10:30", "Agent Garcia", "123 Main St, Quezon City", "Debtor present, willing to negotiate", "PROMISE TO PAY", "COMPLETED", "2024-06-20", "PTP of 10,000 secured"],
      ["ACC-10007", "Jose Mendoza", "2024-06-11", "14:00", "Agent Garcia", "456 Rizal Ave, Manila", "No one at address", "LEFT NOTICE", "COMPLETED", "2024-06-18", "Notice left with neighbor"],
      ["ACC-10009", "Roberto Aquino", "2024-06-12", "09:00", "Agent Lopez", "789 EDSA, Makati", "Business closed, relocated", "SKIP TRACE", "FOLLOW UP", "2024-06-15", "Need to verify new address"],
      ["ACC-10003", "Pedro Reyes", "2024-06-20", "11:00", "Agent Garcia", "123 Main St, Quezon City", "Debtor confirmed payment", "PAYMENT CONFIRMED", "COMPLETED", "2024-07-01", "Will pay at branch"],
      ["ACC-10007", "Jose Mendoza", "2024-06-18", "15:30", "Agent Lopez", "456 Rizal Ave, Manila", "Debtor present, refused to pay", "REFUSED", "ESCALATED", "2024-06-25", "Escalated to legal"],
      ["ACC-10006", "Rosa Lim", "2024-06-14", "10:00", "Agent Garcia", "321 Bonifacio St, Taguig", "Debtor cooperative", "PROMISE TO PAY", "COMPLETED", "2024-06-25", "PTP of 5,500"],
      ["ACC-10001", "Juan Dela Cruz", "2024-06-15", "13:00", "Agent Lopez", "654 Mabini St, Pasig", "Regular check-in, account in good standing", "NO ACTION NEEDED", "COMPLETED", "", "Routine visit"],
      ["ACC-10009", "Roberto Aquino", "2024-06-15", "16:00", "Agent Garcia", "101 Shaw Blvd, Mandaluyong", "New address verified, debtor present", "PROMISE TO PAY", "COMPLETED", "2024-06-22", "PTP of 5,000 at new address"],
    ],
  },
};

for (const [filename, { columns, rows }] of Object.entries(templates)) {
  const wsData = [columns, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Auto-size columns
  ws["!cols"] = columns.map((col, i) => {
    let maxLen = col.length;
    for (const row of rows) {
      const val = row[i];
      if (val != null) {
        const len = String(val).length;
        if (len > maxLen) maxLen = len;
      }
    }
    return { wch: Math.min(maxLen + 2, 40) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  const outPath = join(outDir, filename);
  XLSX.writeFile(wb, outPath);
  console.log(`Created: ${outPath}`);
}

console.log("\nAll 7 templates generated in sample-templates/");
