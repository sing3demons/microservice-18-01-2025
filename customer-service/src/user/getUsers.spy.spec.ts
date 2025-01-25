import * as userFunctions from './user'
import { getUser } from './getUser'

describe('When testing getUser with jest spy', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation()
  })

  it('should call findUser with id 1', async () => {
    const findUserSpy = jest.spyOn(userFunctions, 'findUser').mockResolvedValueOnce({
      id: '1',
      username: 'spy username',
      active: true,
    })
    const id = '1'

    const user = await getUser(id)

    expect(findUserSpy).toHaveBeenCalledWith(id)

    expect(user.id).toBe('1')
    expect(user.username).toBe('spy username')
    expect(user.active).toBeTruthy()
  })
})
