import type { UserRole } from '@resqsync/domain';
interface ConflictAdjudicationProps {
    userRole: UserRole;
    onResolved?: (winner: 'ALPHA' | 'BRAVO', notes: string) => void;
}
export declare function ConflictAdjudicationView({ userRole, onResolved }: ConflictAdjudicationProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ConflictAdjudicationView.d.ts.map