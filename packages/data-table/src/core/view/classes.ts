// The class names of the stylesheet (`DataTable.css`): fixed BEM names, the block `data-table` (the root) and its
// elements `data-table__…`. A name that builds on another one (a data row is a row) carries both.
export {
  adapterContent,
  applyButton,
  autocompleteList,
  autocompletePopup,
  autocompleteStatus,
  blocker,
  button,
  buttonIcon,
  buttonLabel,
  card,
  cardActions,
  cardBar,
  cardDetail,
  cardGroup,
  cardLabel,
  cards,
  cardSelect,
  cardsEmpty,
  cardValue,
  cell,
  cellText,
  check,
  chevron,
  chip,
  chipMore,
  chipRemove,
  chipsField,
  chipsInput,
  chipsText,
  chipText,
  clearButton,
  content,
  dataRow,
  datePopup,
  dateRange,
  dateRangeFooter,
  detailCell,
  detailRow,
  detailToggle,
  dimmed,
  dragHandle,
  editControl,
  editError,
  editField,
  editFields,
  editFooter,
  editForm,
  editFormCell,
  editFormClip,
  editLabel,
  emptyCell,
  field,
  fieldEnd,
  fieldIcon,
  fieldToggle,
  filterBadge,
  filterButtonGroup,
  filterPanelControl,
  filterPanelDot,
  filterPanelFooter,
  filterPanelLabel,
  filterPanelRow,
  filterPill,
  filterPillDots,
  filterPillLabel,
  filterPillMain,
  filterPillMore,
  filterPillRemove,
  filterPills,
  filterPillText,
  filterPillValue,
  filterRange,
  filterSidebar,
  filterSidebarBody,
  filterSidebarHeader,
  filterSidebarIcon,
  filterSidebarRow,
  filterSidebarTitle,
  filterView,
  filterViewBody,
  filterViewColumns,
  filterViewNose,
  footer,
  footerSide,
  groupCell,
  groupCount,
  groupHeader,
  groupLabel,
  groupRow,
  groupTitle,
  groupToggle,
  header,
  headerFiller,
  headerRow,
  headerSub,
  headerTall,
  headerText,
  iconButton,
  input,
  layer,
  listField,
  liveRegion,
  loadingBar,
  menuGroup,
  menuGroupLabel,
  menuIcon,
  menuItem,
  menuSeparator,
  menuText,
  menuWithIcons,
  overlay,
  pageButton,
  pager,
  pagerButton,
  pagerCompact,
  pagerGap,
  pagerNumbers,
  pageSizeButton,
  pageSizeItem,
  pendingSpinner,
  pill,
  pillIcon,
  popup,
  popupPositioner,
  prefixedField,
  prefixSelect,
  resizer,
  root,
  row,
  rowActions,
  scrollArea,
  scroller,
  searchField,
  segment,
  segmented,
  select,
  selectCheck,
  selectionCount,
  selectionPill,
  selectItem,
  selectText,
  sortButton,
  stack,
  submenuChevron,
  subtitle,
  table,
  tableArea,
  textButton,
  title,
  titleTotal,
  toolbar,
  toolbarActions,
  toolbarBar,
  toolbarDivider,
  toolbarGroup,
  toolbarHeading,
  toolbarPinned,
  toolbarReload,
  toolbarSpacer,
  tooltip,
  tooltipPositioner,
  unsortedIcon,
};

