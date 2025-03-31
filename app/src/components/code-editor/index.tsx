import ReactCodeMirror from '@uiw/react-codemirror';
import { ComponentProps, memo } from 'react';
import { useTheme } from '../theme-provider';

const CodeEditor = memo((props: ComponentProps<typeof ReactCodeMirror>) => {
  const { theme } = useTheme();

  return <ReactCodeMirror theme={theme as any} {...props} />;
});

export { CodeEditor };
