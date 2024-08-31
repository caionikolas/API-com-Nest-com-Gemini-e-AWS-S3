import {
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Patch,
  UsePipes,
} from '@nestjs/common'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

const confirmMeasureSchema = z.object({
  measureUuid: z.string(),
  confirmValue: z.number(),
})

type ConfirmMeasureSchema = z.infer<typeof confirmMeasureSchema>

@Controller('/confirm')
export class ConfirmMeasure {
  constructor(private prisma: PrismaService) {}

  @Patch()
  @UsePipes(new ZodValidationPipe(confirmMeasureSchema))
  async handle(@Body() body: ConfirmMeasureSchema) {
    const { measureUuid, confirmValue } = confirmMeasureSchema.parse(body)

    const measureNotFound = await this.prisma.measure.findFirst({
      where: {
        measureUuid,
      },
    })

    if (!measureNotFound) {
      throw new NotFoundException({
        error_code: 'MEASURE_NOT_FOUND',
        error_description: 'Leitura não encontrada',
      })
    }

    const confirmValueIsTrue = await this.prisma.measure.findFirst({
      where: {
        measureUuid,
        AND: {
          hasConfirmed: true,
        },
      },
    })

    if (confirmValueIsTrue) {
      throw new ConflictException({
        error_code: 'CONFIRMATION_DUPLICATE',
        error_description: 'Leitura do mês já realizada',
      })
    }

    await this.prisma.measure.update({
      where: {
        measureUuid,
      },
      data: {
        hasConfirmed: true,
        measureValue: confirmValue,
      },
    })

    return { success: true }
  }
}