const adapterContent = 'data-table__adapter-content';
const applyButton = 'data-table__apply-button';
const autocompleteList = 'data-table__autocomplete-list';
const autocompletePopup = 'data-table__autocomplete-popup';
const autocompleteStatus = 'data-table__autocomplete-status';
const blocker = 'data-table__blocker';
const button = 'data-table__button';
const buttonIcon = 'data-table__button-icon';
const buttonLabel = 'data-table__button-label';
const card = 'data-table__card';
const cardActions = 'data-table__card-actions data-table__row-actions';
const cardBar = 'data-table__card-bar';
const cardDetail = 'data-table__card-detail';
const cardGroup = 'data-table__card-group';
const cardLabel = 'data-table__card-label';
const cards = 'data-table__cards';
const cardsEmpty = 'data-table__cards-empty';
const cardSelect = 'data-table__card-select';
const cardValue = 'data-table__card-value';
const cell = 'data-table__cell';
const cellText = 'data-table__cell-text';
const check = 'data-table__check';
const chip = 'data-table__chip';
const chipMore = 'data-table__chip-more';
const chipRemove = 'data-table__chip-remove';
const chipsField = 'data-table__chips-field';
const chipsInput = 'data-table__chips-input';
const chipsText = 'data-table__chips-text';
const chipText = 'data-table__chip-text';
const chevron = 'data-table__chevron';
const clearButton = 'data-table__clear-button';
const content = 'data-table__content';
const dataRow = 'data-table__data-row data-table__row';
const datePopup = 'data-table__date-popup';
const dateRange = 'data-table__date-range';
const dateRangeFooter = 'data-table__date-range-footer';
const detailCell = 'data-table__detail-cell data-table__cell';
const detailRow = 'data-table__detail-row data-table__row';
const detailToggle = 'data-table__detail-toggle data-table__icon-button';
const dimmed = 'data-table__dimmed';
const dragHandle = 'data-table__drag-handle data-table__icon-button';
const editControl = 'data-table__edit-control';
const editError = 'data-table__edit-error';
const editField = 'data-table__edit-field';
const editFields = 'data-table__edit-fields';
const editFooter = 'data-table__edit-footer';
const editForm = 'data-table__edit-form';
const editFormCell = 'data-table__edit-form-cell data-table__cell';
const editFormClip = 'data-table__edit-form-clip';
const editLabel = 'data-table__edit-label';
const emptyCell = 'data-table__empty-cell data-table__cell';
const field = 'data-table__field';
const fieldEnd = 'data-table__field-end';
const fieldIcon = 'data-table__field-icon';
const fieldToggle = 'data-table__field-toggle';
const filterBadge = 'data-table__filter-badge';
const filterButtonGroup = 'data-table__filter-button-group';
const filterSidebar = 'data-table__filter-sidebar';
const filterSidebarBody = 'data-table__filter-sidebar-body';
const filterSidebarHeader = 'data-table__filter-sidebar-header';
const filterSidebarIcon = 'data-table__filter-sidebar-icon';
const filterSidebarRow = 'data-table__filter-sidebar-row';
const filterSidebarTitle = 'data-table__filter-sidebar-title';
const filterView = 'data-table__filter-view';
const filterViewBody = 'data-table__filter-view-body';
const filterViewColumns = 'data-table__filter-view-columns';
const filterViewNose = 'data-table__filter-view-nose';
const filterPanelControl = 'data-table__filter-panel-control';
const filterPanelDot = 'data-table__filter-panel-dot';
const filterPanelFooter = 'data-table__filter-panel-footer';
const filterPanelLabel = 'data-table__filter-panel-label';
const filterPanelRow = 'data-table__filter-panel-row';
const filterPill = 'data-table__filter-pill';
const filterPillDots = 'data-table__filter-pill-dots';
const filterPillLabel = 'data-table__filter-pill-label';
const filterPillMain = 'data-table__filter-pill-main';
const filterPillMore = 'data-table__filter-pill-more';
const filterPillRemove = 'data-table__filter-pill-remove';
const filterPillText = 'data-table__filter-pill-text';
const filterPillValue = 'data-table__filter-pill-value';
const filterPills = 'data-table__filter-pills';
const filterRange = 'data-table__filter-range';
const footer = 'data-table__footer';
const footerSide = 'data-table__footer-side';
const groupCell = 'data-table__group-cell data-table__cell';
const groupCount = 'data-table__group-count';
const groupHeader = 'data-table__group-header data-table__header data-table__cell';
const groupLabel = 'data-table__group-label';
const groupRow = 'data-table__group-row data-table__row';
const groupTitle = 'data-table__group-title';
const groupToggle = 'data-table__group-toggle';
const header = 'data-table__header data-table__cell';
const headerFiller = 'data-table__header-filler data-table__header data-table__cell';
const headerRow = 'data-table__header-row';
const headerSub = 'data-table__header-sub data-table__header data-table__cell';
const headerTall = 'data-table__header-tall data-table__header data-table__cell';
const headerText = 'data-table__header-text';
const iconButton = 'data-table__icon-button';
const input = 'data-table__input';
const layer = 'data-table__layer';
const listField = 'data-table__list-field';
const liveRegion = 'data-table__live-region';
const menuGroup = 'data-table__menu-group';
const menuGroupLabel = 'data-table__menu-group-label';
const menuIcon = 'data-table__menu-icon';
const menuItem = 'data-table__menu-item';
const menuSeparator = 'data-table__menu-separator';
const menuText = 'data-table__menu-text';
const menuWithIcons = 'data-table__menu-with-icons';
const overlay = 'data-table__overlay';
const pageButton = 'data-table__page-button data-table__icon-button';
const pageSizeButton = 'data-table__page-size-button';
const pendingSpinner = 'data-table__pending-spinner';
const pageSizeItem = 'data-table__page-size-item';
const pager = 'data-table__pager';
const pagerButton = 'data-table__pager-button';
const pagerCompact = 'data-table__pager-compact';
const pagerGap = 'data-table__pager-gap';
const pagerNumbers = 'data-table__pager-numbers';
const pill = 'data-table__pill';
const pillIcon = 'data-table__pill-icon';
const popup = 'data-table__popup';
const prefixedField = 'data-table__prefixed-field';
const prefixSelect = 'data-table__prefix-select';
const popupPositioner = 'data-table__popup-positioner';
const resizer = 'data-table__resizer';
const root = 'data-table';
const row = 'data-table__row';
const rowActions = 'data-table__row-actions';
const scrollArea = 'data-table__scroll-area';
const scroller = 'data-table__scroller';
const searchField = 'data-table__search-field';
const segment = 'data-table__segment';
const segmented = 'data-table__segmented';
const select = 'data-table__select';
const selectCheck = 'data-table__select-check';
const selectItem = 'data-table__select-item';
const selectText = 'data-table__select-text';
const selectionCount = 'data-table__selection-count';
const selectionPill = 'data-table__selection-pill';
const sortButton = 'data-table__sort-button';
const stack = 'data-table__stack';
const loadingBar = 'data-table__loading-bar';
const submenuChevron = 'data-table__submenu-chevron';
const subtitle = 'data-table__subtitle';
const table = 'data-table__table';
const tableArea = 'data-table__table-area';
const textButton = 'data-table__text-button';
const title = 'data-table__title';
const titleTotal = 'data-table__title-total';
const toolbar = 'data-table__toolbar';
const toolbarActions = 'data-table__toolbar-actions';
const toolbarBar = 'data-table__toolbar-bar';
const toolbarDivider = 'data-table__toolbar-divider';
const toolbarGroup = 'data-table__toolbar-group';
const toolbarHeading = 'data-table__toolbar-heading';
const toolbarPinned = 'data-table__toolbar-pinned data-table__toolbar-actions';
const toolbarReload = 'data-table__toolbar-reload';
const toolbarSpacer = 'data-table__toolbar-spacer';
const tooltip = 'data-table__tooltip';
const tooltipPositioner = 'data-table__tooltip-positioner';
const unsortedIcon = 'data-table__unsorted-icon';
