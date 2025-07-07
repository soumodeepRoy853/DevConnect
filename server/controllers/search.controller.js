import User from '../models/User.model.js';

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;

        if(!query || query.trim() === "") {
            return res.status(400).json({ message: "Search query is required" });
        }
        const users = await User.find({
            name: { $regex: query, $options: "i"},   
        }).select("name email");
        res.status(200).json({ users })
        
    } catch (err) {
        res.dtatus(500).json({ message: " Server Eror" })
    }
}