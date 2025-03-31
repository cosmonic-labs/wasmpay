import React, {HTMLProps} from 'react';
import ReactDOM from 'react-dom';

interface PortalProps {
  /**
   * An optional container where the portaled content should be appended.
   */
  container?: Element | null;
  children?: React.ReactNode;
}

type DragPortalContextType = {
  state: ReturnType<typeof React.useState<boolean>>;
  DragPortal: React.FC<HTMLProps<HTMLDivElement>>;
};

const DragPortalContents = React.forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
  ({children}, ref) => {
    const context = React.useContext(DragPortalContext);
    if (!context) return null;
    const {
      state: [dragging],
    } = context;

    return (
      dragging && (
        <div ref={ref} className="fixed z-50 overflow-auto inset-0 bg-black bg-opacity-50">
          {children}
        </div>
      )
    );
  },
);

const DragPortalProvider = React.forwardRef<HTMLDivElement, PortalProps>(
  ({children, container: containerProp}, forwardedRef) => {
    const portalDiv = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(forwardedRef, () => portalDiv.current!);

    const [mounted, setMounted] = React.useState(false);
    const [dragging, setDragging] = React.useState<boolean | undefined>(false);
    const portalChildren = React.useRef<React.ReactNode | null>(null);
    React.useLayoutEffect(() => setMounted(true), []);

    const container = containerProp || (mounted && globalThis?.document?.body);

    const DragPortal: React.FC<React.PropsWithChildren> = React.memo(({children}) => {
      portalChildren.current = children;
      return null;
    });

    const portal =
      container &&
      ReactDOM.createPortal(
        <DragPortalContents>{portalChildren.current}</DragPortalContents>,
        container,
      );

    return (
      <DragPortalContext.Provider value={{state: [dragging, setDragging], DragPortal}}>
        {children}
        {portal}
      </DragPortalContext.Provider>
    );
  },
);

const DragPortalContext = React.createContext<DragPortalContextType | null>(null);

export {DragPortalProvider, DragPortalContext};
