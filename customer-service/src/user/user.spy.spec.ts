import { findUser, User } from './user'

describe('When testing getUser with jest spy', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should call findUser with id 1', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValueOnce({
      _id: '1',
      username: 'spy username',
      active: true,
    })

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

    const user = await findUser('1')

    expect(consoleSpy).toHaveBeenCalled()

    expect(User.findOne).toHaveBeenCalledTimes(1)
    const filter = { _id: '1' }
    expect(User.findOne).toHaveBeenCalledWith(filter)

    expect(user.id).toBe('1')
    expect(user.username).toBe('spy username')
    expect(user.active).toBeTruthy()
  })

  // test case for user not found
  it('should throw an error when user is not found', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValueOnce(null)

    try {
      await findUser('1')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      if (error instanceof Error) {
        expect(error.message).toBe('User not found')
      }
    }

    expect(User.findOne).toHaveBeenCalledTimes(1)
    const filter = { _id: '1' }
    expect(User.findOne).toHaveBeenCalledWith(filter)
  })
})
