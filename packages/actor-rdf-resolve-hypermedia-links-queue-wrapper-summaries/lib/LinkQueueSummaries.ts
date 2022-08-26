import type { ILinkQueue, ILink } from '@comunica/bus-rdf-resolve-hypermedia-links-queue';
import { LinkQueueWrapper } from '@comunica/bus-rdf-resolve-hypermedia-links-queue';

/**
 * A link queue that only allows the given number of links to be pushed into it.
 */
export class LinkQueueSummaries extends LinkQueueWrapper {
  private readonly prunedSummaries: string[];

  public constructor(linkQueue: ILinkQueue, prunedSources: string[]) {
    super(linkQueue);
    this.prunedSummaries = prunedSources;
  }

  public push(link: ILink, parent: ILink): boolean {
    if (this.prunedSummaries.includes(link.url)) {
      return false;
    }
    return super.push(link, parent);
  }
}
