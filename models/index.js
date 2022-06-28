export * from './User.js';
export * from './Category.js';
export * from './Budget.js';
export * from './Transaction.js';

import {Category} from './Category.js';
import {User} from './User.js';
import {Budget} from './Budget.js';
import {Transaction} from './Transaction.js';




User.belongsToMany(Category, {
    through: 'users_categories',
    foreignKey: 'user_id',
    otherKey: 'category_id',
});

User.hasMany(Budget, {
    foreignKey: 'user_id',
    sourceKey: 'id'
});

Budget.belongsTo(User, {
    foreignKey: 'user_id',
    sourceKey: 'id'
});

Category.belongsTo(Budget, {
    foreignKey: 'budget_id',
    sourceKey: 'id'
});

Budget.hasMany(Category, {
    foreignKey: 'budget_id',
    sourceKey: 'id'
});

Category.belongsToMany(User, {
    through: 'users_categories',
    foreignKey: 'category_id',
    otherKey: 'user_id'
});

Category.hasMany(Transaction, {foreignKey: 'category_id'});

Transaction.belongsTo(Category, {foreignKey: 'category_id'});
