// Follow deno lint rules
// deno-lint-ignore-file no-explicit-any

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { transactionId, notificationType } = await req.json();
    
    if (!transactionId || !notificationType) {
      throw new Error("Missing required parameters: transactionId and notificationType are required");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get transaction details
    const { data: transaction, error: transactionError } = await supabaseClient
      .from("payment_transactions")
      .select(`
        *,
        profiles (id, name, email)
      `)
      .eq("id", transactionId)
      .single();

    if (transactionError) {
      throw new Error(`Error fetching transaction: ${transactionError.message}`);
    }

    if (!transaction) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }

    // Prepare email content
    const emailContent = generateEmailContent(transaction, notificationType);
    
    // Log notification
    const { data: logData, error: logError } = await supabaseClient
      .from("notification_logs")
      .insert({
        user_id: transaction.user_id,
        notification_type: notificationType,
        email_to: transaction.profiles.email,
        subject: emailContent.subject,
        content: emailContent.textContent,
        sent_at: new Date().toISOString(),
        delivery_status: "sent"
      });

    if (logError) {
      console.error("Error logging notification:", logError);
    }

    // In a production environment, you would send the actual email here
    // This would typically use a service like SendGrid, Mailgun, etc.
    // For now, we'll just simulate success

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notification recorded successfully",
        notificationId: logData?.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing payment notification:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

function generateEmailContent(transaction: any, notificationType: string): { subject: string; textContent: string; htmlContent: string } {
  const baseUrl = Deno.env.get("FRONTEND_URL") ?? "https://sciencepapers.com";
  const { name } = transaction.profiles;
  const amount = transaction.amount.toLocaleString();
  
  switch (notificationType) {
    case "payment_received":
      return {
        subject: "Payment Received - Science Educational Program",
        textContent: `Dear ${name},\n\nWe have received your payment of Rs ${amount}. Your transaction ID is ${transaction.transaction_id}. Our team will verify your payment shortly and grant you access to the program.\n\nThank you for your patience.\n\nBest regards,\nScience Educational Program Team`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">Payment Received</h2>
            <p>Dear ${name},</p>
            <p>We have received your payment of <strong>Rs ${amount}</strong>.</p>
            <p>Transaction ID: <code>${transaction.transaction_id}</code></p>
            <p>Our team will verify your payment shortly and grant you access to the program.</p>
            <p>Thank you for your patience.</p>
            <p>Best regards,<br>Science Educational Program Team</p>
          </div>
        `
      };
    case "access_granted":
      return {
        subject: "Access Granted - Science Educational Program",
        textContent: `Dear ${name},\n\nYour payment of Rs ${amount} has been verified and access to the Science Educational Program has been granted. You can now log in to your account and access all features.\n\nThank you for joining us!\n\nBest regards,\nScience Educational Program Team`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #22c55e;">Access Granted!</h2>
            <p>Dear ${name},</p>
            <p>Your payment of <strong>Rs ${amount}</strong> has been verified and access to the Science Educational Program has been granted.</p>
            <p>You can now log in to your account and access all features.</p>
            <p><a href="${baseUrl}/login" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Log In Now</a></p>
            <p>Thank you for joining us!</p>
            <p>Best regards,<br>Science Educational Program Team</p>
          </div>
        `
      };
    case "access_denied":
      return {
        subject: "Payment Verification Issue - Science Educational Program",
        textContent: `Dear ${name},\n\nWe were unable to verify your payment of Rs ${amount}. Please contact our support team for assistance.\n\nBest regards,\nScience Educational Program Team`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">Payment Verification Issue</h2>
            <p>Dear ${name},</p>
            <p>We were unable to verify your payment of <strong>Rs ${amount}</strong>.</p>
            <p>Transaction ID: <code>${transaction.transaction_id}</code></p>
            <p>Please contact our support team for assistance.</p>
            <p>Best regards,<br>Science Educational Program Team</p>
          </div>
        `
      };
    case "payment_reminder":
      return {
        subject: "Payment Reminder - Science Educational Program",
        textContent: `Dear ${name},\n\nThis is a friendly reminder that your payment of Rs ${amount} is pending. Please complete your payment to gain access to the program.\n\nBest regards,\nScience Educational Program Team`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Payment Reminder</h2>
            <p>Dear ${name},</p>
            <p>This is a friendly reminder that your payment of <strong>Rs ${amount}</strong> is pending.</p>
            <p>Please complete your payment to gain access to the program.</p>
            <p><a href="${baseUrl}/payments" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Complete Payment</a></p>
            <p>Best regards,<br>Science Educational Program Team</p>
          </div>
        `
      };
    default:
      return {
        subject: "Update on Your Payment - Science Educational Program",
        textContent: `Dear ${name},\n\nThere has been an update regarding your payment of Rs ${amount}. Please log in to your account to view the details.\n\nBest regards,\nScience Educational Program Team`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">Payment Update</h2>
            <p>Dear ${name},</p>
            <p>There has been an update regarding your payment of <strong>Rs ${amount}</strong>.</p>
            <p>Please log in to your account to view the details.</p>
            <p><a href="${baseUrl}/login" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Log In</a></p>
            <p>Best regards,<br>Science Educational Program Team</p>
          </div>
        `
      };
  }
}