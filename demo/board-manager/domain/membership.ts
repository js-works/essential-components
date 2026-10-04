export { ROLES };
export type { Membership, Role };

const ROLES = ['Chair', 'Vice chair', 'Secretary', 'Member'] as const;

type Role = (typeof ROLES)[number];

type Membership = { id: string; boardId: string; personId: string; role: Role; since: string };
