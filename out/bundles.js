// --- File: config.js ---
/**
 * CONFIGURATION
 * Organized by form type for clarity.
 * Event Titles and Descriptions are now composed via functions.
 */
export const CONFIG = {
    CALENDAR_ID: 'demo@group.calendar.google.com',
    TIMEZONE: 'GMT-5',

    DB_MAPPING: {
        'nombre': 'name',
        'valor': 'value',
        'metodo': 'method',
        'fechaInicio': 'startDate',
        'correo': 'email',
        'telefono': 'phone'
    },

    MEMBERSHIP_DURATION_MONTHS: {
        'mensualidad': 1,
        'mensualidad_dirigida': 1,
        'trimestre_mensualidad': 3,
        'semestre_mensualidad': 6,
        'anualidad_mensualidad': 12
    },

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
            EXPIRY_TITLE: (data) => `📞 Renovar: ${data.name}`,
            EXPIRY_DESC: (data) => `Inicio: ${data.startDate} | Tipo: ${data.membershipType}`,
            REMINDER_TITLE: (data) => `⏰ Vence en 7 días: ${data.name}`,
            REMINDER_DESC: (data) => `Inicio: ${data.startDate} | Tipo: ${data.membershipType}`
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
            BIRTHDAY_TITLE: (data) => `🎈 Cumpleaños: ${data.name}`,
            BIRTHDAY_DESC: () => ``,
            ANNIVERSARY_TITLE: (data) => `🎊 Aniversario en 3M: ${data.name}`,
            ANNIVERSARY_DESC: () => ``
        }
    }
};


// --- File: schemas.js ---
/**
 * SCHEMAS
 * Extracted data structures and typedefs for the system.
 */

/**
 * @typedef {Object} PaymentData
 * @property {string} name
 * @property {string} value
 * @property {MembershipType} membershipType
 * @property {string} method
 * @property {string} startDate
 */

/**
 * @typedef {Object} UserData
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} birthdayString
 * @property {string} signupDateFormatted
 */

/**
 * Enum for Membership Types
 * @readonly
 * @enum {string}
 */
const MembershipType = {
  DIA_DE_ESCALADA: 'dia_de_escalada',
  CLASE_DIRIGIDA: 'clase_dirigida',
  MENSUALIDAD: 'mensualidad',
  MENSUALIDAD_DIRIGIDA: 'mensualidad_dirigida',
  TRIMESTRE_MENSUALIDAD: 'trimestre_mensualidad',
  SEMESTRE_MENSUALIDAD: 'semestre_mensualidad',
  ANUALIDAD_MENSUALIDAD: 'anualidad_mensualidad',
  CURSO_BASICO: 'curso_basico',
  CURSO_AVANZADO: 'curso_avanzado'
};


// --- File: routers.js ---
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


// --- File: handlers.js ---
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
            membershipType: getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'DURATION'),
            [CONFIG.DB_MAPPING['metodo']]: getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'METHOD'),
            [CONFIG.DB_MAPPING['fechaInicio']]: getFieldValue(event, CONFIG.PAYMENTS.FIELDS, 'START_DATE')
        };

        // Parse Date (Expected: D/M/Y)
        const dateParts = paymentData.startDate.split(/[-/.]/);
        const startDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

        // Calculate Expiry
        const monthDuration = CONFIG.MEMBERSHIP_DURATION_MONTHS[paymentData.membershipType];

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


// --- File: utils.js ---
/**
 * UTILITY: Safe Value Extraction
 * Handles case-sensitivity and trailing spaces in Form field titles.
 */
export function getFieldValue(event, fieldMapping, key) {
    const targetFieldName = fieldMapping[key];
    const actualKeyInResponse = Object.keys(event.namedValues).find(
        (name) => name.trim().toLowerCase() === targetFieldName.toLowerCase()
    );

    if (!actualKeyInResponse) {
        return ""; // Return empty instead of throwing to allow optional fields
    }

    return event.namedValues[actualKeyInResponse][0];
}


// --- File: functions.js ---
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


