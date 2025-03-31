import React from 'react';
import {cva} from 'class-variance-authority';
import {cn} from '#utils/cn.ts';

enum Layer {
  _1 = 'LAYER_ONE',
  _2 = 'LAYER_TWO',
  _3 = 'LAYER_THREE',
  _4 = 'LAYER_FOUR',
}

const styles = cva('bg-surface shadow-sm p-2', {
  variants: {
    layer: {
      [Layer._1]: 'rounded-xl border-border border p-4',
      [Layer._2]: 'rounded-lg bg-surface-contrast/5',
      [Layer._3]: 'rounded bg-surface-contrast/10',
      [Layer._4]: 'rounded-sm border border-border',
    },
  },
});

type CardProps = React.PropsWithChildren<{
  className?: string;
  layer?: Layer;
}> &
  React.HTMLProps<HTMLDivElement>;

function nextLayer(layer: Layer): Layer {
  switch (layer) {
    case Layer._1:
      return Layer._2;
    case Layer._2:
      return Layer._3;
    case Layer._3:
      return Layer._4;
    case Layer._4:
      throw new Error('Card is at the highest layer, use a different component');
  }
}

const CardContext = React.createContext(Layer._1);

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({children, layer, className = '', ...props}, ref) => {
    const layerFromContext = React.useContext(CardContext);

    return (
      <CardContext.Provider value={nextLayer(layerFromContext)}>
        <div
          ref={ref}
          className={cn(styles({layer: layer ?? layerFromContext}), className)}
          {...props}
        >
          {children}
        </div>
      </CardContext.Provider>
    );
  },
);

export {Card};
