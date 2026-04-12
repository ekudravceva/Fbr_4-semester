import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
    }
});

export const api = {
    getInstruments: async () => {
        const response = await apiClient.get("/instruments");
        return response.data;
    },

    getInstrumentById: async (id) => {
        const response = await apiClient.get(`/instruments/${id}`);
        return response.data;
    },

    createInstrument: async (instrument) => {
        const response = await apiClient.post("/instruments", instrument);
        return response.data;
    },

    updateInstrument: async (id, instrument) => {
        const response = await apiClient.patch(`/instruments/${id}`, instrument);
        return response.data;
    },

    deleteInstrument: async (id) => {
        const response = await apiClient.delete(`/instruments/${id}`);
        return response.data;
    }
};