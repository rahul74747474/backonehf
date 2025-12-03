import mongoose from "mongoose"

const connectdb = async() =>{
   try {
    const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.MONGODB_NAME}`)
    console.log(`Database Connected /n db host = ${connectioninstance.connection.host}`)
   } catch (error) {
    console.log("Connection Failed" ,error.message)
   }
}
export {connectdb}