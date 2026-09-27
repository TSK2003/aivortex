import { enrollmentRepository } from '../../repositories/enrollmentRepository.js'
import * as studentController from '../../controllers/studentController.js'

export const EnrollmentModule = {
  repository: enrollmentRepository,
  controller: studentController
}

export default EnrollmentModule
