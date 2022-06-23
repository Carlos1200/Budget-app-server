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

    type Category{
        id: ID
        name: String
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

    type Query{
        getAuthUser: User
    }

    type Mutation{
        registerUser(user: UserInput): UserToken
        authenticateUser(user: AuthenticateUserInput): UserToken
    }
        
`;