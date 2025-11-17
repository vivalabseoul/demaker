import { supabase, getCurrentUserId } from './supabase';
import { Subscription, ProductId } from '../types/payment';

const BETA_FREE_LIMIT = 3;
const BETA_PERIOD_DAYS = 7;
const BETA_PERIOD_MS = BETA_PERIOD_DAYS * 24 * 60 * 60 * 1000;

export type QuotaBenefitType = 'beta' | 'subscription';

export interface BetaQuotaStatus {
  available: boolean;
  remaining: number;
  total: number;
  used: number;
  periodStart: string | null;
  resetAt: string | null;
}

export interface QuotaInfo {
  available: boolean;
  remaining: number;
  total: number;
  benefitType?: QuotaBenefitType;
  beta?: BetaQuotaStatus;
}

// 구독 정보 저장
export const saveSubscription = async (
  productId: ProductId,
  quota: number
): Promise<string> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  const startDate = new Date();
  const endDate = new Date();
  
  // 상품 기간에 따라 종료일 설정
  if (productId === 'premium') {
    // 연간 구독
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    // 월간 구독
    endDate.setMonth(endDate.getMonth() + 1);
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        product_id: productId,
        period: productId === 'premium' ? 'yearly' : 'monthly',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        quota,
        used_quota: 0,
        reissue_quota: 1,
        used_reissue_quota: 0,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving subscription:', error);
      throw error;
    }

    return data.id;
  } catch (error: any) {
    console.error('❌ Error in saveSubscription:', error);
    throw error;
  }
};

// 사용자의 활성 구독 조회
export const getActiveSubscription = async (): Promise<Subscription | null> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('❌ Error fetching active subscription:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    const now = new Date();
    const endDate = new Date(data.end_date);

    // 만료된 구독은 expired로 변경
    if (endDate < now) {
      await updateSubscriptionStatus(data.id, 'expired');
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      productId: data.product_id as ProductId,
      status: data.status as 'active' | 'expired' | 'cancelled',
      startDate: data.start_date,
      endDate: data.end_date,
      quota: data.quota,
      usedQuota: data.used_quota || 0,
      reissueQuota: data.reissue_quota ?? 1,
      usedReissueQuota: data.used_reissue_quota || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error: any) {
    console.error('❌ Error in getActiveSubscription:', error);
    return null;
  }
};

// 구독 상태 업데이트
export const updateSubscriptionStatus = async (
  subscriptionId: string,
  status: Subscription['status']
): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error updating subscription status:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('❌ Error in updateSubscriptionStatus:', error);
    throw error;
  }
};

// 사용 횟수 증가 (베타 무료 사용분 선차감)
export const incrementUsage = async (): Promise<boolean> => {
  const betaIncremented = await incrementBetaUsage();
  if (betaIncremented) {
    return true;
  }

  const subscription = await getActiveSubscription();
  if (!subscription) {
    return false; // 활성 구독이 없음
  }

  // 사용 가능한 횟수 확인
  if (subscription.usedQuota >= subscription.quota) {
    return false; // 사용 횟수 초과
  }

  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        used_quota: subscription.usedQuota + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (error) {
      console.error('❌ Error incrementing usage:', error);
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error('❌ Error in incrementUsage:', error);
    return false;
  }
};

// 베타 무료 사용량 상태 조회
export const getBetaQuotaStatus = async (): Promise<BetaQuotaStatus> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      available: false,
      remaining: 0,
      total: BETA_FREE_LIMIT,
      used: 0,
      periodStart: null,
      resetAt: null,
    };
  }

  const now = new Date();
  let used = 0;
  let periodStart: Date | null = null;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('beta_free_used, beta_period_started_at')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error fetching beta usage:', error);
    }

    used = data?.beta_free_used ?? 0;
    periodStart = data?.beta_period_started_at
      ? new Date(data.beta_period_started_at)
      : null;
  } catch (error: any) {
    console.error('❌ Error in getBetaQuotaStatus:', error);
  }

  if (!periodStart || now.getTime() - periodStart.getTime() >= BETA_PERIOD_MS) {
    periodStart = now;
    used = 0;
    await resetBetaUsage(userId, periodStart, used);
  }

  const remaining = Math.max(BETA_FREE_LIMIT - used, 0);
  const resetAt = periodStart
    ? new Date(periodStart.getTime() + BETA_PERIOD_MS)
    : null;

  return {
    available: remaining > 0,
    remaining,
    total: BETA_FREE_LIMIT,
    used,
    periodStart: periodStart?.toISOString() ?? null,
    resetAt: resetAt?.toISOString() ?? null,
  };
};

