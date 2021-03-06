import * as React from 'react';
import yargs from 'yargs';
import WebpackConfig from 'webpack-chain';
import * as t from '@babel/types';

export type LogLevel = 'debug' | 'verbose' | 'info' | 'warn' | 'error' | 'silent';

export type Platform = 'web' | 'wechat' | 'ali' | 'toutiao';

export type BuildType = 'miniapp' | 'miniplugin' | 'minicomponent' | 'webapp';

export type WebOptions = {
  mpa: boolean;
  excludeNodeModulesTransform: boolean;
};

export interface PluginOptions {
  errorScreen: boolean;
  spm: boolean;
}

export interface BuildOptions {
  turboRenders?: boolean;
  pxToRpx: boolean;
  cwd: string;
  progress: boolean;
  input?: string[] | string | { [key: string]: string };
  output: string;
  rootDir: string;
  compressTemplate?: boolean;
  UNSAFE_wechatTemplateDepth: number | { [key: string]: number };
  configWebpack?: (params: { config: WebpackConfig; webpack: any }) => void;
  plugins: Plugin[];
  port?: number;
  notify?: boolean;
  watch?: boolean;
  target?: Platform;
  analyze?: boolean;
  devtools?: boolean;
  type?: BuildType;
  component?: any;
  web?: WebOptions;
  minimize?: boolean;
  loglevel?: LogLevel;
}

export type Options = BuildOptions & PluginOptions;

export type Config = Partial<Options>;

export interface EntryInfo {
  name: string;
  filename: string;
  component?: boolean;
}

export interface Entries {
  app: EntryInfo;
  pages: EntryInfo[];
}

export interface AppConfigPlugins {
  [key: string]: {
    version: string;
    provider: string;
  };
}

export interface AppConfig {
  pages: string[];
  subpackages?: Array<{
    root: string;
    pages: string[];
    plugins?: AppConfigPlugins;
  }>;
  subPackages?: Array<{
    root: string;
    pages: string[];
    plugins?: AppConfigPlugins;
  }>;
  tabBar?: {
    items?: Array<{ icon: string; activeIcon: string }>;
    list?: Array<{ iconPath: string; selectedIconPath: string }>;
  };
  plugins?: AppConfigPlugins;
}

export interface MiniPluginConfig {
  pages: string[];
  publicComponents: { [key: string]: string };
  publicPages: { [key: string]: string };
  main: string;
}

export type Meta = {
  global: string;
  template: {
    extension: string;
    tag: string;
    src: string;
  };
  style: string;
  jsHelper?: {
    extension: string;
    tag: string;
    src: string;
  };
  ejs: {
    base?: string;
    page: string;
    jsHelper?: string;
  };
  staticEjs?: {
    base?: string;
    page: string;
    jsHelper?: string;
    isolatedTemplates?: string;
  };
};

export type MetaOptions = {
  remaxOptions: Options;
};

export type ProcessPropsOptions = {
  componentName: string;
  props: string[];
  node?: t.JSXElement;
  additional?: boolean;
};

export type ShouldHostComponentRegister = {
  componentName: string;
  additional?: boolean;
  phase: 'import' | 'jsx' | 'extra';
};

export interface HostComponent {
  props: string[];
  additional?: boolean;
  alias?: { [key: string]: string };
}

export interface ComponentManifest {
  id: string;
  props: string[];
  additional?: boolean;
  type?: string;
}

export interface Plugin {
  /** ???????????? */
  meta?: Meta;
  hostComponents?: Map<string, HostComponent>;
  /**
   * ?????????????????????
   * options.componentName ????????????
   * options.props ????????????
   * options.node ?????? babel JSXElement
   * options.additional ??????????????????????????? host ??????
   */
  processProps?: (options: ProcessPropsOptions) => string[];
  /**
   * ??????????????????
   * options.componentName ????????????
   * options.additional ??????????????????????????????
   * options.phase ???????????????????????????import | jsx | extra
   */
  shouldHostComponentRegister?: (options: ShouldHostComponentRegister) => boolean;

  onBuildStart?: (params: { config: Options }) => void;

  /**
   * ?????? webpack ??????
   */
  configWebpack?: (params: { config: WebpackConfig }) => void;

  /**
   * ?????? babel ??????
   */
  configBabel?: (params: { config: any }) => void;

  /**
   * ?????????????????????
   */
  registerRuntimePlugin?: () => string;

  /**
   * ??????????????????
   */
  onAppConfig?: (params: { config: any }) => any;

  /**
   * ??????????????????
   */
  onPageConfig?: (params: { config: any; page: string }) => any;

  /**
   * ????????????????????? template
   */
  onPageTemplate?: (params: { template: string; page: string }) => string;

  unstable_onEntries?: (params: { entries: any }) => any;
  /**
   * ???????????????
   */
  extendCLI?: (params: { cli: yargs.Argv }) => any;
}

export type PluginConstructor = (options?: any) => Plugin;

export interface RuntimePlugin {
  onAppConfig?: ({ config }: { config: any }) => any;
  onPageConfig?: ({ config, page }: { config: any; page: string }) => any;
  onAppComponent?: ({ component }: { component: React.ComponentType<any> }) => React.ComponentType<any>;
  onPageComponent?: ({
    component,
    page,
  }: {
    component: React.ComponentType<any>;
    page: string;
  }) => React.ComponentType<any>;
  onMiniComponent?: ({
    component,
    context,
  }: {
    component: React.ComponentType<any>;
    context: any;
  }) => React.ComponentType<any>;
  onCreateHostComponent?: ({
    component,
  }: {
    component: React.ForwardRefExoticComponent<any> | React.ComponentType<any>;
  }) => React.ForwardRefExoticComponent<any> | React.ComponentType<any>;
  onCreateHostComponentElement?: ({ element }: { element: React.ReactElement<any> }) => React.ReactElement<any>;
}
