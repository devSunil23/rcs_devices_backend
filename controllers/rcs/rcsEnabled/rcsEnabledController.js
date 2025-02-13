import { checkRcsCapabilities } from "../../../services/rcsServices/viservices/dotgoservices/checkRcsCapabalities.js";
import { getDotgoAccessToken } from "../../../services/rcsServices/viservices/dotgoservices/getAccessToken.js";
import {
    processFile,
    processFileRcsEnabled,
} from "../../../utils/fileUtils.js";

export const rcsEnabledUploadFileController = async (req, res, supabase) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                message: "No file uploaded",
                status: "ERROR",
            });
        }

        // Process file (CSV/XLS/XLSX) and extract phone numbers
        const fileData = await processFileRcsEnabled(file);
        const { validPhoneNumbers } = fileData;

        console.log("validPhoneNumbers", validPhoneNumbers.length);

        const accessToken = await getDotgoAccessToken();
        console.log("accessToken", accessToken);
        // this function are checking rcs capabalities
        const rcsCapabalities = await checkRcsCapabilities(
            validPhoneNumbers,
            accessToken
        );

        if (rcsCapabalities.status === "SUCCESS") {
            const { rcsEnabled, rcsNotEnabled } = rcsCapabalities;

            return res.status(200).json({
                message: "RCS capabilities checked successfully",
                data: {
                    rcsEnabled,
                    rcsNotEnabled,
                },
                status: "SUCCESS",
            });
        } else {
            return res.status(400).json({
                message: "Error checking RCS capabilities",
                error: "",
                status: "ERROR",
            });
        }
    } catch (error) {
        res.status(400).json({
            message: "Error processing file",
            error: error.message,
            status: "ERROR",
        });
    }
};
