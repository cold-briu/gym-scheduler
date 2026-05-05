/**
 * 1. USERS FORM SUBMIT
 * Called by masterFormRouter when a submission hits the Members sheet.
 */
export function onMemberSignup(event) {
    if (ENABLE_LOGS) console.log("--- START: User Registration Workflow ---");
    if (ENABLE_LOGS) console.log(`[User Registration] Received event payload: ${JSON.stringify(event.namedValues || {})}`);
    try {
        const today = new Date();
        const userData = {
            name: getFieldValue(event, CONFIG.USERS.FIELDS, 'NAME'),
            email: getFieldValue(event, CONFIG.USERS.FIELDS, 'EMAIL'),
            phone: getFieldValue(event, CONFIG.USERS.FIELDS, 'PHONE'),
            birthdayString: getFieldValue(event, CONFIG.USERS.FIELDS, 'BIRTHDAY'),
            signupDateFormatted: Utilities.formatDate(today, CONFIG.TIMEZONE, "dd/MM/yyyy")
        };
        if (ENABLE_LOGS) console.log(`[User Registration] Extracted userData: ${JSON.stringify(userData)}`);

        if (!userData.name) {
            throw new Error(`[User Registration Error]: Missing required field 'name' in submission.`);
        }

        if (ENABLE_LOGS) console.log("[User Registration] Attempting to update member dropdown choices...");
        // Update the payment choices immediately
        updateMemberDropdown();
        if (ENABLE_LOGS) console.log("[User Registration] Member dropdown successfully updated.");

        if (ENABLE_LOGS) console.log(`[User Registration] Fetching main calendar with ID: ${CONFIG.CALENDAR_ID}`);
        const mainCalendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
        if (!mainCalendar) {
            throw new Error(`[Calendar Access Error]: Could not access calendar with ID: ${CONFIG.CALENDAR_ID}. Please verify permissions and calendar ID.`);
        }

        const userEventConfig = CONFIG.USERS.EVENTS;
        const yearlyRule = CalendarApp.newRecurrence().addYearlyRule();

        // Event 1: Birthday (Repeats Yearly)
        if (ENABLE_LOGS) console.log(`[User Registration] Evaluating birthday scheduling for: ${userData.birthdayString || 'None provided'}`);
        if (userData.birthdayString) {
            const birthdayParts = userData.birthdayString.split(/[-/.]/);
            if (birthdayParts.length >= 2) {
                const birthdayDate = new Date(today.getFullYear(), birthdayParts[1] - 1, birthdayParts[0]);

                if (!isNaN(birthdayDate.getTime())) {
                    if (ENABLE_LOGS) console.log(`[User Registration] Creating birthday event series for ${userData.name} starting on ${birthdayDate.toDateString()}`);
                    mainCalendar.createAllDayEventSeries(
                        userEventConfig.BIRTHDAY_TITLE(userData),
                        birthdayDate,
                        yearlyRule,
                        {
                            description: userEventConfig.BIRTHDAY_DESC(userData)
                        }
                    );
                    if (ENABLE_LOGS) console.log(`[User Registration] Success: Recurring birthday event created for ${userData.name}`);
                } else {
                    console.warn(`[User Registration Warning]: Could not parse birthday date from string: ${userData.birthdayString}`);
                }
            } else {
                console.warn(`[User Registration Warning]: Birthday format unexpected. Received: ${userData.birthdayString}. Expected format with delimiters (-/.).`);
            }
        } else {
            if (ENABLE_LOGS) console.log(`[User Registration] No birthday provided for ${userData.name}, skipping birthday event creation.`);
        }

        // Event 2: Signup Anniversary (Single event in 1 year)
        const anniversaryDate = new Date(today);
        anniversaryDate.setFullYear(anniversaryDate.getFullYear() + 1);

        if (ENABLE_LOGS) console.log(`[User Registration] Scheduling anniversary event for ${userData.name} on ${anniversaryDate.toDateString()}`);
        mainCalendar.createAllDayEvent(
            userEventConfig.ANNIVERSARY_TITLE(userData),
            anniversaryDate,
            { description: userEventConfig.ANNIVERSARY_DESC(userData) }
        );
        if (ENABLE_LOGS) console.log(`[User Registration] Success: Anniversary event scheduled for ${anniversaryDate.toDateString()} for ${userData.name}`);

    } catch (error) {
        console.error(`[User Registration Critical Failure]: ${error.message}\nStack Trace: ${error.stack || 'N/A'}`);
    }
    if (ENABLE_LOGS) console.log("--- END: User Registration Workflow ---");
}

