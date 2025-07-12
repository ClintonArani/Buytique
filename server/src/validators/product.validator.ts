import joi from 'joi';

export const productSchema = joi.object({
    name: joi.string().min(2).required(),
    description: joi.string().required(),
    price: joi.number().positive().required(),
    stock_quantity: joi.number().integer().min(0).required(),
    category_id: joi.string().required(), 
});