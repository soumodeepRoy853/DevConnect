import jwt from 'jsonwebtoken';

const authUser = (req, res, next) =>{
    try {
        const authHeader = req.headers.authorization;

        //check if token exist or session expired
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({message: 'No authorized, Login again'})
        }

        //extract token
        const token = authHeader.split(' ')[1];

        //verify token
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        //attach user info to req object
        req.user = decode.id || decode.userid;

        next();
    } catch (err) {
        res.status(401).json({message: 'Session expired, Login again'})
    }
}

export default authUser;