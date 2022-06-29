import bcryptjs from "bcryptjs";
import { createToken } from "../helpers/createToken.js";
import { User,Category,Budget,Transaction } from "../models/index.js";



export const resolvers = {
    Query: {
        // ? Start of User Queries
        getAuthUser:async (_, {}, ctx) => {
            if (!ctx.user) {
                return new Error("You are not authenticated");
            }
            try {
                const user=await User.findByPk(ctx.user.id,{
                    attributes: {
                        exclude: ["password"]
                    }
                });
                return user;   
            } catch (error) {
                return new Error("Something went wrong");
            }
        },
        getBudgetsByUser:async (_, {}, ctx) => {
            if (!ctx.user) {
                return new Error("You are not authenticated");
            }
            try {
                const budgets=await Budget.findAll({
                    where:{
                        user_id:ctx.user.id
                    },
                });
                return budgets;
            } catch (error) {
                return new Error("Something went wrong");
            }
        },
        getBudget:async (_, {id}, ctx) => {
            if (!ctx.user) {
                return new Error("You are not authenticated");
            }
            try {
                const budget=await Budget.findByPk(id,{
                    include:[{
                        model:Category,
                        include:[{  
                            model:Transaction,
                        }]
                    }]
                });
                return budget;
            } catch (error) {
                return new Error("Something went wrong");
            }
        }
    },
    Mutation: {
        // ? Start of User Mutations
        registerUser:async(_,{user})=>{
            try {

                //find if user already exists
                const userExists=await User.findOne({
                    where:{
                        email:user.email
                    }
                });
                if(userExists){
                    return new Error("User already exists");
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
                return new Error("Something went wrong");
            }
        },
        authenticateUser:async(_,{user})=>{
            try {
                const userExists=await User.findOne({
                    where:{
                        email:user.email
                    }
                });
                if(!userExists){
                    return new Error("User does not exist");
                }
                const isValid=bcryptjs.compareSync(user.password,userExists.password);
                if(!isValid){
                    return new Error("Invalid password");
                }
                const token=await createToken(userExists.id,'1d');
                return {
                    user:userExists,
                    token
                }
            } catch (error) {
                return new Error("Something went wrong");
            }
        },
        createBudget:async(_,{budget},ctx)=>{
            try {
                if(!ctx.user){
                    return new Error("You are not authenticated");
                }
                if(budget.amount<0){
                    return new Error("Amount cannot be negative");
                }
                const newBudget=await Budget.create({
                    name:budget.name,
                    amount:budget.amount,
                    remaining:budget.amount,
                    user_id:ctx.user.id
                },{
                    attributes: {
                        exclude: ["user_id"]
                    }
                });
                return newBudget;
            } catch (error) {
                console.log({error});
                return new Error("Something went wrong");
            }
        },
        updateBudget:async(_,{budget,id},ctx)=>{
            try {
                if(!ctx.user){
                    return new Error("You are not authenticated");
                }
                if(budget.amount<0){
                    return new Error("Amount cannot be negative");
                }
                //find if budget exists
                const budgetExists=await Budget.findByPk(id);

                if(!budgetExists){
                    return new Error("Budget does not exist");
                }

                const rest =budget.amount- budgetExists.amount;
                budget.remaining=budgetExists.remaining+rest;
                
                
                const updatedBudget=await Budget.update(budget,{
                    where:{
                        id
                    },
                    returning:true,
                });
                return updatedBudget[1][0];
            } catch (error) {
                return new Error("Something went wrong");
            }
        },
        deleteBudget:async(_,{id},ctx)=>{
            try {
                if(!ctx.user){
                    return new Error("You are not authenticated");
                }
                //verify if budget exists
                const budgetExists=await Budget.findByPk(id);
                if(!budgetExists){
                    return new Error("Budget does not exist");
                }
                //delete budget
                await Budget.destroy({
                    where:{
                        id
                    }
                });
                return "Budget deleted";
            } catch (error) {
                return new Error("Something went wrong");
            }
        },
        createCategory:async(_,{category},ctx)=>{
            try {
                if(!ctx.user){
                    return new Error("You are not authenticated");
                }
                const newCategory=await Category.create({
                    name:category.name,
                    budget_id:category.budget_id
                });
                return newCategory;
            } catch (error) {
                return new Error("Something went wrong");
            }
        },
        updateCategory:async(_,{id,name},ctx)=>{
            try {
                if(!ctx.user){
                    return new Error("You are not authenticated");
                }
                const category=await Category.findByPk(id);
                if(!category){
                    return new Error("Category does not exist");
                }
                category.name=name;
                await category.save();
                return category;
            } catch (error) {
                return new Error("Something went wrong");
            }
        },
        deleteCategory:async(_,{id},ctx)=>{
            try {
                if(!ctx.user){
                    return new Error("You are not authenticated");
                }
                const category=await Category.findByPk(id);
                if(!category){
                    return new Error("Category does not exist");
                }
                //delete all user_categories with this category
                await category.destroy();
                return "Category deleted";
            } catch (error) {
                return new Error("Something went wrong");
            }
        },
        createTransaction:async(_,{transaction},ctx)=>{
            try {
                if(!ctx.user){
                    return new Error("You are not authenticated");
                }
                if(transaction.amount<0){
                    return new Error("Amount cannot be negative");
                }

                //verify if category exists
                const categoryExists=await Category.findByPk(transaction.category_id);
                if(!categoryExists){
                    return new Error("Category does not exist");
                }

                const budgetExists=await Budget.findByPk(categoryExists.budget_id);
                
                if(transaction.amount>budgetExists.remaining){
                    return new Error("Amount exceeds budget amount");
                }

                budgetExists.remaining-=transaction.amount;
                await budgetExists.save();

                const newTransaction=await Transaction.create({
                    category_id:transaction.category_id,
                    amount:transaction.amount,
                });
                return newTransaction;
            } catch (error) {
                return new Error("Something went wrong");
            }
        },
        updateTransaction:async(_,{transaction,id},ctx)=>{
            try {
                if(!ctx.user){
                    return new Error("You are not authenticated");
                }

                if(transaction.amount<0){
                    return new Error("Amount cannot be negative");
                }

                //verify if transaction exists
                const transactionExists=await Transaction.findByPk(id);
                if(!transactionExists){
                    return new Error("Transaction does not exist");
                }

                const category=await Category.findByPk(transactionExists.category_id);

                const budgetExists=await Budget.findByPk(category.budget_id);

                const amount=budgetExists.remaining+transactionExists.amount;
                if(transaction.amount>amount){
                    return new Error("Amount exceeds budget amount");
                }

                budgetExists.remaining=amount-transaction.amount;
                await budgetExists.save();

                const updatedTransaction=await Transaction.update(transaction,{
                    where:{
                        id
                    },
                    returning:true
                });
                return updatedTransaction[1][0];

            } catch (error) {
                return new Error("Something went wrong");
            }
        },
        deleteTransaction:async(_,{id},ctx)=>{
            try {
                if(!ctx.user){
                    return new Error("You are not authenticated");
                }
                //verify if transaction exists
                const transactionExists=await Transaction.findByPk(id);
                if(!transactionExists){
                    return new Error("Transaction does not exist");
                }

                const category=await Category.findByPk(transactionExists.category_id);
                
                const budgetExists=await Budget.findByPk(category.budget_id);

                budgetExists.remaining+=transactionExists.amount;
                await budgetExists.save();

                await Transaction.destroy({
                    where:{
                        id
                    }
                });
                return "Transaction deleted";
            } catch (error) {
                return new Error("Something went wrong");
            }
        }
    }
}