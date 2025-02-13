import axios from "axios";

// In-memory storage for the token and its expiration time
let cachedAccessToken = null;
let tokenExpirationTime = null;

export const getDotgoAccessToken = async () => {
    const authBaseUrl = process.env.DOTGO_AUTH_BASE_URL;
    const clientId = process.env.DOTGO_CLIENT_ID;
    const clientSecret = process.env.DOTGO_CLIENT_SECRET;
    const url = `${authBaseUrl}/oauth/token`;
    const params = new URLSearchParams({ grant_type: "client_credentials" });

    const authHeader = `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
    ).toString("base64")}`;

    // Check if the cached token is still valid
    const currentTime = Date.now();

    if (
        cachedAccessToken &&
        tokenExpirationTime &&
        currentTime < tokenExpirationTime
    ) {
        return cachedAccessToken; // Return cached token if valid
    }

    try {
        const response = await axios.post(url, params, {
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const { access_token, expires_in } = response.data;

        // Cache the token and its expiration time
        cachedAccessToken = access_token;
        tokenExpirationTime = currentTime + expires_in * 1000; // Convert expires_in to milliseconds

        return cachedAccessToken;
    } catch (error) {
        console.error(
            "Error fetching access token:",
            error.response?.data || error.message
        );
        throw error;
    }
};

// this accces token for dot go bot and template apis
let cachedAggreAccessToken = null;
let tokenAggreExpirationTime = null;

export const getDotgoAggregatorToken = async () => {
    const authBaseUrl = process.env.DOTGO_AUTH_BASE_URL;
    const clientId = process.env.DOTGO_AGGREGATOR_CLIENT_ID;
    const clientSecret = process.env.DOTGO_AGGREGATOR_CLIENT_SECRET;
    const url = `${authBaseUrl}/oauth/token`;
    const params = new URLSearchParams({
        grant_type: "client_credentials",
    });

    const authHeader = `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
    ).toString("base64")}`;

    // Check if the cached token is still valid
    const currentTime = Date.now();

    if (
        cachedAggreAccessToken &&
        tokenAggreExpirationTime &&
        currentTime < tokenAggreExpirationTime
    ) {
        return cachedAggreAccessToken; // Return cached token if valid
    }

    try {
        const response = await axios.post(url, params.toString(), {
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const { access_token, expires_in } = response.data;

        // Cache the token and its expiration time
        cachedAggreAccessToken = access_token;
        tokenAggreExpirationTime = currentTime + expires_in * 1000; // Convert expires_in to milliseconds

        return cachedAggreAccessToken;
    } catch (error) {
        console.error(
            "Error fetching access token:",
            error.response?.data || error.message
        );
        throw error;
    }
};
