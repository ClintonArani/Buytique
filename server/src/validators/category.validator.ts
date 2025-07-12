import joi from 'joi';

export const categorySchema = joi.object({
    name: joi.string().min(2).required(),
    description: joi.string().required(),
});