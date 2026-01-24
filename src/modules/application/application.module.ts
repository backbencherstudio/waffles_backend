import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { ContactModule } from './contact/contact.module';
import { FaqModule } from './faq/faq.module';
import { EditorModule } from './editor/editor.module';
<<<<<<< HEAD
import { JobModule } from './client/job/job.module';
import { HireModule } from './client/hire/hire.module';

@Module({
  imports: [NotificationModule, ContactModule, FaqModule, EditorModule, JobModule, HireModule],
=======


@Module({
  imports: [NotificationModule, ContactModule, FaqModule, EditorModule],
>>>>>>> 7e23cc28a170bdcf828ac33fcc8a02abde0567ce
})
export class ApplicationModule {}
