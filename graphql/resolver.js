import bcryptjs from "bcryptjs";
import { createToken } from "../helpers/createToken.js";
import { User,Category,Budget,User_Category,Transaction } from "../models/index.js";



export const resolvers = {
    Query: {
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
        createBudget:async(_,{budget})=>{
            try {
                if(budget.amount<0){
                    return new Error("Amount cannot be negative");
                }
                const newBudget=await Budget.create({
                    name:budget.name,
                    amount:budget.amount,
                    remaining:budget.amount
                });
                return newBudget;
            } catch (error) {
                return new Error("Something went wrong");
            }
        },
        updateBudget:async(_,{budget,id})=>{
            try {
                if(budget.amount<0){
                    return new Error("Amount cannot be negative");
                }
                //find if budget exists
                const budgetExists=await Budget.findByPk(id);

                if(!budgetExists){
                    return new Error("Budget does not exist");
                }

                if(budget.amount!==budgetExists.amount){
                    return new Error("You cannot change the amount of a budget");
                }
                
                const updatedBudget=await Budget.update(budget,{
                    where:{
                        id
                    },
                    returning:true
                });
                return updatedBudget[1][0];
            } catch (error) {
                return new Error("Something went wrong");
            }
        },
        deleteBudget:async(_,{id})=>{
            try {
                //verify if budget exists
                const budgetExists=await Budget.findByPk(id);
                if(!budgetExists){
                    return new Error("Budget does not exist");
                }
                //delete all categories associated with budget
                const categories=await User_Category.findAll({
                    where:{
                        budget_id:id
                    },
                    include:[{
                        model:Category,
                    }]
                });
                
                await User_Category.destroy({
                    where:{
                        budget_id:id
                    }
                });
                for(let i=0;i<categories.length;i++){
                    await Category.destroy({
                        where:{
                            id:categories[i].category_id
                        }
                    });
                }
                
                //delete budget
                await Budget.destroy({
                    where:{
                        id
                    }
                });
                return "Budget deleted";
            } catch (error) {
                console.log({error});
                return new Error("Something went wrong");
            }
        },
        createCategory:async(_,{category},ctx)=>{
            try {
                const newCategory=await Category.create({
                    name:category.name,
                    budget_id:category.budget_id
                });
                await User_Category.create({
                    user_id:ctx.user.id,
                    category_id:newCategory.id,
                    budget_id:category.budget_id
                });
                return newCategory;
            } catch (error) {
                return new Error("Something went wrong");
            }
        },
        updateCategory:async(_,{id,name})=>{
            try {
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
        deleteCategory:async(_,{id})=>{
            try {
                const category=await Category.findByPk(id);
                if(!category){
                    return new Error("Category does not exist");
                }
                //delete all user_categories with this category
                await User_Category.destroy({
                    where:{
                        category_id:id
                    }
                });
                await category.destroy();
                return "Category deleted";
            } catch (error) {
                return new Error("Something went wrong");
            }
        },
        createTransaction:async(_,{transaction})=>{
            try {
                if(transaction.amount<0){
                    return new Error("Amount cannot be negative");
                }

                //verify if category exists
                const categoryExists=await Category.findByPk(transaction.category_id);
                if(!categoryExists){
                    return new Error("Category does not exist");
                }

                const budget=await User_Category.findOne({
                    where:{
                        category_id:categoryExists.id
                    }
                });

                const budgetExists=await Budget.findByPk(budget.budget_id);
                
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
                console.log({error});
                return new Error("Something went wrong");
            }
        },
        updateTransaction:async(_,{transaction,id})=>{
            try {

                if(transaction.amount<0){
                    return new Error("Amount cannot be negative");
                }

                //verify if transaction exists
                const transactionExists=await Transaction.findByPk(id);
                if(!transactionExists){
                    return new Error("Transaction does not exist");
                }

                const category=await Category.findByPk(transactionExists.category_id);

                const budget=await User_Category.findOne({
                    where:{
                        category_id:category.id
                    }
                });
                const budgetExists=await Budget.findByPk(budget.budget_id);

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
        deleteTransaction:async(_,{id})=>{
            try {
                //verify if transaction exists
                const transactionExists=await Transaction.findByPk(id);
                if(!transactionExists){
                    return new Error("Transaction does not exist");
                }

                const category=await Category.findByPk(transactionExists.category_id);
                
                const budget=await User_Category.findOne({
                    where:{
                        category_id:category.id
                    }
                });
                const budgetExists=await Budget.findByPk(budget.budget_id);

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