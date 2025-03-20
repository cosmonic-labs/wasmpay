import React from 'react';
import {DragPortalContext} from '../components/DragPortalProvider';

let draggingCount = 0;

export type HTMLFileInputElement = Omit<HTMLInputElement, 'multiple' | 'type'> & {
  multiple: false;
  type: 'file';
};

export type HTMLFileInputProps = Omit<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLInputElement>, HTMLFileInputElement>,
  'ref' | 'multiple' | 'type'
> & {
  ref?: React.Ref<HTMLFileInputElement>;
};

type UseDraggingOptions = {
  inputRef?: React.RefObject<HTMLFileInputElement>;
  onDrop?: (file?: File) => void;
};

/**
 *
 * @param data - labelRef, inputRef, handleChanges, onDrop
 * @returns boolean - the state.
 *
 * @internal
 */
export default function useDragging({inputRef, onDrop}: UseDraggingOptions) {
  const context = React.useContext(DragPortalContext);
  const state = React.useState(false);
  const dragging = context?.state[0] ?? state[0];
  const setDragging = context?.state[1] ?? state[1];

  React.useEffect(() => {
    const input = inputRef?.current;

    const changeFile = (file: File | undefined) => {
      if (!file || !inputRef?.current) return;
      const transfer = new DataTransfer();
      transfer.items.add(file);
      if (input) {
        input.files = transfer.files;
        input.dispatchEvent(new Event('change'));
      }
    };

    const preventDefaults = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const handleChange = () => onDrop?.(input?.files?.[0]) || (() => {});
    const handleDragIn = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      draggingCount++;
      if (event.dataTransfer?.items?.length !== 0) {
        setDragging(true);
      }
    };
    const handleDragOver = (event: DragEvent) => preventDefaults(event);
    const handleDrop = (event: DragEvent) => {
      preventDefaults(event);
      setDragging(false);
      draggingCount = 0;
      onDrop?.(event.dataTransfer?.files?.[0]);
      changeFile(event.dataTransfer?.files?.[0]);
    };
    const handleDragOut = (event: DragEvent) => {
      preventDefaults(event);
      draggingCount--;
      if (draggingCount > 0) return;
      setDragging(false);
    };

    input?.addEventListener('change', handleChange);
    document.body.addEventListener('dragenter', handleDragIn);
    document.body.addEventListener('dragleave', handleDragOut);
    document.body.addEventListener('dragover', handleDragOver);
    document.body.addEventListener('drop', handleDrop);
    return () => {
      input?.removeEventListener('change', handleChange);
      document.body.removeEventListener('dragenter', handleDragIn);
      document.body.removeEventListener('dragleave', handleDragOut);
      document.body.removeEventListener('dragover', handleDragOver);
      document.body.removeEventListener('drop', handleDrop);
    };
  }, [inputRef, onDrop, setDragging]);

  const FallbackDragPortal = React.useMemo(
    () => () => {
      console.error('To use the DragPortal, useDragging must be withing a DragContextProvider');
      return null;
    },
    [],
  );

  return {dragging, setDragging, DragPortal: context?.DragPortal ?? FallbackDragPortal};
}
