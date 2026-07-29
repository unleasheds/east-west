import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { PackageTranslation } from '../packages/entities/package.entity';

/** Source content handed to the model. Mirrors the translatable package fields. */
export interface TranslatableContent {
  title?: string;
  location?: string;
  duration?: string;
  description?: string;
  highlights?: string[];
  itinerary?: { day: number; title: string; activities: string[] }[];
  included?: string[];
  excluded?: string[];
}

const LOCALE_NAMES: Record<string, string> = {
  ms: 'Malay (Bahasa Melayu, as written in Malaysia)',
  ar: 'Arabic (Modern Standard Arabic, as used in the Gulf)',
};

/**
 * JSON Schema for the model's reply.
 *
 * Structured outputs require every object to declare `required` and
 * `additionalProperties: false`, so each field is listed explicitly. That is
 * also what makes the response safe to persist without defensive parsing.
 */
const TRANSLATION_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    location: { type: 'string' },
    duration: { type: 'string' },
    description: { type: 'string' },
    highlights: { type: 'array', items: { type: 'string' } },
    included: { type: 'array', items: { type: 'string' } },
    excluded: { type: 'array', items: { type: 'string' } },
    itinerary: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day: { type: 'integer' },
          title: { type: 'string' },
          activities: { type: 'array', items: { type: 'string' } },
        },
        required: ['day', 'title', 'activities'],
        additionalProperties: false,
      },
    },
  },
  required: [
    'title',
    'location',
    'duration',
    'description',
    'highlights',
    'included',
    'excluded',
    'itinerary',
  ],
  additionalProperties: false,
} as const;

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private client: Anthropic | null = null;

  /**
   * Built lazily so the server still boots without a key — translation is an
   * optional convenience, not a startup dependency.
   */
  private getClient(): Anthropic {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new ServiceUnavailableException(
        'Auto-translate is not configured. Set ANTHROPIC_API_KEY on the API service.',
      );
    }
    this.client ??= new Anthropic();
    return this.client;
  }

  /**
   * Translates one package's customer-facing copy into a target locale.
   *
   * The result is a *draft* for an admin to review before saving — marketing
   * copy carries brand voice, so it is deliberately not written straight to the
   * database.
   */
  async translatePackage(
    content: TranslatableContent,
    locale: string,
  ): Promise<PackageTranslation> {
    const language = LOCALE_NAMES[locale];
    if (!language) {
      throw new ServiceUnavailableException(`Unsupported translation locale '${locale}'`);
    }

    const client = this.getClient();

    // Streaming: a ten-day itinerary plus a long description can run well past
    // the point where a non-streaming request risks an HTTP timeout.
    const message = await this.request(client, content, language, locale);

    if (message.stop_reason === 'refusal') {
      throw new ServiceUnavailableException('The translation request was declined.');
    }

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    try {
      return JSON.parse(text) as PackageTranslation;
    } catch {
      this.logger.error(`Unparseable translation payload for locale '${locale}'`);
      throw new ServiceUnavailableException('The translation response could not be read.');
    }
  }

  private async request(
    client: Anthropic,
    content: TranslatableContent,
    language: string,
    locale: string,
  ): Promise<Anthropic.Message> {
    const stream = client.messages.stream({
      model: 'claude-opus-5',
      max_tokens: 32000,
      system: [
        `You translate halal travel marketing copy from English into ${language}.`,
        '',
        'Rules:',
        `- Translate meaning and tone, not word for word. This is customer-facing marketing copy: keep it warm, natural and idiomatic in ${language}.`,
        '- Preserve any HTML markup exactly (tags, attributes and nesting). Translate only the visible text between tags.',
        '- Keep proper nouns untranslated: place names, island names, resort names, and the brand name "EastWest Halal Travel".',
        '- Keep numbers, prices, currency symbols and durations in their original numeric form.',
        '- Keep Islamic terminology in the form Muslim travellers expect in the target language (e.g. halal, iftar, suhoor).',
        '- Preserve the itinerary day numbers exactly as given.',
        '- Return the same number of list items as the input, in the same order.',
        '- If an input field is empty, return an empty string or empty array for it.',
      ].join('\n'),
      messages: [
        {
          role: 'user',
          content: `Translate this holiday package into ${language}:\n\n${JSON.stringify(content, null, 2)}`,
        },
      ],
      output_config: {
        format: { type: 'json_schema', schema: TRANSLATION_SCHEMA },
      },
    });

    try {
      return await stream.finalMessage();
    } catch (error) {
      // Surface the upstream reason verbatim — "credit balance is too low" and
      // "invalid API key" need completely different fixes, and a generic
      // "translation failed" would send an admin looking in the wrong place.
      if (error instanceof Anthropic.APIError) {
        this.logger.error(`Anthropic API error (${locale}): ${error.message}`);
        throw new ServiceUnavailableException(
          `Translation provider error: ${error.message}`,
        );
      }
      throw error;
    }
  }
}
