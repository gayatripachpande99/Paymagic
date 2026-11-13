import { v4 as uuidv4 } from "uuid";
import { memoryStore } from "../config/db.js";

export const submitEnquiry = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      organization,
      portfolioSize = "₹10 Cr - ₹50 Cr",
      servicesRequested = "Voice Calling & Recovery",
      message
    } = req.body;

    if (!fullName || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, phone, and message are required."
      });
    }

    const newEnquiry = {
      id: `enq_${uuidv4()}`,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      organization: organization ? organization.trim() : "Confidential Institution",
      portfolio_size: portfolioSize,
      services_requested: servicesRequested,
      message: message.trim(),
      status: "NEW",
      created_at: new Date().toISOString()
    };

    memoryStore.enquiries.unshift(newEnquiry);

    return res.status(201).json({
      success: true,
      message: "Thank you for reaching out. A PayMagic enterprise solutions manager will contact you within 4 business hours.",
      enquiryId: newEnquiry.id
    });
  } catch (error) {
    console.error("Enquiry submission error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit enquiry. Please try again."
    });
  }
};

export const listEnquiries = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: memoryStore.enquiries.length,
      enquiries: memoryStore.enquiries
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries."
    });
  }
};

