import axios from "axios";
import { chunkArray } from "../../../../utils/chunkArray.js";

// Function to check RCS capabilities
export const checkRcsCapabilities = async (phoneNumbers, accessToken) => {
    const serverRoot = process.env.DOTGO_SERVER_ROOT;
    const botId = process.env.DOTGO_BOT_ID;

    const url = `${serverRoot}/bot/v1/${botId}/rcsEnabledContacts`;

    const chunkSize = 10000; // Maximum numbers allowed per request
    const chunks = chunkArray(phoneNumbers, chunkSize);

    const rcsEnabled = [];
    const rcsNotEnabled = [];

    try {
        for (const chunk of chunks) {
            const response = await axios.post(
                url,
                { users: chunk },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            // Categorize devices
            rcsEnabled.push(...(response.data?.rcsEnabledContacts || []));
            const notEnabledContacts = chunk.filter(
                (number) => !response.data?.rcsEnabledContacts?.includes(number)
            );
            rcsNotEnabled.push(...notEnabledContacts);
        }

        return { status: "SUCCESS", rcsEnabled, rcsNotEnabled }; // Return categorized results
    } catch (error) {
        console.error("Error checking RCS capabilities:", error.message);
        throw error;
    }
};
