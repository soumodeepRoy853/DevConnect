import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from 'validator'



export const registerUser = async (req, res) =>{
    try {
        const { name, email, password } = req.body;

        //Check if all fields are filled
        if(!name || !email || !password){
            return res.status(400).json({message: "All fields are required"})
        }

        //Check if the email is valid
        if(!validator.isEmail(email)){
            return res.status(400).json({message: "Please enter a valid email"})
        }

        //Check if user already exists
        const existUser = await User.findOne({email})
        if(existUser){
            return res.status(400).json({message: "User already exist"});
        }
        
        //Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //Create new user
        const user = await User.create({name, email, password: hashedPassword})

        // Save the user to database
        const newUser = new User(user);
        await newUser.save();

        //Generate JWT token
        // const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {expiresIn: '7d'})

        res.status(201).json({
            message: "User registered successfully",
            user:{
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        })

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal server error" });
        
    }
}

export const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        //validate input
        if(!email || !password){
            return res.status(400).json({message: 'Email and Password are required'})
        }
        //find user
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({msg:'User not found'})
        }

        //match password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(404).json({msg: 'Invalid Credentials'});
        }

        //generate token
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.status(200).json({
            message: 'Login successfully',
            token,
            user: {id: user._id, name: user.name, email: user.email}
        })

    } catch (err) {
       res.status(500).json({msg: err.message})
       console.log(err)
    }
}

export const getUser = async(req, res)=>{
    try {
        const user = await User.findById(req.user).select('-password')

        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json({
            message: "User fetched successfully",
            user
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal server error" });
        
    }
}
