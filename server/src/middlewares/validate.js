export const validate = (schema) => (req,res,next)=>{
    const {error} = schema.validate(req.body,{abortEarly:false});
    if(error)
        res.status(400).json({success:false,message:error.details.map(err=>err.message).join(",")});
    else
        next();
}