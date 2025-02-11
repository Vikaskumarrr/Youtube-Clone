const userschema = require("../schemas/userschema");

const User = class {

    constructor({ name, email, username, password }) {
        this.name = name;
        this.email = email;
        this.username = username;
        this.password = password;
    }

    registerUser() {
        return new Promise(async (resolve, reject) => {
            try {
                const userExist = await userschema.findOne({
                    $or: [{ email: this.email }, { username: this.username }]
                });

                if (userExist && userExist.email === this.email) return reject("Email already Exist");
                if (userExist && userExist.username === this.username) return reject("Username already Exist");


                const userObj = new userschema({
                    name: this.name,
                    email: this.email,
                    username: this.username,
                    password: this.password

                })

                const userDb = await userObj.save();
                resolve(userDb);


            } catch (error) {
                reject(error);
            }
        })
    }

    static findUserWithKey({ key }) {
        return new Promise(async (resolve, reject) => {
            try {
                const userDb = await userschema.findOne({
                    $or: [{ email: key }, { username : key }],
                }).select("+password");

                if (!userDb) return reject("User not Found");

                resolve(userDb)
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports = User;




// Controller(User) <---------> Model(Schema) <-------->
