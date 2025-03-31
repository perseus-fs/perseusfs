import { dialogInfoSelector } from '@/selectors/dialog';
import { useSelector } from 'react-redux';

const useDialogInfo = () => useSelector(dialogInfoSelector);

export { useDialogInfo };
