import { parsePhoneNumberFromString } from "libphonenumber-js";

const getValidUniqueMobileNumbers = (mobileNumbers) => {
    const uniqueNumbers = new Set();
    const invalidPhoneNumbers = [];
    mobileNumbers.forEach((number) => {
        // Parse and validate the phone number
        const phoneNumber = parsePhoneNumberFromString(number, "IN"); // 'IN' is the default country code

        if (phoneNumber && phoneNumber.isValid()) {
            // Format the number to include the country code and remove any spaces
            const formattedNumber = phoneNumber
                .formatInternational()
                .replace(/\s+/g, "");
            uniqueNumbers.add(formattedNumber);
        } else {
            // Add invalid phone number to the array
            invalidPhoneNumbers.push(number);
        }
    });

    const validPhoneNumbers = Array.from(uniqueNumbers); // Convert the Set back to an array

    return { validPhoneNumbers, invalidPhoneNumbers };
};

// this function is used to get valid phone numbers
export const getValidPhoneNumbers = (mobileNumbers) => {
    const uniqueNumbers = new Set();

    mobileNumbers.forEach((number) => {
        // Parse and validate the phone number
        const phoneNumber = parsePhoneNumberFromString(number, "IN"); // 'IN' is the default country code
        if (phoneNumber && phoneNumber.isValid()) {
            // Format the number to include the country code and remove any spaces
            const formattedNumber = phoneNumber
                .formatInternational()
                .replace(/\s+/g, "");
            uniqueNumbers.add(formattedNumber);
        }
    });

    const validPhoneNumbers = Array.from(uniqueNumbers); // Convert the Set back to an array

    return { validPhoneNumbers };
};

// this function return phonenumbers without country code
const getValidNumbersWithoutCode = (mobileNumbers) => {
    const uniqueNumbers = new Set();
    const invalidPhoneNumbers = [];

    mobileNumbers.forEach((number) => {
        // Parse and validate the phone number
        const phoneNumber = parsePhoneNumberFromString(number, "IN"); // 'IN' is the default country code

        if (phoneNumber && phoneNumber.isValid()) {
            // Format the number to return the national format (without country code)
            let formattedNumber = phoneNumber
                .formatNational()
                .replace(/\s+/g, ""); // Removes any spaces

            // Remove leading zero if present
            if (formattedNumber.startsWith("0")) {
                formattedNumber = formattedNumber.substring(1);
            }

            uniqueNumbers.add(formattedNumber); // Add formatted number to the Set
        } else {
            // Add invalid phone number to the array
            invalidPhoneNumbers.push(number);
        }
    });

    const validPhoneNumbers = Array.from(uniqueNumbers); // Convert the Set back to an array

    return { validPhoneNumbers, invalidPhoneNumbers };
};

export { getValidUniqueMobileNumbers, getValidNumbersWithoutCode };
