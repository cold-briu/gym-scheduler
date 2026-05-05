// --- File: config.js ---
/**
 * DEPLOYMENT IDs
 * Easy access source of truth for IDs.
 */
const IDS = {
    CALENDAR_ID: 'demo@group.calendar.google.com',
    SIGNUP_FORM_ID: 'form-id-2',
    PAYMENTS_FORM_ID: 'form-id'
};

/**
 * CONFIGURATION
 * Organized by form type for clarity.
 * Event Titles and Descriptions are now composed via functions.
 */
const CONFIG = {
    CALENDAR_ID: IDS.CALENDAR_ID,
    TIMEZONE: 'GMT-5',

    MEMBERSHIP_TYPE_MONTHS: {
        'mensualidad': 1,
        'mensualidad_dirigida': 1,
        'trimestre_mensualidad': 3,
        'semestre_mensualidad': 6,
        'anualidad_mensualidad': 12
    },

    // 1. USERS FORM SETTINGS
    USERS: {
        FORM_ID: IDS.SIGNUP_FORM_ID,
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
    },

    // 2. PAYMENT FORM SETTINGS
    PAYMENTS: {
        FORM_ID: IDS.PAYMENTS_FORM_ID,
        SHEET_NAME: 'Pagos',
        DROPDOWN_TITLE: 'nombre',
        REMINDER_DAYS: 7,
        FIELDS: {
            NAME: 'Nombre',
            VALUE: 'Valor',
            MEMBERSHIP_TYPE: 'Tipo de membresía',
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

    // 3. SCHEDULE SETTINGS (Reference Sheet)
    SCHEDULE: {
        SHEET_NAME: 'Horarios',
        FIELDS: {
            DAY: 'Día',
            TIME_SLOT: 'Horario',
            INSTRUCTOR: 'Instructor',
            MAX_CAPACITY: 'Cupos Totales',
            AVAILABLE_SPOTS: 'Cupos Disponibles',
            ENROLLED: 'Inscritos'
        }
    },
    // 4. ASIGNACION FORM SETTINGS
    ASIGNACION: {
        SHEET_NAME: 'Asignacion Inicial',
        FIELDS: {
            USER: 'Usuario',
            DAY: 'Día',
            TIME_SLOT: 'Horario',
            INSTRUCTOR: 'Instructor'
        }
    },
    // 5. ATTENDANCE FORM SETTINGS
    ATTENDANCE: {
        SHEET_NAME: 'Asistencia',
        FIELDS: {
            CLASS: 'Clase',
            // Note: Instructor fields are dynamic and prefixed with "Asistencia - "
            INSTRUCTOR_PREFIX: 'Asistencia - '
        }
    },
    // 6. MODIFY SCHEDULE SETTINGS
    MODIFY: {
        SHEET_NAME: 'Cambios',
        FIELDS: {
            USER: 'Nombre',
            OLD_CLASS: 'Clase Actual',
            NEW_DATE: 'Nueva Fecha',
            NEW_TIME: 'Nuevo Horario',
            NEW_INSTRUCTOR: 'Nuevo Instructor'
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
 * @typedef {Object} ScheduleData
 * @property {string} day
 * @property {string} timeSlot
 * @property {string} instructor
 * @property {number} maxCapacity
 * @property {number} availableSpots
 * @property {string[]} enrolledUsers
 */

/**
 * @typedef {Object} ModifyScheduleData
 * @property {string} user_id
 * @property {string} old_class_info
 * @property {string} new_class_date
 * @property {string} new_class_time
 * @property {string} new_class_instructor
 */

/**
 * @typedef {Object} AttendanceData
 * @property {string} class_id - The ID or name of the class slot.
 * @property {string[]} presentUsers - List of students marked as present.
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
let ENABLE_LOGS = false;

function masterFormRouter(e) {
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


// --- File: handlers.js ---
/**
 * 1. USERS FORM SUBMIT
 * Called by masterFormRouter when a submission hits the Members sheet.
 */
function onMemberSignup(event) {
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
function onPaymentSubmit(event) {
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


// --- File: utils.js ---
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
 * Normalizes Spanish text to slugs compatible with MembershipType enum.
 * Example: "Día de Escalada" -> "dia_de_escalada"
 */
function toSlug(text) {
    if (!text) return "";
    return text.toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}


// --- File: functions.js ---
/**
 * SYNC NAMES TO DROPDOWN
 * Updates the Payment Form's member list based on the "Member_Database" sheet.
 */
function updateMemberDropdown() {
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


