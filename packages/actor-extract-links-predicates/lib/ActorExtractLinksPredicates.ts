import type { IActionExtractLinks, IActorExtractLinksOutput } from '@comunica/bus-extract-links';
import { ActorExtractLinks } from '@comunica/bus-extract-links';
import type { ILink } from '@comunica/bus-rdf-resolve-hypermedia-links';
import type { IActorArgs, IActorTest } from '@comunica/core';
import type * as RDF from '@rdfjs/types';

/**
 * A comunica Traverse Predicates RDF Metadata Extract Actor.
 */
export class ActorExtractLinksPredicates extends ActorExtractLinks {
  private readonly checkSubject: boolean;
  private readonly predicates: RegExp[];

  public constructor(args: IActorExtractLinksTraversePredicatesArgs) {
    super(args);

    this.predicates = args.predicateRegexes.map(stringRegex => new RegExp(stringRegex, 'u'));
  }

  public async test(action: IActionExtractLinks): Promise<IActorTest> {
    return true;
  }

  public async run(action: IActionExtractLinks): Promise<IActorExtractLinksOutput> {
    return new Promise((resolve, reject) => {
      const links: ILink[] = [];

      // Forward errors
      action.metadata.on('error', reject);

      // Immediately resolve when a value has been found.
      action.metadata.on('data', (quad: RDF.Quad) => {
        if (!this.checkSubject || this.subjectMatches(quad.subject.value, action.url)) {
          for (const regex of this.predicates) {
            if (regex.test(quad.predicate.value)) {
              links.push({ url: quad.object.value });
              break;
            }
          }
        }
      });

      // If no value has been found, assume infinity.
      action.metadata.on('end', () => {
        resolve({ links });
      });
    });
  }

  private subjectMatches(subject: string, url: string): boolean {
    const fragmentPos = subject.indexOf('#');
    if (fragmentPos >= 0) {
      subject = subject.slice(0, fragmentPos);
    }
    return subject === url;
  }
}

export interface IActorExtractLinksTraversePredicatesArgs
  extends IActorArgs<IActionExtractLinks, IActorTest, IActorExtractLinksOutput> {
  /**
   * If only quads will be considered that have a subject equal to the request URL.
   */
  checkSubject: boolean;
  /**
   * A list of regular expressions that will be tested against predicates of quads.
   */
  predicateRegexes: string[];
}