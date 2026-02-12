import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_SMTP_HOST,
	port: parseInt(process.env.EMAIL_SMTP_PORT || "465"),
	auth: {
		user: process.env.EMAIL_SMTP_USER,
		pass: process.env.EMAIL_SMTP_PASSWORD,
	},
	secure: process.env.NODE_ENV === "production",
});

async function send(mailOptions: MailOptions) {
	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		console.error("Erro ao enviar email:", error);
		console.error("Config SMTP:", {
			host: process.env.EMAIL_SMTP_HOST,
			port: process.env.EMAIL_SMTP_PORT,
			user: process.env.EMAIL_SMTP_USER,
			from: mailOptions.from,
			to: mailOptions.to,
		});
		throw error;
	}
}

type MailOptions = {
	from: string;
	to: string;
	subject: string;
	text: string;
	html?: string;
};

const email = {
	send,
};

export default email;
