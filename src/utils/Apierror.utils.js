class Apierror extends Error{
    constructor(
        statuscode,
        message="Something Went Wrong",
        error=[],
        stack=""
    ){
        super(message)
        this.statuscode=statuscode
        this.message = message
        this.data=null
        this.success = false    
        this.error = error
        if(!stack){
            Error.captureStackTrace(this.constructor,constructor)
        }else{
            this.stack = stack
        }

    }
}
export {Apierror}