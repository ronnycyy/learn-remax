import VNode, { RawNode } from './VNode';
import { generate } from './instanceId';
import { FiberRoot } from 'react-reconciler';
import nativeEffector from './nativeEffect';
import { RuntimeOptions } from '@remax/framework-shared';
import { unstable_batchedUpdates } from './index';

interface SpliceUpdate {
  path: string[];
  start: number;
  id: number;
  deleteCount: number;
  items: RawNode[];
  children?: RawNode[];
  type: 'splice';
  node: VNode;
}

interface SetUpdate {
  path: string[];
  name: string;
  value: any;
  type: 'set';
  node: VNode;
}



export default class Container {
  context: any;
  root: VNode;
  rootKey: string;
  updateQueue: Array<SpliceUpdate | SetUpdate> = [];
  _rootContainer?: FiberRoot;
  stopUpdate?: boolean;
  rendered = false;

  constructor(context: any, rootKey = 'root') {
    this.context = context;

    this.root = new VNode({
      id: generate(),
      type: 'root',
      container: this,
    });
    this.root.mounted = true;
    this.rootKey = rootKey;
  }

  requestUpdate(update: SpliceUpdate | SetUpdate) {
    this.updateQueue.push(update);
  }

  normalizeUpdatePath(paths: string[]) {
    return [this.rootKey, ...paths].join('.');
  }

  // 处理完毕，遍历 update 队列，提交 this.setData(AppData) 给小程序
  // 注意⚠️ 这是个问题，AppData 是一棵 vDOM 树，可能会很大
  applyUpdate() {
    if (this.stopUpdate || this.updateQueue.length === 0) {
      return;
    }

    const startTime = new Date().getTime();

    if (typeof this.context.$spliceData === 'function') {
      let $batchedUpdates = (callback: () => void) => {
        callback();
      };

      if (typeof this.context.$batchedUpdates === 'function') {
        $batchedUpdates = this.context.$batchedUpdates;
      }

      $batchedUpdates(() => {
        this.updateQueue.map((update, index) => {
          let callback = undefined;
          if (index + 1 === this.updateQueue.length) {
            callback = () => {
              nativeEffector.run();
              /* istanbul ignore next */
              if (RuntimeOptions.get('debug')) {
                console.log(`setData => 回调时间：${new Date().getTime() - startTime}ms`);
              }
            };
          }

          if (update.type === 'splice') {
            this.context.$spliceData(
              {
                [this.normalizeUpdatePath([...update.path, 'children'])]: [
                  update.start,
                  update.deleteCount,
                  ...update.items,
                ],
              },
              callback
            );
          }

          if (update.type === 'set') {
            this.context.setData(
              {
                [this.normalizeUpdatePath([...update.path, update.name])]: update.value,
              },
              callback
            );
          }
        });
      });

      this.updateQueue = [];

      return;
    }

    const updatePayload = this.updateQueue.reduce<{ [key: string]: any }>((acc, update) => {
      if (update.node.isDeleted()) {
        return acc;
      }
      if (update.type === 'splice') {
        acc[this.normalizeUpdatePath([...update.path, 'nodes', update.id.toString()])] = update.items[0] || null;

        if (update.children) {
          acc[this.normalizeUpdatePath([...update.path, 'children'])] = (update.children || []).map(c => c.id);
        }
      } else {
        acc[this.normalizeUpdatePath([...update.path, update.name])] = update.value;
      }
      // 序列化出 AppData
      return acc;
    }, {});

    // 微信的 setData
    this.context.setData(updatePayload, () => {
      nativeEffector.run();
      /* istanbul ignore next */
      if (RuntimeOptions.get('debug')) {
        console.log(`setData => 回调时间：${new Date().getTime() - startTime}ms`, updatePayload);
      }
    });

    this.updateQueue = [];
  }


  // Remax 给 react 构建一个虚拟 dom 环境, react会操作这个虚拟的 dom, 然后 Remax 把 "操作" 产生的变化 给到 渲染层线程，渲染层线程分析，更新视图。

  clearUpdate() {
    this.stopUpdate = true;
  }

  createCallback(name: string, fn: (...params: any) => any) {
    this.context[name] = (...args: any) => {
      return unstable_batchedUpdates(args => {
        return fn(...args);
      }, args);
    };
  }

  removeCallback(name: string) {
    delete this.context[name];
  }

  appendChild(child: VNode) {
    this.root.appendChild(child);
  }

  removeChild(child: VNode) {
    this.root.removeChild(child);
  }

  insertBefore(child: VNode, beforeChild: VNode) {
    this.root.insertBefore(child, beforeChild);
  }
}
