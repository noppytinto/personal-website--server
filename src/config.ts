import dotenv from "dotenv";
dotenv.config();

export function getPort() {
    return process.env.PORT || 3000;
}

export function getBaseURL() {
    return process.env.BASE_URL;
}
