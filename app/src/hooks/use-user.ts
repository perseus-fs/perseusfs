import { useSelector } from 'react-redux';
import { userSelector } from '../selectors/user';

const useUser = () => useSelector(userSelector);

export { useUser };
