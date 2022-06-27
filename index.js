import {ApolloServer} from 'apollo-server';
import jwt from "jsonwebtoken";
import {config} from 'dotenv';
import {typeDefs,resolvers} from './graphql/index.js';
import sequelize from './connection/index.js';
config();

//test db connection
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

// Create Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers["authorization"] || "";
        if (token) {
          try {
            const user = jwt.verify(
              token,
              process.env.API_SECRET
            );
    
            return {
              user,
            };
          } catch (error) {
            return new Error("Token is not valid");
          }
        }
      },
})


server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});