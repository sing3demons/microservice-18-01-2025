import * as userFunctions from './user'
import { getUser } from './getUser'

describe('When testing getUser with jest spy', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation()
  })

  const findUserMock = jest.mocked(userFunctions)

  it('should call findUser with id 1', async () => {
    findUserMock.findUser = jest.fn().mockResolvedValueOnce({
      id: '1',
      username: 'spy username',
      active: true,
    })

    const id = '1'

    const user = await getUser(id)

    expect(findUserMock.findUser).toHaveBeenCalledTimes(1)
    expect(findUserMock.findUser).toHaveBeenCalledWith(id)

    expect(user.id).toBe('1')
    expect(user.username).toBe('spy username')
    expect(user.active).toBeTruthy()
  })
})
