import {
  Body,
  ConflictException,
  Controller,
  Post,
  UsePipes,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import 'dotenv'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { ConfigService } from '@nestjs/config'
import { Env } from 'src/env'
import * as fs from 'fs'
import { UploadService } from 'src/s3/upload-client'

const uploadMeasureSchema = z.object({
  image: z.string().base64(),
  customerId: z.string(),
  measureDatetime: z.coerce.string(),
  measureType: z.enum(['WATER', 'GAS']),
})

type UploadMeasureSchema = z.infer<typeof uploadMeasureSchema>

@Controller('/upload')
export class UploadMeasure {
  private readonly genAI = new GoogleGenerativeAI(
    this.configService.get('GEMINI_API_KEY'),
  )

  private readonly model = this.genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  })

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService<Env, true>,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(uploadMeasureSchema))
  async handle(@Body() body: UploadMeasureSchema) {
    const { image, customerId, measureDatetime, measureType } =
      uploadMeasureSchema.parse(body)

    // upload image s3
    const originalName = 'medidor.png'
    const urlBucket = 'https://upload-shopper.s3.us-east-2.amazonaws.com/'
    const base64Data = image.replace(/^data:image\/png;base64,/, '')
    const buff = Buffer.from(base64Data, 'base64')
    fs.writeFileSync(originalName, buff)

    await this.uploadService.upload(originalName, buff)

    fs.unlinkSync(originalName)

    const url = urlBucket + originalName
    //

    const hasCustomer = await this.prisma.customer.findUnique({
      where: {
        customerCode: customerId,
      },
    })

    if (!hasCustomer) {
      await this.prisma.customer.create({
        data: {
          customerCode: customerId,
        },
      })
    }

    function fileToGenerativePart(path, mimeType) {
      return {
        inlineData: {
          data: path,
          mimeType,
        },
      }
    }

    const prompt =
      'Descreva o valor no medidor e escreva somente numeros sem textos ou unidades de medidas.'

    const imagePart = fileToGenerativePart(image, 'image/jpeg')
    const result = await this.model.generateContent([prompt, imagePart])
    const measureValueWithoutValidation = Number(result.response.text())

    const measureAlreadyDone = await this.prisma.measure.findFirst({
      where: {
        measureDatetime,
        AND: {
          customerId,
          AND: {
            measureType,
          },
        },
      },
    })

    if (measureAlreadyDone) {
      throw new ConflictException({
        error_code: 'DOUBLE_REPORT',
        error_description: 'Leitura do mês já realizada',
      })
    }

    await this.prisma.measure.create({
      data: {
        measureDatetime,
        measureType,
        measureValue: measureValueWithoutValidation,
        imageUrl: url,
        customerId,
      },
    })

    const measure = await this.prisma.measure.findFirst({
      where: {
        imageUrl: url,
      },
      select: {
        imageUrl: true,
        measureValue: true,
        measureUuid: true,
      },
    })

    const { imageUrl, measureUuid, measureValue } = measure

    return { imageUrl, measureUuid, measureValue }
  }
}
