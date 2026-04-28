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
