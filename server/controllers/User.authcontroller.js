import {
    getUserByIdService,
    loginUserService,
    registerUserService,
    oauthLoginService,
    changePasswordService,
} from "../services/user.service.js";
import {
    validateLoginInput,
    validateRegisterInput,
    validateChangePasswordInput,
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

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,     
            sameSite: "none",   
        });

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

export const oauthUser = async (req, res) => {
    try {
        const { name, email, avatar } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const { token, user } = await oauthLoginService({ name, email, avatar });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        res.status(200).json({ message: 'OAuth success', token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ message: error.message || "Internal server error" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const payload = validateChangePasswordInput(req.body);
        await changePasswordService({ userId: req.user.id, ...payload });
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ message: error.message || "Internal server error" });
    }
};
