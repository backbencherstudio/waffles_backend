import { Module } from '@nestjs/common';
import { StripeModule } from './stripe/stripe.module';
import { WithdrawModule } from './withdraw/withdraw.module';

@Module({
  imports: [StripeModule, WithdrawModule],
})
export class PaymentModule {}
