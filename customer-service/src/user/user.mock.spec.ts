import { findUser, User } from './user'

describe('When testing getUser with jest mock', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  const UserModel = jest.mocked(User)
  const consoleMock = jest.mocked(console)

  it('should call findUser with id 1', async () => {
    UserModel.findOne = jest.fn().mockResolvedValueOnce({
      _id: '1',
      username: 'mock username',
      active: true,
    })

    consoleMock.log = jest.fn()

    const user = await findUser('1')

    expect(consoleMock.log).toHaveBeenCalled()

    expect(User.findOne).toHaveBeenCalledTimes(1)
    const filter = { _id: '1' }
    expect(User.findOne).toHaveBeenCalledWith(filter)

    expect(user.id).toBe('1')
    expect(user.username).toBe('mock username')
    expect(user.active).toBeTruthy()
  })
})
