import authRoutes from '../../routes/authRoutes.js'
import * as authController from '../../controllers/authController.js'
import { userRepository } from '../../repositories/userRepository.js'

export const AuthModule = {
  routes: authRoutes,
  controller: authController,
  repository: userRepository,
}

export default AuthModule
