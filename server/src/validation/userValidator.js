import joi from "joi"

export const registerSchema  = joi.object({
    name: joi.string().min(3).max(50).required(),
    email: joi.string().min(3).max(255).required().email(),
    password: joi.string().min(3).max(32).required(),
   
})

export const loginSchema = joi.object({
    email:joi.string().min(3).max(255).required().email(),
    password:joi.string().min(3).max(32).required(),
})