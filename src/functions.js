/**
 * SYNC NAMES TO DROPDOWN
 * Updates the Payment Form's member list based on the "Member_Database" sheet.
 */
export function updateMemberDropdown() {
    if (ENABLE_LOGS) console.log("--- START: updateMemberDropdown Workflow ---");
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (ENABLE_LOGS) console.log(`[updateMemberDropdown] Attempting to access sheet: "${CONFIG.USERS.SHEET_NAME}"`);
    const memberSheet = spreadsheet.getSheetByName(CONFIG.USERS.SHEET_NAME);

    if (!memberSheet) {
        console.error(`[updateMemberDropdown Critical Failure]: Sheet "${CONFIG.USERS.SHEET_NAME}" not found. Member dropdown not updated.`);
        if (ENABLE_LOGS) console.log("--- END: updateMemberDropdown Workflow ---");
        return;
    }

    const lastRowOfDatabase = memberSheet.getLastRow();
    if (ENABLE_LOGS) console.log(`[updateMemberDropdown] Extracted last row of database: ${lastRowOfDatabase}`);
    if (lastRowOfDatabase < 2) {
        console.warn("[updateMemberDropdown Warning]: Member database is empty (less than 2 rows). Skipping dropdown update.");
        if (ENABLE_LOGS) console.log("--- END: updateMemberDropdown Workflow ---");
        return;
    }

    const lastColumn = memberSheet.getLastColumn();
    if (ENABLE_LOGS) console.log(`[updateMemberDropdown] Extracted last column of database: ${lastColumn}`);
    if (lastColumn < 1) {
        console.warn("[updateMemberDropdown Warning]: Member database has no columns. Skipping dropdown update.");
        if (ENABLE_LOGS) console.log("--- END: updateMemberDropdown Workflow ---");
        return;
    }

    const headers = memberSheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    const nameColumnIndex = headers.indexOf(CONFIG.USERS.FIELDS.NAME) + 1;
    if (ENABLE_LOGS) console.log(`[updateMemberDropdown] Found "${CONFIG.USERS.FIELDS.NAME}" column at index: ${nameColumnIndex}`);

    if (nameColumnIndex === 0) {
        console.error(`[updateMemberDropdown Critical Failure]: Column "${CONFIG.USERS.FIELDS.NAME}" not found in sheet "${CONFIG.USERS.SHEET_NAME}". headers: ${JSON.stringify(headers)}`);
        if (ENABLE_LOGS) console.log("--- END: updateMemberDropdown Workflow ---");
        return;
    }

    const memberNameList = memberSheet.getRange(2, nameColumnIndex, lastRowOfDatabase - 1, 1).getValues()
        .map((row) => row[0])
        .filter((name) => name && name.toString().trim() !== "");
    if (ENABLE_LOGS) console.log(`[updateMemberDropdown] Extracted ${memberNameList.length} valid member names.`);

    if (ENABLE_LOGS) console.log(`[updateMemberDropdown] Opening payment form with ID: ${CONFIG.PAYMENTS.FORM_ID}`);
    const paymentForm = FormApp.openById(CONFIG.PAYMENTS.FORM_ID);
    const existingFormItems = paymentForm.getItems();
    if (ENABLE_LOGS) console.log(`[updateMemberDropdown] Scanning ${existingFormItems.length} existing form items for title "${CONFIG.PAYMENTS.DROPDOWN_TITLE}"`);

    const itemWasFound = existingFormItems.some((item) => {
        if (item.getTitle().toLowerCase() === CONFIG.PAYMENTS.DROPDOWN_TITLE.toLowerCase()) {
            item.asListItem().setChoiceValues(memberNameList);
            return true;
        }
        return false;
    });

    if (itemWasFound) {
        if (ENABLE_LOGS) console.log(`[updateMemberDropdown Success]: Dropdown updated with ${memberNameList.length} members.`);
    } else {
        console.warn(`[updateMemberDropdown Warning]: Could not find a form item titled "${CONFIG.PAYMENTS.DROPDOWN_TITLE}" to update.`);
    }
    if (ENABLE_LOGS) console.log("--- END: updateMemberDropdown Workflow ---");
}
