import { Controller, Post, Body } from '@nestjs/common';

@Controller('estimate')
export class CustomsController {
  @Post()
  estimate(@Body() b: any) {
    const goods = Math.max(0, Number(b?.goodsValueMinor || 0)); // بالسنت/القرش
    const weight = Math.max(0, Number(b?.weightKg || 0));
    const volume = Math.max(0, Number(b?.volumeM3 || 0));
    const duty = Math.round(goods * 0.05);               // 5% مثال
    const vat = Math.round((goods + duty) * 0.17);       // 17% مثال
    const freight = Math.round(weight * 200 + volume * 1000);
    const handling = 5000;                                // ثابتة (minor units)
    const insurance = Math.round(goods * 0.003);
    const total = duty + vat + freight + handling + insurance;
    return { input: b, breakdown: { duty, vat, freight, handling, insurance }, total, disclaimer: 'Indicative only — not binding.' };
  }
}
