/**
 * CONFIGURATION
 * Organized by form type for clarity.
 * Event Titles and Descriptions are now composed via functions.
 */
export const CONFIG = {
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
