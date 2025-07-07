import express from "express"
import { searchUsers } from "../controllers/search.controller.js";

const searchRouter = express.Router();

searchRouter.get('/', searchUsers);

export default searchRouter;
