import express from "express"
import { searchUsers } from "../controllers/search.controller.js";
import { paginationMiddleware } from "../middleware/pagination.middleware.js";

const searchRouter = express.Router();

searchRouter.get('/', paginationMiddleware(), searchUsers);

export default searchRouter;
