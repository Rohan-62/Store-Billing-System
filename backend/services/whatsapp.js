const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");

class WhatsAppService {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      }
    });

    this.qrCode = null;
    this.status = "DISCONNECTED";

    this.client.on("qr", async (qr) => {
      this.qrCode = await qrcode.toDataURL(qr);
      this.status = "QR_READY";
      console.log("WhatsApp QR Code Ready");
    });

    this.client.on("ready", () => {
      this.status = "CONNECTED";
      this.qrCode = null;
      console.log("WhatsApp Client Ready");
    });

    this.client.on("authenticated", () => {
      this.status = "AUTHENTICATED";
    });

    this.client.on("auth_failure", () => {
      this.status = "AUTH_FAILURE";
    });

    this.client.on("disconnected", () => {
      this.status = "DISCONNECTED";
      this.qrCode = null;
    });
  }

  initialize() {
    this.client.initialize().catch(err => console.error("WA Init Error:", err));
  }

  async sendInvoice(mobile, billData) {
    if (this.status !== "CONNECTED") {
      throw new Error("WhatsApp client is not connected. Please scan the QR code in the application.");
    }

    // Format mobile number (ensure digits only)
    const cleanDigits = mobile.replace(/\D/g, "");
    if (!cleanDigits || cleanDigits.length < 5) {
      throw new Error("Invalid mobile number format. Please provide a valid number.");
    }

    let numberDetails = null;

    // Resolve registered number ID via WhatsApp Web API
    try {
      numberDetails = await this.client.getNumberId(cleanDigits);
      // If not found and it's a 10-digit number, try prepending India country code (91)
      if (!numberDetails && cleanDigits.length === 10) {
        numberDetails = await this.client.getNumberId(`91${cleanDigits}`);
      }
    } catch (err) {
      console.error("WA Number Resolution Error:", err.message);
    }

    if (!numberDetails) {
      throw new Error(`Number (${mobile}) is not registered on WhatsApp or is missing a valid country code.`);
    }

    const targetJid = numberDetails._serialized;
    console.log(`Attempting to send WA to resolved JID: ${targetJid}`);

    const message = `
*Modern Store - Invoice*
-------------------------
*Customer:* ${billData.customerName}
*Date:* ${new Date(billData.date).toLocaleDateString()}

*Items:*
${billData.products.map(p => `- ${p.name} (x${p.quantity}): $${(p.price * p.quantity).toFixed(2)}`).join("\n")}

-------------------------
*Subtotal:* $${billData.subtotal.toFixed(2)}
${billData.discount?.amount > 0 ? `*Discount:* -$${billData.discount.amount.toFixed(2)}` : ""}
*Total Payable: $${billData.total.toFixed(2)}*

Thank you for shopping with us!
    `.trim();

    await this.client.sendMessage(targetJid, message);
    return true;
  }

  getStatus() {
    return { status: this.status, qrCode: this.qrCode };
  }
}

module.exports = new WhatsAppService();
