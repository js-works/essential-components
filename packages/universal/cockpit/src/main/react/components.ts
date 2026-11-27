import type {
  AppHeaderComponentConfig,
  AppHeaderProps,
  CockpitComponentConfig,
  CockpitProps,
  LoginComponentConfig,
  LoginProps,
  NavTreeComponentConfig,
  NavTreeProps,
  StatusViewComponentConfig,
  StatusViewProps,
  SystemBannerComponentConfig,
  SystemBannerProps,
} from './api/index.js';
import { defineComponent } from './define-component.js';

export {
  createAppHeaderComponent,
  createCockpitComponent,
  createLoginComponent,
  createNavTreeComponent,
  createStatusViewComponent,
  createSystemBannerComponent,
};

// The React components of the package's elements, one factory per element class (`createNavTreeClass` …), with the
// same config, its `i18n` a hook (`useI18n`). Each call makes a component of its own (a class of its own, under an
// internal tag); the call has no side effect.

function createNavTreeComponent(config: NavTreeComponentConfig = {}) {
  const { useI18n, ...classConfig } = config;

  return defineComponent<NavTreeProps>({
    name: 'nav-tree',
    createClass: (client) => client.createNavTreeClass(classConfig),
    properties: {
      items: [],
      groups: [],
      active: '',
      marked: [],
      collapsibleGroups: false,
      groupDisplay: 'sections',
      density: 'normal',
      theme: classConfig.theme ?? {},
    },
    events: { onNavigate: 'navigate' },
    slots: { top: 'top', bottom: 'bottom' },
  }, useI18n);
}

function createStatusViewComponent(config: StatusViewComponentConfig = {}) {
  const { useI18n, ...classConfig } = config;

  return defineComponent<StatusViewProps>({
    name: 'status-view',
    createClass: (client) => client.createStatusViewClass(classConfig),
    properties: {
      layout: 'inline',
      kind: 'default',
      appTitle: '',
      subtitle: '',
      heading: '',
      message: '',
      actionLabel: '',
    },
    events: { onAction: 'action' },
    slots: { icon: 'icon', logo: 'logo', footer: 'footer', hint: 'hint' },
  }, useI18n);
}

function createSystemBannerComponent(config: SystemBannerComponentConfig = {}) {
  const { useI18n, ...classConfig } = config;

  return defineComponent<SystemBannerProps>({
    name: 'system-banner',
    createClass: (client) => client.createSystemBannerClass(classConfig),
    properties: { tone: 'info', message: '', actionLabel: '', dismissible: false },
    events: { onAction: 'action', onDismiss: 'dismiss' },
    slots: {},
  }, useI18n);
}

function createLoginComponent(config: LoginComponentConfig = {}) {
  const { useI18n, ...classConfig } = config;

  return defineComponent<LoginProps>({
    name: 'login',
    createClass: (client) => client.createLoginClass(classConfig),
    properties: {
      appTitle: '',
      subtitle: '',
      heading: '',
      submitLabel: '',
      submitting: false,
      providers: [],
      signInWith: null,
    },
    events: {},
    slots: { logo: 'logo', footer: 'footer', hint: 'hint' },
  }, useI18n);
}

function createAppHeaderComponent(config: AppHeaderComponentConfig = {}) {
  const { useI18n, ...classConfig } = config;

  return defineComponent<AppHeaderProps>({
    name: 'app-header',
    createClass: (client) => client.createAppHeaderClass(classConfig),
    properties: {
      heading: '',
      switcher: [],
      activeSwitcherItem: '',
      modules: [],
      activeModule: '',
      homeHref: '#',
      crumbs: [],
      back: null,
      forward: null,
      theme: classConfig.theme ?? {},
    },
    events: { onNavigate: 'navigate', onBack: 'back', onForward: 'forward' },
    slots: { icon: 'icon', end: 'end', backPage: 'back-page', forwardPage: 'forward-page' },
    moreSlots: (props) =>
      ((props['crumbLabels'] ?? []) as readonly unknown[]).map((label, index) =>
        [`crumb-${index}`, label as never] as const
      ),
  }, useI18n);
}

function createCockpitComponent(config: CockpitComponentConfig) {
  const { useI18n, ...classConfig } = config;

  return defineComponent<CockpitProps>({
    name: 'cockpit',
    createClass: (client) => client.createCockpitClass(classConfig),
    properties: {
      nav: 'side',
      navScheme: 'dark',
      density: 'normal',
      startPage: classConfig.startPage === true,
      theme: classConfig.theme ?? {},
    },
    events: {},
    slots: { logo: 'logo', sidebarEnd: 'sidebar-end' },
  }, useI18n);
}
