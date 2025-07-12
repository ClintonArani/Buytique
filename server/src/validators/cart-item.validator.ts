import joi from 'joi';

export const cartItemSchema = joi.object({
    user_id: joi.string().required(),
    product_id: joi.string().required(),
    quantity: joi.number().integer().min(1).required(),
});