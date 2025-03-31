import { useSelector } from 'react-redux';
import { authenticatedSelector } from '../selectors/user';

const useIsAuthenticated = () => useSelector(authenticatedSelector);

export { useIsAuthenticated };
