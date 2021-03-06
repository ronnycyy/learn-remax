import * as React from 'react';
import ReactReconciler from 'react-reconciler';
import hostConfig from './hostConfig';
import Container from './Container';
import AppContainer from './AppContainer';

// commit 时要做的事，重新配置 reconciler
export const ReactReconcilerInst = ReactReconciler(hostConfig as any);

if (process.env.NODE_ENV === 'development') {
  ReactReconcilerInst.injectIntoDevTools({
    bundleType: 1,
    version: '16.13.1',
    rendererPackageName: 'remax',
  });
}

function getPublicRootInstance(container: ReactReconciler.FiberRoot) {
  const containerFiber = container.current;
  if (!containerFiber.child) {
    return null;
  }
  return containerFiber.child.stateNode;
}

// 重写 render 方法
export default function render(rootElement: React.ReactElement | null, container: Container | AppContainer) {
  // Create a root Container if it doesnt exist
  if (!container._rootContainer) {
    container._rootContainer = ReactReconcilerInst.createContainer(container, 0, false, null);
  }

  ReactReconcilerInst.updateContainer(rootElement, container._rootContainer, null, () => {
    // ignore
  });

  return getPublicRootInstance(container._rootContainer);
}
