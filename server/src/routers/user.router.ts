import { Router } from 'express';
import { userController } from '../controllers/user.controller';

const controller = new userController();
const user_router = Router();

user_router.post('/create', controller.createUser);
user_router.get('/all-users', controller.fetchAll);
user_router.put('/switch-role', controller.switchRoles);
user_router.get('/:user_id', controller.fetchSingleUser);
user_router.put('/:user_id', controller.updateUser); // Add this route for updating user
user_router.patch('/update/:user_id', controller.updateUser);
user_router.delete('/delete/:user_id', controller.deleteUser);
user_router.post('/forgot-password', controller.initiatePasswordReset);
user_router.post('/verify-reset-code', controller.verifyResetCode);
user_router.post('/reset-password', controller.resetPassword);

user_router.post('/:user_id/profile-photo', controller.addProfilePhoto);
user_router.put('/:user_id/profile-photo', controller.updateProfilePhoto);
export default user_router;
