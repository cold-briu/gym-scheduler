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

/**
 * Normalizes Spanish text to slugs compatible with MembershipType enum.
 * Example: "Día de Escalada" -> "dia_de_escalada"
 */
export function toSlug(text) {
    if (!text) return "";
    return text.toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}
