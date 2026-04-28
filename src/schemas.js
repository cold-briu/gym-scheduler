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
