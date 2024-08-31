/* eslint-disable prettier/prettier */
import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

const paramSchema = z.string()

type ParamSchema = z.infer<typeof paramSchema>

const measureTypeParamsSchema = z.string().optional()

const queryValidationPipe = new ZodValidationPipe(measureTypeParamsSchema)

type MeasureTypeParamsSchema = z.infer<typeof measureTypeParamsSchema>

@Controller('/:customerCode/list')
export class GetMeasureList {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(
    @Param('customerCode') customerCode: ParamSchema,
    @Query('measure_type', queryValidationPipe)
    // eslint-disable-next-line camelcase, prettier/prettier
    measure_type: MeasureTypeParamsSchema,
  ) {
      console.log(measure_type)

      const measures = await this.prisma.measure.findMany({
        where: {
          // eslint-disable-next-line camelcase
          measureType: measure_type,
          AND: {
            customerId: customerCode
          }
        },
        orderBy: {
          measureDatetime: 'desc',
        },
        select: {
          measureUuid: true,
          measureDatetime: true,
          measureType: true,
          hasConfirmed: true,
          imageUrl: true
        }
      })

      if (measures.length === 0) {
        throw new NotFoundException({
          error_code: "MEASURES_NOT_FOUND",
          error_description: "Nenhuma leitura encontrada"
         })
      }

      const { customerId } = await this.prisma.measure.findFirst({
        where: {
          // eslint-disable-next-line camelcase
          measureType: measure_type,
          AND: {
            customerId: customerCode
          }
        },
        select: {
          customerId: true
        }
      })
  
      return { customer_code: customerId, measures
    }
  }
}
