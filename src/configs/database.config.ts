import { MongooseModule } from "@nestjs/mongoose";
import { envConfig } from "@configs/env.config";
import * as mongoose from "mongoose"

export const dbModule = MongooseModule.forRoot(envConfig.MONGO_URI, {})

export const makeMongoId = mongoose?.Types?.ObjectId