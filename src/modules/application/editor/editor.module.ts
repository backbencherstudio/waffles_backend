import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';
import { BidsModule } from './bids/bids.module';


@Module({

  imports: [ProfileModule, BidsModule]
})
export class EditorModule {}
