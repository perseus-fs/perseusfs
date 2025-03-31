import { useSelector } from 'react-redux';
import { tokenSelector } from '../selectors/user';

const useToken = () => useSelector(tokenSelector);

export { useToken };
