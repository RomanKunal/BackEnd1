class ApiError extends Error {

  constructor(
    statusCode,
    message="An error occurred",
    error=[],
    stack=""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.message = message;
    //this.stack = stack;
    this.data=null;
    this.success=false;
    if(stack){
      this.stack=stack;
    } else{
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;