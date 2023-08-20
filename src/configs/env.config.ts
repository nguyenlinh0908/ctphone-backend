import * as Joi from "joi"
import * as dotenv from "dotenv"

const envConfig = dotenv.config().parsed

export {envConfig}

export interface IDatabase{
    MONGO_URL: string
}

export interface IAppConfig {
    database: IDatabase
}

const env:IAppConfig = {
    database: {
        MONGO_URL: envConfig.MONGO_URI
    }
}

export const validationSchema = Joi.object({
    database:{
        MONGO_URL: Joi.string().required()
    }
})

export default (): IAppConfig =>{
    const {error} = validationSchema.validate(env)

    if(error){
        throw new Error(error.message)
    }
    return env
}