const resetBetaUsage = async (
  userId: string,
  periodStart: Date,
  used: number,
) => {
  try {
    await supabase
      .from('users')
      .update({
        beta_free_used: used,
        beta_period_started_at: periodStart.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  } catch (error) {
    console.error('❌ Error resetting beta usage:', error);
  }
};

const incrementBetaUsage = async (): Promise<boolean> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    return false;
  }

  const betaStatus = await getBetaQuotaStatus();
  if (!betaStatus.available) {
    return false;
  }

  const now = new Date();
  const periodStart = betaStatus.periodStart
    ? new Date(betaStatus.periodStart)
    : now;
  const nextUsed = Math.min(
    betaStatus.total,
    betaStatus.total - betaStatus.remaining + 1,
  );

  try {
    const { error } = await supabase
      .from('users')
      .update({
        beta_free_used: nextUsed,
        beta_period_started_at: periodStart.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('❌ Error incrementing beta usage:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error in incrementBetaUsage:', error);
    return false;
  }
};

// 사용 가능한 횟수 확인 (베타 무료 포함)
export const checkQuota = async (): Promise<QuotaInfo> => {
  const betaStatus = await getBetaQuotaStatus();
  if (betaStatus.available) {
    return {
      available: true,
      remaining: betaStatus.remaining,
      total: betaStatus.total,
      benefitType: 'beta',
      beta: betaStatus,
    };
  }

  const subscription = await getActiveSubscription();
  if (!subscription) {
    return {
      available: false,
      remaining: betaStatus.remaining,
      total: betaStatus.total,
      benefitType: undefined,
      beta: betaStatus,
    };
  }

  const remaining = subscription.quota - subscription.usedQuota;
  return {
    available: remaining > 0,
    remaining,
    total: subscription.quota,
    benefitType: 'subscription',
    beta: betaStatus,
  };
};

// 재발급 가능 여부 확인
export const checkReissueQuota = async (): Promise<{ available: boolean; remaining: number; total: number }> => {
  const subscription = await getActiveSubscription();
  if (!subscription) {
    return { available: false, remaining: 0, total: 0 };
  }

  const reissueQuota = subscription.reissueQuota ?? 1;
  const usedReissueQuota = subscription.usedReissueQuota ?? 0;
  const remaining = reissueQuota - usedReissueQuota;

  return {
    available: remaining > 0,
    remaining,
    total: reissueQuota,
  };
};

// 재발급 사용 (수정해서 재발급)
export const useReissue = async (): Promise<boolean> => {
  const subscription = await getActiveSubscription();
  if (!subscription) {
    return false; // 활성 구독이 없음
  }

  const reissueQuota = subscription.reissueQuota ?? 1;
  const usedReissueQuota = subscription.usedReissueQuota ?? 0;

  // 재발급 가능한 횟수 확인
  if (usedReissueQuota >= reissueQuota) {
    return false; // 재발급 횟수 초과
  }

  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        used_reissue_quota: usedReissueQuota + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (error) {
      console.error('❌ Error using reissue:', error);
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error('❌ Error in useReissue:', error);
    return false;
  }
};

// 사용자의 모든 구독 내역 조회
export const getSubscriptionHistory = async (): Promise<Subscription[]> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching subscription history:', error);
      throw error;
    }

    return (data || []).map(sub => ({
      id: sub.id,
      userId: sub.user_id,
      productId: sub.product_id as ProductId,
      status: sub.status as 'active' | 'expired' | 'cancelled',
      startDate: sub.start_date,
      endDate: sub.end_date,
      quota: sub.quota,
      usedQuota: sub.used_quota || 0,
      reissueQuota: sub.reissue_quota ?? 1,
      usedReissueQuota: sub.used_reissue_quota || 0,
      createdAt: sub.created_at,
      updatedAt: sub.updated_at
    }));
  } catch (error: any) {
    console.error('❌ Error in getSubscriptionHistory:', error);
    throw error;
  }
};

