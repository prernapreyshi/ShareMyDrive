import axios from "axios";

const API_KEY = process.env.REACT_APP_LOCATIONIQ_API_KEY; // 🔐 Loaded from .env
const BASE_URL = "https://api.locationiq.com/v1/autocomplete.php";

export const fetchLocationSuggestions = async (query) => {
  if (!query) return [];
  try {
    const res = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        format: "json",
      },
    });
    return res.data;
  } catch (err) {
    console.error("Location autocomplete error:", err);
    return [];
  }
};
