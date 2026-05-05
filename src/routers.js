/**
 * THE TRAFFIC ROUTER
 * Set a SINGLE trigger for this function "On form submit"
 */
export let ENABLE_LOGS = false;

export function masterFormRouter(e) {
    try {
        if (!e || !e.range) {
            throw new Error("[Router Error]: Event object 'e' or 'e.range' is undefined. Ensure this function is only triggered via a Form Submit event, not run manually from the Apps Script editor.");
        }

        // 1. Identify which sheet received the data
        const sheetName = e.range.getSheet().getName();
        if (ENABLE_LOGS) console.log(`[Router] Form submission detected in sheet: ${sheetName}`);

        // 2. Route the data to the correct function using CONFIG
        if (sheetName === CONFIG.PAYMENTS.SHEET_NAME) {
            if (ENABLE_LOGS) console.log(`[Router] Match found for Payments sheet ('${sheetName}'). Routing to Payment Logic...`);
            onPaymentSubmit(e);
        }
        else if (sheetName === CONFIG.USERS.SHEET_NAME) {
            if (ENABLE_LOGS) console.log(`[Router] Match found for Users sheet ('${sheetName}'). Routing to Signup Logic...`);
            onMemberSignup(e);
        }
        else {
            console.warn(`[Router Warning]: Form submitted to an unknown sheet: '${sheetName}'. No handler configured for this sheet.`);
        }
    } catch (error) {
        console.error(`[Router Critical Failure]: Execution aborted. Reason: ${error.message}\nStack Trace: ${error.stack || 'N/A'}`);
    }
}
