import { demoModeSelector } from '@/selectors/app';
import { useSelector } from 'react-redux';

const useIsDemoModeEnabled = () => useSelector(demoModeSelector);

export { useIsDemoModeEnabled };
