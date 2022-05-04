import path from 'path';
import * as dotenv from "dotenv";
import {log} from './utilities';

dotenv.config({path:`.env.${process.env.NODE_ENV}`});

export interface ConfigurablePlugin {
  resolve: string;
  options?: {
    [key: string]: any;
  };
}

export type ResolvablePlugin = ConfigurablePlugin | string;

export enum SourceKind {
  Filesystem,
  Git,
};

/**
 * Abstract class of source.
 */
export abstract class Source {
  /**
   * Constructs `Soruce` instance.
   */
  constructor() { }

  /**
   * Get gatsby source plugin kind.
   */
  abstract getKind(): SourceKind;

  /**
   * Get gatsby plugin info from the plugin
   * @return {ResolvablePlugin}
   */
  abstract getResovlablePlugins(): ResolvablePlugin[];

  /**
   * Get path.
   */
  abstract getPath(): string;

  /**
   * Get source kind from environment variable
   * @return {SourceKind}
   */
  static getSourceKindFromEnvironment(): SourceKind {
    const rawKind = process.env.GATSBY_WPW_SOURCE_KIND;
    if (!rawKind) {
      log(`No source type specified with environment variable 
      GATSBY_WPW_SOURCE_KIND.`);
      return SourceKind.Filesystem;
    }

    if (rawKind.toLowerCase() == 'filesystem') {
      return SourceKind.Filesystem;
    }

    if (rawKind.toLowerCase() == 'git') {
      return SourceKind.Git;
    }

    log(`Unrecognized value in environment variable 
    GATSBY_WPW_SOURCE_TYPE ${rawKind}.`);

    return SourceKind.Filesystem;
  }

  /**
   * Make source from environment values
   * @return {Source}
   */
  static makeFromEnvironment(): Source {
    const kind = this.getSourceKindFromEnvironment();
    const url = process.env.GATSBY_WPW_SOURCE_URL;
    if (!url) {
      throw new Error(
        `Environment variable GATSBY_WPW_SOURCE_URL is not set.`,
      );
    }
    switch (kind) {
    case SourceKind.Filesystem:
      return new FilesystemSource(url);
    case SourceKind.Git:
      const branch = process.env.GATSBY_WPW_SOURCE_BRANCH;
      if (!branch) {
        log(`No branch specified with environment variable GATSBY_WPW_SOURCE_BRANCH, use main by default.`);
      }
      return new GitSource(url, branch ?? 'main');
    }
  }
};

/**
 * Represents a filesystem source.
 */
class FilesystemSource extends Source {
  url: string;

  /**
   * Constructs `SourceFilesystem` instance.
   * @param {string} url
   */
  constructor(url: string) {
    super();
    this.url = url;
  }

  /**
   * Source kind of filesystem source.
   * @return {SourceKind}
   */
  getKind(): SourceKind {
    return SourceKind.Filesystem;
  }

  /**
   * Get gatsby plugin info from the plugin
   * @return {ResolvablePlugin}
   */
  override getResovlablePlugins(): ResolvablePlugin[] {
    return [
      {
        resolve: 'gatsby-source-filesystem',
        options: {
          name: `posts`,
          path: this.getPath(),
        },
      },
    ];
  }

  /**
   * Get path.
   * @return {string}
   */
  override getPath(): string {
    if (this.url.startsWith('file://')) {
      const comp = this.url.slice('file://'.length);
      return path.resolve(comp);
    } else {
      return path.resolve(this.url);
    }
  }
};


/**
 * Represents a git source.
 */
class GitSource extends Source {
  url: string;

  branch: string;

  /**
   * Constructs `PostSourceGit` instance.
   * @param {string} url
   * @param {string} branch
   */
  constructor(url: string, branch: string) {
    super();
    this.url = url;
    this.branch = branch;
  }

  /**
   * Source kind of git source.
   * @return {SourceKind}
   */
  getKind(): SourceKind {
    return SourceKind.Git;
  }

  /**
   * Get gatsby plugin info from the plugin
   * @return {ResolvablePlugin}
   */
  override getResovlablePlugins(): ResolvablePlugin[] {
    return [
      // We need to add gatsby-source-filesystem on gatsby.
      // Else gatsby-source-git-as-filesystem won't work.
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          path: path.resolve(`src`),
          name: `dummy`,
          ignore: [`*`],
        },
      },
      {
        resolve: 'gatsby-source-git-as-filesystem',
        options: {
          name: `posts`,
          branch: this.branch,
          remote: this.getResolvedURL(),
          local: this.getPath(),
        },
      },
    ];
  }

  /**
   * Get resolved URL.
   * @return {string}
   */
  private getResolvedURL(): string {
    if (this.url.startsWith('file://')) {
      const comp = this.url.slice('file://'.length);
      return path.resolve(comp);
    } else if (this.url.startsWith('http://')) {
      return this.url;
    } else if (this.url.startsWith('https://')) {
      return this.url;
    } else if (this.url.startsWith('ssh://')) {
      return this.url;
    } else if (this.url.startsWith('git://')) {
      return this.url;
    } else {
      return path.resolve(this.url);
    }
  }

  /**
   * Get path.
   * @return {string}
   */
  override getPath(): string {
    return path.join(
      process.cwd(),
      `.cache`,
      `gatsby-source-git-as-filesystem`,
      `posts`,
    );
  }
};

export const source = Source.makeFromEnvironment();

export default source;
