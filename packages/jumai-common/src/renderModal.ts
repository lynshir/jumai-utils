import type React from 'react';
import { render as reactDomRender, unmountComponentAtNode } from 'react-dom';

const domStack: HTMLElement[] = [];

/**
 * 渲染Modal。内部不需要本地化的组件。用法就是ReactDom.render用法
 * @param element react元素
 */
export function renderModal(element: React.ReactElement): HTMLElement {
  const newDomElement = document.createElement('div');
  domStack.push(newDomElement);
  document.body.appendChild(newDomElement);
  reactDomRender(element, newDomElement);
  return newDomElement;
}

/**
 * 摧毁上一个Modal
 */
export function destroyModal(): HTMLElement {
  const oldDomElement = domStack.pop();
  if (oldDomElement && oldDomElement.parentElement) {
    unmountComponentAtNode(oldDomElement);
    oldDomElement.parentElement.removeChild(oldDomElement);
  }
  return oldDomElement;
}

/**
 * 摧毁所有Modal
 */
export function destroyAllModal(): void {
  // eslint-disable-next-line no-empty
  while (destroyModal()) {
  }
}
