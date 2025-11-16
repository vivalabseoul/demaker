import { supabase, getCurrentUserId } from './supabase';
import { PaymentInfo } from '../types/payment';

// 결제 정보 저장
export const savePaymentInfo = async (paymentInfo: Omit<PaymentInfo, 'id' | 'createdAt' | 'userId'>): Promise<string> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        order_id: paymentInfo.orderId,
        amount: paymentInfo.amount,
        goods_name: paymentInfo.goodsName,
        status: paymentInfo.status,
        buyer_name: paymentInfo.buyerName,
        buyer_email: paymentInfo.buyerEmail,
        buyer_tel: paymentInfo.buyerTel
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving payment info:', error);
      throw error;
    }

    return data.id;
  } catch (error: any) {
    console.error('❌ Error in savePaymentInfo:', error);
    throw error;
  }
};

// 결제 정보 업데이트
export const updatePaymentInfo = async (
  paymentId: string,
  updates: Partial<PaymentInfo>
): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    const updateData: any = {};
    
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt;
    if (updates.payMethod !== undefined) updateData.pay_method = updates.payMethod;
    if (updates.tid !== undefined) updateData.tid = updates.tid;
    
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error updating payment info:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('❌ Error in updatePaymentInfo:', error);
    throw error;
  }
};

// 사용자의 결제 내역 조회
export const getPaymentHistory = async (): Promise<PaymentInfo[]> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching payment history:', error);
      throw error;
    }

    return (data || []).map(payment => ({
      id: payment.id,
      userId: payment.user_id,
      orderId: payment.order_id,
      amount: payment.amount,
      goodsName: payment.goods_name,
      status: payment.status as 'pending' | 'completed' | 'failed' | 'cancelled',
      payMethod: payment.pay_method,
      tid: payment.tid,
      createdAt: payment.created_at,
      completedAt: payment.completed_at,
      buyerName: payment.buyer_name,
      buyerEmail: payment.buyer_email,
      buyerTel: payment.buyer_tel
    }));
  } catch (error: any) {
    console.error('❌ Error in getPaymentHistory:', error);
    throw error;
  }
};

// 특정 결제 정보 조회
export const getPaymentById = async (paymentId: string): Promise<PaymentInfo | null> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('❌ Error fetching payment by ID:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      orderId: data.order_id,
      amount: data.amount,
      goodsName: data.goods_name,
      status: data.status as 'pending' | 'completed' | 'failed' | 'cancelled',
      payMethod: data.pay_method,
      tid: data.tid,
      createdAt: data.created_at,
      completedAt: data.completed_at,
      buyerName: data.buyer_name,
      buyerEmail: data.buyer_email,
      buyerTel: data.buyer_tel
    };
  } catch (error: any) {
    console.error('❌ Error in getPaymentById:', error);
    throw error;
  }
};

// 주문번호로 결제 정보 조회
export const getPaymentByOrderId = async (orderId: string): Promise<PaymentInfo | null> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('❌ Error fetching payment by order ID:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      orderId: data.order_id,
      amount: data.amount,
      goodsName: data.goods_name,
      status: data.status as 'pending' | 'completed' | 'failed' | 'cancelled',
      payMethod: data.pay_method,
      tid: data.tid,
      createdAt: data.created_at,
      completedAt: data.completed_at,
      buyerName: data.buyer_name,
      buyerEmail: data.buyer_email,
      buyerTel: data.buyer_tel
    };
  } catch (error: any) {
    console.error('❌ Error in getPaymentByOrderId:', error);
    throw error;
  }
};

