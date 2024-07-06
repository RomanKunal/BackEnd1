const asyncHandler = (fn) => {return(req, res, next) =>{
    Promise.resolve(fn(req,res,next)).catch((err)=>next(err));
}
}

export {asyncHandler};


//2nd way to do this code by using try and catch block

//const asyncHandler = (fn) =>async (req, res, next) =>{
    //    try {
    //        await fn(req,res,next)}
    //    catch(err){
    // res.status(500).json({message:err.message})
    //        next(err)
    //    }