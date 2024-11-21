/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import * as ejs from 'ejs';
import { join } from 'path';

@Injectable()
export class EjsService {
  constructor() {}

  //   method for sending emails to successfully registered users
  async registerEmail(emailPayload: {
    firstName: string;
    homePageLink: string;
  }): Promise<any> {
    const emailBody = {
      firstName: emailPayload.firstName,
      homePageLink: emailPayload.homePageLink,
    };
    try {
      //create the ejs file send logic
      return await ejs.renderFile(
        join(__dirname, 'views/register.ejs'),
        emailBody,
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
