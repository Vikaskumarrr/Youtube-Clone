const express = require("express");
require('dotenv').config();
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs");
const session = require("express-session");
const mongoDbSession = require("connect-mongodb-session")(session);

//file-imports
const { userDataValidation, isEmailValidate } = require("./utils/authUtil");
const userModel = require("./models/userModel");
const isAuth = require("./middlewares/isAuth");
const todoValidation = require("./utils/todoUtils");
const todoModel = require("./models/todoModel");

// constant
const app = express();
const PORT = process.env.PORT;
const store = new mongoDbSession({
    uri: process.env.MONGO_URI,
    collection: "sessions"
})

//Data Base connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("mongodb connected successfully"))
    .catch((err) => console.log(err));

//middleware 
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(session({
    secret: process.env.SECRET_KEY,
    store: store,
    resave: false,
    saveUninitialized: false,
}))


app.get('/', (req, res) => {
    return res.send("Server is up and runing..")
})

app.get("/register-page", (req, res) => {
    return res.render("register");
})

app.post("/register", async (req, res) => {
    console.log(req.body);

    const { name, email, username, password } = req.body;
    // data validation 
    // User Schema
    // email and username does not exist 
    // store the data in db
    try {
        await userDataValidation({ email, username, password, name })
    } catch (error) {
        return res.status(400).json(error);
    }

    // eamil and username exist or not

    const userEmailExist = await userModel.findOne({ email });
    if (userEmailExist) {
        return res.status(400).json("Email already exist");
    }

    const userUsernameExist = await userModel.findOne({ username });
    if (userUsernameExist) {
        return res.status(400).json("username already Exist");
    }

    //encypt of password--
    const hashedpassword = await bcrypt.hash(password, Number(process.env.SALT))

    const userObj = new userModel({ name, email, username, password: hashedpassword })

    try {
        const userDb = await userObj.save()
        // return res.status(201)
        //     .json({ message: "Register Succesfuly", data: userDb });
        return res.redirect('/login-page')
    } catch (error) {
        return res.status(500)
            .json({ message: "Internal server error", error: error });

    }

})

app.get("/login-page", (req, res) => {
    return res.render("login")
})

app.post("/login", async (req, res) => {
    console.log(req.body)

    //find user with loginid
    //compare the password
    //session base auth

    const { loginId, password } = req.body

    if (!loginId || !password)
        return res.status(400).json("Missing user credentials.")

    try {
        let userDb;
        if (isEmailValidate({ key: loginId })) {
            userDb = await userModel.findOne({ email: loginId });
        } else {
            userDb = await userModel.findOne({ username: loginId })
        }

        if (!userDb)
            return res.status(400).json("User does not exist, register first");

        const isMatched = await bcrypt.compare(password, userDb.password)

        if (!isMatched)
            return res.status(400).json("Password does not matched")

        req.session.isAuth = true;
        req.session.user = {
            userId: userDb.id,
            email: userDb.email,
            username: userDb.username,
        }

        // return res.status(200).json("Login Sucessfully");
        return res.redirect("/dashboard");

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error })

    }

})


app.get('/dashboard', isAuth, (req, res) => {
    return res.render("dashboardpage")
});

app.post("/logout", isAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.send(500).json("logout unscessfully");

        // return res.status(200).json("logout sucessfully");
        return res.redirect("/login-page")
    });
});

app.post('/logout-out-from-all', isAuth, async (req, res) => {

    //session schema
    //session model
    // model.Queries

    const username = req.session.user.username;

    const sessionSchema = new mongoose.Schema({ _id: String }, { strict: false })
    const sessionModel = mongoose.model('session', sessionSchema)

    try {
        const deleteDb = await sessionModel.deleteMany({ "session.user.username": username })

        // return res.status(200).json("logout from all devices sucessfully")
        return res.redirect("/login-page")

    } catch (error) {
        return res
            .status(500)
            .json({ message: "Internal server error", error: error });
    }

});

app.post('/create-item', isAuth, async (req, res) => {
    console.log(req.body)

    const username = req.session.user.username;
    const todo = req.body.todo;
    try {
        await todoValidation({ todo })

    } catch (error) {
        return res.send({
            status: 400,
            message: error,
        })
    }
    const todoObj = new todoModel({ todo, username })

    try {
        const todoDb = todoObj.save();

        return res.send({
            status: 200,
            message: "Todo creaded successfully",
            data: todoDb
        })
    } catch (error) {
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error,
        });
    }

})

app.get('/read-item', isAuth, async (req, res) => {
    const username = req.session.user.username;

    try {
        const todos = await todoModel.find({ username })
        if (todos.length === 0)
            return res.send(
        { status: 204,
         message: "No todos found" 
        });

        return res.send({
            status: 200,
            message: "Read",
            data: todos,
        })

    } catch (error) {
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error,
        })
    }


})

app.post('/edit-item', isAuth, async (req, res) => {
    const { newData, todoId } = req.body
    const username = req.session.user.username;
    //data Validation
    //ownership check 
    //update todo 

    try {
        await todoValidation({ todo: newData });
    } catch (error) {
        return res.send({
            status: 400,
            error: error,
        })
    }

    try {

        const todoDb = await todoModel.findOne({ _id: todoId })

        if (!todoDb)
            return res.send({
                status: 400,
                message: "not found todo",
            })

        // console.log(username, todoDb.username)

        if (username !== todoDb.username) {
            return res.send({
                status: 403,
                message: "Not allow to edit this todo"
            })
        }

        const UpdatedTodoDb = await todoModel.findOneAndUpdate(
            { _id: todoId },
            { todo: newData },
            { new: true }
        )

        return res.send({
            status: 200,
            message: "Todo Updated Succesfully",
            data: UpdatedTodoDb
        })
    } catch (error) {
        return res.send({
            status: 500,
            message: "internal server error",
            error: error,
        })
    }


})

app.post('/delete-item', isAuth, async (req, res) => {
    const { todoId } = req.body
    const username = req.session.user.username;
    if (!todoId) {
        return res.send({
            status: 400,
            message: "Missing Todo Id",
        });
    }

    try {

        const todoDb = await todoModel.findOne({ _id: todoId })

        if (!todoDb)
            return res.send({
                status: 400,
                message: "not found todo",
            })

        // console.log(username, todoDb.username)

        if (username !== todoDb.username) {
            return res.send({
                status: 403,
                message: "Not allow to delete this todo"
            })
        }

        const deletedTodoDb = await todoModel.findOneAndDelete(
            { _id: todoId },
        )

        return res.send({
            status: 200,
            message: "Todo Updated Succesfully",
            data: deletedTodoDb,
        })
    } catch (error) {
        return res.send({
            status: 500,
            message: "internal server error",
            error: error,
        })
    }


})


app.listen(PORT, () => {
    console.log(`Server is running at : http://localhost:${PORT}`)
})