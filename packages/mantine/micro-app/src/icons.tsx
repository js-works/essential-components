export { ArrowRightIcon, MaximizeIcon, MinimizeIcon, PencilIcon, PlusIcon, TrashIcon };

// Tabler icons (MIT), drawn in `currentColor`.
function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const ArrowRightIcon = () => (
  <Icon>
    <path d="M5 12l14 0" />
    <path d="M13 18l6 -6" />
    <path d="M13 6l6 6" />
  </Icon>
);

const PlusIcon = () => (
  <Icon>
    <path d="M12 5l0 14" />
    <path d="M5 12l14 0" />
  </Icon>
);

const PencilIcon = () => (
  <Icon>
    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
    <path d="M13.5 6.5l4 4" />
  </Icon>
);

const TrashIcon = () => (
  <Icon>
    <path d="M4 7l16 0" />
    <path d="M10 11l0 6" />
    <path d="M14 11l0 6" />
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
  </Icon>
);

const MaximizeIcon = () => (
  <Icon>
    <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
    <path d="M4 16v2a2 2 0 0 0 2 2h2" />
    <path d="M16 4h2a2 2 0 0 1 2 2v2" />
    <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
  </Icon>
);

const MinimizeIcon = () => (
  <Icon>
    <path d="M15 19v-2a2 2 0 0 1 2 -2h2" />
    <path d="M15 5v2a2 2 0 0 0 2 2h2" />
    <path d="M5 15h2a2 2 0 0 1 2 2v2" />
    <path d="M5 9h2a2 2 0 0 0 2 -2v-2" />
  </Icon>
);
