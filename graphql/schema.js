import {gql} from 'apollo-server';

export const typeDefs = gql`

    # types are defined here

    type User{
        id: ID
        name: String
        email: String
        createdAt: String
        updatedAt: String
    }

    type UserToken{
        user: User
        token: String
    }

    type Budget{
        id: ID
        amount: Float
        remaining: Float
        name: String
        createdAt: String
        updatedAt: String
    }

    type Category{
        id: ID
        name: String
        createdAt: String
        updatedAt: String
    }

    type Transaction{
        id: ID
        amount: Float
        createdAt: String
        updatedAt: String
    }

    # input types are defined here
    
    input UserInput{
        name: String!
        email: String!
        password: String!
    }

    input AuthenticateUserInput{
        email: String!
        password: String!
    }
    
    input CategoryInput{
        name: String!
        budget_id: ID!
    }

    input BudgetInput{
        amount: Float!
        name: String!
    }

    input TransactionInput{
        amount: Float!
        category_id: ID
    }

    type Query{
        #Users
        getAuthUser: User

        #Budgets
        getBudgetsByUser: [Budget]
        getBudget(id: ID!): Budget
    }

    type Mutation{
        #Users
        registerUser(user: UserInput): UserToken
        authenticateUser(user: AuthenticateUserInput): UserToken

        #Budgets
        createBudget(budget: BudgetInput): Budget
        updateBudget(budget: BudgetInput,id:ID): Budget
        deleteBudget(id:ID): String

        #Categories
        createCategory(category: CategoryInput): Category
        updateCategory(id: ID!, name: String!): Category
        deleteCategory(id: ID!): String

        #Transactions
        createTransaction(transaction: TransactionInput): Transaction
        updateTransaction(transaction: TransactionInput,id:ID): Transaction
        deleteTransaction(id:ID): String

    }
        
`;