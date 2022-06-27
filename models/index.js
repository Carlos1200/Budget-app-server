export * from './User.js';
export * from './Category.js';
export * from './Budget.js';
export * from './Transaction.js';
export * from './User_Category.js';

import {Category} from './Category.js';
import {User} from './User.js';
import {Budget} from './Budget.js';
import {Transaction} from './Transaction.js';
import {User_Category} from './User_Category.js';


User.belongsToMany(Budget, {
    through: 'users_categories',
    foreignKey: 'user_id',
    otherKey: 'budget_id'
});

User.belongsToMany(Category, {
    through: 'users_categories',
    foreignKey: 'user_id',
    otherKey: 'category_id',
});


Category.belongsToMany(Budget, {
    through: 'users_categories',
    foreignKey: 'category_id',
    otherKey: 'budget_id',
    as: 'budgets'
});

Category.belongsToMany(User, {
    through: 'users_categories',
    foreignKey: 'category_id',
    otherKey: 'user_id'
});


Budget.belongsToMany(Category, {
    through: 'users_categories',
    foreignKey: 'budget_id',
    otherKey: 'category_id'
});

Budget.belongsToMany(User, {
    through: 'users_categories',
    foreignKey: 'budget_id',
    otherKey: 'user_id'
});

Category.hasMany(Transaction, {foreignKey: 'category_id'});

User_Category.belongsTo(Category, {foreignKey: 'category_id'});

User_Category.belongsTo(User, {foreignKey: 'user_id'});

User_Category.belongsTo(Budget, {foreignKey: 'budget_id'});