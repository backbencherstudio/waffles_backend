import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { ContactModule } from './contact/contact.module';
import { FaqModule } from './faq/faq.module';
import { EditorModule } from './editor/editor.module';
import { JobModule } from './client/job/job.module';

@Module({
  imports: [NotificationModule, ContactModule, FaqModule, EditorModule, JobModule],
})
export class ApplicationModule {}
