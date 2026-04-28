/**
 * CONFIGURATION
 * Organized by form type for clarity.
 * Event Titles and Descriptions are now composed via functions.
 */
const CONFIG = {
    CALENDAR_ID: 'demo@group.calendar.google.com',
    TIMEZONE: 'GMT-5',

    PAYMENTS: {
        FORM_ID: 'form-id',
        SHEET_NAME: 'Pagos',
        DROPDOWN_TITLE: 'nombre',
        REMINDER_DAYS: 7,
        FIELDS: {
            NAME: 'Nombre',
            VALUE: 'Valor',
            DURATION: 'Duracion',
            METHOD: 'Metodo',
            START_DATE: 'Fecha de inicio'
        },
        // Composition functions for Payment events
        EVENTS: {
            EXPIRY_TITLE: (data) => `📞 Renovar: ${data.nombre}`,
            EXPIRY_DESC: (data) => `Inicio: ${data.fechaInicioStr} | Duracion: ${data.duracionRaw}`,
            REMINDER_TITLE: (data) => `⏰ Vence en 7 días: ${data.nombre}`,
            REMINDER_DESC: (data) => `Inicio: ${data.fechaInicioStr} | Duracion: ${data.duracionRaw}`
        }
    },

    // 2. USERS FORM SETTINGS
    USERS: {
        FORM_ID: 'form-id-2',
        SHEET_NAME: 'Usuarios',
        FIELDS: {
            NAME: 'Nombre',
            EMAIL: 'Correo',
            BIRTHDAY: 'Cumpleaños',
            PHONE: 'Telefono'
        },
        // Composition functions for User events
        EVENTS: {
            BIRTHDAY_TITLE: (data) => `🎈 Cumpleaños: ${data.nombre}`,
            BIRTHDAY_DESC: () => ``,
            ANNIVERSARY_TITLE: (data) => `🎊 Aniversario en 3M: ${data.nombre}`,
            ANNIVERSARY_DESC: () => ``
        }
    }
};

/**
 * UTILITY: Safe Value Extraction
 * Handles case-sensitivity and trailing spaces in Form field titles.
 */
function getFieldValue(event, fieldMapping, key) {
    const targetFieldName = fieldMapping[key];
    const actualKeyInResponse = Object.keys(event.namedValues).find(
        (name) => name.trim().toLowerCase() === targetFieldName.toLowerCase()
    );

    if (!actualKeyInResponse) {
        return ""; // Return empty instead of throwing to allow optional fields
    }

    return event.namedValues[actualKeyInResponse][0];
}

/**
 * SYNC NAMES TO DROPDOWN
 * Updates the Payment Form's member list based on the "Member_Database" sheet.
 */
function updateMemberDropdown() {
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

/**
 * THE TRAFFIC ROUTER
 * Set a SINGLE trigger for this function "On form submit"
 */
function masterFormRouter(e) {
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

/**
 * 1. PAYMENTS FORM SUBMIT
 * Called by masterFormRouter when a submission hits the Payments sheet.
 */
function onPaymentSubmit(event) {
    console.log("--- Payment Submit Received ---");
    try {
        const paymentData = {
            nombre: getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'NAME'),
            valor: getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'VALUE'),
            duracionRaw: getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'DURATION'),
            metodo: getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'METHOD'),
            fechaInicioStr: getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'START_DATE')
        };

        // Parse Date (Expected: D/M/Y)
        const dateParts = paymentData.fechaInicioStr.split(/[-/.]/);
        const startDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

        // Calculate Expiry
        const monthDuration = parseInt(paymentData.duracionRaw.match(/\d+/) || [1], 10);
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

        console.log(`Calendar records created for ${paymentData.nombre}`);
    } catch (error) {
        console.error(`Payment workflow failure: ${error.message}`);
    }
    console.log("--- Finished Payment Workflow ---");
}

/**
 * 2. USERS FORM SUBMIT
 * Called by masterFormRouter when a submission hits the Members sheet.
 */
function onMemberSignup(event) {
    console.log("--- User Registration Received ---");
    try {
        const today = new Date();
        const userData = {
            nombre: getFieldValue(event, CONFIG.USERS.FIELDS, 'NAME'),
            correo: getFieldValue(event, CONFIG.USERS.FIELDS, 'EMAIL'),
            telefono: getFieldValue(event, CONFIG.USERS.FIELDS, 'PHONE'),
            birthdayString: getFieldValue(event, CONFIG.USERS.FIELDS, 'BIRTHDAY'),
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
                    console.log(`Success: Recurring birthday event created for ${userData.nombre}`);
                } else {
                    console.warn(`Could not parse birthday date from: ${userData.birthdayString}`);
                }
            } else {
                console.warn(`Birthday format unexpected: ${userData.birthdayString}`);
            }
        } else {
            console.log(`No birthday provided for ${userData.nombre}`);
        }

        // Event 2: Signup Anniversary (Single event in 1 year)
        const anniversaryDate = new Date(today);
        anniversaryDate.setFullYear(anniversaryDate.getFullYear() + 1);

        mainCalendar.createAllDayEvent(
            userEventConfig.ANNIVERSARY_TITLE(userData),
            anniversaryDate,
            { description: userEventConfig.ANNIVERSARY_DESC(userData) }
        );
        console.log(`Success: Anniversary event scheduled for ${anniversaryDate.toDateString()} for ${userData.nombre}`);

    } catch (error) {
        console.error(`User registration failure: ${error.message}`);
    }
    console.log("--- Finished User Registration Workflow ---");
}