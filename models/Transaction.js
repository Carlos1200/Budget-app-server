import {  DataTypes } from 'sequelize';
import sequelize from '../connection/index.js';
import {Category} from './Category.js';

export const Transaction = sequelize.define('transactions', {
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    amount:{
        type:DataTypes.DECIMAL,
        allowNull:false
    }
}
);

Category.hasMany(Transaction, {foreignKey: 'category_id'});