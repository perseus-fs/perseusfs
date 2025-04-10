import { isDemoModeLockedSelector } from '@/selectors/app';
import { useSelector } from 'react-redux';

const useIsDemoModeLocked = () => useSelector(isDemoModeLockedSelector);

export { useIsDemoModeLocked };
