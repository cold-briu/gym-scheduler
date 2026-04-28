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
