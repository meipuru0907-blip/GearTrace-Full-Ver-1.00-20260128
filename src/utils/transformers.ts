export const toCamelCase = (str: string): string => {
    return str.replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
    );
};

export const toSnakeCase = (str: string): string => {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

export const keysToCamelCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map((v) => keysToCamelCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce(
            (result, key) => ({
                ...result,
                [toCamelCase(key)]: keysToCamelCase(obj[key]),
            }),
            {}
        );
    }
    return obj;
};

export const keysToSnakeCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map((v) => keysToSnakeCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce(
            (result, key) => ({
                ...result,
                [toSnakeCase(key)]: keysToSnakeCase(obj[key]),
            }),
            {}
        );
    }
    return obj;
};
