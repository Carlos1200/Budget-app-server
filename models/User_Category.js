import {  DataTypes } from 'sequelize';
import sequelize from '../connection/index.js';
import {Category} from './Category.js';
import {User} from './User.js';
import {Budget} from './Budget.js';

export const User_Category = sequelize.define('users_categories',{
    user_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        references:{
            model:User,
            key:'id'
        }
    },
    category_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        references:{
            model:Category,
            key:'id'
        }
    },
    budget_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        primaryKey:true,
        references:{
            model:Budget,
            key:'id'
        }
    }
},{
    timestamps:false
});