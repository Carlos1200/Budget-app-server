import bcryptjs from "bcryptjs";
import { createToken } from "../helpers/createToken.js";
import { User } from "../models/index.js";



export const resolvers = {
    Query: {
        getAuthUser:async (_, {}, ctx) => {
            if (!ctx.user) {
                throw new Error("You are not authenticated");
            }
            try {
                const user=await User.findByPk(ctx.user.id,{
                    attributes: {
                        exclude: ["password"]
                    }
                });
                return user;   
            } catch (error) {
                throw new Error(error);
            }
        }
    },
    Mutation: {
        registerUser:async(_,{user})=>{
            try {

                //find if user already exists
                const userExists=await User.findOne({
                    where:{
                        email:user.email
                    }
                });
                if(userExists){
                    throw new Error("User already exists");
                }

                const salt = bcryptjs.genSaltSync(10);
                user.password=bcryptjs.hashSync(user.password,salt);

                const newUser=await User.create(user,{
                    attributes: {
                        exclude: ["password"]
                    }
                });
                const token=await createToken(newUser.id,'1d');
                return {
                    user:newUser,
                    token
                }
            } catch (error) {
                console.log(error);
            }
        },
        authenticateUser:async(_,{user})=>{
            try {
                const userExists=await User.findOne({
                    where:{
                        email:user.email
                    },
                    attributes: {
                        exclude: ["password"]
                    }
                });
                if(!userExists){
                    throw new Error("User does not exist");
                }
                const isValid=bcryptjs.compareSync(user.password,userExists.password);
                if(!isValid){
                    throw new Error("Invalid password");
                }
                const token=await createToken(userExists.id,'1d');
                return {
                    user:userExists,
                    token
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
}