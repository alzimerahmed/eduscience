import { supabase } from '../lib/supabaseClient';

export interface PaymentMethod {
  id: string;
  method_name: string;
  is_active: boolean;
  configuration: Record<string, any>;
  instructions: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  period: string;
  price_lkr: number;
  description?: string;
}

export interface PaymentTransaction {
  id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'paid' | 'verified' | 'failed';
  payment_proof_url?: string;
  admin_notes?: string;
  created_at: string;
  verified_at?: string;
}

export interface AccessRequest {
  id: string;
  status: 'pending' | 'approved' | 'denied';
  requested_role: string;
  created_at: string;
  approved_at?: string;
}

export const paymentService = {
  /**
   * Get all active payment methods
   */
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  /**
   * Get all subscription plans
   */
  getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_lkr', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  },

  /**
   * Get payment transactions for a user
   */
  getUserTransactions: async (userId: string): Promise<PaymentTransaction[]> => {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      throw error;
    }
  },

  /**
   * Create a new payment transaction
   */
  createTransaction: async (userId: string, amount: number, paymentMethod: string, details?: any): Promise<PaymentTransaction> => {
    try {
      // Generate a transaction ID
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          transaction_id: transactionId,
          amount,
          currency: 'LKR',
          payment_method: paymentMethod,
          status: 'pending',
          payment_details: details || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw error;
    }
  },

  /**
   * Upload payment proof for a transaction
   */
  uploadPaymentProof: async (transactionId: string, file: File): Promise<string> => {
    try {
      // First upload the file
      const fileExt = file.name.split('.').pop();
      const fileName = `payment-proofs/${transactionId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);
      
      // Update the transaction
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({ 
          payment_proof_url: publicUrl,
          status: 'paid'
        })
        .eq('id', transactionId);
      
      if (updateError) throw updateError;
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      throw error;
    }
  },

  /**
   * Create an access request
   */
  createAccessRequest: async (userId: string, transactionId: string, requestedRole: string, institutionName?: string, contactNumber?: string, additionalInfo?: any): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from('access_requests')
        .insert({
          user_id: userId,
          payment_transaction_id: transactionId,
          requested_role: requestedRole,
          institution_name: institutionName,
          contact_number: contactNumber,
          additional_info: additionalInfo,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Try to send a notification
      try {
        await supabase.functions.invoke('payment-notification', {
          body: { 
            transactionId, 
            notificationType: 'payment_received'
          }
        });
      } catch (notifyError) {
        console.error('Error sending payment notification:', notifyError);
        // Continue even if notification fails
      }
      
      return data;
    } catch (error) {
      console.error('Error creating access request:', error);
      throw error;
    }
  },

  /**
   * Get user access requests
   */
  getUserAccessRequests: async (userId: string): Promise<AccessRequest[]> => {
    try {
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching access requests:', error);
      throw error;
    }
  }
};

export default paymentService;