/**
 * SYNC NAMES TO DROPDOWN
 * Updates the Payment Form's member list based on the "Member_Database" sheet.
 */
export function updateMemberDropdown() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const memberSheet = spreadsheet.getSheetByName(CONFIG.USERS.SHEET_NAME);

    if (!memberSheet) {
        console.error(`Error: Sheet "${CONFIG.USERS.SHEET_NAME}" not found. Member dropdown not updated.`);
        return;
    }

    const lastRowOfDatabase = memberSheet.getLastRow();
    if (lastRowOfDatabase < 2) {
        console.warn("Member database is empty. Skipping dropdown update.");
        return;
    }

    // Assumes Names are in Column B (index 2)
    const memberNameList = memberSheet.getRange(2, 2, lastRowOfDatabase - 1, 1).getValues()
        .map((row) => row[0])
        .filter((name) => name && name.toString().trim() !== "");

    const paymentForm = FormApp.openById(CONFIG.PAYMENTS.FORM_ID);
    const existingFormItems = paymentForm.getItems();

    const itemWasFound = existingFormItems.some((item) => {
        if (item.getTitle().toLowerCase() === CONFIG.PAYMENTS.DROPDOWN_TITLE.toLowerCase()) {
            item.asListItem().setChoiceValues(memberNameList);
            return true;
        }
        return false;
    });

    if (itemWasFound) {
        console.log(`Dropdown updated with ${memberNameList.length} members.`);
    } else {
        console.warn(`Could not find a form item titled "${CONFIG.PAYMENTS.DROPDOWN_TITLE}" to update.`);
    }
}
