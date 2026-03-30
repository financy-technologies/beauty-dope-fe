import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/integrations/api/client';
import { useAuth } from '@/hooks/auth/useAuth';

export type TransactionType =
  | 'signup'
  | 'skin_quiz'
  | 'review'
  | 'favorite'
  | 'redemption'
  | 'admin_grant';

export type RewardType = 'discount' | 'badge' | 'feature_access';
export type RedemptionStatus = 'active' | 'used' | 'expired';

export interface PointTransaction {
  id: string;
  userId: string;
  points: number;
  type: TransactionType;
  description: string;
  referenceId: string | null;
  createdAt: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  type: RewardType;
  discountPercent: number | null;
  badgeLabel: string | null;
  icon: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface RewardRedemption {
  id: string;
  userId: string;
  reward: Reward;
  pointsSpent: number;
  redemptionCode: string | null;
  status: RedemptionStatus;
  expiresAt: string | null;
  createdAt: string;
}

export interface PointsBalance {
  points: number;
  pointsEarnedTotal: number;
}

export interface PointsHistoryResponse {
  transactions: PointTransaction[];
  total: number;
  page: number;
  limit: number;
}

export function useMyPoints() {
  const { user } = useAuth();
  return useQuery<PointsBalance>({
    queryKey: ['rewards', 'points'],
    queryFn: () => api.get<PointsBalance>('/rewards/my-points'),
    enabled: !!user,
  });
}

export function usePointsHistory(page = 1) {
  const { user } = useAuth();
  return useQuery<PointsHistoryResponse>({
    queryKey: ['rewards', 'history', page],
    queryFn: () => api.get<PointsHistoryResponse>(`/rewards/history?page=${page}&limit=20`),
    enabled: !!user,
  });
}

export function useAvailableRewards() {
  return useQuery<Reward[]>({
    queryKey: ['rewards', 'available'],
    queryFn: () => api.get<Reward[]>('/rewards'),
  });
}

export function useMyRedemptions() {
  const { user } = useAuth();
  return useQuery<RewardRedemption[]>({
    queryKey: ['rewards', 'redemptions'],
    queryFn: () => api.get<RewardRedemption[]>('/rewards/my-redemptions'),
    enabled: !!user,
  });
}

export function useRedeemReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rewardId: string) =>
      api.post<RewardRedemption>(`/rewards/redeem/${rewardId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rewards', 'points'] });
      qc.invalidateQueries({ queryKey: ['rewards', 'history'] });
      qc.invalidateQueries({ queryKey: ['rewards', 'redemptions'] });
      qc.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });
}
