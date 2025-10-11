import { Resend } from 'resend';
import { FormEmail } from '../../../email/emails/form-mail';
import { EMAIL_RECIPIENTS, EMAIL_SENDER } from '../../../constants';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    senderName: string;
    type: string;
    data: Record<string, any>;
    imageUrls: string[];
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};


export async function OPTIONS(request: Request) {
    console.log('📧 OPTIONS request received');
    return new Response(null, {
        status: 200,
        headers: corsHeaders,
    });
}

export async function POST(request: Request) {
    console.log('📧 Email API called - POST request received');
    const { senderName, type, data, imageUrls } = await request.json() as SendEmailParams;
    console.log('📧 Email data:', { senderName, type, data, imageUrls });
    const result = await sendEmail({ senderName, type, data, imageUrls });
    console.log('📧 Email result:', result);

    return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
    });
}

async function sendEmail({ senderName, type, data, imageUrls }: SendEmailParams) {
    try {
        const { data: emailData, error } = await resend.emails.send({
            from: EMAIL_SENDER,
            to: EMAIL_RECIPIENTS,
            subject: ` ${type} - ${senderName}`,
            react: FormEmail({
                senderName,
                type,
                data,
            }),
            attachments: imageUrls.map((url) => ({
                path: url,
                filename: url.split('/').pop() || 'image.jpg',
            })),
        });

        if (error) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message };
        }

        console.log('Email sent successfully:', emailData);
        return { success: true, data: emailData };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: 'Failed to send email' };
    }
}