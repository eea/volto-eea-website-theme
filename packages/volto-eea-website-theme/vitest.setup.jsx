import { vi } from 'vitest';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { blocksConfig } from '@plone/volto/config/Blocks';
import installSlate from '@plone/volto-slate/index';

global.jest = vi;

// React Testing Library still checks the Jest-compatible timer API when
// Vitest fake timers are active.
global.jest = {
  ...global.jest,
  advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
};

// Mock the lazy-loading helper globally so core components loaded below (and
// the add-on components that import them) use the @plone/volto
// __mocks__/Loadable implementation. The real implementation dispatches
// thunks into redux-mock-store instances, which never update their state, so
// lazy-wrapped components would render null and leak unhandled rejections.
vi.mock('@plone/volto/helpers/Loadable/Loadable');

var mockSemanticComponents = await vi.importActual('semantic-ui-react');
var mockComponents = await vi.importActual('@plone/volto/components');
var mockRegistry = await vi.importActual('@plone/volto/registry');
var config = mockRegistry.default;

config.blocks.blocksConfig = {
  ...blocksConfig,
  ...config.blocks.blocksConfig,
};

vi.doMock('semantic-ui-react', () => ({
  __esModule: true,
  ...mockSemanticComponents,
  Popup: ({ content, trigger }) => {
    return (
      <div className="popup">
        <div className="trigger">{trigger}</div>
        <div className="content">{content}</div>
      </div>
    );
  },
}));

vi.doMock('@plone/volto/components', () => {
  return {
    __esModule: true,
    ...mockComponents,
    SidebarPortal: ({ children }) => <div id="sidebar">{children}</div>,
  };
});

vi.doMock('@plone/volto/registry', () => ({
  ...mockRegistry,
  default: [installSlate].reduce((acc, apply) => apply(acc), config),
}));

const mockStore = configureStore([thunk]);

global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  }),
);

global.store = mockStore({
  intl: {
    locale: 'en',
    messages: {},
    formatMessage: vi.fn(),
  },
  content: {
    create: {},
    subrequests: [],
  },
  connected_data_parameters: {},
  screen: {
    page: {
      width: 768,
    },
  },
});

await (await import('@plone/volto/helpers/Loadable/Loadable')).__setLoadables();
