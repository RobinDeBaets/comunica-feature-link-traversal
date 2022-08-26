import type { MediatorHttp } from '@comunica/bus-http';
import type {
  IActionRdfResolveHypermediaLinksQueue,
  IActorRdfResolveHypermediaLinksQueueOutput,
} from '@comunica/bus-rdf-resolve-hypermedia-links-queue';
import { ActorRdfResolveHypermediaLinksQueue } from '@comunica/bus-rdf-resolve-hypermedia-links-queue';
import { KeysInitQuery } from '@comunica/context-entries';
import type { Actor, IActorArgs, IActorTest, Mediator } from '@comunica/core';
import { ActionContextKey } from '@comunica/core';
import type { ISourceInfo } from '@comunica/summaries-lib';
import {
  configToSummaries,
  extractPatternsFromQuery,
  getDiscoverableSources, getPrunableSources, loadSummaries,
  patternToStrings,
} from '@comunica/summaries-lib';
import type { Algebra } from 'sparqlalgebrajs';
import { LinkQueueSummaries } from './LinkQueueSummaries';

/**
 * A comunica Wrapper Summaries RDF Resolve Hypermedia Links Queue Actor.
 */
export class ActorRdfResolveHypermediaLinksQueueWrapperSummaries extends ActorRdfResolveHypermediaLinksQueue {
  private readonly mediatorRdfResolveHypermediaLinksQueue: Mediator<
  Actor<IActionRdfResolveHypermediaLinksQueue, IActorTest, IActorRdfResolveHypermediaLinksQueueOutput>,
  IActionRdfResolveHypermediaLinksQueue, IActorTest, IActorRdfResolveHypermediaLinksQueueOutput>;

  public readonly mediatorHttp: MediatorHttp;

  public constructor(args: IActorRdfResolveHypermediaLinksQueueWrapperSummariesArgs) {
    super(args);
  }

  public async test(action: IActionRdfResolveHypermediaLinksQueue): Promise<IActorTest> {
    if (action.context.get(KEY_CONTEXT_WRAPPED)) {
      throw new Error('Unable to wrap link queues multiple times');
    }
    return true;
  }

  public async run(action: IActionRdfResolveHypermediaLinksQueue): Promise<IActorRdfResolveHypermediaLinksQueueOutput> {
    const context = action.context.set(KEY_CONTEXT_WRAPPED, true);

    const queryString: string = action.context.get(KeysInitQuery.queryString)!;
    const query: Algebra.Operation = action.context.get(KeysInitQuery.query)!;
    const patterns: Algebra.Pattern[] = extractPatternsFromQuery(query, queryString);
    const patternStrings = patterns.map(patternToStrings);

    const { linkQueue } = await this.mediatorRdfResolveHypermediaLinksQueue.mediate({ ...action, context });
    let linkQueueSummary;

    if (action.context.has(KEY_SUMMARIES)) {
      const summaryConfig = action.context.get(KEY_SUMMARIES);
      const summaries = await configToSummaries(summaryConfig);
      await loadSummaries(summaries, this.mediatorHttp, action.context);

      const discoverableSources: ISourceInfo[] = getDiscoverableSources(patternStrings, summaries);
      const prunableSources = getPrunableSources(patternStrings, summaries);

      linkQueueSummary = new LinkQueueSummaries(linkQueue, prunableSources);
      for (const sourceInfoEntry of discoverableSources) {
        linkQueueSummary.push({
          url: sourceInfoEntry.source,
        }, {
          url: sourceInfoEntry.summary,
        });
      }
    } else {
      linkQueueSummary = new LinkQueueSummaries(linkQueue, []);
    }

    return { linkQueue: linkQueueSummary };
  }
}

export interface IActorRdfResolveHypermediaLinksQueueWrapperSummariesArgs
  extends IActorArgs<IActionRdfResolveHypermediaLinksQueue, IActorTest, IActorRdfResolveHypermediaLinksQueueOutput> {
  mediatorRdfResolveHypermediaLinksQueue: Mediator<
  Actor<IActionRdfResolveHypermediaLinksQueue, IActorTest, IActorRdfResolveHypermediaLinksQueueOutput>,
  IActionRdfResolveHypermediaLinksQueue, IActorTest, IActorRdfResolveHypermediaLinksQueueOutput>;

  /**
   * The HTTP mediator
   */
  mediatorHttp: MediatorHttp;
}

export const KEY_CONTEXT_WRAPPED = new ActionContextKey<boolean>(
  '@comunica/actor-rdf-resolve-hypermedia-links-queue-wrapper-summaries:wrapped',
);

export const KEY_SUMMARIES = new ActionContextKey<any>(
  '@comunica/actor-rdf-resolve-hypermedia-links-queue-wrapper-summaries:summaries',
);
