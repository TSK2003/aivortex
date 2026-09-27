import studentRoutes from '../../routes/studentRoutes.js'
import * as studentController from '../../controllers/studentController.js'
import { enrollmentRepository } from '../../repositories/enrollmentRepository.js'

export const StudentModule = {
  routes: studentRoutes,
  controller: studentController,
  repository: enrollmentRepository
}

export default StudentModule
