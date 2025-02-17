import axios from "axios"

const BACKEND_URL = "https://url-shortener-assignment.onrender.com"
// const BACKEND_URL = "http://localhost:10000"

export const urlService = {
    createShortUrl: async (token, longUrl, customAlias, topic) => {
        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/shorten`,
                { longUrl, customAlias, topic },
                { headers: { Authorization: `Bearer ${token}` } },
            )
            return response.data
        } catch (error) {
            throw new Error("Failed to create short URL")
        }
    },

    getUrls: async (token) => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/shorten`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            return response.data
        } catch (error) {
            throw new Error("Failed to fetch URLs")
        }
    },

    getAnalytics: async (token, alias) => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/analytics/${alias}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            return response.data
        } catch (error) {
            throw new Error("Failed to fetch analytics")
        }
    },

    getOverallAnalytics: async (token) => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/overallAnalytics`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            return response.data
        } catch (error) {
            throw new Error("Failed to fetch overall analytics")
        }
    },
}

