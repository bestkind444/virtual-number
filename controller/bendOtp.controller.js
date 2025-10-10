import axios from "axios";

const getCountries = async (req, res) => {
    try {
        const response = await axios.get("https://benotp.com/api/all/");
        // console.log(response.data);
        
        res.json(response.data);

    } catch (error) {
        console.error("Error fetching countries:", err.message);
        res.status(500).json({ error: "Failed to fetch countries" });
    }

}

export { getCountries };