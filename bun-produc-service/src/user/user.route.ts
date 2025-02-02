import { Router } from '../lib/serve'
import UserHandler from './user.handler'

const userRouter = Router()

const userHandler = new UserHandler()

userRouter.get('/:id', userHandler.getUserById)

export default userRouter.Router('users')
