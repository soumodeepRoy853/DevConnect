import { searchUsersService } from "../services/search.service.js";
import { validateSearchQuery } from "../validators/search.validator.js";

export const searchUsers = async (req, res) => {
    try {
        const query = validateSearchQuery(req.query.query);
        const result = await searchUsersService(query, req.pagination);
        const response = { users: result.users };

        if (result.pagination) {
            response.pagination = result.pagination;
        }

        res.status(200).json(response);
    } catch (err) {
        const status = err.status || 500;
        res.status(status).json({ message: err.message || "Server error" });
    }
}