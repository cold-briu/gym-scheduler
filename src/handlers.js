/**
 * 1. PAYMENTS FORM SUBMIT
 * Called by masterFormRouter when a submission hits the Payments sheet.
 */
export function onPaymentSubmit(event) {
    console.log("--- Payment Submit Received ---");
    try {
        const paymentData = {
            [CONFIG.DB_MAPPING['nombre']]: getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'NAME'),
            [CONFIG.DB_MAPPING['valor']]: getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'VALUE'),
            [CONFIG.DB_MAPPING['tipo de membresía']]: toSlug(getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'MEMBERSHIP_TYPE')),
            [CONFIG.DB_MAPPING['metodo']]: getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'METHOD'),
            [CONFIG.DB_MAPPING['fechaInicio']]: getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'START_DATE')
        };

        // Parse Date (Expected: D/M/Y)
        const dateParts = paymentData.startDate.split(/[-/.]/);
        const startDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

        // Calculate Expiry
        const monthDuration = CONFIG.MEMBERSHIP_TYPE_MONTHS[paymentData.membershipType];

        if (monthDuration) {
            const expiryDate = new Date(startDate);
            expiryDate.setMonth(expiryDate.getMonth() + monthDuration);

            const mainCalendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
            if (!mainCalendar) {
                throw new Error(`Could not access calendar with ID: ${CONFIG.CALENDAR_ID}`);
            }

            const eventConfig = CONFIG.PAYMENTS.EVENTS;

            // 1. Expiry Event
            mainCalendar.createAllDayEvent(
                eventConfig.EXPIRY_TITLE(paymentData),
                expiryDate,
                { description: eventConfig.EXPIRY_DESC(paymentData) }
            );

            // 2. Reminder Event
            const reminderDate = new Date(expiryDate);
            reminderDate.setDate(reminderDate.getDate() - CONFIG.PAYMENTS.REMINDER_DAYS);

            mainCalendar.createAllDayEvent(
                eventConfig.REMINDER_TITLE(paymentData),
                reminderDate,
                { description: eventConfig.REMINDER_DESC(paymentData) }
            );

            console.log(`Calendar records created for ${paymentData.name}`);
        } else {
            console.log(`No expiry calendar record created for ${paymentData.name} - membership type: ${paymentData.membershipType} does not require it`);
        }
    } catch (error) {
        console.error(`Payment workflow failure: ${error.message}`);
    }
    console.log("--- Finished Payment Workflow ---");
}

/**
 * 2. USERS FORM SUBMIT
 * Called by masterFormRouter when a submission hits the Members sheet.
 */
export function onMemberSignup(event) {
    console.log("--- User Registration Received ---");
    try {
        const today = new Date();
        const userData = {
            [CONFIG.DB_MAPPING['nombre']]: getFieldValue(event, CONFIG.USERS.FIELDS, 'NAME'),
            [CONFIG.DB_MAPPING['correo']]: getFieldValue(event, CONFIG.USERS.FIELDS, 'EMAIL'),
            [CONFIG.DB_MAPPING['telefono']]: getFieldValue(event, CONFIG.USERS.FIELDS, 'PHONE'),
            [CONFIG.DB_MAPPING['cumpleaños']]: getFieldValue(event, CONFIG.USERS.FIELDS, 'BIRTHDAY'),
            signupDateFormatted: Utilities.formatDate(today, CONFIG.TIMEZONE, "dd/MM/yyyy")
        };

        // Update the payment choices immediately
        updateMemberDropdown();

        const mainCalendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
        if (!mainCalendar) {
            throw new Error(`Could not access calendar with ID: ${CONFIG.CALENDAR_ID}`);
        }

        const userEventConfig = CONFIG.USERS.EVENTS;
        const yearlyRule = CalendarApp.newRecurrence().addYearlyRule();

        // Event 1: Birthday (Repeats Yearly)
        if (userData.birthdayString) {
            const birthdayParts = userData.birthdayString.split(/[-/.]/);
            if (birthdayParts.length >= 2) {
                const birthdayDate = new Date(today.getFullYear(), birthdayParts[1] - 1, birthdayParts[0]);

                if (!isNaN(birthdayDate.getTime())) {
                    mainCalendar.createAllDayEventSeries(
                        userEventConfig.BIRTHDAY_TITLE(userData),
                        birthdayDate,
                        yearlyRule,
                        {
                            description: userEventConfig.BIRTHDAY_DESC(userData)
                        }
                    );
                    console.log(`Success: Recurring birthday event created for ${userData.name}`);
                } else {
                    console.warn(`Could not parse birthday date from: ${userData.birthdayString}`);
                }
            } else {
                console.warn(`Birthday format unexpected: ${userData.birthdayString}`);
            }
        } else {
            console.log(`No birthday provided for ${userData.name}`);
        }

        // Event 2: Signup Anniversary (Single event in 1 year)
        const anniversaryDate = new Date(today);
        anniversaryDate.setFullYear(anniversaryDate.getFullYear() + 1);

        mainCalendar.createAllDayEvent(
            userEventConfig.ANNIVERSARY_TITLE(userData),
            anniversaryDate,
            { description: userEventConfig.ANNIVERSARY_DESC(userData) }
        );
        console.log(`Success: Anniversary event scheduled for ${anniversaryDate.toDateString()} for ${userData.name}`);

    } catch (error) {
        console.error(`User registration failure: ${error.message}`);
    }
    console.log("--- Finished User Registration Workflow ---");
}
