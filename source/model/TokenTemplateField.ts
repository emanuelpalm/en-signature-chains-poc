/**
 * Describes one kind of `TokenTemplate` data field.
 */
export interface TokenTemplateField {
    /**
     * The default value of the field, if any.
     */
    default?: string;

    /**
     * Valid field values, including `default`, if any.
     */
    options?: string[];

    /**
     * If no `options` or `default` are given, this field names a `Token` type
     * which may be chosen as alternative for this field.
     */
    referenceToType?: string;
}

/**
 * Determines if given value is a `TokenTemplateField`.
 *
 * @param any Checked value.
 * @return Whether `any` is of type `TokenTemplateField`.
 */
export function isTokenTemplateField(any: any): any is TokenTemplateField {
    return typeof any === "object" && any !== null;
}