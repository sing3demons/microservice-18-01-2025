import { User, findUser } from './user'

const wrongUserIdError = new Error('wrong id.')

export const getUser = async (id: string): Promise<User> => {
  console.log('getUser()...')

  const user = await findUser(id)
  console.log('====> user:', user)
  return user
}
