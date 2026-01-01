"use server";

import nodemailer from "nodemailer";
import twilio from "twilio";
import { jsPDF } from "jspdf";

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
};

// Twilio configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendEmailTransactions(
  to: string,
  transactions: any[],
  userName: string
) {
  try {
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      throw new Error("Email configuration not set in environment");
    }

    const transporter = nodemailer.createTransport(emailConfig);

    // Format transactions table
    const transactionRows = transactions
      .map(
        (t) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">KES ${t.cost.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.author?.name || "Unknown"}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(t.date || t.createdAt).toLocaleDateString()}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.comment || "-"}</td>
        </tr>
      `
      )
      .join("");

    const totalAmount = transactions.reduce((sum, t) => sum + t.cost, 0);

    const htmlContent = `
      <h2 style="color: #1e293b;">Budget Transaction Report</h2>
      <p>Hello ${userName},</p>
      <p>Here is your transaction summary:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #0f172a;">Item</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #0f172a;">Amount</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #0f172a;">Author</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #0f172a;">Date</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #0f172a;">Comment</th>
          </tr>
        </thead>
        <tbody>
          ${transactionRows}
        </tbody>
      </table>
      <h3 style="color: #10b981;">Total: KES ${totalAmount.toFixed(2)}</h3>
      <p style="color: #666;">This email was sent from your Budget & Personal Management app.</p>
    `;

    const result = await transporter.sendMail({
      from: emailConfig.auth.user,
      to,
      subject: `Budget Transaction Report - ${new Date().toLocaleDateString()}`,
      html: htmlContent,
    });

    return { success: true, message: "Email sent successfully", result };
  } catch (error: any) {
    console.error("Email error:", error);
    return { success: false, error: error.message };
  }
}

export async function sendSmsTransactions(
  phone: string,
  transactions: any[],
  userName: string
) {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio credentials not configured");
    }

    const totalAmount = transactions.reduce((sum, t) => sum + t.cost, 0);
    const itemCount = transactions.length;

    const message = `Hi ${userName}, Your Budget Summary: ${itemCount} items totaling KES ${totalAmount.toFixed(2)}. Download the full report from your dashboard. -BudgetApp`;

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return { success: true, message: "SMS sent successfully", result };
  } catch (error: any) {
    console.error("SMS error:", error);
    return { success: false, error: error.message };
  }
}

export async function generateTransactionsPDF(
  transactions: any[],
  userName: string
): Promise<string> {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    pdf.setFontSize(16);
    pdf.text("Budget Transaction Report", 10, yPosition);
    yPosition += 10;

    // User info
    pdf.setFontSize(10);
    pdf.text(`User: ${userName}`, 10, yPosition);
    yPosition += 5;
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 10, yPosition);
    yPosition += 10;

    // Table headers
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    const headers = ["Item", "Cost (KES)", "Author", "Date", "Comment"];
    const colWidths = [30, 30, 25, 25, 40];
    let xPosition = 10;

    headers.forEach((header, i) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += colWidths[i];
    });

    pdf.setFont("helvetica", "normal");
    yPosition += 5;

    // Table rows
    transactions.forEach((transaction) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }

      xPosition = 10;
      const cells = [
        transaction.name,
        transaction.cost.toFixed(2),
        transaction.author?.name || "Unknown",
        new Date(transaction.date || transaction.createdAt).toLocaleDateString(),
        transaction.comment || "-",
      ];

      cells.forEach((cell, i) => {
        const text = String(cell).substring(0, 15);
        pdf.text(text, xPosition, yPosition);
        xPosition += colWidths[i];
      });

      yPosition += 7;
    });

    // Total
    yPosition += 5;
    pdf.setFont("helvetica", "bold");
    const totalAmount = transactions.reduce((sum, t) => sum + t.cost, 0);
    pdf.text(
      `Total: KES ${totalAmount.toFixed(2)}`,
      10,
      yPosition
    );

    // Convert to base64 for transmission
    const pdfBase64 = pdf.output("dataurlstring").split(",")[1];
    return pdfBase64;
  } catch (error: any) {
    console.error("PDF generation error:", error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}
