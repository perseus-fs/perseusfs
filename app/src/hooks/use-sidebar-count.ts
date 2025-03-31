import { updateSidebarCountSelector } from '@/selectors/app';
import { useSelector } from 'react-redux';

const useSidebarCount = () => useSelector(updateSidebarCountSelector);

export { useSidebarCount };
