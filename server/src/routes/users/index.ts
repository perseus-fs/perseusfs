import { adminOnly, authenticate } from '../../middlewares/authenticate';
import { userAuth } from './auth';
import { createUser } from './create';
import { deleteUser } from './delete';
import { getUser } from './get';
import { listUsers } from './list';
import { userLogin } from './login';
import { updateUser } from './update';

export default [
  { method: 'POST', path: '/users/login', handlers: [userLogin] },
  { method: 'GET', path: '/users/auth', handlers: [authenticate, userAuth] },
  {
    method: 'GET',
    path: '/users',
    handlers: [authenticate, adminOnly, listUsers]
  },
  {
    method: 'POST',
    path: '/users',
    handlers: [authenticate, adminOnly, createUser]
  },
  {
    method: 'DELETE',
    path: '/users/:userId',
    handlers: [authenticate, adminOnly, deleteUser]
  },
  {
    method: 'PUT',
    path: '/users/:userId',
    handlers: [authenticate, adminOnly, updateUser]
  },
  {
    method: 'GET',
    path: '/users/:userId',
    handlers: [authenticate, adminOnly, getUser]
  }
];
