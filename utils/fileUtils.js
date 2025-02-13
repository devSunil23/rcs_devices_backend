import multer from "multer";
import csv from "csv-parser";
import XLSX from "xlsx";
import fs from "fs";
import { parsePhoneNumberFromString as phone } from "libphonenumber-js";

import { getValidNumbersWithoutCode } from "./mobileNumbersValidation.js";

// Supported file types
const supportedMimeTypes = [
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
];

// Multer storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "uploads/";

        // Check if directory exists, if not, create it
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

// File filter to check file type before uploading
const fileFilter = (req, file, cb) => {
    if (supportedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Accept file
    } else {
        cb(new Error("Unsupported file type"), false); // Reject file
    }
};

// Multer middleware with file filter and error handling
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
});

// CSV File Reader
export const readCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (data) => results.push(data))
            .on("end", () => resolve(results))
            .on("error", (error) => reject(error));
    });
};

// Excel File Reader (XLSX and XLS)
export const readExcel = (filePath) => {
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
    return data;
};

// File Processing Function
export const processFile = async (file) => {
    const filePath = file.path;
    const fileType = file.mimetype;
    let fileData;

    // Read the file based on its type
    if (fileType === "text/csv") {
        fileData = await readCSV(filePath);
    } else if (
        fileType ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        fileType === "application/vnd.ms-excel"
    ) {
        fileData = readExcel(filePath);
    } else {
        throw new Error("Unsupported file type");
    }
    // Extract and validate phone numbers
    const phoneNumbers = fileData
        .map((row) => row["phonenumber"])
        .filter(Boolean);

    if (phoneNumbers.length === 0) {
        throw new Error(
            "Missing 'Phone Number' column or no phone numbers found"
        );
    }

    // This function gets valid, invalid, and unique phone numbers
    const { validPhoneNumbers, invalidPhoneNumbers } =
        getValidNumbersWithoutCode(phoneNumbers);

    // Get the rows where phone numbers are valid
    const validRows = fileData.filter((row) =>
        validPhoneNumbers.includes(row["phonenumber"])
    );

    // Extract column names (keys) from the first row
    const columns = fileData.length > 0 ? Object.keys(fileData[0]) : [];

    // Return phone numbers, full row data, valid row data, and columns
    return {
        allPhoneNumbers: phoneNumbers,
        invalidPhoneNumbers,
        validPhoneNumbers,
        validRows, // rows with valid phone numbers
        allData: fileData,
        columns,
    };
};

// process file for rcs enabled
export const processFileRcsEnabled = async (file) => {
    const filePath = file.path;
    const fileType = file.mimetype;
    let fileData;

    // Read the file based on its type
    if (fileType === "text/csv") {
        fileData = await readCSV(filePath);
    } else if (
        fileType ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        fileType === "application/vnd.ms-excel"
    ) {
        fileData = readExcel(filePath);
    } else {
        throw new Error("Unsupported file type");
    }

    // Extract, validate, and normalize phone numbers
    const phoneNumbers = fileData
        .map((row) => {
            let phoneNumber = row["phonenumber"];

            if (!phoneNumber) return null;

            // Convert scientific notation to plain string
            if (typeof phoneNumber === "number") {
                phoneNumber = phoneNumber.toString();
            }

            if (phoneNumber.includes("E")) {
                phoneNumber = Number(phoneNumber).toFixed(0); // Convert scientific notation to plain string
            }

            return phoneNumber;
        })
        .filter(Boolean) // Remove undefined or null entries
        .map((phoneNumber) => {
            // Use the `libphonenumber-js` library for validation and formatting
            const phoneObj = phone(phoneNumber, "IN");
            return phoneObj && phoneObj.isValid()
                ? phoneObj.format("E.164")
                : null;
        })
        .filter(Boolean); // Remove invalid or null phone numbers

    if (phoneNumbers.length === 0) {
        throw new Error(
            "Missing 'Phone Number' column or no valid phone numbers found"
        );
    }

    return {
        validPhoneNumbers: phoneNumbers,
    };
};

// Upload to Supabase

export const uploadToSupabase = async (file, supabase) => {
    const filePath = file.path;

    // Read the file as a buffer
    const fileBuffer = fs.readFileSync(filePath);

    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
        .from("telepiefile")
        .upload(`uploads/${file.filename}`, fileBuffer, {
            contentType: file.mimetype, // Specify the  content type
        });

    if (error) throw error;
    // Clean up local file after upload
    fs.unlinkSync(filePath);

    return { data, error };
};

// This function is used for file upload phonebook
const uploadContacts = multer({
    dest: "uploads/", // Temporary storage
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error("Only CSV, XLS, and XLSX files are allowed"),
                false
            );
        }
        cb(null, true);
    },
});

export const uploadExcel = uploadContacts.single("file"); // Single file upload
