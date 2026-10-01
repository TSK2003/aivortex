import { userRepository } from '../../repositories/userRepository.js'
import * as adminController from '../../controllers/adminController.js'

export const UserModule = {
  repository: userRepository,
  controller: adminController
}

export default UserModule
