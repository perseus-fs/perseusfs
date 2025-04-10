import { useSelector } from 'react-redux';
import { isSuperUserSelector } from '../selectors/user';

const useIsSuperUser = () => useSelector(isSuperUserSelector);

export { useIsSuperUser };
