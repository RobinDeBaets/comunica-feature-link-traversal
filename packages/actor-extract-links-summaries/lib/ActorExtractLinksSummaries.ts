import type { IActionExtractLinks, IActorExtractLinksOutput } from '@comunica/bus-extract-links';
import { ActorExtractLinks } from '@comunica/bus-extract-links';
import type { MediatorHttp } from '@comunica/bus-http';
import { KeysInitQuery } from '@comunica/context-entries';
import type { IActorTest, IActorArgs } from '@comunica/core';
import type { ISourceInfo } from '@comunica/summaries-lib';
import {
  extractPatternsFromQuery,
  getDiscoverableSources,
  loadSummaries,
  patternToStrings, PREFIX,
  quadsToSummaries,
} from '@comunica/summaries-lib';
import type { BaseQuad } from '@rdfjs/types/data-model';
import type { Algebra } from 'sparqlalgebrajs';

/**
 * A comunica Extract Summaries Actor.
 */
export class ActorExtractLinksSummaries extends ActorExtractLinks {
  public readonly mediatorHttp: MediatorHttp;

  public constructor(args: IActorActorExtractLinksSummariesArgs) {
    super(args);
  }

  public async test(action: IActionExtractLinks): Promise<IActorTest> {
    return true;
  }

  public async run(action: IActionExtractLinks): Promise<IActorExtractLinksOutput> {
    const queryString: string = action.context.get(KeysInitQuery.queryString)!;
    const query: Algebra.Operation = action.context.get(KeysInitQuery.query)!;
    const patterns: Algebra.Pattern[] = extractPatternsFromQuery(query, queryString);
    const patternStrings = patterns.map(patternToStrings);

    const summaryQuads: BaseQuad[] = [];

    await ActorExtractLinks.collectStream(action.metadata, (quad, _) => {
      const subject = quad.subject.value;
      const predicate = quad.predicate.value;
      const object = quad.object.value;
      if (predicate.startsWith(PREFIX)) {
        this.logDebug(action.context, 'Found relevant summary quad', () => ({
          subject,
          predicate,
          object,
        }));
        summaryQuads.push(quad);
      }
    });
    const summaries = quadsToSummaries(summaryQuads);

    await loadSummaries(summaries, this.mediatorHttp, action.context);

    const discoveredSources: ISourceInfo[] = getDiscoverableSources(patternStrings, summaries);

    return {
      links: discoveredSources.map(link => ({
        url: link.source,
      })),
    };
  }
}

export interface IActorActorExtractLinksSummariesArgs
  extends IActorArgs<IActionExtractLinks, IActorTest, IActorExtractLinksOutput> {

  /**
   * The HTTP mediator
   */
  mediatorHttp: MediatorHttp;
}

