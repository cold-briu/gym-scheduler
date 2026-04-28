/**
 * THE TRAFFIC ROUTER
 * Set a SINGLE trigger for this function "On form submit"
 */
export function masterFormRouter(e) {
    // 1. Identify which sheet received the data
    const sheetName = e.range.getSheet().getName();
    console.log("Form submission detected in sheet: " + sheetName);

    // 2. Route the data to the correct function using CONFIG
    if (sheetName === CONFIG.PAYMENTS.SHEET_NAME) {
        console.log("Routing to Payment Logic...");
        onPaymentSubmit(e);
    }
    else if (sheetName === CONFIG.USERS.SHEET_NAME) {
        console.log("Routing to Signup Logic...");
        onMemberSignup(e);
    }
    else {
        console.warn("Form submitted to an unknown sheet: " + sheetName);
    }
}
