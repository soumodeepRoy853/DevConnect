import {
    getUserByIdService,
    loginUserService,
    registerUserService,
} from "../services/user.service.js";
import {
    validateLoginInput,
    validateRegisterInput,
} from "../validators/user.validator.js";

export const registerUser = async (req, res) => {
    try {
        const payload = validateRegisterInput(req.body);
        const newUser = await registerUserService(payload);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                avatar: newUser.avatar,
            },
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ message: error.message || "Internal server error" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const payload = validateLoginInput(req.body);
        const { token, user } = await loginUserService(payload);

        res.status(200).json({
            message: "Login successfully",
            token,
            user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ message: error.message || "Internal server error" });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await getUserByIdService(req.user.id);

        res.status(200).json({
            message: "User fetched successfully",
            user,
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ message: error.message || "Internal server error" });
    }
};