/**
 * 2. PAYMENTS FORM SUBMIT
 * Called by masterFormRouter when a submission hits the Payments sheet.
 */
export function onPaymentSubmit(event) {
    if (ENABLE_LOGS) console.log("--- START: Payment Submission Workflow ---");
    if (ENABLE_LOGS) console.log(`[Payment Submission] Received event payload: ${JSON.stringify(event.namedValues || {})}`);
    try {
        const paymentData = {
            name: getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'NAME'),
            value: getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'VALUE'),
            membershipType: toSlug(getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'MEMBERSHIP_TYPE')),
            method: getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'METHOD'),
            startDate: getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'START_DATE')
        };
        if (ENABLE_LOGS) console.log(`[Payment Submission] Extracted paymentData: ${JSON.stringify(paymentData)}`);

        if (!paymentData.name || !paymentData.startDate || !paymentData.membershipType) {
            throw new Error(`[Payment Submission Error]: Missing required fields. Name: ${paymentData.name}, StartDate: ${paymentData.startDate}, MembershipType: ${paymentData.membershipType}`);
        }

        if (ENABLE_LOGS) console.log(`[Payment Submission] Parsing start date: ${paymentData.startDate}`);
        // Parse Date (Expected: D/M/Y)
        const dateParts = paymentData.startDate.split(/[-/.]/);
        if (dateParts.length < 3) {
            throw new Error(`[Date Parsing Error]: Invalid start date format received: ${paymentData.startDate}. Expected format DD/MM/YYYY.`);
        }
        const startDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        if (isNaN(startDate.getTime())) {
            throw new Error(`[Date Parsing Error]: Parsed start date is invalid: ${startDate.toString()} from original string ${paymentData.startDate}`);
        }

        // Calculate Expiry
        if (ENABLE_LOGS) console.log(`[Payment Submission] Calculating expiration for membership type: ${paymentData.membershipType}`);
        const monthDuration = CONFIG.MEMBERSHIP_TYPE_MONTHS[paymentData.membershipType];

        if (monthDuration) {
            if (ENABLE_LOGS) console.log(`[Payment Submission] Membership duration found: ${monthDuration} months. Computing expiry date...`);
            const expiryDate = new Date(startDate);
            expiryDate.setMonth(expiryDate.getMonth() + monthDuration);
            if (ENABLE_LOGS) console.log(`[Payment Submission] Calculated expiry date: ${expiryDate.toDateString()}`);

            if (ENABLE_LOGS) console.log(`[Payment Submission] Fetching main calendar with ID: ${CONFIG.CALENDAR_ID}`);
            const mainCalendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
            if (!mainCalendar) {
                throw new Error(`[Calendar Access Error]: Could not access calendar with ID: ${CONFIG.CALENDAR_ID}. Please verify permissions and calendar ID.`);
            }

            const eventConfig = CONFIG.PAYMENTS.EVENTS;

            // 1. Expiry Event
            if (ENABLE_LOGS) console.log(`[Payment Submission] Scheduling Expiry Event on ${expiryDate.toDateString()} for ${paymentData.name}`);
            mainCalendar.createAllDayEvent(
                eventConfig.EXPIRY_TITLE(paymentData),
                expiryDate,
                { description: eventConfig.EXPIRY_DESC(paymentData) }
            );

            // 2. Reminder Event
            const reminderDate = new Date(expiryDate);
            reminderDate.setDate(reminderDate.getDate() - CONFIG.PAYMENTS.REMINDER_DAYS);

            if (ENABLE_LOGS) console.log(`[Payment Submission] Scheduling Reminder Event ${CONFIG.PAYMENTS.REMINDER_DAYS} days prior on ${reminderDate.toDateString()} for ${paymentData.name}`);
            mainCalendar.createAllDayEvent(
                eventConfig.REMINDER_TITLE(paymentData),
                reminderDate,
                { description: eventConfig.REMINDER_DESC(paymentData) }
            );

            if (ENABLE_LOGS) console.log(`[Payment Submission] Success: Expiry and Reminder calendar records created for ${paymentData.name}`);
        } else {
            if (ENABLE_LOGS) console.log(`[Payment Submission] Skipping calendar events: Membership type '${paymentData.membershipType}' does not require an expiration record.`);
        }
    } catch (error) {
        console.error(`[Payment Workflow Critical Failure]: ${error.message}\nStack Trace: ${error.stack || 'N/A'}`);
    }
    if (ENABLE_LOGS) console.log("--- END: Payment Workflow ---");
}
