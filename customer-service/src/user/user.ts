import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: String,
  active: Boolean,
})

export const User = mongoose.model('User', userSchema)

export type User = {
  id: string
  username: string
  active: boolean
}

export const findUser = async (id: string): Promise<User> => {
  console.log('We are in findUser() line 10')
  const result = await User.findOne({ _id: id })
  if (!result) {
    throw new Error('User not found')
  }

  return {
    id,
    username: result.username as string,
    active: result.active as boolean,
  }
}
