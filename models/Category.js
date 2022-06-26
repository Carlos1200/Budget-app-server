import {  DataTypes } from 'sequelize';
import sequelize from '../connection/index.js';

export const Category = sequelize.define('categories', {
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
});
