import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

//file for utility nodemailer classes
@Injectable()
export class EmailService {
  constructor(private config: ConfigService) {}
  async createEmail(to: string, html: any, subject: string): Promise<void> {
    //nodemailer options

    try {
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        port: 465,
        secure: true,
        auth: {
          user: this.config.get<string>('GOOGLE_EMAIL_USER'),
          pass: this.config.get<string>('GOOGLE_EMAIL_PASS'),
        },
      });

      //email options
      const emailOptions = {
        from: this.config.get<string>('GOOGLE_EMAIL_USER'),
        to: to,
        html: html,
        subject: subject,
      };

      //send the email
      const info = await transporter.sendMail(emailOptions);
      console.log(`Message sent to ${info.messageId}`);
    } catch (error) {
      console.error(`There was an error sending email, ${error.message}`);
      throw new HttpException(
        'Email sending failed',
        HttpStatus.EXPECTATION_FAILED,
      );
    }
  }
}
