const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const userSchema = require("../schemas/userschema");
const { userDataValidator } = require("../utils/authutils");

const registerController = async (req, res ) => { 
    // data validation 
    // check if email and username exist or not 
    // hashed password
    // store data in data base
    const {name , email , username , password} = req.body;
    console.log(req.body);

    try {
        await userDataValidator({name , email, username, password})
    } catch (error) {
        return res.send({
            status : 400,
            message: "Invalid Data",
            error: error,
        });
    }

    const hashedPassword = await bcrypt.hash(password , Number(process.env.SALT) )

    const userObj  = new User({name, email, username, password : hashedPassword });

    try {
        const userDb = await userObj.registerUser();
        return res.send({ 
            status: 201,
            message: "register sucessfully",
            data: userDb,
        })

    } catch (error) {
        res.send({ 
            status: 500,
            message: "Internal server error",
            error: error,
        })        
    }

}

const loginController = async (req, res ) => { 

    // FIND THE USER 
    // COMPARE THE PASSWROD

    const {loginId, password} = req.body ; 

    if(!loginId || !password) return res.send({
        status : 400,
        mesasge: "missing user credentials",
    });

    try {
        const userDb = await User.findUserWithKey({key : loginId})
        
        const isMatched = await bcrypt.compare(password, userDb.password);
        if(!isMatched){ 
            return res.send({
                status: 400,
                message: "Incorrect Password",          
            })
        }
        
        req.session.isAuth = true,
        req.session.user = { 
            userId : userDb._id,
            email: userDb.email,
            username: userDb.username,
        };

        return res.send({ 
            status: 200,
            message : "Login successfully",
        });

    } catch (error) {
        console.log(error)
        return res.send({
            status: 500,
            message : "Internal Server error",
            error: error
        })
    }

}


const logoutController = (req , res)=>{ 
    req.session.destroy((err)=>{ 
        if(err)return res.send({
             status : 400,
             message: "Logout unscessfully, please login agian "
        });
        return res.send({
            status : 200,
            message: "Logout successfull",
        })
    })
}

module.exports = {registerController, loginController,logoutController};